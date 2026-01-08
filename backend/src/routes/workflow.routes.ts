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
 *           description: Workflow ID
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         isActive:
 *           type: boolean
 *         userId:
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
 *         version:
 *           type: integer
 *         definition:
 *           $ref: '#/components/schemas/DAGDefinition'
 *         isPublished:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *     WorkflowInput:
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
 *     UpdateWorkflowInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         isActive:
 *           type: boolean
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
 *             $ref: '#/components/schemas/WorkflowInput'
 *     responses:
 *       201:
 *         description: Workflow created successfully
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
 *                     workflow:
 *                       $ref: '#/components/schemas/Workflow'
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
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of workflows
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
 *                     workflows:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Workflow'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 */

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
 *         description: Workflow ID
 *     responses:
 *       200:
 *         description: Workflow details
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
 *                     workflow:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Workflow'
 *                         - type: object
 *                           properties:
 *                             versions:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/WorkflowVersion'
 *       404:
 *         description: Workflow not found
 */
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
 *         description: Workflow ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWorkflowInput'
 *     responses:
 *       200:
 *         description: Workflow updated successfully
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
 *                     workflow:
 *                       $ref: '#/components/schemas/Workflow'
 *       404:
 *         description: Workflow not found
 */
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
 *         description: Workflow ID
 *     responses:
 *       200:
 *         description: Workflow deleted successfully
 */
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
 *         description: Workflow ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dagDefinition
 *             properties:
 *               dagDefinition:
 *                 $ref: '#/components/schemas/DAGDefinition'
 *     responses:
 *       201:
 *         description: Version created successfully
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
 *                     version:
 *                       $ref: '#/components/schemas/WorkflowVersion'
 */
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
/**
 * @swagger
 * /workflows/{id}/versions/{versionId}/pin:
 *   put:
 *     summary: Pin a specific version of a workflow
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow ID
 *       - in: path
 *         name: versionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Version ID
 *     responses:
 *       200:
 *         description: Version pinned successfully
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
 *                     version:
 *                       $ref: '#/components/schemas/WorkflowVersion'
 */
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
