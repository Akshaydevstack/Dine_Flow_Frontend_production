import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import DineFlowLoader from "../components/ui/DineFlowLoader";

export default function ProtectedRoute({ allowedRole }) {
  const { isAuthenticated, user, sessionChecked } = useAppSelector(
    (state) => state.auth
  );

  // ⏳ Wait for the refreshSession call to finish before making routing decisions
  if (!sessionChecked) {
    return <DineFlowLoader/>; // replace with your spinner component
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}