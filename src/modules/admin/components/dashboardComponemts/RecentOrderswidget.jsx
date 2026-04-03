import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminOrders,
  selectAdminOrders,
  selectAdminOrderLoading,
  selectAdminOrderFetched,
  initialOrderFilters,
} from "../../../../store/slices/restaurantAdminSlice/adminOrderSlice";

/* ─── helpers ─────────────────────────────────────────────── */

const fmtTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString())     return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

/* ─── badge config ────────────────────────────────────────── */

const STATUS_CFG = {
  PENDING:   { label: "Pending",   light: "bg-amber-100 text-amber-700",  dark: "dark:bg-amber-900/40 dark:text-amber-300",  dot: "bg-amber-400"  },
  ACCEPTED:  { label: "Accepted",  light: "bg-blue-100 text-blue-700",    dark: "dark:bg-blue-900/40 dark:text-blue-300",    dot: "bg-blue-400"   },
  PREPARING: { label: "Preparing", light: "bg-purple-100 text-purple-700",dark: "dark:bg-purple-900/40 dark:text-purple-300",dot: "bg-purple-400" },
  READY:     { label: "Ready",     light: "bg-emerald-100 text-emerald-700",dark:"dark:bg-emerald-900/40 dark:text-emerald-300",dot:"bg-emerald-400"},
  COMPLETED: { label: "Completed", light: "bg-green-100 text-green-700",  dark: "dark:bg-green-900/40 dark:text-green-300",  dot: "bg-green-500"  },
  CANCELLED: { label: "Cancelled", light: "bg-red-100 text-red-700",      dark: "dark:bg-red-900/40 dark:text-red-300",      dot: "bg-red-400"    },
};

const PAYMENT_CFG = {
  PAID:     { label: "Paid",     cls: "text-emerald-600 dark:text-emerald-400" },
  PENDING:  { label: "Unpaid",   cls: "text-red-500 dark:text-red-400"         },
  REFUNDED: { label: "Refunded", cls: "text-gray-500 dark:text-gray-400"       },
};

/* ─── Skeleton row ────────────────────────────────────────── */
const SkeletonRow = () => (
  <div className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 w-28 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-2.5 w-20 rounded bg-gray-100 dark:bg-gray-800" />
    </div>
    <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
    <div className="h-3 w-12 rounded bg-gray-100 dark:bg-gray-800" />
  </div>
);

/* ─── Single order row ────────────────────────────────────── */
const OrderRow = ({ order, index }) => {
  const sc = STATUS_CFG[order.status]          || { label: order.status,         light: "bg-gray-100 text-gray-600",  dark: "",     dot: "bg-gray-400" };
  const pc = PAYMENT_CFG[order.payment_status] || { label: order.payment_status, cls: "text-gray-500 dark:text-gray-400" };

  const firstDish = order.items?.[0];
  const extraCount = (order.items?.length ?? 1) - 1;

  return (
    <div
      className="group flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors duration-150 border-b border-gray-100 dark:border-gray-800 last:border-0"
      style={{ animationDelay: `${index * 60}ms`, animation: "rowFadeIn 0.3s ease both" }}
    >
      <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 font-mono tracking-tight">
            {order.order_id}
          </span>
          <span className="hidden sm:inline text-xs text-gray-400 dark:text-gray-500">·</span>
          <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400 truncate">
            {order.table?.table_number} — {order.table?.zone_name}
          </span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
          {firstDish?.name ?? "—"}
          {extraCount > 0 && (
            <span className="ml-1 text-gray-400 dark:text-gray-600">+{extraCount} more</span>
          )}
        </p>
      </div>

      <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${sc.light} ${sc.dark}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
        {sc.label}
      </span>

      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">₹{order.total}</p>
        <p className={`text-[11px] font-medium ${pc.cls}`}>{pc.label}</p>
      </div>

      <div className="hidden md:block text-right shrink-0 min-w-[52px]">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{fmtTime(order.created_at)}</p>
        <p className="text-[11px] text-gray-400 dark:text-gray-600">{fmtDate(order.created_at)}</p>
      </div>
    </div>
  );
};

/* ─── Main widget ─────────────────────────────────────────── */
export default function RecentOrdersWidget({ onShowAll }) {
  const dispatch = useDispatch();
  const allOrders = useSelector(selectAdminOrders);
  const loading   = useSelector(selectAdminOrderLoading);
  const fetched   = useSelector(selectAdminOrderFetched);

  useEffect(() => {
    if (!fetched) {
      // Increased itemsPerPage to 10
      dispatch(fetchAdminOrders({ ...initialOrderFilters, itemsPerPage: 10 }));
    }
  }, [dispatch, fetched]);

  // Max 10 orders
  const recent = allOrders.slice(0, 10);

  return (
    <>
      <style>{`
        @keyframes rowFadeIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
      `}</style>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">

        {/* ── Header ── */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
              </span>
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                Live Orders Feed
              </h2>
            </div>
            <button
              onClick={onShowAll}
              className="group flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
            >
              Show all
              <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
            Real-time tracking of the latest 10 orders. Monitor kitchen status, table assignments, and payment confirmation as they happen.
          </p>
        </div>

        {/* ── Column labels ── */}
        <div className="flex items-center gap-3 px-5 py-2 bg-gray-50/70 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
          <div className="w-7 shrink-0" />
          <p className="flex-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">Order & Table</p>
          <p className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 w-20 shrink-0">Status</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 w-16 shrink-0 text-right">Total</p>
          <p className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 w-14 shrink-0 text-right">Time</p>
        </div>

        {/* ── Scrollable Rows Container ── */}
        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <span className="text-4xl mb-3">🍽️</span>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No active orders</p>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">New orders will pop up here instantly.</p>
            </div>
          ) : (
            recent.map((order, i) => (
              <OrderRow key={order.order_id} order={order} index={i} />
            ))
          )}
        </div>

        {/* ── Footer ── */}
        {!loading && recent.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <button
              onClick={onShowAll}
              className="w-full py-2 rounded-xl text-xs font-bold text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-150"
            >
              Full Order Management Panel →
            </button>
          </div>
        )}
      </div>
    </>
  );
}