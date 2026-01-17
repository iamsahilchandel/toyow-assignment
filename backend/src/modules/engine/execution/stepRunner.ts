import { prismaClient } from '../../../prisma/client';
import { workflowQueue } from '../../../infra/queue';
import { logger } from '../../../shared/logger';
import { ExecutionStatus, NodeStatus, PluginType } from '../../../../generated/prisma';
import { DAGDefinition } from '../../workflows/workflows.types';
import { StepContext, StepResult, DAGRuntime, PluginResult } from '../engine.types';
import { buildDAGRuntime, getRootNodes, getChildNodes } from '../dag';
import {
  evaluateIfCondition,
  determineIfBranch,
  getSkippedNodes,
  areParentsComplete,
} from '../dag/ifElseBranching';
import { shouldRetry, calculateBackoff, getNextRetryTime } from './stepRetry';
import { generateChecksum, checkIdempotency, updateStepChecksum } from './stepIdempotency';
import { executeBuiltinPlugin } from '../runtime/pluginExecutor';

/**
 * Execution Engine - orchestrates workflow execution
 */
class ExecutionEngine {
  /**
   * Start workflow execution
   */
  async startExecution(
    workflowId: string,
    userId: string,
    input: Record<string, any> = {}
  ): Promise<string> {
    // Get pinned version
    const version = await prismaClient.workflowVersion.findFirst({
      where: {
        workflow: { id: workflowId },
        isPinned: true,
      },
    });

    if (!version) {
      throw new Error('No pinned version found for workflow');
    }

    const dag = version.dagDefinition as unknown as DAGDefinition;
    const dagRuntime = buildDAGRuntime(dag);

    // Create execution run
    const run = await prismaClient.executionRun.create({
      data: {
        workflowVersionId: version.id,
        status: ExecutionStatus.RUNNING,
        input,
        metadata: { userId },
      },
    });

    // Create step rows for all nodes
    const nodes = Array.from(dagRuntime.nodes.values());
    await prismaClient.stepExecution.createMany({
      data: nodes.map((node) => ({
        runId: run.id,
        nodeId: node.id,
        status: NodeStatus.PENDING,
        executionKey: `${run.id}:${node.id}:0`,
      })),
    });

    logger.info('Execution started', { runId: run.id, workflowId });

    // Queue root nodes
    const rootNodes = getRootNodes(dagRuntime);
    for (const nodeId of rootNodes) {
      await this.enqueueNode(run.id, nodeId, input, 0);
    }

    return run.id;
  }

  /**
   * Execute a single node
   */
  async executeNode(runId: string, nodeId: string, input: Record<string, any>): Promise<void> {
    const run = await prismaClient.executionRun.findUnique({
      where: { id: runId },
      include: {
        workflowVersion: true,
        stepExecutions: true,
      },
    });

    if (!run) {
      throw new Error(`Run ${runId} not found`);
    }

    // Check if run is still running
    if (run.status !== ExecutionStatus.RUNNING) {
      logger.info('Skipping node execution - run not running', {
        runId,
        nodeId,
        runStatus: run.status,
      });
      return;
    }

    const dag = run.workflowVersion.dagDefinition as unknown as DAGDefinition;
    const dagRuntime = buildDAGRuntime(dag);
    const node = dagRuntime.nodes.get(nodeId);

    if (!node) {
      throw new Error(`Node ${nodeId} not found in DAG`);
    }

    // Get step execution record
    const step = run.stepExecutions.find((s) => s.nodeId === nodeId);
    if (!step) {
      throw new Error(`Step ${nodeId} not found in run ${runId}`);
    }

    // Check idempotency
    const checksum = generateChecksum(runId, nodeId, input);
    const idempotencyCheck = await checkIdempotency(runId, nodeId, checksum);

    if (idempotencyCheck.isIdempotent) {
      logger.info('Skipping idempotent step', { runId, nodeId });
      await this.handleNodeSuccess(run.id, nodeId, dagRuntime, idempotencyCheck.outputs || {});
      return;
    }

    // Update step to RUNNING
    await prismaClient.stepExecution.update({
      where: { id: step.id },
      data: {
        status: NodeStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    await this.logStepExecution(step.id, 'INFO', 'Step execution started', { nodeId });

    try {
      // Build step context
      const stepResults = this.buildStepResults(run.stepExecutions);
      const context: StepContext = {
        runId,
        nodeId,
        input,
        config: node.config,
        steps: stepResults,
        inputs: (run.input as Record<string, any>) || {},
      };

      // Execute based on node type
      let result: PluginResult;

      if (node.type === 'IF') {
        // Handle IF node specially
        result = await this.executeIfNode(context, dagRuntime, step.id);
      } else {
        // Execute plugin
        result = await executeBuiltinPlugin(node.type as PluginType, context);
      }

      if (result.success) {
        await this.handleNodeSuccess(runId, nodeId, dagRuntime, result.output || {});
        await updateStepChecksum(step.id, checksum);

        // Update step record
        await prismaClient.stepExecution.update({
          where: { id: step.id },
          data: {
            status: NodeStatus.SUCCESS,
            completedAt: new Date(),
            output: result.output,
          },
        });

        await this.logStepExecution(step.id, 'INFO', 'Step completed successfully', {
          duration: result.duration,
        });
      } else {
        await this.handleNodeFailure(runId, nodeId, step.id, result.error, node.retryConfig);
      }
    } catch (error: any) {
      await this.handleNodeFailure(runId, nodeId, step.id, error, node.retryConfig);
    }
  }

  /**
   * Execute IF node
   */
  private async executeIfNode(
    context: StepContext,
    dag: DAGRuntime,
    stepId: string
  ): Promise<PluginResult> {
    const startTime = Date.now();
    const node = dag.nodes.get(context.nodeId);

    if (!node) {
      return {
        success: false,
        error: { message: 'IF node not found', retryable: false },
        duration: Date.now() - startTime,
      };
    }

    const expression = node.config.expr as string;

    // Evaluate condition
    const conditionResult = evaluateIfCondition(expression, {
      steps: context.steps,
      inputs: context.inputs,
    });

    // Determine branches
    const branches = determineIfBranch(dag, context.nodeId, conditionResult);

    if (!branches) {
      return {
        success: false,
        error: { message: 'IF node must have true and false branches', retryable: false },
        duration: Date.now() - startTime,
      };
    }

    // Mark skipped branch nodes
    const skippedNodes = getSkippedNodes(dag, branches.skippedBranch, branches.selectedBranch);

    for (const skippedNodeId of skippedNodes) {
      await prismaClient.stepExecution.updateMany({
        where: {
          runId: context.runId,
          nodeId: skippedNodeId,
          status: NodeStatus.PENDING,
        },
        data: {
          status: NodeStatus.SKIPPED,
          completedAt: new Date(),
        },
      });
    }

    await this.logStepExecution(stepId, 'INFO', `IF condition evaluated to ${conditionResult}`, {
      expression,
      selectedBranch: branches.selectedBranch,
      skippedNodes,
    });

    return {
      success: true,
      output: {
        condition: expression,
        result: conditionResult,
        selectedBranch: branches.selectedBranch,
        skippedBranch: branches.skippedBranch,
      },
      duration: Date.now() - startTime,
    };
  }

  /**
   * Handle successful node execution
   */
  private async handleNodeSuccess(
    runId: string,
    nodeId: string,
    dag: DAGRuntime,
    output: Record<string, any>
  ): Promise<void> {
    // Queue dependent nodes
    const children = getChildNodes(dag, nodeId);

    for (const childId of children) {
      // Check if all parents are complete
      const allSteps = await prismaClient.stepExecution.findMany({
        where: { runId },
      });

      const stepResults = new Map<string, StepResult>();
      for (const step of allSteps) {
        stepResults.set(step.nodeId, {
          status: step.status as NodeStatus,
          outputs: (step.output as Record<string, any>) || {},
        });
      }

      if (areParentsComplete(dag, childId, stepResults)) {
        // Check edge condition
        const edge = dag.edges.find((e) => e.from === nodeId && e.to === childId);

        // Skip if this is a conditional edge that wasn't selected
        if (edge?.condition && typeof edge.condition === 'string') {
          // Already handled in IF node
        }

        await this.enqueueNode(runId, childId, output, 0);
      }
    }

    // Check if workflow is complete
    await this.checkWorkflowCompletion(runId);
  }

  /**
   * Handle node failure
   */
  private async handleNodeFailure(
    runId: string,
    nodeId: string,
    stepId: string,
    error: any,
    retryConfig: { maxAttempts: number; backoffMs: number; backoffMultiplier: number }
  ): Promise<void> {
    const step = await prismaClient.stepExecution.findUnique({
      where: { id: stepId },
    });

    if (!step) return;

    const attemptNumber = step.retryCount + 1;
    const errorMessage = error?.message || String(error);

    await this.logStepExecution(stepId, 'ERROR', `Step execution failed: ${errorMessage}`, {
      attempt: attemptNumber,
      error: errorMessage,
    });

    if (shouldRetry(error, attemptNumber, retryConfig.maxAttempts)) {
      // Schedule retry
      const nextRetry = getNextRetryTime(attemptNumber, retryConfig);
      const delay = calculateBackoff(attemptNumber, retryConfig);

      await prismaClient.stepExecution.update({
        where: { id: stepId },
        data: {
          status: NodeStatus.RETRYING,
          retryCount: attemptNumber,
          error: { message: errorMessage, stack: error?.stack },
        },
      });

      await this.logStepExecution(stepId, 'INFO', `Scheduling retry ${attemptNumber}`, {
        nextRetry: nextRetry.toISOString(),
        delay,
      });

      // Queue with delay
      await this.enqueueNode(runId, nodeId, {}, attemptNumber, delay);
    } else {
      // Mark as failed
      await prismaClient.stepExecution.update({
        where: { id: stepId },
        data: {
          status: NodeStatus.FAILED,
          completedAt: new Date(),
          error: { message: errorMessage, stack: error?.stack },
        },
      });

      // Fail the run
      await prismaClient.executionRun.update({
        where: { id: runId },
        data: {
          status: ExecutionStatus.FAILED,
          completedAt: new Date(),
        },
      });

      logger.error('Execution failed', { runId, nodeId, error: errorMessage });
    }
  }

  /**
   * Check if workflow is complete
   */
  private async checkWorkflowCompletion(runId: string): Promise<void> {
    const steps = await prismaClient.stepExecution.findMany({
      where: { runId },
    });

    const allComplete = steps.every(
      (s) =>
        s.status === NodeStatus.SUCCESS ||
        s.status === NodeStatus.SKIPPED ||
        s.status === NodeStatus.FAILED
    );

    if (allComplete) {
      const anyFailed = steps.some((s) => s.status === NodeStatus.FAILED);
      const status = anyFailed ? ExecutionStatus.FAILED : ExecutionStatus.SUCCESS;

      await prismaClient.executionRun.update({
        where: { id: runId },
        data: {
          status,
          completedAt: new Date(),
        },
      });

      logger.info('Execution completed', { runId, status });
    }
  }

  /**
   * Enqueue node for execution
   */
  async enqueueNode(
    runId: string,
    nodeId: string,
    input: Record<string, any>,
    retryCount: number,
    delay: number = 0
  ): Promise<void> {
    const jobData = {
      runId,
      nodeId,
      input,
      retryCount,
    };

    if (delay > 0) {
      await workflowQueue.add(jobData, { delay });
    } else {
      await workflowQueue.add(jobData);
    }

    logger.debug('Node enqueued', { runId, nodeId, retryCount, delay });
  }

  /**
   * Pause execution
   */
  async pauseExecution(runId: string): Promise<void> {
    await prismaClient.executionRun.update({
      where: { id: runId },
      data: { status: ExecutionStatus.PAUSED },
    });
    logger.info('Execution paused', { runId });
  }

  /**
   * Resume execution
   */
  async resumeExecution(runId: string): Promise<void> {
    const run = await prismaClient.executionRun.findUnique({
      where: { id: runId },
      include: {
        workflowVersion: true,
        stepExecutions: true,
      },
    });

    if (!run) return;

    await prismaClient.executionRun.update({
      where: { id: runId },
      data: { status: ExecutionStatus.RUNNING },
    });

    // Re-queue pending/retrying nodes
    const dag = run.workflowVersion.dagDefinition as unknown as DAGDefinition;
    const dagRuntime = buildDAGRuntime(dag);

    for (const step of run.stepExecutions) {
      if (step.status === NodeStatus.PENDING || step.status === NodeStatus.RETRYING) {
        const stepResults = this.buildStepResults(run.stepExecutions);
        if (areParentsComplete(dagRuntime, step.nodeId, stepResults)) {
          await this.enqueueNode(runId, step.nodeId, {}, step.retryCount);
        }
      }
    }

    logger.info('Execution resumed', { runId });
  }

  /**
   * Cancel execution
   */
  async cancelExecution(runId: string): Promise<void> {
    await prismaClient.$transaction([
      prismaClient.executionRun.update({
        where: { id: runId },
        data: { status: ExecutionStatus.CANCELLED, completedAt: new Date() },
      }),
      prismaClient.stepExecution.updateMany({
        where: {
          runId,
          status: { in: [NodeStatus.PENDING, NodeStatus.RUNNING, NodeStatus.RETRYING] },
        },
        data: { status: NodeStatus.SKIPPED, completedAt: new Date() },
      }),
    ]);
    logger.info('Execution cancelled', { runId });
  }

  /**
   * Build step results map from step executions
   */
  private buildStepResults(
    stepExecutions: Array<{ nodeId: string; status: NodeStatus; output: any }>
  ): Record<string, StepResult> {
    const results: Record<string, StepResult> = {};

    for (const step of stepExecutions) {
      results[step.nodeId] = {
        status: step.status,
        outputs: (step.output as Record<string, any>) || {},
      };
    }

    return results;
  }

  /**
   * Log step execution
   */
  async logStepExecution(
    stepId: string,
    level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR',
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await prismaClient.executionLog.create({
      data: {
        stepId,
        level,
        message,
        metadata: { ...metadata, event: level === 'INFO' ? 'STEP_LOG' : level },
      },
    });
  }
}

export const executionEngine = new ExecutionEngine();
