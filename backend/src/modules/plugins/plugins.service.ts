import { prismaClient } from '../../prisma/client';
import { NotFoundError, ConflictError } from '../../shared/errors';
import { parsePagination } from '../../shared/utils';
import { sha256 } from '../../shared/crypto';
import { PluginType } from '../../../generated/prisma';
import { CreatePluginInput, CreatePluginVersionInput, ListPluginsQuery } from './plugins.schemas';

export class PluginsService {
  /**
   * Create a new plugin (ADMIN only)
   */
  async createPlugin(data: CreatePluginInput) {
    // Check for existing plugin with same name
    const existing = await prismaClient.plugin.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new ConflictError(`Plugin with name "${data.name}" already exists`);
    }

    const plugin = await prismaClient.plugin.create({
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
      },
    });

    return plugin;
  }

  /**
   * Get plugin by ID
   */
  async getPlugin(pluginId: string) {
    const plugin = await prismaClient.plugin.findUnique({
      where: { id: pluginId },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!plugin) {
      throw new NotFoundError('Plugin');
    }

    return plugin;
  }

  /**
   * List plugins with filtering and pagination
   */
  async listPlugins(filters: ListPluginsQuery = {}) {
    const { page, limit, skip } = parsePagination(filters);

    const where: any = {};

    if (filters.type) {
      where.type = filters.type;
    }

    const [plugins, total] = await Promise.all([
      prismaClient.plugin.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          versions: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Latest version only
          },
        },
      }),
      prismaClient.plugin.count({ where }),
    ]);

    return {
      plugins,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new plugin version (ADMIN only)
   */
  async createPluginVersion(pluginId: string, data: CreatePluginVersionInput) {
    // Verify plugin exists
    const plugin = await prismaClient.plugin.findUnique({
      where: { id: pluginId },
    });

    if (!plugin) {
      throw new NotFoundError('Plugin');
    }

    // Check for existing version
    const existingVersion = await prismaClient.pluginVersion.findFirst({
      where: {
        pluginId,
        version: data.version,
      },
    });

    if (existingVersion) {
      throw new ConflictError(`Version ${data.version} already exists for this plugin`);
    }

    // Generate checksum for the code
    const checksumSha256 = sha256(data.code);

    const version = await prismaClient.pluginVersion.create({
      data: {
        pluginId,
        version: data.version,
        code: data.code,
        config: data.config,
        checksumSha256,
      },
    });

    return version;
  }

  /**
   * Get plugin versions
   */
  async getPluginVersions(pluginId: string) {
    // Verify plugin exists
    await this.getPlugin(pluginId);

    const versions = await prismaClient.pluginVersion.findMany({
      where: { pluginId },
      orderBy: { createdAt: 'desc' },
    });

    return versions;
  }

  /**
   * Get specific plugin version
   */
  async getPluginVersion(pluginId: string, versionId: string) {
    const version = await prismaClient.pluginVersion.findUnique({
      where: { id: versionId },
    });

    if (!version || version.pluginId !== pluginId) {
      throw new NotFoundError('Plugin version');
    }

    return version;
  }

  /**
   * Get plugin by type (for execution)
   */
  async getPluginByType(type: PluginType) {
    const plugin = await prismaClient.plugin.findFirst({
      where: { type },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return plugin;
  }
}

export const pluginsService = new PluginsService();
