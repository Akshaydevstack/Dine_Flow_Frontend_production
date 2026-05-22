import React, { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import { setLogoutHandler } from "./api/axiosClient";
import store from "./store";
import { logoutUser, refreshSession } from "./store/slices/authSlices/authSlice";
import DineFlowLoader from "./components/ui/DineFlowLoader";

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    setLogoutHandler(() => {
      store.dispatch(logoutUser());
    });

    const hadSession = localStorage.getItem("hasSession");

    if (hadSession) {
      // Set a 300ms delay. 
      // If the user fast-refreshes, the component unmounts BEFORE the 300ms is up.
      const timer = setTimeout(() => {
        store.dispatch(refreshSession()).finally(() => {
          setAppReady(true);
        });
      }, 250); // 300ms is usually fast enough to feel instant, but slow enough to catch a double-reload

      // THIS IS THE MAGIC: If the component unmounts (because they refreshed again), 
      // clear the timer so the request never fires.
      return () => clearTimeout(timer);
      
    } else {
      setAppReady(true);
    }
  }, []);

  if (!appReady) {
    return <DineFlowLoader />;
  }

  return (
    <div className="min-h-screen">
      <AppRoutes />
    </div>
  );
}