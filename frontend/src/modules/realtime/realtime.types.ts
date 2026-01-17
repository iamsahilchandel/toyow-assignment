/**
 * Type definitions for WebSocket real-time events.
 */

import type { ExecutionStatus } from "../../shared/types/workflow";
import type { LogLevel } from "../../shared/types/logs";

// Run status values (matching backend ExecutionStatus)
export type RunStatus = ExecutionStatus;

// Step status values (matching backend ExecutionStatus)
export type StepStatus = ExecutionStatus;

// WebSocket event types
export type WSEventType =
  | "SUBSCRIBE_RUN"
  | "UNSUBSCRIBE_RUN"
  | "RUN_UPDATE"
  | "STEP_UPDATE"
  | "LOG"
  | "ERROR"
  | "CONNECTED"
  | "SUBSCRIBED";

// Base WebSocket event
export interface WSEvent<T = unknown> {
  type: WSEventType;
  payload: T;
  timestamp?: string;
}

// Run update event payload
export interface RunUpdatePayload {
  runId: string;
  status: RunStatus;
  progress?: number;
  currentStep?: string;
  error?: string;
}

// Step update event payload
export interface StepUpdatePayload {
  runId: string;
  nodeId: string;
  status: StepStatus;
  startedAt?: string;
  completedAt?: string;
  output?: unknown;
  error?: string;
  retryCount?: number;
}

// Log event payload (using UPPERCASE LogLevel from logs.ts)
export interface LogPayload {
  runId: string;
  nodeId?: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Error event payload
export interface ErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

// Subscription status
export interface Subscription {
  runId: string;
  subscribedAt: string;
  status: "active" | "pending" | "error";
}

// Connection state
export interface RealtimeConnectionState {
  status: "disconnected" | "connecting" | "connected" | "error";
  lastConnectedAt?: string;
  reconnectAttempts: number;
  error?: string;
}

// Realtime state for Redux
export interface RealtimeState {
  connection: RealtimeConnectionState;
  subscriptions: Record<string, Subscription>;
  eventBuffer: WSEvent[];
  runStatuses: Record<string, RunStatus>;
  stepStatuses: Record<string, Record<string, StepStatus>>;
}
