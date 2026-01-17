import { Request, Response, NextFunction } from 'express';
import { workflowService } from './workflows.service';

/**
 * Workflows controller - handles HTTP request/response logic
 */
export class WorkflowsController {
  /**
   * Create a new workflow
   * POST /workflows
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const workflow = await workflowService.createWorkflow(req.user!.userId, req.body);

      res.status(201).json({
        success: true,
        data: { workflow },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List workflows
   * GET /workflows
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await workflowService.listWorkflows(
        req.user!.userId,
        req.user!.role,
        req.query as any
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get workflow by ID
   * GET /workflows/:id
   */
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const workflow = await workflowService.getWorkflow(
        req.params.id,
        req.user!.userId,
        req.user!.role
      );

      res.status(200).json({
        success: true,
        data: { workflow },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update workflow
   * PUT /workflows/:id
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const workflow = await workflowService.updateWorkflow(
        req.params.id,
        req.user!.userId,
        req.user!.role,
        req.body
      );

      res.status(200).json({
        success: true,
        data: { workflow },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete workflow
   * DELETE /workflows/:id
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await workflowService.deleteWorkflow(req.params.id, req.user!.userId, req.user!.role);

      res.status(200).json({
        success: true,
        message: 'Workflow deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new workflow version
   * POST /workflows/:id/versions
   */
  async createVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const version = await workflowService.createVersion(
        req.params.id,
        req.user!.userId,
        req.user!.role,
        req.body.dagDefinition
      );

      res.status(201).json({
        success: true,
        data: { version },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List workflow versions
   * GET /workflows/:id/versions
   */
  async listVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const versions = await workflowService.getVersions(
        req.params.id,
        req.user!.userId,
        req.user!.role
      );

      res.status(200).json({
        success: true,
        data: { versions },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get specific workflow version
   * GET /workflows/:id/versions/:versionId
   */
  async getVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const version = await workflowService.getVersion(
        req.params.id,
        req.params.versionId,
        req.user!.userId,
        req.user!.role
      );

      res.status(200).json({
        success: true,
        data: { version },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Pin workflow version
   * POST /workflows/:id/versions/:versionId/pin
   */
  async pinVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const version = await workflowService.pinVersion(
        req.params.id,
        req.params.versionId,
        req.user!.userId,
        req.user!.role
      );

      res.status(200).json({
        success: true,
        data: { version },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const workflowsController = new WorkflowsController();
