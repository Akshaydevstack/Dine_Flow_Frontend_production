import { Outlet } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import BottomNav from "../components/common/BottomNav";
import TopBar from "../components/common/CustomerTopBar";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  notificationArrived,
  fetchNotifications,
} from "../../../store/slices/notificationSlice";
import axiosClient from "../../../api/axiosClient";
import {
  requestForToken,
  onMessageListener,
} from "../../../firebase/firebaseConfig";

import { fetchOrders } from "../../../store/slices/orderSlice";
import AiWaiterButton from "../AI/Aiwaiterbutton";
import { BellRing, X } from "lucide-react"; // Import some icons for the banner

export default function CustomerLayout() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const registered = useRef(false);
  const dispatch = useAppDispatch();

  // State to control our custom notification prompt
  const [showPrompt, setShowPrompt] = useState(false);

  // 1. Extract the registration logic into a callable function
  const registerDevice = async () => {
    try {
      const token = await requestForToken();
      if (token) {
        await axiosClient.post(
          "/notification/customer/firebase-fcm/register-device/",
          {
            fcm_token: token,
            device_type: "web",
          },
        );
        setShowPrompt(false); // Hide prompt on success
      }
    } catch (err) {
      console.error("FCM register failed", err);
    }
  };

  useEffect(() => {
    if (registered.current) return;
    registered.current = true;

    // 2. Check permission status safely on load
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        // Already granted previously, safe to fetch token silently
        registerDevice();
      } else if (Notification.permission === "default") {
        // Needs a user gesture. Show our custom banner instead of asking directly.
        // Adding a small delay so it doesn't pop up aggressively instantly.
        setTimeout(() => setShowPrompt(true), 2500);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onMessageListener((payload) => {
      console.log("Notification received");
      dispatch(notificationArrived());

      // 🐛 FIXED BUG: Used strict inequality check
      if (payload?.notification?.title !== "Order Cancelled") {
        dispatch(fetchOrders());
      }

      console.log(payload?.notification?.title);
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

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchNotifications());
  }, [isAuthenticated, dispatch]);

  // 3. Helper functions to check iOS and PWA status
  const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  };
  const isStandalone = () => {
    return "standalone" in window.navigator && window.navigator.standalone;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-body relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Background Blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.08)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(37,99,235,0.15)_0%,transparent_70%)]" />
        <div className="absolute top-[30%] left-[-5%] w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.05)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(236,72,153,0.1)_0%,transparent_70%)]" />
        <div className="absolute bottom-[20%] right-[5%] w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.05)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(16,185,129,0.1)_0%,transparent_70%)]" />
      </div>

      <TopBar />

      {/* 🌟 4. THE FIX: Custom Notification Prompt Banner */}
      {showPrompt && (
        <div className="fixed z-[100] top-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 transition-all">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 text-violet-600 dark:text-violet-400">
                <BellRing size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Live Order Updates
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {isIos() && !isStandalone()
                    ? "To get push notifications on iOS, please tap 'Share' -> 'Add to Home Screen' first, then open the app from there."
                    : "Enable push notifications to know exactly when your food is ready."}
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

          {/* Only show the Enable button if they are NOT on iOS Safari (must be PWA or Android/Desktop) */}
          {(!isIos() || isStandalone()) && (
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setShowPrompt(false)}
                className="flex-1 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Not Now
              </button>
              {/* This click counts as a user gesture! */}
              <button
                onClick={registerDevice}
                className="flex-1 px-3 py-2.5 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-md shadow-violet-500/20"
              >
                Enable Notifications
              </button>
            </div>
          )}
        </div>
      )}

      <Outlet />

      <BottomNav />

      <AiWaiterButton />
    </div>
  );
}
