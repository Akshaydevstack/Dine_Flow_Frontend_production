import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

export default function ProtectedRoute({ allowedRole }) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}