import { prismaClient } from '../../prisma/client';
import { NotFoundError, AuthorizationError, ValidationError } from '../../shared/errors';
import { parsePagination } from '../../shared/utils';
import { UserRole, ExecutionStatus, NodeStatus } from '../../../generated/prisma';
import { RunFilters, NDJSONLogEntry } from './runs.types';

export class RunsService {
  /**
   * Trigger workflow execution
   */
  async triggerExecution(
    workflowId: string,
    userId: string,
    userRole: string,
    input: Record<string, any> = {}
  ) {
    // Verify workflow exists and user has access
    const workflow = await prismaClient.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new NotFoundError('Workflow');
    }

    if (userRole !== UserRole.ADMIN && workflow.createdById !== userId) {
      throw new AuthorizationError('You do not have access to execute this workflow');
    }

    if (!workflow.isActive) {
      throw new ValidationError('Cannot execute inactive workflow');
    }

    // Get pinned version
    const pinnedVersion = await prismaClient.workflowVersion.findFirst({
      where: {
        workflowId,
        isPinned: true,
      },
    });

    if (!pinnedVersion) {
      throw new ValidationError('No pinned version found for this workflow');
    }

    // Create execution run
    const run = await prismaClient.executionRun.create({
      data: {
        workflowVersionId: pinnedVersion.id,
        status: ExecutionStatus.PENDING,
        input,
        metadata: { userId },
      },
      include: {
        workflowVersion: {
          include: {
            workflow: true,
          },
        },
      },
    });

    // Create step executions for all nodes
    const dag = pinnedVersion.dagDefinition as any;
    const nodes = dag.nodes || [];

    await prismaClient.stepExecution.createMany({
      data: nodes.map((node: any) => ({
        runId: run.id,
        nodeId: node.id,
        status: NodeStatus.PENDING,
        executionKey: `${run.id}:${node.id}:0`,
      })),
    });

    // Update run status to RUNNING
    await prismaClient.executionRun.update({
      where: { id: run.id },
      data: { status: ExecutionStatus.RUNNING },
    });

    // Queue execution (will be handled by engine module)
    // For now, return the run
    return run;
  }

  /**
   * Get execution details
   */
  async getExecution(runId: string, userId: string, userRole: string) {
    const run = await prismaClient.executionRun.findUnique({
      where: { id: runId },
      include: {
        workflowVersion: {
          include: {
            workflow: true,
          },
        },
        stepExecutions: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!run) {
      throw new NotFoundError('Execution run');
    }

    // Check authorization
    if (userRole !== UserRole.ADMIN && run.workflowVersion.workflow.createdById !== userId) {
      throw new AuthorizationError('You do not have access to this execution');
    }

    return run;
  }

  /**
   * List executions with filtering and pagination
   */
  async listExecutions(userId: string, userRole: string, filters: RunFilters = {}) {
    const { page, limit, skip } = parsePagination(filters);

    const where: any = {};

    // Filter by workflow if specified
    if (filters.workflowId) {
      where.workflowVersion = {
        workflowId: filters.workflowId,
      };
    }

    // Filter by status
    if (filters.status) {
      where.status = filters.status;
    }

    // Non-admin users can only see their own executions
    if (userRole !== UserRole.ADMIN) {
      where.metadata = {
        path: ['userId'],
        equals: userId,
      };
    }

    const [runs, total] = await Promise.all([
      prismaClient.executionRun.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
        include: {
          workflowVersion: {
            include: {
              workflow: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prismaClient.executionRun.count({ where }),
    ]);

    return {
      runs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Pause execution
   */
  async pauseExecution(runId: string, userId: string, userRole: string) {
    const run = await this.getExecution(runId, userId, userRole);

    if (run.status !== ExecutionStatus.RUNNING) {
      throw new ValidationError('Can only pause running executions');
    }

    await prismaClient.executionRun.update({
      where: { id: runId },
      data: { status: ExecutionStatus.PAUSED },
    });

    return { success: true };
  }

  /**
   * Resume execution
   */
  async resumeExecution(runId: string, userId: string, userRole: string) {
    const run = await this.getExecution(runId, userId, userRole);

    if (run.status !== ExecutionStatus.PAUSED) {
      throw new ValidationError('Can only resume paused executions');
    }

    await prismaClient.executionRun.update({
      where: { id: runId },
      data: { status: ExecutionStatus.RUNNING },
    });

    return { success: true };
  }

  /**
   * Cancel execution
   */
  async cancelExecution(runId: string, userId: string, userRole: string) {
    const run = await this.getExecution(runId, userId, userRole);

    if (
      [ExecutionStatus.SUCCESS, ExecutionStatus.FAILED, ExecutionStatus.CANCELLED].includes(
        run.status
      )
    ) {
      throw new ValidationError('Cannot cancel completed execution');
    }

    await prismaClient.$transaction([
      prismaClient.executionRun.update({
        where: { id: runId },
        data: { status: ExecutionStatus.CANCELLED },
      }),
      prismaClient.stepExecution.updateMany({
        where: {
          runId,
          status: { in: [NodeStatus.PENDING, NodeStatus.RUNNING, NodeStatus.RETRYING] },
        },
        data: { status: NodeStatus.SKIPPED },
      }),
    ]);

    return { success: true };
  }

  /**
   * Get step executions for a run
   */
  async getStepExecutions(runId: string, userId: string, userRole: string) {
    // Verify access
    await this.getExecution(runId, userId, userRole);

    const steps = await prismaClient.stepExecution.findMany({
      where: { runId },
      orderBy: { createdAt: 'asc' },
      include: {
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
      },
    });

    return steps;
  }

  /**
   * Get specific step by node ID
   */
  async getStep(runId: string, nodeId: string, userId: string, userRole: string) {
    // Verify access
    await this.getExecution(runId, userId, userRole);

    const step = await prismaClient.stepExecution.findFirst({
      where: { runId, nodeId },
      include: {
        logs: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!step) {
      throw new NotFoundError('Step');
    }

    return step;
  }

  /**
   * Retry a specific step
   */
  async retryStep(runId: string, nodeId: string, userId: string, userRole: string) {
    const run = await this.getExecution(runId, userId, userRole);

    if (run.status !== ExecutionStatus.FAILED && run.status !== ExecutionStatus.PAUSED) {
      throw new ValidationError('Can only retry steps in failed or paused executions');
    }

    const step = await this.getStep(runId, nodeId, userId, userRole);

    if (step.status !== NodeStatus.FAILED) {
      throw new ValidationError('Can only retry failed steps');
    }

    // Reset step for retry
    await prismaClient.stepExecution.update({
      where: { id: step.id },
      data: {
        status: NodeStatus.PENDING,
        startedAt: null,
        completedAt: null,
        error: null,
        retryCount: step.retryCount + 1,
        executionKey: `${runId}:${nodeId}:${step.retryCount + 1}`,
      },
    });

    // Resume run if paused
    if (run.status === ExecutionStatus.PAUSED) {
      await prismaClient.executionRun.update({
        where: { id: runId },
        data: { status: ExecutionStatus.RUNNING },
      });
    }

    return { success: true };
  }

  /**
   * Get logs for a run
   */
  async getLogs(
    runId: string,
    userId: string,
    userRole: string,
    filters: { level?: string; stepId?: string; limit?: number } = {}
  ) {
    // Verify access
    await this.getExecution(runId, userId, userRole);

    const steps = await prismaClient.stepExecution.findMany({
      where: { runId },
      select: { id: true },
    });

    const stepIds = steps.map((s) => s.id);

    const where: any = {
      stepId: { in: stepIds },
    };

    if (filters.stepId) {
      where.stepId = filters.stepId;
    }

    if (filters.level) {
      where.level = filters.level;
    }

    const logs = await prismaClient.executionLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: filters.limit || 100,
      include: {
        step: {
          select: { nodeId: true },
        },
      },
    });

    return logs;
  }

  /**
   * Get logs as NDJSON stream entries
   */
  async getLogsForStream(
    runId: string,
    userId: string,
    userRole: string
  ): Promise<NDJSONLogEntry[]> {
    const logs = await this.getLogs(runId, userId, userRole, { limit: 1000 });

    return logs.map((log) => ({
      ts: log.timestamp.toISOString(),
      level: log.level as NDJSONLogEntry['level'],
      event: (log.metadata as any)?.event || 'LOG',
      runId,
      nodeId: log.step?.nodeId,
      stepId: log.stepId,
      payload: log.metadata as any,
    }));
  }
}

export const runsService = new RunsService();
