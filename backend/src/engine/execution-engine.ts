import { prismaClient } from '../config/database';
import { workflowService } from '../services/workflow.service';
import { dagValidator } from './dag-validator';
import { retryManager } from './retry-manager';
import { workflowQueue } from '../queue/workflow-queue';
import { pluginExecutor } from '../runtime/plugin-executor';
import { DAGDefinition, NodeConfig, ExecutionState } from '../types/workflow.types';
import { ExecutionStatus, NodeStatus } from '@prisma/client';
import { logger } from '../utils/logger';
import { NotFoundError, ValidationError } from '../utils/errors';

export class ExecutionEngine {
  /**
   * Start workflow execution
   */
  async startExecution(
    workflowId: string,
    userId: string,
    input: Record<string, any> = {}
  ): Promise<string> {
    // Get pinned workflow version
    const workflowVersion = await workflowService.getPinnedVersion(workflowId);

    const dagDefinition = workflowVersion.dagDefinition as DAGDefinition;

    // Validate DAG
    dagValidator.validate(dagDefinition);

    // Create execution run
    const run = await prismaClient.executionRun.create({
      data: {
        workflowVersionId: workflowVersion.id,
        status: ExecutionStatus.PENDING,
        input,
        metadata: {
          userId,
          workflowId,
        },
      },
    });

    logger.info('Execution started', {
      runId: run.id,
      workflowId,
      workflowVersionId: workflowVersion.id,
    });

    // Queue initial nodes for execution
    const rootNodes = dagValidator.getRootNodes(dagDefinition.nodes, dagDefinition.edges);

    for (const nodeId of rootNodes) {
      await this.enqueueNode(run.id, nodeId, input);
    }

    // Update run status to RUNNING
    await prismaClient.executionRun.update({
      where: { id: run.id },
      data: { status: ExecutionStatus.RUNNING },
    });

    return run.id;
  }

  /**
   * Execute a single node
   */
  async executeNode(runId: string, nodeId: string, input: Record<string, any>) {
    const run = await prismaClient.executionRun.findUnique({
      where: { id: runId },
      include: { workflowVersion: true },
    });

    if (!run) {
      throw new NotFoundError('Execution run');
    }

    // Check if execution is paused or cancelled
    if (run.status === ExecutionStatus.PAUSED || run.status === ExecutionStatus.CANCELLED) {
      logger.info('Execution paused or cancelled, skipping node', { runId, nodeId });
      return;
    }

    const dagDefinition = run.workflowVersion.dagDefinition as DAGDefinition;
    const node = dagDefinition.nodes.find((n: NodeConfig) => n.id === nodeId);

    if (!node) {
      throw new ValidationError(`Node ${nodeId} not found in DAG`);
    }

    // Generate execution key for idempotency
    const executionKey = retryManager.generateExecutionKey(runId, nodeId, 0);

    // Check if already executed
    const existing = await prismaClient.stepExecution.findUnique({
      where: { executionKey },
    });

    if (existing) {
      logger.warn('Step already executed (idempotency check)', { runId, nodeId });
      return;
    }

    // Create step execution record
    const stepExecution = await prismaClient.stepExecution.create({
      data: {
        runId,
        nodeId,
        status: NodeStatus.RUNNING,
        executionKey,
        input,
        startedAt: new Date(),
      },
    });

    try {
      // Load and execute plugin
      const pluginCode = await pluginExecutor.loadPlugin(
        node.pluginId || '',
        node.pluginVersion || 'latest'
      );

      const result = await pluginExecutor.executePlugin(
        {
          runId,
          nodeId,
          input,
          config: node.config,
        },
        pluginCode
      );

      if (result.success) {
        // Update step execution as successful
        await prismaClient.stepExecution.update({
          where: { id: stepExecution.id },
          data: {
            status: NodeStatus.SUCCESS,
            output: result.output,
            completedAt: new Date(),
          },
        });

        // Log success
        await this.logStepExecution(stepExecution.id, 'INFO', 'Step executed successfully', {
          duration: result.duration,
        });

        // Queue dependent nodes
        await this.queueDependentNodes(runId, nodeId, dagDefinition, result.output || {});

        // Check if workflow is complete
        await this.checkWorkflowCompletion(runId);
      } else {
        await this.handleNodeFailure(runId, nodeId, stepExecution.id, result.error!, node);
      }
    } catch (error: any) {
      await this.handleNodeFailure(runId, nodeId, stepExecution.id, error, node);
    }
  }

  /**
   * Handle node execution failure
   */
  private async handleNodeFailure(
    runId: string,
    nodeId: string,
    stepId: string,
    error: any,
    node: NodeConfig
  ) {
    logger.error('Node execution failed', {
      runId,
      nodeId,
      error: error.message,
    });

    const retryConfig = node.retryConfig || { maxAttempts: 3, backoffMs: 1000 };

    // Get current retry count
    const step = await prismaClient.stepExecution.findUnique({
      where: { id: stepId },
    });

    const retryCount = (step?.retryCount || 0) + 1;

    // Check if should retry
    if (retryManager.shouldRetry(error, retryCount, retryConfig.maxAttempts)) {
      // Update step status to RETRYING
      await prismaClient.stepExecution.update({
        where: { id: stepId },
        data: {
          status: NodeStatus.RETRYING,
          error: {
            message: error.message,
            stack: error.stack,
          },
          retryCount,
        },
      });

      // Calculate backoff delay
      const delay = retryManager.calculateBackoff(retryCount, retryConfig);

      // Schedule retry
      await this.enqueueNode(runId, nodeId, step?.input as Record<string, any>, retryCount, delay);

      await this.logStepExecution(stepId, 'WARN', `Retrying step (attempt ${retryCount})`, {
        delay,
      });
    } else {
      // Mark step as failed
      await prismaClient.stepExecution.update({
        where: { id: stepId },
        data: {
          status: NodeStatus.FAILED,
          error: {
            message: error.message,
            stack: error.stack,
          },
          completedAt: new Date(),
        },
      });

      await this.logStepExecution(stepId, 'ERROR', `Step failed: ${error.message}`);

      // Mark entire run as failed
      await prismaClient.executionRun.update({
        where: { id: runId },
        data: {
          status: ExecutionStatus.FAILED,
          completedAt: new Date(),
        },
      });
    }
  }

  /**
   * Queue dependent nodes for execution
   */
  private async queueDependentNodes(
    runId: string,
    completedNodeId: string,
    dag: DAGDefinition,
    output: Record<string, any>
  ) {
    const dependentEdges = dag.edges.filter((e) => e.from === completedNodeId);

    for (const edge of dependentEdges) {
      // Check if all prerequisites are met
      const prerequisites = dag.edges.filter((e) => e.to === edge.to);

      const allPrerequisitesMet = await this.checkPrerequisites(
        runId,
        prerequisites.map((e) => e.from)
      );

      if (allPrerequisitesMet) {
        await this.enqueueNode(runId, edge.to, output);
      }
    }
  }

  /**
   * Check if all prerequisite nodes are completed
   */
  private async checkPrerequisites(runId: string, nodeIds: string[]): Promise<boolean> {
    const steps = await prismaClient.stepExecution.findMany({
      where: {
        runId,
        nodeId: { in: nodeIds },
      },
    });

    return steps.length === nodeIds.length && steps.every((s) => s.status === NodeStatus.SUCCESS);
  }

  /**
   * Check if workflow execution is complete
   */
  private async checkWorkflowCompletion(runId: string) {
    const run = await prismaClient.executionRun.findUnique({
      where: { id: runId },
      include: {
        stepExecutions: true,
        workflowVersion: true,
      },
    });

    if (!run) return;

    const dag = run.workflowVersion.dagDefinition as DAGDefinition;
    const allSteps = run.stepExecutions;

    // Check if all nodes have been executed
    if (allSteps.length === dag.nodes.length) {
      const allSuccess = allSteps.every((s) => s.status === NodeStatus.SUCCESS);
      const anyFailed = allSteps.some((s) => s.status === NodeStatus.FAILED);

      if (allSuccess) {
        await prismaClient.executionRun.update({
          where: { id: runId },
          data: {
            status: ExecutionStatus.SUCCESS,
            completedAt: new Date(),
          },
        });
        logger.info('Workflow execution completed successfully', { runId });
      } else if (anyFailed) {
        // Already handled in handleNodeFailure
        logger.info('Workflow execution failed', { runId });
      }
    }
  }

  /**
   * Pause workflow execution
   */
  async pauseExecution(runId: string) {
    await prismaClient.executionRun.update({
      where: { id: runId },
      data: { status: ExecutionStatus.PAUSED },
    });

    logger.info('Execution paused', { runId });
  }

  /**
   * Resume workflow execution
   */
  async resumeExecution(runId: string) {
    const run = await prismaClient.executionRun.update({
      where: { id: runId },
      data: { status: ExecutionStatus.RUNNING },
      include: {
        stepExecutions: true,
        workflowVersion: true,
      },
    });

    // Find pending nodes and requeue them
    const dag = run.workflowVersion.dagDefinition as DAGDefinition;
    const completedNodeIds = run.stepExecutions
      .filter((s) => s.status === NodeStatus.SUCCESS)
      .map((s) => s.nodeId);

    const pendingNodes = dag.nodes.filter((n) => !completedNodeIds.includes(n.id));

    for (const node of pendingNodes) {
      // Check prerequisites before queueing
      const prerequisites = dag.edges.filter((e) => e.to === node.id).map((e) => e.from);

      if (prerequisites.length === 0 || (await this.checkPrerequisites(runId, prerequisites))) {
        const lastStep = run.stepExecutions.find((s) => s.nodeId === node.id);
        await this.enqueueNode(runId, node.id, lastStep?.input as Record<string, any>);
      }
    }

    logger.info('Execution resumed', { runId });
  }

  /**
   * Cancel workflow execution
   */
  async cancelExecution(runId: string) {
    await prismaClient.executionRun.update({
      where: { id: runId },
      data: {
        status: ExecutionStatus.CANCELLED,
        completedAt: new Date(),
      },
    });

    logger.info('Execution cancelled', { runId });
  }

  /**
   * Enqueue node for execution
   */
  private async enqueueNode(
    runId: string,
    nodeId: string,
    input: Record<string, any>,
    retryCount: number = 0,
    delay: number = 0
  ) {
    await workflowQueue.add(
      {
        runId,
        nodeId,
        input,
        retryCount,
      },
      {
        delay,
        jobId: `${runId}:${nodeId}:${retryCount}`,
      }
    );
  }

  /**
   * Log step execution
   */
  private async logStepExecution(
    stepId: string,
    level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR',
    message: string,
    metadata?: Record<string, any>
  ) {
    await prismaClient.executionLog.create({
      data: {
        stepId,
        level,
        message,
        metadata,
      },
    });
  }
}

export const executionEngine = new ExecutionEngine();
