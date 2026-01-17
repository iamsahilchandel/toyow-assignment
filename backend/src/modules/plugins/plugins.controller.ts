import { Request, Response, NextFunction } from 'express';
import { pluginsService } from './plugins.service';

/**
 * Plugins controller - handles HTTP request/response logic
 */
export class PluginsController {
  /**
   * Create a new plugin (ADMIN only)
   * POST /plugins
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const plugin = await pluginsService.createPlugin(req.body);

      res.status(201).json({
        success: true,
        data: { plugin },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List plugins
   * GET /plugins
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await pluginsService.listPlugins(req.query as any);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get plugin by ID
   * GET /plugins/:pluginId
   */
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const plugin = await pluginsService.getPlugin(req.params.pluginId);

      res.status(200).json({
        success: true,
        data: { plugin },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create plugin version (ADMIN only)
   * POST /plugins/:pluginId/versions
   */
  async createVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const version = await pluginsService.createPluginVersion(req.params.pluginId, req.body);

      res.status(201).json({
        success: true,
        data: { version },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List plugin versions
   * GET /plugins/:pluginId/versions
   */
  async listVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const versions = await pluginsService.getPluginVersions(req.params.pluginId);

      res.status(200).json({
        success: true,
        data: { versions },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const pluginsController = new PluginsController();
