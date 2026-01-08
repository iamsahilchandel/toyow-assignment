import { PluginExecutionContext, PluginExecutionResult } from '../types/workflow.types';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { spawn } from 'child_process';

export class PluginExecutor {
  /**
   * Execute plugin in sandboxed environment
   */
  async executePlugin(
    context: PluginExecutionContext,
    code: string
  ): Promise<PluginExecutionResult> {
    const startTime = Date.now();

    try {
      // Execute plugin based on type
      const result = await this.runInSandbox(code, context);

      return {
        success: true,
        output: result,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      logger.error('Plugin execution failed', {
        nodeId: context.nodeId,
        runId: context.runId,
        error: error.message,
      });

      return {
        success: false,
        error: {
          message: error.message,
          stack: error.stack,
          retryable: this.isRetryableError(error),
        },
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Run plugin code in isolated subprocess
   */
  private async runInSandbox(
    code: string,
    context: PluginExecutionContext
  ): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      const timeout = env.PLUGIN_TIMEOUT_MS;

      // Wrapper script that executes the plugin
      const wrapperScript = `
const pluginCode = ${JSON.stringify(code)};
const context = ${JSON.stringify(context)};

async function executePlugin() {
  try {
    // Create plugin function from code
    const pluginFn = new Function('context', pluginCode);
    const result = await pluginFn(context);
    console.log(JSON.stringify({ success: true, output: result }));
  } catch (error) {
    console.error(JSON.stringify({ 
      success: false, 
      error: { message: error.message, stack: error.stack } 
    }));
    process.exit(1);
  }
}

executePlugin();
`;

      // Spawn Node.js subprocess
      const child = spawn('node', ['-e', wrapperScript], {
        timeout,
        env: {
          ...process.env,
          NODE_ENV: 'plugin-execution',
        },
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (error) => {
        reject(new Error(`Plugin process error: ${error.message}`));
      });

      child.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            if (result.success) {
              resolve(result.output);
            } else {
              reject(new Error(result.error.message));
            }
          } catch (error) {
            reject(new Error('Failed to parse plugin output'));
          }
        } else {
          reject(new Error(stderr || 'Plugin execution failed'));
        }
      });

      // Timeout handling
      setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error('Plugin execution timeout'));
      }, timeout);
    });
  }

  /**
   * Determine if error is retryable
   */
  private isRetryableError(error: any): boolean {
    const retryablePatterns = [/timeout/i, /network/i, /temporary/i];

    const errorMessage = error.message || String(error);

    return retryablePatterns.some((pattern) => pattern.test(errorMessage));
  }

  /**
   * Load plugin code from storage
   */
  async loadPlugin(pluginId: string, version: string): Promise<string> {
    // TODO: Implement plugin loading from MinIO
    // For now, return placeholder
    return `
      return {
        message: "Plugin executed",
        input: context.input,
        config: context.config
      };
    `;
  }
}

export const pluginExecutor = new PluginExecutor();
