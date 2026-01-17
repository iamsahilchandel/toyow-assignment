import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";

/**
 * AdminLayout - Wrapper layout for admin-only routes.
 * Checks if the current user has ADMIN role.
 * Redirects to home if not authorized.
 */
export function AdminLayout() {
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth,
  );

  // Wait for auth check to complete
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check for ADMIN role
  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground">
          You don't have permission to access this page.
        </p>
        <a href="/" className="text-primary underline">
          Return to Dashboard
        </a>
      </div>
    );
  }

  return <Outlet />;
}
