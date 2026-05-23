import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminOrders,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
  setAdminOrderSearch,
  setAdminOrderStatusFilter,
  setAdminOrderCurrentPage,
  setAdminOrderSortBy,
  setAdminOrderPaymentFilter,
  setAdminOrderDateRange,
  clearAdminOrderDateRange,
  resetAdminOrderFilters,
  selectAdminOrders,
  selectAdminOrderFilters,
  selectAdminOrderPagination,
  selectAdminOrderLoading,
  selectAdminOrderRefreshing,
  selectAdminOrderLoadingMore,
  selectAdminOrderError,
  selectAdminOrderFetched,
  selectAdminOrderMutating,
} from "../../../store/slices/restaurantAdminSlice/adminOrderSlice";
import {
  Search,
  Clock,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  XCircle,
  RefreshCw,
  AlertCircle,
  Loader2,
  CreditCard,
  SlidersHorizontal,
  MapPin,
  Calendar,
  CalendarRange,
  Timer,
  History,
  ArrowRight,
} from "lucide-react";

/* ================================================================
   STATUS CONFIG
================================================================ */
const STATUS_CFG = {
  CREATED: {
    label: "New",
    icon: Clock,
    pill: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    bar: "bg-blue-500",
  },
  ACCEPTED: {
    label: "Accepted",
    icon: CheckCircle2,
    pill: "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
    bar: "bg-indigo-500",
  },
  PREPARING: {
    label: "Cooking",
    icon: ChefHat,
    pill: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    bar: "bg-amber-500",
  },
  READY: {
    label: "Ready",
    icon: PackageCheck,
    pill: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    bar: "bg-emerald-500",
  },
  COMPLETED: {
    label: "Done",
    icon: CheckCircle2,
    pill: "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    bar: "bg-slate-400",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    pill: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
    bar: "bg-rose-500",
  },
};

const PIPELINE = ["CREATED", "ACCEPTED", "PREPARING", "READY", "COMPLETED"];

/* ================================================================
   DATE / TIME HELPERS
================================================================ */

/**
 * Format an ISO date string → "Mar 15, 2024 · 02:45 PM"
 * Returns "—" if the value is falsy.
 */
const formatDateTime = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
};

/**
 * Format just the time portion → "02:45 PM"
 */
const formatTime = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
};

/**
 * Relative elapsed time → "5m ago", "2h ago", etc.
 */
const timeAgo = (iso) => {
  if (!iso) return "";
  try {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return "";
  }
};

/**
 * Build a timeline array from an order's timestamps.
 * Adjust field names to match your actual API response.
 */
const buildTimeline = (order) => {
  // Map status → timestamp field name (adjust to your backend's actual field names)
  const entries = [
    { status: "CREATED",   label: "Order Placed",    ts: order.created_at },
    { status: "ACCEPTED",  label: "Accepted",         ts: order.accepted_at },
    { status: "PREPARING", label: "Cooking Started",  ts: order.preparing_at },
    { status: "READY",     label: "Ready for Pickup", ts: order.ready_at },
    { status: "COMPLETED", label: "Completed",        ts: order.completed_at },
    { status: "CANCELLED", label: "Cancelled",        ts: order.cancelled_at },
  ];

  // Return only entries that have a timestamp OR are the current status
  return entries.filter((e) => e.ts || e.status === order.status);
};

/* ================================================================
   FILTER PILL
================================================================ */
const FilterPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap
      ${
        active
          ? "bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-500/30"
          : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-violet-300 dark:hover:border-violet-700 bg-white dark:bg-slate-900"
      }`}
  >
    {label}
  </button>
);

/* ================================================================
   DATE RANGE PICKER
================================================================ */
const DateRangePicker = ({ dateFrom, dateTo, onChange, onClear }) => {
  const hasRange = dateFrom || dateTo;

  return (
    <div>
      <p className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-1.5">
        <CalendarRange size={11} />
        Date Range
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {/* From */}
        <div className="relative">
          <Calendar
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => onChange({ dateFrom: e.target.value })}
            className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold outline-none focus:ring-2 ring-violet-500/20 focus:border-violet-400 transition-all"
            placeholder="From"
          />
        </div>

        <ArrowRight size={14} className="text-slate-400 flex-shrink-0" />

        {/* To */}
        <div className="relative">
          <Calendar
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => onChange({ dateTo: e.target.value })}
            className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold outline-none focus:ring-2 ring-violet-500/20 focus:border-violet-400 transition-all"
            placeholder="To"
          />
        </div>

        {/* Quick presets */}
        {[
          {
            label: "Today",
            fn: () => {
              const t = new Date().toISOString().slice(0, 10);
              onChange({ dateFrom: t, dateTo: t });
            },
          },
          {
            label: "Last 7d",
            fn: () => {
              const to = new Date().toISOString().slice(0, 10);
              const from = new Date(Date.now() - 6 * 86400000)
                .toISOString()
                .slice(0, 10);
              onChange({ dateFrom: from, dateTo: to });
            },
          },
          {
            label: "This Month",
            fn: () => {
              const now = new Date();
              const from = new Date(now.getFullYear(), now.getMonth(), 1)
                .toISOString()
                .slice(0, 10);
              const to = now.toISOString().slice(0, 10);
              onChange({ dateFrom: from, dateTo: to });
            },
          },
        ].map((p) => (
          <button
            key={p.label}
            onClick={p.fn}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider hover:border-violet-300 dark:hover:border-violet-700 transition-all whitespace-nowrap"
          >
            {p.label}
          </button>
        ))}

        {hasRange && (
          <button
            onClick={onClear}
            className="text-[10px] font-black uppercase text-rose-400 hover:text-rose-500 transition-colors"
          >
            ✕ Clear
          </button>
        )}
      </div>
    </div>
  );
};

/* ================================================================
   TIMESTAMP TIMELINE (inside the card)
================================================================ */
const OrderTimeline = ({ order }) => {
  const timeline = buildTimeline(order);
  if (timeline.length === 0) return null;

  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800">
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-1">
        <History size={9} />
        Timeline
      </p>
      <div className="space-y-2">
        {timeline.map((entry, i) => {
          const isLast = i === timeline.length - 1;
          const isCurrent = entry.status === order.status;

          return (
            <div key={entry.status} className="flex items-start gap-2.5">
              {/* Dot + line */}
              <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 transition-all
                    ${
                      isCurrent && isCancelled
                        ? "bg-rose-500"
                        : isCurrent
                        ? "bg-violet-600 ring-2 ring-violet-300 dark:ring-violet-800"
                        : entry.ts
                        ? "bg-slate-300 dark:bg-slate-600"
                        : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    }`}
                />
                {!isLast && (
                  <div className="w-px h-4 bg-slate-100 dark:bg-slate-800 mt-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 -mt-0.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wide
                      ${
                        isCurrent && isCancelled
                          ? "text-rose-500"
                          : isCurrent
                          ? "text-violet-600 dark:text-violet-400"
                          : entry.ts
                          ? "text-slate-600 dark:text-slate-400"
                          : "text-slate-300 dark:text-slate-700"
                      }`}
                  >
                    {entry.label}
                  </span>
                  {entry.ts && (
                    <span className="text-[9px] font-mono text-slate-400 flex-shrink-0">
                      {formatTime(entry.ts)}
                    </span>
                  )}
                </div>
                {entry.ts && (
                  <p className="text-[9px] text-slate-300 dark:text-slate-700 font-medium mt-0.5">
                    {timeAgo(entry.ts)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ================================================================
   STATS STRIP
================================================================ */
const StatsStrip = ({ orders }) => {
  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const paid = orders.filter((o) => o.payment_status === "PAID").length;
  const revenue = orders
    .filter((o) => o.payment_status === "PAID")
    .reduce((s, o) => s + parseFloat(o.total || 0), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {[
        { label: "New", value: counts.CREATED || 0, color: "text-blue-500" },
        {
          label: "Cooking",
          value: counts.PREPARING || 0,
          color: "text-amber-500",
        },
        { label: "Ready", value: counts.READY || 0, color: "text-emerald-500" },
        { label: "Paid", value: paid, color: "text-violet-500" },
        {
          label: "Revenue",
          value: `₹${revenue.toFixed(0)}`,
          color: "text-slate-700 dark:text-white",
        },
      ].map((s) => (
        <div
          key={s.label}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center"
        >
          <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
          <p className="text-[10px] font-black uppercase text-slate-400 mt-0.5">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
};

/* ================================================================
   ORDER CARD
================================================================ */
const OrderCard = React.forwardRef(({ order, mutating }, ref) => {
  const dispatch = useDispatch();
  const cfg = STATUS_CFG[order.status] ?? STATUS_CFG.CREATED;
  const StatusIcon = cfg.icon;
  const busy = !!mutating;

  const pipelineStep = PIPELINE.indexOf(order.status);
  const isArchived = ["COMPLETED", "CANCELLED"].includes(order.status);
  const isPaid = order.payment_status === "PAID";

  // Elapsed time since order was placed
  const elapsed = order.created_at ? timeAgo(order.created_at) : "";

  const doStatus = (v) =>
    dispatch(
      updateAdminOrderStatus({ publicId: order.order_id, statusValue: v }),
    );
  const doPayment = (v) =>
    dispatch(
      updateAdminPaymentStatus({ publicId: order.order_id, paymentStatus: v }),
    );

  return (
    <div
      ref={ref}
      className={`group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 hover:border-violet-200 dark:hover:border-violet-800
        h-[560px] /* 👈 FIX: Lock the card height */
        ${busy ? "opacity-60 pointer-events-none grayscale" : ""}`}
    >
      {/* Coloured status bar */}
      <div className={`h-1.5 w-full flex-shrink-0 ${cfg.bar}`} />

      {/* Header (Locked) */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3 border-b border-slate-50 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center font-black text-white text-base shadow-lg flex-shrink-0">
            {order.table?.table_number ?? "?"}
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
              {order.order_id}
            </p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
              {order.user_id}
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-500 font-bold">
              <MapPin size={10} className="text-slate-400" />
              {order.table?.zone_name ?? "—"}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase flex-shrink-0 ${cfg.pill}`}
          >
            {busy ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <StatusIcon size={11} strokeWidth={3} />
            )}
            {cfg.label}
          </div>
          {/* Elapsed time badge */}
          {elapsed && (
            <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
              <Timer size={9} />
              {elapsed}
            </div>
          )}
        </div>
      </div>

      {/* ── Created At timestamp (Locked) ── */}
      {order.created_at && (
        <div className="px-5 py-2.5 bg-slate-50/60 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 flex-shrink-0">
          <Calendar size={10} className="text-slate-400 flex-shrink-0" />
          <span className="text-[10px] text-slate-500 dark:text-slate-500 font-semibold">
            Placed:{" "}
            <span className="font-black text-slate-600 dark:text-slate-400">
              {formatDateTime(order.created_at)}
            </span>
          </span>
        </div>
      )}

      {/* Pipeline progress (Locked) */}
      {!isArchived && (
        <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-1">
            {PIPELINE.slice(0, -1).map((step, i) => {
              const done = i <= pipelineStep - 1;
              const current = i === pipelineStep;
              return (
                <React.Fragment key={step}>
                  <div
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${done || current ? cfg.bar : "bg-slate-100 dark:bg-slate-800"}`}
                  />
                  {i < PIPELINE.length - 2 && (
                    <div
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all ${done ? cfg.bar : "bg-slate-100 dark:bg-slate-800"}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="flex justify-between mt-1.5">
            {["New", "Accept", "Cook", "Ready"].map((l, i) => (
              <span
                key={l}
                className={`text-[8px] font-black uppercase ${i <= pipelineStep ? "text-slate-600 dark:text-slate-400" : "text-slate-300 dark:text-slate-700"}`}
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── SCROLLABLE MIDDLE SECTION ── */}
      {/* 👇 FIX: Unified scrolling area, scrollbars hidden visually */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Items */}
        <div className="px-5 py-4 space-y-3">
          {order.items?.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 group/item"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 flex items-center justify-center bg-violet-50 dark:bg-violet-500/10 rounded-lg text-[10px] font-black text-violet-600 flex-shrink-0">
                  {item.quantity}
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover/item:text-slate-900 dark:group-hover/item:text-white transition-colors truncate">
                  {item.name}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400 flex-shrink-0">
                {item.total}
              </span>
            </div>
          ))}
          {order.special_request && (
            <div className="flex gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 mt-1">
              <AlertCircle size={14} className="shrink-0 text-amber-600 mt-0.5" />
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300 italic leading-relaxed">
                "{order.special_request}"
              </p>
            </div>
          )}
        </div>

        {/* ── TIMELINE ── */}
        <OrderTimeline order={order} />
      </div>

      {/* Footer (Locked to bottom) */}
      <div className="px-5 pb-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 flex-shrink-0 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <button
            disabled={busy}
            onClick={() => doPayment(isPaid ? "PENDING" : "PAID")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[10px] font-black uppercase transition-all
              ${
                isPaid
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-emerald-300"
              }`}
          >
            <CreditCard size={12} />
            {isPaid ? "Paid" : "Unpaid"}
          </button>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase text-slate-400">
              Total
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-none">
              {order.currency} {order.total}
            </p>
          </div>
        </div>

        {/* Updated At — shown if available */}
        {order.updated_at && order.updated_at !== order.created_at && (
          <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
            <Clock size={9} />
            <span>
              Updated: <span className="font-bold">{formatDateTime(order.updated_at)}</span>
            </span>
          </div>
        )}

        {order.status === "CREATED" && (
          <div className="flex gap-2">
            <button
              onClick={() => doStatus("CANCELLED")}
              className="p-3 border border-rose-200 dark:border-rose-900/50 text-rose-500 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex-shrink-0"
            >
              <XCircle size={18} />
            </button>
            <button
              onClick={() => doStatus("ACCEPTED")}
              className="flex-1 py-3 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-500/30 hover:bg-violet-700 transition-all"
            >
              Accept Order
            </button>
          </div>
        )}
        {order.status === "ACCEPTED" && (
          <button
            onClick={() => doStatus("PREPARING")}
            className="w-full py-3.5 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-all"
          >
            🍳 Start Cooking
          </button>
        )}
        {order.status === "PREPARING" && (
          <button
            onClick={() => doStatus("READY")}
            className="w-full py-3.5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all"
          >
            ✅ Mark as Ready
          </button>
        )}
        {order.status === "READY" && (
          <button
            onClick={() => doStatus("COMPLETED")}
            className="w-full py-3.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-100 transition-all"
          >
            🎉 Complete Order
          </button>
        )}
        {isArchived && (
          <div className="w-full py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
            {order.status === "CANCELLED" ? "❌ Cancelled" : "✅ Archived"}
          </div>
        )}
      </div>
    </div>
  );
});
OrderCard.displayName = "OrderCard";

/* ================================================================
   EMPTY STATE
================================================================ */
const EmptyState = ({ filtered, onReset }) => (
  <div className="col-span-full flex flex-col items-center justify-center h-64 text-slate-400">
    <span className="text-5xl mb-4">📋</span>
    <p className="font-bold uppercase text-xs tracking-widest">
      {filtered ? "No orders match your filters" : "No orders yet"}
    </p>
    {filtered && (
      <button
        onClick={onReset}
        className="mt-4 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-xs font-black hover:bg-violet-700"
      >
        Clear filters
      </button>
    )}
  </div>
);

/* ================================================================
   MAIN COMPONENT
================================================================ */
const OrderManagement = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectAdminOrders);
  const filters = useSelector(selectAdminOrderFilters);
  const pagination = useSelector(selectAdminOrderPagination);
  const loading = useSelector(selectAdminOrderLoading);
  const isRefreshing = useSelector(selectAdminOrderRefreshing);
  const loadingMore = useSelector(selectAdminOrderLoadingMore);
  const error = useSelector(selectAdminOrderError);
  const fetched = useSelector(selectAdminOrderFetched);
  const mutating = useSelector(selectAdminOrderMutating);

  const [searchTerm, setSearchTerm] = useState(filters.searchQuery);
  const [showFilters, setShowFilters] = useState(false);

  const observer = useRef();
  const isMounted = useRef(false);

  /* ── Infinite scroll sentinel ── */
  const lastOrderRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && pagination.hasNext) {
          dispatch(setAdminOrderCurrentPage(filters.currentPage + 1));
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, pagination.hasNext, filters.currentPage, dispatch],
  );

  /* ── Initial fetch — only if not yet fetched ── */
  useEffect(() => {
    if (!fetched) dispatch(fetchAdminOrders(filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Filter / sort / page watcher ── */
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    dispatch(fetchAdminOrders(filters));
  }, [
    dispatch,
    filters.searchQuery,
    filters.status,
    filters.paymentStatus,
    filters.sortBy,
    filters.currentPage,
    filters.dateFrom,
    filters.dateTo,
  ]);

  /* ── Debounced search ── */
  useEffect(() => {
    const t = setTimeout(() => dispatch(setAdminOrderSearch(searchTerm)), 400);
    return () => clearTimeout(t);
  }, [searchTerm, dispatch]);

  const handleRefresh = () =>
    dispatch(fetchAdminOrders({ ...filters, currentPage: 1 }));

  const handleReset = () => {
    setSearchTerm("");
    dispatch(resetAdminOrderFilters());
  };

  const handleDateChange = (range) => {
    dispatch(setAdminOrderDateRange(range));
  };

  const handleDateClear = () => {
    dispatch(clearAdminOrderDateRange());
  };

  const isFiltered =
    filters.status !== "all" ||
    filters.paymentStatus !== "all" ||
    !!filters.searchQuery ||
    !!filters.dateFrom ||
    !!filters.dateTo;

  const activeFilterCount =
    (filters.status !== "all" ? 1 : 0) +
    (filters.paymentStatus !== "all" ? 1 : 0) +
    (searchTerm ? 1 : 0) +
    (filters.dateFrom || filters.dateTo ? 1 : 0);

  // Active date range label for header badge
  const dateRangeLabel =
    filters.dateFrom && filters.dateTo
      ? `${filters.dateFrom} → ${filters.dateTo}`
      : filters.dateFrom
      ? `From ${filters.dateFrom}`
      : filters.dateTo
      ? `To ${filters.dateTo}`
      : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-4 lg:p-8 transition-colors duration-300">
      {/* ── PAGE HEADER ── */}
      <header className="flex flex-col lg:flex-row justify-between mb-8 gap-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Live Orders
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Kitchen & Revenue Control Centre
            {pagination.totalItems > 0 && (
              <span className="ml-2 text-violet-500 font-bold">
                · {pagination.totalItems} total
              </span>
            )}
          </p>
          {/* Active date range display */}
          {dateRangeLabel && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-wide">
              <CalendarRange size={10} />
              {dateRangeLabel}
              <button
                onClick={handleDateClear}
                className="ml-1 hover:text-rose-500 transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {/* Search */}
          <div className="relative flex-1 lg:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              className="w-full pl-12 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 ring-violet-500/20"
              placeholder="Search orders…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Subtle inline search indicator */}
            {isRefreshing && (
              <Loader2
                size={14}
                className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-violet-400"
              />
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`relative p-3 rounded-2xl border transition-all
              ${
                showFilters || activeFilterCount > 0
                  ? "bg-violet-50 dark:bg-violet-500/10 border-violet-300 dark:border-violet-700 text-violet-600"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900"
              }`}
          >
            <SlidersHorizontal size={20} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-violet-600 text-white text-[9px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            title="Refresh orders"
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <RefreshCw
              size={20}
              className={
                loading || isRefreshing ? "animate-spin text-violet-500" : ""
              }
            />
          </button>
        </div>
      </header>

      {/* ── STATS STRIP ── */}
      {orders.length > 0 && <StatsStrip orders={orders} />}

      {/* ── FILTER PANEL ── */}
      {showFilters && (
        <div className="mb-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-5">
          {/* Order Status */}
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-2">
              Order Status
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "all",
                "CREATED",
                "ACCEPTED",
                "PREPARING",
                "READY",
                "COMPLETED",
                "CANCELLED",
              ].map((s) => (
                <FilterPill
                  key={s}
                  label={s === "all" ? "All" : (STATUS_CFG[s]?.label ?? s)}
                  active={filters.status === s}
                  onClick={() => dispatch(setAdminOrderStatusFilter(s))}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            {/* Payment */}
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">
                Payment
              </p>
              <div className="flex gap-2">
                {[
                  ["all", "All"],
                  ["PAID", "Paid"],
                  ["PENDING", "Pending"],
                ].map(([val, label]) => (
                  <FilterPill
                    key={val}
                    label={label}
                    active={filters.paymentStatus === val}
                    onClick={() => dispatch(setAdminOrderPaymentFilter(val))}
                  />
                ))}
              </div>
            </div>

            {/* Sort by */}
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">
                Sort by
              </p>
              <div className="flex gap-2">
                {[
                  ["newest", "Newest"],
                  ["oldest", "Oldest"],
                  ["totalHigh", "Highest Total"],
                ].map(([val, label]) => (
                  <FilterPill
                    key={val}
                    label={label}
                    active={filters.sortBy === val}
                    onClick={() => dispatch(setAdminOrderSortBy(val))}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── DATE RANGE PICKER ── */}
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
            <DateRangePicker
              dateFrom={filters.dateFrom}
              dateTo={filters.dateTo}
              onChange={handleDateChange}
              onClear={handleDateClear}
            />
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={handleReset}
              className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-600"
            >
              ✕ Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── ERROR BANNER ── */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-200 dark:border-rose-500/20 text-sm font-bold">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* ── ORDER GRID ── */}
      {loading && !loadingMore ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="animate-spin text-violet-600 mb-4" size={40} />
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
            Loading orders…
          </p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-200 ${isRefreshing ? "opacity-60" : "opacity-100"}`}
        >
          {orders.length === 0 ? (
            <EmptyState filtered={isFiltered} onReset={handleReset} />
          ) : (
            orders.map((order, index) => (
              <OrderCard
                key={order.order_id}
                order={order}
                mutating={mutating[order.order_id]}
                ref={index === orders.length - 1 ? lastOrderRef : null}
              />
            ))
          )}
        </div>
      )}

      {/* ── LOAD MORE ── */}
      {loadingMore && (
        <div className="flex justify-center p-12">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-3 rounded-full shadow-lg border border-slate-100 dark:border-slate-800">
            <Loader2 className="animate-spin text-violet-600" size={20} />
            <span className="text-xs font-black uppercase text-slate-500 tracking-widest">
              Loading more orders…
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;