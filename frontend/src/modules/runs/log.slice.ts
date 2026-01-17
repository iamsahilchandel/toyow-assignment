import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { LogEntry, LogFilters } from "../../shared/types/logs";

interface LogState {
  entries: LogEntry[];
  filters: LogFilters;
  autoScroll: boolean;
  isPaused: boolean;
}

const initialState: LogState = {
  entries: [],
  filters: {},
  autoScroll: true,
  isPaused: false,
};

const logSlice = createSlice({
  name: "log",
  initialState,
  reducers: {
    addLogEntry: (state, action: PayloadAction<LogEntry>) => {
      state.entries.push(action.payload);
      // Keep a reasonable limit on log entries in memory
      if (state.entries.length > 10000) {
        state.entries = state.entries.slice(-5000);
      }
    },
    addLogEntries: (state, action: PayloadAction<LogEntry[]>) => {
      state.entries.push(...action.payload);
      if (state.entries.length > 10000) {
        state.entries = state.entries.slice(-5000);
      }
    },
    clearLogs: (state) => {
      state.entries = [];
    },
    setFilters: (state, action: PayloadAction<LogFilters>) => {
      state.filters = action.payload;
    },
    updateFilter: (
      state,
      action: PayloadAction<{
        key: keyof LogFilters;
        value: LogFilters[keyof LogFilters];
      }>
    ) => {
      state.filters[action.payload.key] = action.payload.value as never;
    },
    setAutoScroll: (state, action: PayloadAction<boolean>) => {
      state.autoScroll = action.payload;
    },
    togglePause: (state) => {
      state.isPaused = !state.isPaused;
    },
  },
});

export const {
  addLogEntry,
  addLogEntries,
  clearLogs,
  setFilters,
  updateFilter,
  setAutoScroll,
  togglePause,
} = logSlice.actions;

export default logSlice.reducer;
