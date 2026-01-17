import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { isAdmin } from "../constants/roles";
import type { ReactNode } from "react";
import { ProtectedRoute } from "./ProtectedRoute";

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !isAdmin(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <ProtectedRoute allowedRoles={["ADMIN"]}>{children}</ProtectedRoute>;
}
