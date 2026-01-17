/**
 * WebSocket event types
 */

// Client to Server events
export interface ClientEvents {
  SUBSCRIBE_RUN: {
    runId: string;
  };
  UNSUBSCRIBE_RUN: {
    runId: string;
  };
}

// Server to Client events
export interface ServerEvents {
  SUBSCRIBED: {
    runId: string;
    timestamp: string;
  };
  UNSUBSCRIBED: {
    runId: string;
    timestamp: string;
  };
  RUN_STATUS: {
    runId: string;
    status: string;
    timestamp: string;
  };
  STEP_STATUS: {
    runId: string;
    nodeId: string;
    stepId: string;
    status: string;
    timestamp: string;
    output?: Record<string, any>;
    error?: string;
  };
  STEP_LOG: {
    runId: string;
    nodeId: string;
    stepId: string;
    level: string;
    message: string;
    timestamp: string;
    metadata?: Record<string, any>;
  };
  ERROR: {
    message: string;
    timestamp: string;
  };
}

// Generic WebSocket message
export interface WSMessage<T = any> {
  event: string;
  data: T;
}
