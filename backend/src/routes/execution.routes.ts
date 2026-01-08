import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { executionService } from '../services/execution.service';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { ExecutionStatus } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const triggerExecutionSchema = z.object({
  params: z.object({
    workflowId: z.string().uuid(),
  }),
  body: z.object({
    input: z.record(z.any()).optional().default({}),
  }),
});

const runIdSchema = z.object({
  params: z.object({
    runId: z.string().uuid(),
  }),
});

const listExecutionsSchema = z.object({
  query: z.object({
    workflowId: z.string().uuid().optional(),
    status: z.nativeEnum(ExecutionStatus).optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

// POST /workflows/:workflowId/execute - Trigger execution
router.post(
  '/:workflowId/execute',
  validate(triggerExecutionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const run = await executionService.triggerExecution(
        req.params.workflowId,
        req.user!.userId,
        req.user!.role,
        req.body.input
      );

      res.status(201).json({
        success: true,
        data: { run },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /runs - List executions
router.get(
  '/',
  validate(listExecutionsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await executionService.listExecutions(
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

// GET /runs/:runId - Get execution
router.get(
  '/:runId',
  validate(runIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const run = await executionService.getExecution(
        req.params.runId,
        req.user!.userId,
        req.user!.role
      );

      res.status(200).json({
        success: true,
        data: { run },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /runs/:runId/pause - Pause execution
router.post(
  '/:runId/pause',
  validate(runIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await executionService.pauseExecution(req.params.runId, req.user!.userId, req.user!.role);

      res.status(200).json({
        success: true,
        message: 'Execution paused successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /runs/:runId/resume - Resume execution
router.post(
  '/:runId/resume',
  validate(runIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await executionService.resumeExecution(req.params.runId, req.user!.userId, req.user!.role);

      res.status(200).json({
        success: true,
        message: 'Execution resumed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /runs/:runId/cancel - Cancel execution
router.post(
  '/:runId/cancel',
  validate(runIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await executionService.cancelExecution(req.params.runId, req.user!.userId, req.user!.role);

      res.status(200).json({
        success: true,
        message: 'Execution cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /runs/:runId/steps - Get step executions
router.get(
  '/:runId/steps',
  validate(runIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const steps = await executionService.getStepExecutions(
        req.params.runId,
        req.user!.userId,
        req.user!.role
      );

      res.status(200).json({
        success: true,
        data: { steps },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
