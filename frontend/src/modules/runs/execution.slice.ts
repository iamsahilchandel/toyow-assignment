import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  NodeExecutionState,
  ExecutionMetadata,
  ExecutionEvent,
} from "../../shared/types/run";
import type { ExecutionStatus } from "../../shared/types/workflow";

interface ExecutionState {
  currentExecution: ExecutionMetadata | null;
  nodeStates: Record<string, NodeExecutionState>;
  wsConnected: boolean;
  wsError: string | null;
  eventBuffer: ExecutionEvent[];
}

const initialState: ExecutionState = {
  currentExecution: null,
  nodeStates: {},
  wsConnected: false,
  wsError: null,
  eventBuffer: [],
};

const executionSlice = createSlice({
  name: "execution",
  initialState,
  reducers: {
    setExecution: (state, action: PayloadAction<ExecutionMetadata>) => {
      state.currentExecution = action.payload;
      state.nodeStates = {};
    },
    updateNodeState: (state, action: PayloadAction<NodeExecutionState>) => {
      state.nodeStates[action.payload.nodeId] = action.payload;
    },
    updateExecutionStatus: (state, action: PayloadAction<ExecutionStatus>) => {
      if (state.currentExecution) {
        state.currentExecution.status = action.payload;
      }
    },
    setWsConnected: (state, action: PayloadAction<boolean>) => {
      state.wsConnected = action.payload;
      if (action.payload) {
        state.wsError = null;
      }
    },
    setWsError: (state, action: PayloadAction<string | null>) => {
      state.wsError = action.payload;
    },
    addEventToBuffer: (state, action: PayloadAction<ExecutionEvent>) => {
      state.eventBuffer.push(action.payload);
      // Keep buffer size limited
      if (state.eventBuffer.length > 100) {
        state.eventBuffer.shift();
      }
    },
    clearEventBuffer: (state) => {
      state.eventBuffer = [];
    },
    clearExecution: (state) => {
      state.currentExecution = null;
      state.nodeStates = {};
      state.eventBuffer = [];
    },
  },
});

export const {
  setExecution,
  updateNodeState,
  updateExecutionStatus,
  setWsConnected,
  setWsError,
  addEventToBuffer,
  clearEventBuffer,
  clearExecution,
} = executionSlice.actions;

export default executionSlice.reducer;
