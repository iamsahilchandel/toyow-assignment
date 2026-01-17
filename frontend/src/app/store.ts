import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../modules/auth/auth.slice";
import workflowEditorReducer from "../modules/workflows/workflow-editor.slice";
import executionReducer from "../modules/runs/execution.slice";
import logReducer from "../modules/runs/log.slice";
import realtimeReducer from "../modules/realtime/realtime.slice";
import { authApi } from "../modules/auth/auth.api";
import { workflowsApi } from "../modules/workflows/workflows.api";
import { runsApi } from "../modules/runs/runs.api";
import { pluginsApi } from "../modules/plugins/plugins.api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workflowEditor: workflowEditorReducer,
    execution: executionReducer,
    log: logReducer,
    realtime: realtimeReducer,
    [authApi.reducerPath]: authApi.reducer,
    [workflowsApi.reducerPath]: workflowsApi.reducer,
    [runsApi.reducerPath]: runsApi.reducer,
    [pluginsApi.reducerPath]: pluginsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state for serialization checks
        ignoredActions: [
          "execution/addEventToBuffer",
          "realtime/addEventToBuffer",
        ],
        ignoredPaths: ["execution.eventBuffer", "realtime.eventBuffer"],
      },
    }).concat(
      authApi.middleware,
      workflowsApi.middleware,
      runsApi.middleware,
      pluginsApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
