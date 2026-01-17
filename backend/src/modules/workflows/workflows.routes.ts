import { Router } from 'express';
import { workflowsController } from './workflows.controller';
import {
  createWorkflowSchema,
  updateWorkflowSchema,
  workflowIdSchema,
  createVersionSchema,
  pinVersionSchema,
  listWorkflowsSchema,
} from './workflows.schemas';
import { validate, authenticate } from '../../shared/http';

const router = Router();

// All workflow routes require authentication
router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     DAGDefinition:
 *       type: object
 *       description: JSON object defining the DAG structure (nodes, edges)
 *       additionalProperties: true
 *     Workflow:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdById:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     WorkflowVersion:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         workflowId:
 *           type: string
 *         version:
 *           type: integer
 *         dagDefinition:
 *           $ref: '#/components/schemas/DAGDefinition'
 *         isPinned:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreateWorkflowInput:
 *       type: object
 *       required:
 *         - name
 *         - dagDefinition
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         dagDefinition:
 *           $ref: '#/components/schemas/DAGDefinition'
 */

/**
 * @swagger
 * tags:
 *   name: Workflows
 *   description: Workflow management endpoints
 */

/**
 * @swagger
 * /workflows:
 *   post:
 *     summary: Create a new workflow
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWorkflowInput'
 *     responses:
 *       201:
 *         description: Workflow created successfully
 */
router.post(
  '/',
  validate(createWorkflowSchema),
  workflowsController.create.bind(workflowsController)
);

/**
 * @swagger
 * /workflows:
 *   get:
 *     summary: List workflows
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of workflows
 */
router.get('/', validate(listWorkflowsSchema), workflowsController.list.bind(workflowsController));

/**
 * @swagger
 * /workflows/{id}:
 *   get:
 *     summary: Get a workflow by ID
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workflow details
 *       404:
 *         description: Workflow not found
 */
router.get('/:id', validate(workflowIdSchema), workflowsController.get.bind(workflowsController));

/**
 * @swagger
 * /workflows/{id}:
 *   put:
 *     summary: Update a workflow
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workflow updated
 */
router.put(
  '/:id',
  validate(updateWorkflowSchema),
  workflowsController.update.bind(workflowsController)
);

/**
 * @swagger
 * /workflows/{id}:
 *   delete:
 *     summary: Delete a workflow
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workflow deleted
 */
router.delete(
  '/:id',
  validate(workflowIdSchema),
  workflowsController.delete.bind(workflowsController)
);

/**
 * @swagger
 * /workflows/{id}/versions:
 *   post:
 *     summary: Create a new version for a workflow
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Version created
 */
router.post(
  '/:id/versions',
  validate(createVersionSchema),
  workflowsController.createVersion.bind(workflowsController)
);

/**
 * @swagger
 * /workflows/{id}/versions:
 *   get:
 *     summary: List workflow versions
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of versions
 */
router.get(
  '/:id/versions',
  validate(workflowIdSchema),
  workflowsController.listVersions.bind(workflowsController)
);

/**
 * @swagger
 * /workflows/{id}/versions/{versionId}:
 *   get:
 *     summary: Get specific workflow version
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Version details
 */
router.get(
  '/:id/versions/:versionId',
  validate(pinVersionSchema),
  workflowsController.getVersion.bind(workflowsController)
);

/**
 * @swagger
 * /workflows/{id}/versions/{versionId}/pin:
 *   post:
 *     summary: Pin a workflow version for execution
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Version pinned
 */
router.post(
  '/:id/versions/:versionId/pin',
  validate(pinVersionSchema),
  workflowsController.pinVersion.bind(workflowsController)
);

export default router;
