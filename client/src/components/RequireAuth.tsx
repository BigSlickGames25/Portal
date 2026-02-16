import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getStoredRole } from "../lib/auth";

export function RequireAuth() {
  const role = getStoredRole();
  const location = useLocation();
  if (!role) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
