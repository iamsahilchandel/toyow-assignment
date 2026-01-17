import { StepContext } from '../../engine.types';
import { timerQueue } from '../../../../infra/queue';
import { sleep } from '../../../../shared/utils';

/**
 * DELAY Built-in Plugin
 *
 * Modes:
 * - blocking: Sleep for specified duration (blocks worker)
 * - non-blocking: Schedule timer job (releases worker)
 */
export async function executeDelay(
  context: StepContext
): Promise<{ success: boolean; output?: Record<string, any>; error?: string }> {
  const { config, input, runId, nodeId } = context;
  const ms = (config.ms || input.ms || 1000) as number;
  const blocking = (config.blocking !== false) as boolean;

  try {
    if (ms <= 0) {
      return {
        success: false,
        error: 'Delay must be a positive number',
      };
    }

    if (ms > 3600000) {
      return {
        success: false,
        error: 'Delay cannot exceed 1 hour (3600000ms)',
      };
    }

    if (blocking || ms <= 5000) {
      // Blocking delay for short durations
      const startTime = Date.now();
      await sleep(ms);
      const actualDelay = Date.now() - startTime;

      return {
        success: true,
        output: {
          requestedMs: ms,
          actualMs: actualDelay,
          blocking: true,
          completedAt: new Date().toISOString(),
        },
      };
    } else {
      // Non-blocking delay using timer queue
      await timerQueue.add(
        {
          runId,
          nodeId,
          delayMs: ms,
          blocking: false,
          nextNodeInput: input,
        },
        { delay: ms }
      );

      return {
        success: true,
        output: {
          requestedMs: ms,
          blocking: false,
          scheduledAt: new Date().toISOString(),
          willCompleteAt: new Date(Date.now() + ms).toISOString(),
        },
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
