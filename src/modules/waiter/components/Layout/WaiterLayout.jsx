// WaiterLayout.jsx (Full file)
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

import { BellRing, X, Utensils, PackageCheck } from "lucide-react"; 
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
  
  // Grab the current waiter's ID
  const internal_id = useAppSelector((state) => state.auth.user?.id);

  const [orderAlert, setOrderAlert] = useState(null);
  const audioRef = useRef(null);

  const closePopup = useCallback(() => {
    setOrderAlert(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; 
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
      // 🟢 HANDLE NEW ORDERS
      if (message.type === "new_order_alert") {
        const eventData = message.data;

        // Skip popup if the waiter placed it themselves
        if (
          eventData.event_type === "ORDER_CREATED" && 
          eventData.user_id !== internal_id
        ) {
          audioRef.current = new Audio("/bell.wav");
          audioRef.current.play().catch((e) => console.log("Audio play blocked:", e));

          setOrderAlert({ ...eventData, alertType: "NEW_ORDER" });
          setTimeout(() => closePopup(), 10000);
        }

        dispatch(fetchOrdersToAccept());
      } 
      // 🟢 HANDLE ORDER READY FROM KITCHEN
      else if (message.type === "order_ready_alert") {
        const eventData = message.data;

        audioRef.current = new Audio("/bell.wav"); 
        audioRef.current.play().catch((e) => console.log("Audio play blocked:", e));

        setOrderAlert({ ...eventData, alertType: "ORDER_READY" });
        setTimeout(() => closePopup(), 10000);

        dispatch(fetchOrdersToAccept());
      }
    },
    [dispatch, closePopup, internal_id],
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
          { fcm_token: fcmToken, device_type: "web" }
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
      const title = payload?.notification?.title || "";
      if (title.includes("New Order") || title.includes("Ready")) {
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

  const isIos = () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isStandalone = () => "standalone" in window.navigator && window.navigator.standalone;

  // 🟢 ROUTING FIX: Open the correct tab based on the alert
  const handleViewOrders = () => {
    closePopup(); 
    const targetTab = orderAlert?.alertType === "ORDER_READY" ? "ready" : "pending";
    navigate("/waiter/orders", { state: { tab: targetTab } });
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
              onClick={closePopup}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <X size={18} />
            </button>

            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-inner ${
              orderAlert.alertType === "ORDER_READY" 
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" 
                : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
            }`}>
              {orderAlert.alertType === "ORDER_READY" ? (
                <PackageCheck size={36} className="animate-bounce" />
              ) : (
                <BellRing size={36} className="animate-bounce" />
              )}
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              {orderAlert.alertType === "ORDER_READY" ? "Order Ready!" : "New Order!"}
            </h2>

            <div className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full mb-6 mt-1">
              <Utensils size={14} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {orderAlert.alertType === "ORDER_READY" && orderAlert.order_id && `Order ${orderAlert.order_id} · `}
                Table {orderAlert.table_number || "Unknown"}
              </span>
            </div>

            <div className="w-full flex gap-3">
              <button
                onClick={closePopup}
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