import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { ROLES } from "../utils/constants";

export default function GuestRoute() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (isAuthenticated && user?.role === ROLES.CUSTOMER) {
    return <Navigate to="/customer/home" replace />;
  }

  if (isAuthenticated && user?.role === ROLES.RESTAURANT_ADMIN) {
    return <Navigate to="restaurant/admin/dashboard" replace />;
  }

  if (isAuthenticated && user?.role === ROLES.WAITER) {
    return <Navigate to="waiter/tables" replace />;
  }

  if (isAuthenticated && user?.role === ROLES.KITCHEN) {
    return <Navigate to="kitchen/display" replace />;
  }

   if (isAuthenticated && user?.role === ROLES.SUPER_ADMIN) {
    return <Navigate to="super-admin/dashboard" replace />;
  }

  return <Outlet />;
}