import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { workflowService } from '../services/workflow.service';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { dagDefinitionSchema } from '../types/workflow.types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const createWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    dagDefinition: dagDefinitionSchema,
  }),
});

const updateWorkflowSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    isActive: z.boolean().optional(),
  }),
});

const workflowIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

const createVersionSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    dagDefinition: dagDefinitionSchema,
  }),
});

const pinVersionSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    versionId: z.string().uuid(),
  }),
});

const listWorkflowsSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    isActive: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
  }),
});

// POST /workflows - Create workflow
router.post(
  '/',
  validate(createWorkflowSchema),
  async (req: Request, res: Response, next: NextFunction) => {
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
);

// GET /workflows - List workflows
router.get(
  '/',
  validate(listWorkflowsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
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
);

// GET /workflows/:id - Get workflow
router.get(
  '/:id',
  validate(workflowIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
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
);

// PUT /workflows/:id - Update workflow
router.put(
  '/:id',
  validate(updateWorkflowSchema),
  async (req: Request, res: Response, next: NextFunction) => {
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
);

// DELETE /workflows/:id - Delete workflow
router.delete(
  '/:id',
  validate(workflowIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
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
);

// POST /workflows/:id/versions - Create new version
router.post(
  '/:id/versions',
  validate(createVersionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
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
);

// PUT /workflows/:id/versions/:versionId/pin - Pin version
router.put(
  '/:id/versions/:versionId/pin',
  validate(pinVersionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
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
);

export default router;
