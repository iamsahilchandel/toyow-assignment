import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  RealtimeState,
  WSEvent,
  StepStatus,
  RunUpdatePayload,
  StepUpdatePayload,
  Subscription,
} from "./realtime.types";

const initialState: RealtimeState = {
  connection: {
    status: "disconnected",
    reconnectAttempts: 0,
  },
  subscriptions: {},
  eventBuffer: [],
  runStatuses: {},
  stepStatuses: {},
};

const MAX_EVENT_BUFFER_SIZE = 100;

const realtimeSlice = createSlice({
  name: "realtime",
  initialState,
  reducers: {
    // Connection state updates
    setConnectionStatus: (
      state,
      action: PayloadAction<RealtimeState["connection"]["status"]>,
    ) => {
      state.connection.status = action.payload;
      if (action.payload === "connected") {
        state.connection.lastConnectedAt = new Date().toISOString();
        state.connection.reconnectAttempts = 0;
        state.connection.error = undefined;
      }
    },

    setConnectionError: (state, action: PayloadAction<string>) => {
      state.connection.status = "error";
      state.connection.error = action.payload;
    },

    incrementReconnectAttempts: (state) => {
      state.connection.reconnectAttempts += 1;
    },

    // Subscription management
    addSubscription: (
      state,
      action: PayloadAction<{ runId: string; status?: Subscription["status"] }>,
    ) => {
      const { runId, status = "pending" } = action.payload;
      state.subscriptions[runId] = {
        runId,
        subscribedAt: new Date().toISOString(),
        status,
      };
    },

    updateSubscriptionStatus: (
      state,
      action: PayloadAction<{ runId: string; status: Subscription["status"] }>,
    ) => {
      const { runId, status } = action.payload;
      if (state.subscriptions[runId]) {
        state.subscriptions[runId].status = status;
      }
    },

    removeSubscription: (state, action: PayloadAction<string>) => {
      delete state.subscriptions[action.payload];
    },

    clearAllSubscriptions: (state) => {
      state.subscriptions = {};
    },

    // Event buffer
    addEventToBuffer: (state, action: PayloadAction<WSEvent>) => {
      state.eventBuffer.push(action.payload);
      // Keep buffer size limited
      if (state.eventBuffer.length > MAX_EVENT_BUFFER_SIZE) {
        state.eventBuffer = state.eventBuffer.slice(-MAX_EVENT_BUFFER_SIZE);
      }
    },

    clearEventBuffer: (state) => {
      state.eventBuffer = [];
    },

    // Run status updates
    updateRunStatus: (state, action: PayloadAction<RunUpdatePayload>) => {
      const { runId, status } = action.payload;
      state.runStatuses[runId] = status;
    },

    // Step status updates
    updateStepStatus: (state, action: PayloadAction<StepUpdatePayload>) => {
      const { runId, nodeId, status } = action.payload;
      if (!state.stepStatuses[runId]) {
        state.stepStatuses[runId] = {};
      }
      state.stepStatuses[runId][nodeId] = status;
    },

    // Bulk update steps (for initial load)
    setStepStatuses: (
      state,
      action: PayloadAction<{
        runId: string;
        steps: Record<string, StepStatus>;
      }>,
    ) => {
      const { runId, steps } = action.payload;
      state.stepStatuses[runId] = steps;
    },

    // Clear run data when unsubscribing
    clearRunData: (state, action: PayloadAction<string>) => {
      const runId = action.payload;
      delete state.runStatuses[runId];
      delete state.stepStatuses[runId];
    },

    // Reset entire state
    resetRealtimeState: () => initialState,
  },
});

export const {
  setConnectionStatus,
  setConnectionError,
  incrementReconnectAttempts,
  addSubscription,
  updateSubscriptionStatus,
  removeSubscription,
  clearAllSubscriptions,
  addEventToBuffer,
  clearEventBuffer,
  updateRunStatus,
  updateStepStatus,
  setStepStatuses,
  clearRunData,
  resetRealtimeState,
} = realtimeSlice.actions;

export default realtimeSlice.reducer;
