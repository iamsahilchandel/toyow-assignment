import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../shared/components/ProtectedRoute";
import { AppLayout } from "../shared/layouts/AppLayout";
import { AuthLayout } from "../shared/layouts/AuthLayout";
import { AdminLayout } from "../shared/layouts/AdminLayout";
// Auth pages
import { LoginPage } from "../modules/auth/pages/LoginPage";
import { RegisterPage } from "../modules/auth/pages/RegisterPage";
// Dashboard
import { DashboardHomePage } from "../modules/dashboard/pages/DashboardHomePage";
// Workflows
import { WorkflowsListPage } from "../modules/workflows/pages/WorkflowsListPage";
import { WorkflowDetailPage } from "../modules/workflows/pages/WorkflowDetailPage";
import { WorkflowBuilderPage } from "../modules/workflows/pages/WorkflowBuilderPage";
import { WorkflowVersionsPage } from "../modules/workflows/pages/WorkflowVersionsPage";
// Runs
import { RunsListPage } from "../modules/runs/pages/RunsListPage";
import { RunDetailsPage } from "../modules/runs/pages/RunDetailsPage";
import { RunLogsPage } from "../modules/runs/pages/RunLogsPage";
// Plugins (Admin)
import { PluginsListPage } from "../modules/plugins/pages/PluginsListPage";
import { PluginDetailsPage } from "../modules/plugins/pages/PluginDetailsPage";

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
        <Route
          path="workflows/:workflowId/builder"
          element={<WorkflowBuilderPage />}
        />
        <Route
          path="workflows/:workflowId/versions"
          element={<WorkflowVersionsPage />}
        />
        <Route path="runs" element={<RunsListPage />} />
        <Route path="runs/:runId" element={<RunDetailsPage />} />
        <Route path="runs/:runId/logs" element={<RunLogsPage />} />
      </Route>

      {/* Admin-only routes with AdminLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/plugins" element={<PluginsListPage />} />
        <Route path="/plugins/:pluginId" element={<PluginDetailsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
