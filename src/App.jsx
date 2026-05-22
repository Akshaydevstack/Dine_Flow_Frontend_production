import React, { useEffect, useState, useRef } from "react";
import AppRoutes from "./routes/AppRoutes";
import { setLogoutHandler } from "./api/axiosClient";
import store from "./store";
import { logoutUser, refreshSession } from "./store/slices/authSlices/authSlice";
import DineFlowLoader from "./components/ui/DineFlowLoader";

export default function App() {
  const [appReady, setAppReady] = useState(false);
  
  const isInitializing = useRef(false);

  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    // Register the logout handler for axiosClient to call on refresh failure
    setLogoutHandler(() => {
      store.dispatch(logoutUser());
    });

    const hadSession = localStorage.getItem("hasSession");

    if (hadSession) {
      // 1. Set a 500ms delay. If the user fast-refreshes, the component unmounts
      // and the timer is cleared BEFORE the API call ever hits the backend.
      const timer = setTimeout(() => {
        store.dispatch(refreshSession()).finally(() => {
          setAppReady(true);
        });
      }, 500); // 500ms buffer

      // 2. Clear the timeout if the component unmounts (page reload)
    } else {
      // No previous session
      setAppReady(true);
    }
  }, []); // Empty dependency array

  if (!appReady) {
    return <DineFlowLoader />;
  }

  return (
    <div className="min-h-screen">
      <AppRoutes />
    </div>
  );
}