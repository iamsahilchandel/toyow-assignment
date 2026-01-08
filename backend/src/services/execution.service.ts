import { executionEngine } from '../engine/execution-engine';
import { prismaClient } from '../config/database';
import { NotFoundError, AuthorizationError } from '../utils/errors';
import { UserRole } from '@prisma/client';

export class ExecutionService {
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
      throw new AuthorizationError('Cannot execute inactive workflow');
    }

    const runId = await executionEngine.startExecution(workflowId, userId, input);

    const run = await prismaClient.executionRun.findUnique({
      where: { id: runId },
      include: {
        workflowVersion: {
          include: {
            workflow: true,
          },
        },
      },
    });

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
   * List executions
   */
  async listExecutions(
    userId: string,
    userRole: string,
    filters: {
      workflowId?: string;
      status?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

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

    await executionEngine.pauseExecution(runId);

    return { success: true };
  }

  /**
   * Resume execution
   */
  async resumeExecution(runId: string, userId: string, userRole: string) {
    const run = await this.getExecution(runId, userId, userRole);

    await executionEngine.resumeExecution(runId);

    return { success: true };
  }

  /**
   * Cancel execution
   */
  async cancelExecution(runId: string, userId: string, userRole: string) {
    const run = await this.getExecution(runId, userId, userRole);

    await executionEngine.cancelExecution(runId);

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
          take: 10, // Latest 10 logs per step
        },
      },
    });

    return steps;
  }
}

export const executionService = new ExecutionService();
