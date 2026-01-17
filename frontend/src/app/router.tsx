import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../shared/components/ProtectedRoute";
import { AppLayout } from "../shared/layouts/AppLayout";
import { AuthLayout } from "../shared/layouts/AuthLayout";
// Pages will be imported as we migrate them
import { LoginPage } from "../modules/auth/pages/LoginPage";
import { RegisterPage } from "../modules/auth/pages/RegisterPage";
import { DashboardHomePage } from "../modules/dashboard/pages/DashboardHomePage";
import { WorkflowsListPage } from "../modules/workflows/pages/WorkflowsListPage";
import { WorkflowDetailPage } from "../modules/workflows/pages/WorkflowDetailPage";
import { RunsListPage } from "../modules/runs/pages/RunsListPage";
import { RunDetailsPage } from "../modules/runs/pages/RunDetailsPage";
import { RunLogsPage } from "../modules/runs/pages/RunLogsPage";
import { PluginsListPage } from "../modules/plugins/pages/PluginsListPage";
import { PluginDetailsPage } from "../modules/plugins/pages/PluginDetailsPage";
import { AdminRoute } from "../shared/components/AdminRoute";

export function AppRouter() {
  return (
    <Routes>
      {/* Public routes with AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected routes with AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHomePage />} />
        <Route path="workflows" element={<WorkflowsListPage />} />
        <Route path="workflows/:workflowId" element={<WorkflowDetailPage />} />
        <Route path="runs" element={<RunsListPage />} />
        <Route path="runs/:runId" element={<RunDetailsPage />} />
        <Route path="runs/:runId/logs" element={<RunLogsPage />} />
        {/* TODO: Add remaining routes (workflow builder, versions) */}
      </Route>

      {/* Admin-only routes */}
      <Route
        path="/plugins"
        element={
          <AdminRoute>
            <PluginsListPage />
          </AdminRoute>
        }
      />
      <Route
        path="/plugins/:pluginId"
        element={
          <AdminRoute>
            <PluginDetailsPage />
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
