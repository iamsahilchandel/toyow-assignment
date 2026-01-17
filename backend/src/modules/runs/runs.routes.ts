import { Router } from 'express';
import { runsController } from './runs.controller';
import {
  triggerExecutionSchema,
  runIdSchema,
  stepNodeIdSchema,
  listRunsSchema,
  logsQuerySchema,
} from './runs.schemas';
import { validate, authenticate } from '../../shared/http';

const router = Router();

// All runs routes require authentication
router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     Execution:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         workflowVersionId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, RUNNING, PAUSED, SUCCESS, FAILED, RETRYING, CANCELLED]
 *         startedAt:
 *           type: string
 *           format: date-time
 *         completedAt:
 *           type: string
 *           format: date-time
 *         input:
 *           type: object
 *     StepExecution:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         runId:
 *           type: string
 *         nodeId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, RUNNING, SUCCESS, FAILED, RETRYING, SKIPPED]
 *         startedAt:
 *           type: string
 *           format: date-time
 *         completedAt:
 *           type: string
 *           format: date-time
 *         input:
 *           type: object
 *         output:
 *           type: object
 *         error:
 *           type: object
 *         retryCount:
 *           type: integer
 */

/**
 * @swagger
 * tags:
 *   name: Runs
 *   description: Workflow execution management endpoints
 */

/**
 * @swagger
 * /runs:
 *   get:
 *     summary: List executions
 *     tags: [Runs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workflowId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of executions
 */
router.get('/', validate(listRunsSchema), runsController.list.bind(runsController));

/**
 * @swagger
 * /runs/{runId}:
 *   get:
 *     summary: Get execution by ID
 *     tags: [Runs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: runId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Execution details
 */
router.get('/:runId', validate(runIdSchema), runsController.get.bind(runsController));

/**
 * @swagger
 * /runs/{runId}/pause:
 *   post:
 *     summary: Pause execution
 *     tags: [Runs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Execution paused
 */
router.post('/:runId/pause', validate(runIdSchema), runsController.pause.bind(runsController));

/**
 * @swagger
 * /runs/{runId}/resume:
 *   post:
 *     summary: Resume execution
 *     tags: [Runs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Execution resumed
 */
router.post('/:runId/resume', validate(runIdSchema), runsController.resume.bind(runsController));

/**
 * @swagger
 * /runs/{runId}/cancel:
 *   post:
 *     summary: Cancel execution
 *     tags: [Runs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Execution cancelled
 */
router.post('/:runId/cancel', validate(runIdSchema), runsController.cancel.bind(runsController));

/**
 * @swagger
 * /runs/{runId}/steps:
 *   get:
 *     summary: Get step executions
 *     tags: [Runs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of step executions
 */
router.get('/:runId/steps', validate(runIdSchema), runsController.getSteps.bind(runsController));

/**
 * @swagger
 * /runs/{runId}/steps/{nodeId}:
 *   get:
 *     summary: Get specific step
 *     tags: [Runs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Step details
 */
router.get(
  '/:runId/steps/:nodeId',
  validate(stepNodeIdSchema),
  runsController.getStep.bind(runsController)
);

/**
 * @swagger
 * /runs/{runId}/steps/{nodeId}/retry:
 *   post:
 *     summary: Retry a failed step
 *     tags: [Runs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Step retry initiated
 */
router.post(
  '/:runId/steps/:nodeId/retry',
  validate(stepNodeIdSchema),
  runsController.retryStep.bind(runsController)
);

/**
 * @swagger
 * /runs/{runId}/logs:
 *   get:
 *     summary: Get execution logs
 *     tags: [Runs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [DEBUG, INFO, WARN, ERROR]
 *       - in: query
 *         name: stepId
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Execution logs
 */
router.get('/:runId/logs', validate(logsQuerySchema), runsController.getLogs.bind(runsController));

/**
 * @swagger
 * /runs/{runId}/logs/stream:
 *   get:
 *     summary: Stream logs as NDJSON
 *     tags: [Runs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: NDJSON log stream
 *         content:
 *           application/x-ndjson:
 *             schema:
 *               type: string
 */
router.get(
  '/:runId/logs/stream',
  validate(runIdSchema),
  runsController.streamLogs.bind(runsController)
);

export default router;
