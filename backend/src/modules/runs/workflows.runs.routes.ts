import { Router } from 'express';
import { runsController } from './runs.controller';
import { triggerExecutionSchema } from './runs.schemas';
import { validate, authenticate } from '../../shared/http';

const router = Router();

// All workflow run routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /workflows/{workflowId}/runs:
 *   post:
 *     summary: Trigger workflow execution
 *     tags: [Runs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workflowId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               input:
 *                 type: object
 *     responses:
 *       201:
 *         description: Execution started
 */
router.post(
  '/:workflowId/runs',
  validate(triggerExecutionSchema),
  runsController.trigger.bind(runsController)
);

export default router;
