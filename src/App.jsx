import React, { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import { setLogoutHandler } from "./api/axiosClient";
import store from "./store";
import { logoutUser, refreshSession } from "./store/slices/authSlices/authSlice";
import DineFlowLoader from "./components/ui/DineFlowLoader";

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Register the logout handler for axiosClient to call on refresh failure
    setLogoutHandler(() => {
      store.dispatch(logoutUser());
    });

    const hadSession = sessionStorage.getItem("hasSession");

    if (hadSession) {
      // User was logged in before this page load — try to restore session
      // Block render until we know if the cookie is still valid
      store.dispatch(refreshSession()).finally(() => {
        setAppReady(true);
      });
    } else {
      // No previous session — skip the refresh API call entirely
      // and render immediately
      setAppReady(true);
    }
  }, []);

  // Block the entire app from rendering until session check is done.
  // This is what prevents the flicker/false-logout on fast refresh.
  if (!appReady) {
    return <DineFlowLoader />;
  }

  return (
    <div className="min-h-screen">
      <AppRoutes />
    </div>
  );
}