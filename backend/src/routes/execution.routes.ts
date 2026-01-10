import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { executionService } from '../services/execution.service';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { ExecutionStatus } from '../../generated/prisma';

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

/**
 * @swagger
 * components:
 *   schemas:
 *     Execution:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Execution ID
 *         workflowId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, RUNNING, COMPLETED, FAILED, CANCELLED, PAUSED]
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         input:
 *           type: object
 *         output:
 *           type: object
 *     StepExecution:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         nodeId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, RUNNING, COMPLETED, FAILED, SKIPPED]
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         logs:
 *           type: array
 *           items:
 *             type: string
 *     ExecutionInput:
 *       type: object
 *       properties:
 *         input:
 *           type: object
 *           description: JSON input for the workflow execution
 */

/**
 * @swagger
 * tags:
 *   name: Executions
 *   description: Workflow execution management endpoints
 */

/**
 * @swagger
 * /workflows/{workflowId}/execute:
 *   post:
 *     summary: Trigger a workflow execution
 *     tags: [Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workflowId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExecutionInput'
 *     responses:
 *       201:
 *         description: Execution triggered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     run:
 *                       $ref: '#/components/schemas/Execution'
 */

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
/**
 * @swagger
 * /runs:
 *   get:
 *     summary: List executions
 *     tags: [Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workflowId
 *         schema:
 *           type: string
 *         description: Filter by workflow ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, RUNNING, COMPLETED, FAILED, CANCELLED, PAUSED]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of executions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     runs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Execution'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 */
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
/**
 * @swagger
 * /runs/{runId}:
 *   get:
 *     summary: Get execution details
 *     tags: [Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: runId
 *         required: true
 *         schema:
 *           type: string
 *         description: Execution ID
 *     responses:
 *       200:
 *         description: Execution details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     run:
 *                       $ref: '#/components/schemas/Execution'
 *       404:
 *         description: Execution not found
 */
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
/**
 * @swagger
 * /runs/{runId}/pause:
 *   post:
 *     summary: Pause an execution
 *     tags: [Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: runId
 *         required: true
 *         schema:
 *           type: string
 *         description: Execution ID
 *     responses:
 *       200:
 *         description: Execution paused successfully
 */
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
/**
 * @swagger
 * /runs/{runId}/resume:
 *   post:
 *     summary: Resume a paused execution
 *     tags: [Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: runId
 *         required: true
 *         schema:
 *           type: string
 *         description: Execution ID
 *     responses:
 *       200:
 *         description: Execution resumed successfully
 */
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
/**
 * @swagger
 * /runs/{runId}/cancel:
 *   post:
 *     summary: Cancel a running execution
 *     tags: [Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: runId
 *         required: true
 *         schema:
 *           type: string
 *         description: Execution ID
 *     responses:
 *       200:
 *         description: Execution cancelled successfully
 */
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
/**
 * @swagger
 * /runs/{runId}/steps:
 *   get:
 *     summary: Get execution steps details
 *     tags: [Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: runId
 *         required: true
 *         schema:
 *           type: string
 *         description: Execution ID
 *     responses:
 *       200:
 *         description: List of step executions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     steps:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StepExecution'
 */
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
