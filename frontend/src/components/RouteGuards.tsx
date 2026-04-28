import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ClientGuard() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated || role !== "client") return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function AdminGuard() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated || role !== "admin") return <Navigate to="/login" replace />;
  return <Outlet />;
}
