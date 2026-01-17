import { PluginType } from '../../../../generated/prisma';
import { StepContext, PluginResult } from '../engine.types';
import {
  executeTextTransform,
  executeApiProxy,
  executeDataAggregator,
  executeDelay,
} from './builtins';

/**
 * Execute a built-in plugin
 */
export async function executeBuiltinPlugin(
  type: PluginType,
  context: StepContext
): Promise<PluginResult> {
  const startTime = Date.now();

  try {
    let result: { success: boolean; output?: Record<string, any>; error?: string };

    switch (type) {
      case 'TEXT_TRANSFORM':
        result = await executeTextTransform(context);
        break;

      case 'API_PROXY':
        result = await executeApiProxy(context);
        break;

      case 'DATA_AGGREGATOR':
        result = await executeDataAggregator(context);
        break;

      case 'DELAY':
        result = await executeDelay(context);
        break;

      default:
        result = {
          success: false,
          error: `Unknown plugin type: ${type}`,
        };
    }

    const duration = Date.now() - startTime;

    if (result.success) {
      return {
        success: true,
        output: result.output,
        duration,
      };
    } else {
      return {
        success: false,
        error: {
          message: result.error || 'Unknown error',
          retryable: isRetryablePluginError(result.error),
        },
        duration,
      };
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      error: {
        message: error.message || 'Plugin execution failed',
        stack: error.stack,
        retryable: isRetryablePluginError(error.message),
      },
      duration,
    };
  }
}

/**
 * Determine if a plugin error should trigger a retry
 */
function isRetryablePluginError(error?: string): boolean {
  if (!error) return false;

  const retryablePatterns = [
    /timeout/i,
    /network/i,
    /econnrefused/i,
    /econnreset/i,
    /etimedout/i,
    /socket hang up/i,
    /rate limit/i,
    /429/,
    /503/,
    /502/,
  ];

  return retryablePatterns.some((pattern) => pattern.test(error));
}
