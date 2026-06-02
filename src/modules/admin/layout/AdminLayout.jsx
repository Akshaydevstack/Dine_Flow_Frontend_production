import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../store/hooks";
import AdminSidebar from "../components/AdminSidebar";

import {
  fetchAdminOrders,
  invalidateAdminOrders,
} from "../../../store/slices/restaurantAdminSlice/adminOrderSlice";
import {
  fetchAdminTables,
  invalidateAdminTables,
} from "../../../store/slices/restaurantAdminSlice/adminTableSlice";

// 🟢 Import the two new custom hooks (Adjust path if necessary!)
import {
  useAdminOrderSocket,
  useAdminTableSocket,
} from "../../../modules/admin/hooks/useAdminSockets";

import { BellRing, X, Utensils } from "lucide-react";

const SIDEBAR_COLLAPSED_W = 64;
const SIDEBAR_EXPANDED_W = 176;

export default function AdminLayout() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = useAppSelector((state) => state.auth.accessToken);
  const [orderAlert, setOrderAlert] = useState(null);

  const orderFilters = useAppSelector((state) => state.adminOrders?.filters);
  const tableFilters = useAppSelector((state) => state.adminTables?.filters);

  // -----------------------------------------------------
  // 🟢 WebSocket Handler 1: Live Order Updates
  // -----------------------------------------------------
  const handleOrderUpdate = useCallback(
    (message) => {
      // Listen for the specific type emitted by your Django AdminOrderConsumer
      if (message.type === "admin_order_update") {
        const eventData = message.data;
        console.log("🛎️ Admin Order Event Received:", eventData);

        // ONLY show the popup and play the bell if it's a BRAND NEW order
        if (eventData.event_type === "ORDER_CREATED") {
          const audio = new Audio("/bell.mp3");
          audio.play().catch((e) => console.log("Audio play blocked:", e));

          setOrderAlert(eventData);

          setTimeout(() => {
            setOrderAlert(null);
          }, 10000);
        }

        // Regardless of event type (created, accepted, cancelled), refresh the orders list
        dispatch(invalidateAdminOrders());
        if (orderFilters) dispatch(fetchAdminOrders(orderFilters));
      }
    },
    [dispatch, orderFilters],
  );

  // -----------------------------------------------------
  // 🟢 WebSocket Handler 2: Live Table Session Updates
  // -----------------------------------------------------
  const handleTableUpdate = useCallback(
    (message) => {
      // Listen for the specific type emitted by your Django AdminTableConsumer
      if (message.type === "admin_table_update") {
        console.log("🪑 Admin Table Event Received:", message.data);

        // Silently refresh the tables list in the background
        dispatch(invalidateAdminTables());
        if (tableFilters) dispatch(fetchAdminTables(tableFilters));
      }
    },
    [dispatch, tableFilters],
  );

  // Initialize both sockets
  useAdminOrderSocket({ token, onMessage: handleOrderUpdate });
  useAdminTableSocket({ token, onMessage: handleTableUpdate });

  const handleViewOrders = () => {
    setOrderAlert(null);
    navigate("/restaurant/admin/order-management");
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsExpanded(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = isExpanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W;

  return (
    <div
      className="flex min-h-screen
        bg-gray-50 dark:bg-gray-900
        transition-colors duration-300 relative"
    >
      {/* 🛎️ Custom Centered Order Popup */}
      {orderAlert && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm flex flex-col items-center text-center relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setOrderAlert(null)}
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
                onClick={() => setOrderAlert(null)}
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

      {/* ── SIDEBAR (desktop only) ── */}
      {!isMobile && (
        <div
          style={{ width: sidebarWidth }}
          className="fixed left-0 top-0 h-full z-40 transition-[width] duration-300 ease-in-out"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <AdminSidebar isExpanded={isExpanded} />
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main
        style={{ marginLeft: isMobile ? 0 : sidebarWidth }}
        className="flex-1 min-h-screen transition-[margin-left] duration-300 ease-in-out"
      >
        <Outlet />
      </main>
    </div>
  );
}
