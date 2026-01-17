/**
 * WebSocket client integrated with Redux store.
 * Handles connection, subscriptions, and event dispatching.
 */

import { API_URL } from "../../app/env";
import type { AppDispatch } from "../../app/store";
import {
  WebSocketClient,
  type WebSocketMessage,
} from "../../shared/lib/websocket";
import type {
  WSEvent,
  RunUpdatePayload,
  StepUpdatePayload,
} from "./realtime.types";
import {
  setConnectionStatus,
  setConnectionError,
  addSubscription,
  updateSubscriptionStatus,
  removeSubscription,
  addEventToBuffer,
  updateRunStatus,
  updateStepStatus,
  clearRunData,
} from "./realtime.slice";

let wsClient: WebSocketClient | null = null;
let storeDispatch: AppDispatch | null = null;

/**
 * Handle incoming WebSocket messages and dispatch to Redux.
 */
function handleMessage(message: WebSocketMessage): void {
  if (!storeDispatch) return;

  const event = message as WSEvent;

  // Add to event buffer
  storeDispatch(
    addEventToBuffer({
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    }),
  );

  // Handle specific event types
  switch (event.type) {
    case "SUBSCRIBED":
      const subPayload = event.payload as { runId: string };
      storeDispatch(
        updateSubscriptionStatus({ runId: subPayload.runId, status: "active" }),
      );
      break;

    case "RUN_UPDATE":
      storeDispatch(updateRunStatus(event.payload as RunUpdatePayload));
      break;

    case "STEP_UPDATE":
      storeDispatch(updateStepStatus(event.payload as StepUpdatePayload));
      break;

    case "LOG":
      // Log events are already in buffer, no additional action needed
      // Components can filter buffer for LOG events
      break;

    case "ERROR":
      console.error("WebSocket error event:", event.payload);
      break;

    default:
      // Unknown event type
      console.log("Unknown WebSocket event:", event.type);
  }
}

/**
 * Initialize the WebSocket client with Redux dispatch.
 */
export function initializeWsClient(dispatch: AppDispatch): void {
  if (wsClient) {
    wsClient.disconnect();
  }

  storeDispatch = dispatch;

  // Convert HTTP URL to WebSocket URL
  const wsUrl = API_URL.replace(/^http/, "ws") + "/ws";

  wsClient = new WebSocketClient({
    url: wsUrl,
    reconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    onOpen: () => {
      dispatch(setConnectionStatus("connected"));
    },
    onClose: () => {
      dispatch(setConnectionStatus("disconnected"));
    },
    onError: () => {
      dispatch(setConnectionError("Connection error"));
    },
    onMessage: handleMessage,
    onStatusChange: (status) => {
      // Map WebSocket status to Redux status
      const statusMap: Record<
        string,
        "disconnected" | "connecting" | "connected" | "error"
      > = {
        disconnected: "disconnected",
        connecting: "connecting",
        connected: "connected",
        error: "error",
      };
      dispatch(setConnectionStatus(statusMap[status] || "disconnected"));
    },
  });
}

/**
 * Connect to the WebSocket server.
 */
export function connectWs(): void {
  if (!wsClient) {
    console.warn(
      "WebSocket client not initialized. Call initializeWsClient first.",
    );
    return;
  }
  wsClient.connect();
}

/**
 * Disconnect from the WebSocket server.
 */
export function disconnectWs(): void {
  wsClient?.disconnect();
}

/**
 * Subscribe to run updates.
 */
export function subscribeToRun(runId: string): void {
  if (!wsClient || !storeDispatch) {
    console.warn("WebSocket client not initialized");
    return;
  }

  storeDispatch(addSubscription({ runId, status: "pending" }));
  wsClient.subscribeToRun(runId);
}

/**
 * Unsubscribe from run updates.
 */
export function unsubscribeFromRun(runId: string): void {
  if (!wsClient || !storeDispatch) return;

  wsClient.unsubscribeFromRun(runId);
  storeDispatch(removeSubscription(runId));
  storeDispatch(clearRunData(runId));
}

/**
 * Get the WebSocket client instance (for testing or direct access).
 */
export function getWsClient(): WebSocketClient | null {
  return wsClient;
}

/**
 * Check if connected.
 */
export function isWsConnected(): boolean {
  return wsClient?.isConnected() ?? false;
}
