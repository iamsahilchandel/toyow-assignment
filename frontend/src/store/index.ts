import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth-slice";
import workflowEditorReducer from "./slices/workflow-editor-slice";
import executionReducer from "./slices/execution-slice";
import logReducer from "./slices/log-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workflowEditor: workflowEditorReducer,
    execution: executionReducer,
    log: logReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state for serialization checks
        ignoredActions: ["execution/addEventToBuffer"],
        ignoredPaths: ["execution.eventBuffer"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
