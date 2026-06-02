import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../../store/hooks";
import WaiterBottomNav from "../common/WaiterBottomNav";
import { updateTableSession } from "../../../../store/slices/waiterSlice/waiterTablesSlice";
import { fetchOrdersToAccept } from "../../../../store/slices/waiterSlice/waiterOrderSlice";

import {
  useWaiterTableSessionSocket,
  useWaiterDisplaySocket,
} from "../../hooks/useWaiterSocket";

import { BellRing, X, Utensils } from "lucide-react";
import axiosClient from "../../../../api/axiosClient";
import {
  requestForToken,
  onMessageListener,
} from "../../../../firebase/firebaseConfig";

export default function WaiterLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useAppSelector((state) => state.auth.accessToken);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [orderAlert, setOrderAlert] = useState(null);
  
  // 🟢 NEW: Store the audio object so we can pause it later
  const audioRef = useRef(null);

  // 🟢 NEW: Unified function to close the popup AND stop the sound
  const closePopup = useCallback(() => {
    setOrderAlert(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset to beginning
    }
  }, []);

  // -----------------------------------------------------
  // 1. WebSocket Logic (Table Sessions)
  // -----------------------------------------------------
  const handleSessionUpdate = useCallback(
    (data) => {
      console.log("📡 Table session update:", data);
      dispatch(updateTableSession(data));
    },
    [dispatch],
  );

  useWaiterTableSessionSocket({
    token,
    onMessage: handleSessionUpdate,
  });

  // -----------------------------------------------------
  // 2. Foreground WebSocket (Live Order Popups)
  // -----------------------------------------------------
  const handleWaiterDisplayUpdate = useCallback(
    (message) => {
      if (message.type === "new_order_alert") {
        const eventData = message.data;
        console.log("🛎️ Instant Foreground Alert:", eventData);

        if (eventData.event_type === "ORDER_CREATED") {
          // 🟢 Initialize audio and save it to the ref
          audioRef.current = new Audio("/bell.wav");
          audioRef.current.play().catch((e) => console.log("Audio play blocked (User must interact first):", e));

          setOrderAlert(eventData);

          // Auto-dismiss after 10 seconds and stop sound
          setTimeout(() => {
            closePopup();
          }, 10000);
        }

        // Refresh orders list silently in the background
        dispatch(fetchOrdersToAccept());
      }
    },
    [dispatch, closePopup],
  );

  useWaiterDisplaySocket({
    token,
    onMessage: handleWaiterDisplayUpdate,
  });

  // -----------------------------------------------------
  // 3. FCM Push Notification Logic (Background)
  // -----------------------------------------------------
  const registered = useRef(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const registerDevice = async () => {
    try {
      const fcmToken = await requestForToken();
      if (fcmToken) {
        await axiosClient.post(
          "/notification/waiter/firebase-fcm/register-device/",
          {
            fcm_token: fcmToken,
            device_type: "web",
          },
        );
        setShowPrompt(false);
      }
    } catch (err) {
      console.error("FCM register failed", err);
    }
  };

  useEffect(() => {
    if (registered.current || !isAuthenticated) return;
    registered.current = true;

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        registerDevice();
      } else if (Notification.permission === "default") {
        setTimeout(() => setShowPrompt(true), 2500);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const unsubscribe = onMessageListener((payload) => {
      console.log("🔔 Waiter FCM Notification received:", payload);

      if (payload?.notification?.title?.includes("New Order")) {
        dispatch(fetchOrdersToAccept());
      }

      if (Notification.permission === "granted") {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [dispatch]);

  const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  };
  const isStandalone = () => {
    return "standalone" in window.navigator && window.navigator.standalone;
  };

  const handleViewOrders = () => {
    closePopup(); // 🟢 Stop sound and hide popup
    navigate("/waiter/orders");
  };

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  return (
    <div className="min-h-screen bg-white dark:bg-gray-450 text-gray-900 dark:text-gray-100 font-body relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 dark:bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-[30%] left-[-5%] w-72 h-72 bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[5%] w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[110px]" />
      </div>

      {orderAlert && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm flex flex-col items-center text-center relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={closePopup} // 🟢 Use unified close function
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-5 shadow-inner">
              <BellRing size={36} className="animate-bounce" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              New Order!
            </h2>

            <div className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full mb-6 mt-1">
              <Utensils size={14} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Table {orderAlert.table_number || "Unknown"}
              </span>
            </div>

            <div className="w-full flex gap-3">
              <button
                onClick={closePopup} // 🟢 Use unified close function
                className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={handleViewOrders}
                className="flex-1 py-3.5 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 transition-colors shadow-lg shadow-violet-500/30"
              >
                View
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrompt && (
        <div className="fixed z-[100] top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 transition-all">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 text-violet-600 dark:text-violet-400">
                <BellRing size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Live Staff Alerts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {isIos() && !isStandalone()
                    ? "To get instant order alerts on iOS, tap 'Share' -> 'Add to Home Screen', then open the app."
                    : "Enable push notifications so you never miss a new table order or kitchen update."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPrompt(false)}
              className="text-slate-400 hover:text-slate-600 flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {(!isIos() || isStandalone()) && (
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setShowPrompt(false)}
                className="flex-1 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Not Now
              </button>
              <button
                onClick={registerDevice}
                className="flex-1 px-3 py-2.5 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-md shadow-violet-500/20"
              >
                Enable Alerts
              </button>
            </div>
          )}
        </div>
      )}

      <Outlet />
      <WaiterBottomNav />
    </div>
  );
}