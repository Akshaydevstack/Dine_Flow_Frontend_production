import React, { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";

import { setLogoutHandler } from "./api/axiosClient";
import store from "./store";
import { logoutUser,refreshSession } from "./store/slices/authSlices/authSlice";

export default function App() {

  useEffect(() => {
    // ✅ Register logout handler
    setLogoutHandler(() => {
      store.dispatch(logoutUser());
    });

    // ✅ Try to restore session from HttpOnly cookie on every page load
    store.dispatch(refreshSession());
  }, []);

  return (
    <div className="min-h-screen">
      <AppRoutes />
    </div>
  );
}