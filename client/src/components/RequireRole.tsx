import { Navigate, Outlet } from "react-router-dom";
import { getStoredRole } from "../lib/auth";
import type { Role } from "../types";

export function RequireRole({ allowedRoles }: { allowedRoles: Role[] }) {
  const role = getStoredRole();
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
