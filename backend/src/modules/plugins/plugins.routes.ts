import { Router } from 'express';
import { pluginsController } from './plugins.controller';
import {
  createPluginSchema,
  pluginIdSchema,
  createPluginVersionSchema,
  listPluginsSchema,
} from './plugins.schemas';
import { validate, authenticate, requireAdmin } from '../../shared/http';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Plugin:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [TEXT_TRANSFORM, API_PROXY, DATA_AGGREGATOR, DELAY, IF]
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     PluginVersion:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         pluginId:
 *           type: string
 *         version:
 *           type: string
 *         code:
 *           type: string
 *         checksumSha256:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreatePluginInput:
 *       type: object
 *       required:
 *         - name
 *         - type
 *       properties:
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [TEXT_TRANSFORM, API_PROXY, DATA_AGGREGATOR, DELAY, IF]
 *         description:
 *           type: string
 *     CreatePluginVersionInput:
 *       type: object
 *       required:
 *         - version
 *         - code
 *       properties:
 *         version:
 *           type: string
 *           description: Semver format (e.g., 1.0.0)
 *         code:
 *           type: string
 *         config:
 *           type: object
 */

/**
 * @swagger
 * tags:
 *   name: Plugins
 *   description: Plugin management endpoints
 */

/**
 * @swagger
 * /plugins:
 *   get:
 *     summary: List all plugins
 *     tags: [Plugins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
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
 *         description: List of plugins
 */
router.get(
  '/',
  authenticate,
  validate(listPluginsSchema),
  pluginsController.list.bind(pluginsController)
);

/**
 * @swagger
 * /plugins/{pluginId}:
 *   get:
 *     summary: Get plugin by ID
 *     tags: [Plugins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pluginId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plugin details
 */
router.get(
  '/:pluginId',
  authenticate,
  validate(pluginIdSchema),
  pluginsController.get.bind(pluginsController)
);

/**
 * @swagger
 * /plugins:
 *   post:
 *     summary: Create a new plugin (ADMIN only)
 *     tags: [Plugins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePluginInput'
 *     responses:
 *       201:
 *         description: Plugin created
 *       403:
 *         description: Admin access required
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createPluginSchema),
  pluginsController.create.bind(pluginsController)
);

/**
 * @swagger
 * /plugins/{pluginId}/versions:
 *   get:
 *     summary: List plugin versions
 *     tags: [Plugins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pluginId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of plugin versions
 */
router.get(
  '/:pluginId/versions',
  authenticate,
  validate(pluginIdSchema),
  pluginsController.listVersions.bind(pluginsController)
);

/**
 * @swagger
 * /plugins/{pluginId}/versions:
 *   post:
 *     summary: Create plugin version (ADMIN only)
 *     tags: [Plugins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pluginId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePluginVersionInput'
 *     responses:
 *       201:
 *         description: Plugin version created
 *       403:
 *         description: Admin access required
 */
router.post(
  '/:pluginId/versions',
  authenticate,
  requireAdmin,
  validate(createPluginVersionSchema),
  pluginsController.createVersion.bind(pluginsController)
);

export default router;
