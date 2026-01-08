import { prismaClient } from '../config/database';
import { DAGDefinition, dagDefinitionSchema } from '../types/workflow.types';
import { dagValidator } from '../engine/dag-validator';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errors';
import { UserRole } from '@prisma/client';

export class WorkflowService {
  /**
   * Create a new workflow with initial version
   */
  async createWorkflow(
    userId: string,
    data: {
      name: string;
      description?: string;
      dagDefinition: DAGDefinition;
    }
  ) {
    // Validate DAG structure
    const validatedDag = dagDefinitionSchema.parse(data.dagDefinition);
    dagValidator.validate(validatedDag);

    // Create workflow and initial version in transaction
    const workflow = await prismaClient.$transaction(async (tx) => {
      const newWorkflow = await tx.workflow.create({
        data: {
          name: data.name,
          description: data.description,
          createdById: userId,
        },
      });

      const version = await tx.workflowVersion.create({
        data: {
          workflowId: newWorkflow.id,
          version: 1,
          dagDefinition: validatedDag as any,
          isPinned: true,
        },
      });

      return {
        ...newWorkflow,
        versions: [version],
      };
    });

    return workflow;
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId: string, userId: string, userRole: string) {
    const workflow = await prismaClient.workflow.findUnique({
      where: { id: workflowId },
      include: {
        versions: {
          orderBy: { version: 'desc' },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundError('Workflow');
    }

    // Check authorization
    if (userRole !== UserRole.ADMIN && workflow.createdById !== userId) {
      throw new AuthorizationError('You do not have access to this workflow');
    }

    return workflow;
  }

  /**
   * List workflows
   */
  async listWorkflows(
    userId: string,
    userRole: string,
    filters: {
      page?: number;
      limit?: number;
      isActive?: boolean;
    } = {}
  ) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    // Non-admin users can only see their own workflows
    if (userRole !== UserRole.ADMIN) {
      where.createdById = userId;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [workflows, total] = await Promise.all([
      prismaClient.workflow.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          versions: {
            where: { isPinned: true },
            take: 1,
          },
          createdBy: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
      prismaClient.workflow.count({ where }),
    ]);

    return {
      workflows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update workflow metadata
   */
  async updateWorkflow(
    workflowId: string,
    userId: string,
    userRole: string,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
    }
  ) {
    const workflow = await this.getWorkflow(workflowId, userId, userRole);

    // Check ownership
    if (userRole !== UserRole.ADMIN && workflow.createdById !== userId) {
      throw new AuthorizationError('You can only update your own workflows');
    }

    const updated = await prismaClient.workflow.update({
      where: { id: workflowId },
      data,
      include: {
        versions: {
          orderBy: { version: 'desc' },
        },
      },
    });

    return updated;
  }

  /**
   * Delete workflow (soft delete by marking inactive)
   */
  async deleteWorkflow(workflowId: string, userId: string, userRole: string) {
    const workflow = await this.getWorkflow(workflowId, userId, userRole);

    if (userRole !== UserRole.ADMIN && workflow.createdById !== userId) {
      throw new AuthorizationError('You can only delete your own workflows');
    }

    await prismaClient.workflow.update({
      where: { id: workflowId },
      data: { isActive: false },
    });

    return { success: true };
  }

  /**
   * Create new workflow version
   */
  async createVersion(
    workflowId: string,
    userId: string,
    userRole: string,
    dagDefinition: DAGDefinition
  ) {
    const workflow = await this.getWorkflow(workflowId, userId, userRole);

    if (userRole !== UserRole.ADMIN && workflow.createdById !== userId) {
      throw new AuthorizationError('You can only create versions for your own workflows');
    }

    // Validate DAG
    const validatedDag = dagDefinitionSchema.parse(dagDefinition);
    dagValidator.validate(validatedDag);

    // Get latest version number
    const latestVersion = await prismaClient.workflowVersion.findFirst({
      where: { workflowId },
      orderBy: { version: 'desc' },
    });

    const newVersionNumber = (latestVersion?.version || 0) + 1;

    const version = await prismaClient.workflowVersion.create({
      data: {
        workflowId,
        version: newVersionNumber,
        dagDefinition: validatedDag as any,
        isPinned: false,
      },
    });

    return version;
  }

  /**
   * Pin a workflow version for execution
   */
  async pinVersion(workflowId: string, versionId: string, userId: string, userRole: string) {
    const workflow = await this.getWorkflow(workflowId, userId, userRole);

    if (userRole !== UserRole.ADMIN && workflow.createdById !== userId) {
      throw new AuthorizationError('You can only pin versions of your own workflows');
    }

    // Verify version belongs to this workflow
    const version = await prismaClient.workflowVersion.findUnique({
      where: { id: versionId },
    });

    if (!version || version.workflowId !== workflowId) {
      throw new NotFoundError('Workflow version');
    }

    // Unpin all versions and pin the selected one
    await prismaClient.$transaction([
      prismaClient.workflowVersion.updateMany({
        where: { workflowId },
        data: { isPinned: false },
      }),
      prismaClient.workflowVersion.update({
        where: { id: versionId },
        data: { isPinned: true },
      }),
    ]);

    return version;
  }

  /**
   * Get pinned version for a workflow
   */
  async getPinnedVersion(workflowId: string) {
    const version = await prismaClient.workflowVersion.findFirst({
      where: {
        workflowId,
        isPinned: true,
      },
    });

    if (!version) {
      throw new ValidationError('No pinned version found for this workflow');
    }

    return version;
  }
}

export const workflowService = new WorkflowService();
