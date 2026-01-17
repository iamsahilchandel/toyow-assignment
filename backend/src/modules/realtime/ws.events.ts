import { topicManager } from './ws.topics';
import { WSMessage } from './ws.types';
import { logger } from '../../shared/logger';

/**
 * Handle incoming WebSocket message
 */
export function handleWSMessage(clientId: string, message: WSMessage): WSMessage | null {
  const { event, data } = message;

  switch (event) {
    case 'SUBSCRIBE_RUN':
      return handleSubscribeRun(clientId, data.runId);

    case 'UNSUBSCRIBE_RUN':
      return handleUnsubscribeRun(clientId, data.runId);

    default:
      logger.warn('Unknown WS event', { clientId, event });
      return {
        event: 'ERROR',
        data: {
          message: `Unknown event: ${event}`,
          timestamp: new Date().toISOString(),
        },
      };
  }
}

/**
 * Handle SUBSCRIBE_RUN event
 */
function handleSubscribeRun(clientId: string, runId: string): WSMessage {
  if (!runId) {
    return {
      event: 'ERROR',
      data: {
        message: 'runId is required for SUBSCRIBE_RUN',
        timestamp: new Date().toISOString(),
      },
    };
  }

  topicManager.subscribeToRun(clientId, runId);

  return {
    event: 'SUBSCRIBED',
    data: {
      runId,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Handle UNSUBSCRIBE_RUN event
 */
function handleUnsubscribeRun(clientId: string, runId: string): WSMessage {
  if (!runId) {
    return {
      event: 'ERROR',
      data: {
        message: 'runId is required for UNSUBSCRIBE_RUN',
        timestamp: new Date().toISOString(),
      },
    };
  }

  topicManager.unsubscribeFromRun(clientId, runId);

  return {
    event: 'UNSUBSCRIBED',
    data: {
      runId,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Emit run status change to subscribers
 */
export function emitRunStatus(runId: string, status: string): void {
  const message: WSMessage = {
    event: 'RUN_STATUS',
    data: {
      runId,
      status,
      timestamp: new Date().toISOString(),
    },
  };

  const sent = topicManager.broadcastToRun(runId, message);
  logger.debug('Run status emitted', { runId, status, recipients: sent });
}

/**
 * Emit step status change to subscribers
 */
export function emitStepStatus(
  runId: string,
  nodeId: string,
  stepId: string,
  status: string,
  output?: Record<string, any>,
  error?: string
): void {
  const message: WSMessage = {
    event: 'STEP_STATUS',
    data: {
      runId,
      nodeId,
      stepId,
      status,
      timestamp: new Date().toISOString(),
      output,
      error,
    },
  };

  const sent = topicManager.broadcastToRun(runId, message);
  logger.debug('Step status emitted', { runId, nodeId, status, recipients: sent });
}

/**
 * Emit step log to subscribers
 */
export function emitStepLog(
  runId: string,
  nodeId: string,
  stepId: string,
  level: string,
  logMessage: string,
  metadata?: Record<string, any>
): void {
  const message: WSMessage = {
    event: 'STEP_LOG',
    data: {
      runId,
      nodeId,
      stepId,
      level,
      message: logMessage,
      timestamp: new Date().toISOString(),
      metadata,
    },
  };

  topicManager.broadcastToRun(runId, message);
}
