import React, { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";

import { setLogoutHandler } from "./api/axiosClient";
import store from "./store";
import { logoutUser } from "./store/slices/authSlices/authSlice";

export default function App() {

  useEffect(() => {
    setLogoutHandler(() => {
      store.dispatch(logoutUser());
    });
  }, []);

  return (
    <div className="min-h-screen">
      <AppRoutes />
    </div>
  );
}