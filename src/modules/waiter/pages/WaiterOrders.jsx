// pages/waiter/WaiterOrders.jsx
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  ChefHat,
  ArrowLeft,
  X,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  MapPin,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Zap,
  Check,
  UtensilsCrossed,
  Loader2,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchWaiterOrders,
  setWaiterFilters,
  cancelWaiterOrder,
  clearWaiterCurrentOrder,
  invalidateCache,
} from "../../../store/slices/waiterSlice/waiterOrderSlice";
import { debounce } from "lodash";

/* ═══════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════ */

const STATUS_CONFIG = {
  CREATED:   { label: "Placed",    color: "#7c3aed", bg: "#ede9fe", ring: "#c4b5fd", icon: Clock },
  PAID:      { label: "Paid",      color: "#0369a1", bg: "#e0f2fe", ring: "#7dd3fc", icon: CheckCircle },
  ACCEPTED:  { label: "Accepted",  color: "#b45309", bg: "#fef3c7", ring: "#fcd34d", icon: ChefHat },
  PREPARING: { label: "Cooking",   color: "#c2410c", bg: "#ffedd5", ring: "#fdba74", icon: ChefHat },
  READY:     { label: "Ready",     color: "#15803d", bg: "#dcfce7", ring: "#86efac", icon: Zap },
  COMPLETED: { label: "Completed", color: "#0f766e", bg: "#ccfbf1", ring: "#5eead4", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "#6b7280", bg: "#f3f4f6", ring: "#d1d5db", icon: X },
};

const PAYMENT_CONFIG = {
  PENDING:  { label: "Unpaid",   color: "#b45309", bg: "#fefce8" },
  PAID:     { label: "Paid",     color: "#15803d", bg: "#f0fdf4" },
  FAILED:   { label: "Failed",   color: "#b91c1c", bg: "#fef2f2" },
  REFUNDED: { label: "Refunded", color: "#1d4ed8", bg: "#eff6ff" },
};

const STATUS_TABS = [
  { value: "all",       label: "All" },
  { value: "CREATED",   label: "Placed" },
  { value: "PAID",      label: "Paid" },
  { value: "ACCEPTED",  label: "Accepted" },
  { value: "PREPARING", label: "Cooking" },
  { value: "READY",     label: "Ready" },
  { value: "COMPLETED", label: "Done" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PAYMENT_OPTIONS = [
  { value: null,        label: "All" },
  { value: "PENDING",   label: "Unpaid" },
  { value: "PAID",      label: "Paid" },
  { value: "FAILED",    label: "Failed" },
  { value: "REFUNDED",  label: "Refunded" },
];

const ZONE_OPTIONS = [
  { value: null,            label: "All Zones" },
  { value: "zone_f55add81", label: "AC Dining" },
  { value: "zone_bcc90da7", label: "Sea View" },
  { value: "zone_8f20afce", label: "Non-AC" },
];

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest First" },
  { value: "oldest",     label: "Oldest First" },
  { value: "total-high", label: "Amount ↑" },
  { value: "total-low",  label: "Amount ↓" },
];

/* ═══════════════════════════════════════════════
   HELPERS
   API response: order.table = { table_number, zone_name, ... }
═══════════════════════════════════════════════ */

const formatTime = (d) =>
  new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

const formatAge = (d) => {
  const diff = Math.floor((Date.now() - new Date(d)) / 60000);
  if (diff < 1)  return "just now";
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24)    return `${h}h ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

// The backend returns order_id like "ORD-820F6823"
// Display last 8 chars of the hex part
const shortId = (id) => id?.replace("ORD-", "") ?? "—";

const fmt  = (v) => parseFloat(v || 0).toFixed(0);
const fmt2 = (v) => parseFloat(v || 0).toFixed(2);

// Safe accessor for nested table object from API
const getTable = (order) => ({
  number:  order.table?.table_number  ?? null,
  zone:    order.table?.zone_name     ?? null,
  zoneId:  order.table?.zone_public_id ?? null,
  tableId: order.table?.table_public_id ?? null,
});

/* ═══════════════════════════════════════════════
   ORDER CARD
═══════════════════════════════════════════════ */

function OrderCard({ order, onCancel, cancelLoading }) {
  const [itemsOpen, setItemsOpen] = useState(false);

  const cfg        = STATUS_CONFIG[order.status]          || STATUS_CONFIG.CANCELLED;
  const pay        = PAYMENT_CONFIG[order.payment_status]  || PAYMENT_CONFIG.PENDING;
  const StatusIcon = cfg.icon;
  const table      = getTable(order);

  const canCancel   = ["CREATED", "PAID", "ACCEPTED"].includes(order.status);
  const isReady     = order.status === "READY";
  const hasDiscount = parseFloat(order.discount || 0) > 0;
  const totalItems  = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) ?? 0;

  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow duration-200">

      {/* Left status strip */}
      <div
        style={{ background: `linear-gradient(180deg, ${cfg.color} 0%, ${cfg.ring} 100%)` }}
        className="absolute left-0 top-0 bottom-0 w-[3px]"
      />

      <div className="pl-[14px] pr-4 pt-3.5 pb-3">

        {/* ── Row 1: ID · Table · Time ──────────────────── */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex-1 min-w-0">

            {/* Order ID */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[13px] font-extrabold text-slate-900 dark:text-white tracking-wider">
                {shortId(order.order_id)}
              </span>

              {/* Table + Zone chip */}
              {table.number ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  <MapPin className="w-2.5 h-2.5 text-violet-500" />
                  {table.number}
                  {table.zone && (
                    <span className="text-slate-400 dark:text-slate-500 font-normal">· {table.zone}</span>
                  )}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  No table
                </span>
              )}
            </div>

            {/* Time */}
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {formatTime(order.created_at)} · {formatAge(order.created_at)}
            </p>
          </div>

          {/* Status badge */}
          <span
            style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.ring}` }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold flex-shrink-0 whitespace-nowrap"
          >
            <StatusIcon className="w-3 h-3" />
            {cfg.label}
          </span>
        </div>

        {/* ── Special request ──────────────────────────── */}
        {order.special_request && (
          <div className="flex items-start gap-1.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl px-2.5 py-1.5 mb-2.5">
            <MessageSquare className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] italic text-amber-700 dark:text-amber-300 line-clamp-1">
              {order.special_request}
            </p>
          </div>
        )}

        {/* ── Items accordion ──────────────────────────── */}
        <button
          onClick={() => setItemsOpen((v) => !v)}
          className="w-full flex items-center justify-between mb-2.5 text-left"
        >
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Receipt className="w-3 h-3" />
            <span>
              {itemsOpen
                ? "Hide items"
                : `${totalItems} item${totalItems !== 1 ? "s" : ""} · ${
                    order.items
                      ?.slice(0, 2)
                      .map((i) => i.name)
                      .join(", ") +
                    (order.items?.length > 2 ? ` +${order.items.length - 2} more` : "")
                  }`}
            </span>
          </div>
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
              itemsOpen
                ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
            }`}
          >
            <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${itemsOpen ? "rotate-90" : ""}`} />
          </div>
        </button>

        {/* Expanded item list with images */}
        {itemsOpen && (
          <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden mb-2.5">
            {order.items?.map((item, idx) => (
              <div
                key={item.dish_id ?? idx}
                className={`flex items-center gap-3 px-3 py-2.5 ${
                  idx !== 0 ? "border-t border-slate-100 dark:border-slate-800" : ""
                }`}
              >
                {/* Item image */}
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UtensilsCrossed className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                </div>

                {/* Name + unit price */}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    ₹{fmt2(item.unit_price)} × {item.quantity}
                  </p>
                </div>

                {/* Line total */}
                <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 flex-shrink-0">
                  ₹{fmt(item.total)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Totals strip ──────────────────────────────── */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-2 mb-3">
          <div className="flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
            <span>
              Sub{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                ₹{fmt(order.subtotal)}
              </span>
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span>
              Tax{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                ₹{fmt(order.tax)}
              </span>
            </span>
            {hasDiscount && (
              <>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  −₹{fmt(order.discount)}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {/* Payment pill */}
            <span
              style={{ color: pay.color, background: pay.bg }}
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            >
              {pay.label}
            </span>
            {/* Grand total */}
            <span className="text-[15px] font-black text-slate-900 dark:text-white">
              ₹{fmt(order.total)}
            </span>
            <span className="text-[10px] text-slate-400">{order.currency}</span>
          </div>
        </div>

        {/* ── Actions ───────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isReady && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-green-500 text-white shadow-sm shadow-green-500/30 animate-pulse">
                <Zap className="w-3 h-3" /> Serve Now
              </span>
            )}
            {canCancel && (
              <button
                onClick={() => onCancel(order.order_id)}
                disabled={cancelLoading === order.order_id}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-red-500 border border-red-200 dark:border-red-800/50 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
              >
                {cancelLoading === order.order_id
                  ? <><Loader2 className="w-3 h-3 animate-spin" /> Cancelling</>
                  : "✕ Cancel"}
              </button>
            )}
          </div>

          <Link
            to={`/waiter/orders/${order.order_id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-[11px] font-bold rounded-xl shadow-sm shadow-violet-500/20 transition-all active:scale-95"
          >
            <ExternalLink className="w-3 h-3" /> View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════ */

function OrderSkeleton() {
  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden animate-pulse">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-slate-200 dark:bg-slate-700" />
      <div className="pl-[14px] pr-4 pt-3.5 pb-3 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="h-7 w-20 bg-slate-200 dark:bg-slate-700 rounded-xl ml-2" />
        </div>
        <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
        <div className="flex justify-between">
          <div className="h-7 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-7 w-28 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FILTER CHIP (active filter tags in sheet)
═══════════════════════════════════════════════ */

function SheetOption({ label, active, onClick, checkmark = true }) {
  return (
    <button
      onClick={onClick}
      className={`p-2.5 rounded-xl text-xs font-semibold relative transition-all ${
        active
          ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-md"
          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
      }`}
    >
      {label}
      {active && checkmark && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-white/25 rounded-full flex items-center justify-center">
          <Check className="w-2.5 h-2.5" />
        </span>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */

export default function WaiterOrders() {
  const dispatch = useAppDispatch();

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [localSort,      setLocalSort]      = useState("newest");
  const [showSearch,     setShowSearch]     = useState(false);
  const [showFilters,    setShowFilters]    = useState(false);
  const [refreshing,     setRefreshing]     = useState(false);
  const [loadingMore,    setLoadingMore]    = useState(false);
  const [cancelLoading,  setCancelLoading]  = useState(null);
  const [searchInput,    setSearchInput]    = useState("");

  const loadingRef = useRef();
  const searchRef  = useRef();

  const { orders = [], loading, fetched, hasMore, page, filters, count, error } =
    useAppSelector((s) => s.waiterOrder);

  /* ── Initial fetch ── */
  useEffect(() => {
    if (!fetched) dispatch(fetchWaiterOrders(1));
  }, [fetched, dispatch]);

  /* ── Cleanup ── */
  useEffect(() => {
    return () => { dispatch(clearWaiterCurrentOrder()); };
  }, [dispatch]);

  /* ── Auto-focus search ── */
  useEffect(() => {
    if (showSearch) searchRef.current?.focus();
  }, [showSearch]);

  /* ── Infinite scroll ── */
  useEffect(() => {
    const el = loadingRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
          setLoadingMore(true);
          // fetchWaiterOrders checks slice cache internally
          dispatch(fetchWaiterOrders(page + 1)).finally(() => setLoadingMore(false));
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [hasMore, loading, loadingMore, page, dispatch]);

  /* ── Filter helpers ── */
  const applyFilters = useCallback(
    (patch) => { dispatch(setWaiterFilters(patch)); },
    [dispatch]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((val) => applyFilters({ search: val }), 400),
    [applyFilters]
  );

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  };

  const clearSearch = () => {
    setSearchInput("");
    applyFilters({ search: "" });
  };

  const handleStatusTab = (val) => {
    setSelectedStatus(val);
    applyFilters({ status: val === "all" ? null : val });
  };

  const handleReset = () => {
    setSearchInput("");
    setSelectedStatus("all");
    setLocalSort("newest");
    applyFilters({ status: null, payment_status: null, zone: null, table: null, search: "" });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(invalidateCache());
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    setCancelLoading(id);
    await dispatch(cancelWaiterOrder(id));
    setCancelLoading(null);
  };

  /* ── Derived ── */
  const activeFilterCount = useMemo(
    () => [filters.payment_status, filters.zone, filters.table].filter(Boolean).length,
    [filters]
  );

  const readyOrders = useMemo(
    () => orders.filter((o) => o.status === "READY"),
    [orders]
  );

  // Ready-order tables for the banner
  const readyTables = useMemo(
    () => readyOrders.map((o) => o.table?.table_number).filter(Boolean).join(", "),
    [readyOrders]
  );

  const sortedOrders = useMemo(() => {
    const arr = [...orders];
    switch (localSort) {
      case "oldest":     return arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case "total-high": return arr.sort((a, b) => parseFloat(b.total) - parseFloat(a.total));
      case "total-low":  return arr.sort((a, b) => parseFloat(a.total) - parseFloat(b.total));
      default:           return arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }, [orders, localSort]);

  const showInitialLoader = loading && !fetched;
  const showEmpty         = !loading && sortedOrders.length === 0;

  /* ═══════════════════════════════ RENDER */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28">

      {/* ══════════════════════════════════════
          STICKY HEADER  (matches WaiterMenu)
      ══════════════════════════════════════ */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="px-4 pt-3 pb-0">

          {/* Row 1: back · title · actions */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              <div>
                <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Orders</h1>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">{count} total</p>
              </div>
              {readyOrders.length > 0 && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500 text-white text-[11px] font-bold shadow-sm shadow-green-500/30 animate-pulse">
                  <Zap className="w-3 h-3" /> {readyOrders.length} Ready
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Search toggle */}
              <button
                onClick={() => setShowSearch((v) => !v)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  showSearch
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Filter toggle with count badge */}
              <button
                onClick={() => setShowFilters(true)}
                className="relative w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center disabled:opacity-40"
              >
                <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Search bar */}
          {showSearch && (
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search order ID, table, dish…"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                </button>
              )}
            </div>
          )}

          {/* Status pill tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleStatusTab(tab.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  selectedStatus === tab.value
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/30"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          FILTER BOTTOM SHEET  (matches WaiterMenu)
      ══════════════════════════════════════ */}
      {showFilters && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-5 pb-8 max-h-[88vh] overflow-y-auto">

            {/* Sheet header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Filters & Sort</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{activeFilterCount} active</p>
                </div>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="space-y-5">

              {/* Sort */}
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Sort By</p>
                <div className="grid grid-cols-2 gap-2">
                  {SORT_OPTIONS.map((opt) => (
                    <SheetOption
                      key={opt.value}
                      label={opt.label}
                      active={localSort === opt.value}
                      onClick={() => setLocalSort(opt.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Zone */}
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Zone</p>
                <div className="grid grid-cols-2 gap-2">
                  {ZONE_OPTIONS.map((z) => (
                    <SheetOption
                      key={String(z.value)}
                      label={z.label}
                      active={filters.zone === z.value}
                      onClick={() => applyFilters({ zone: z.value })}
                      checkmark={z.value !== null}
                    />
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Payment Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <SheetOption
                      key={String(opt.value)}
                      label={opt.label}
                      active={filters.payment_status === opt.value}
                      onClick={() => applyFilters({ payment_status: opt.value })}
                      checkmark={opt.value !== null}
                    />
                  ))}
                </div>
              </div>

              {/* Table */}
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Table Number</p>
                <input
                  type="text"
                  value={filters.table || ""}
                  onChange={(e) => applyFilters({ table: e.target.value || null })}
                  placeholder="e.g. T-20"
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                />
              </div>
            </div>

            {/* Sheet footer */}
            <div className="flex gap-3 mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => { handleReset(); setShowFilters(false); }}
                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-purple-500/30"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          CONTENT
      ══════════════════════════════════════ */}
      <div className="px-4 pt-4 pb-6">

        {/* Ready banner with table numbers */}
        {readyOrders.length > 0 && (
          <div className="flex items-center gap-3 bg-green-500 text-white rounded-2xl px-4 py-3 mb-4 shadow-md shadow-green-500/25">
            <Zap className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-bold flex-1">
              {readyOrders.length} order{readyOrders.length > 1 ? "s" : ""} ready to serve!
            </p>
            {readyTables && (
              <span className="text-[11px] font-semibold bg-white/20 rounded-full px-2.5 py-0.5 flex-shrink-0">
                {readyTables}
              </span>
            )}
          </div>
        )}

        {/* Count + clear row */}
        {!showInitialLoader && sortedOrders.length > 0 && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {sortedOrders.length} order{sortedOrders.length !== 1 ? "s" : ""}
              {localSort !== "newest" && (
                <span className="ml-1 text-violet-500">
                  · {SORT_OPTIONS.find((s) => s.value === localSort)?.label}
                </span>
              )}
            </p>
            {(activeFilterCount > 0 || searchInput || selectedStatus !== "all") && (
              <button
                onClick={handleReset}
                className="text-[11px] text-violet-500 font-semibold"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* ── Initial skeleton ── */}
        {showInitialLoader && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <OrderSkeleton key={i} />)}
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-2xl p-4 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">Failed to load orders</p>
              <p className="text-xs text-red-500 mt-0.5">{error.message || "Please try again"}</p>
              <button onClick={handleRefresh} className="mt-2 text-xs font-semibold text-red-600 underline">
                Retry
              </button>
            </div>
          </div>
        )}

        {/* ── Empty ── */}
        {showEmpty && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">No orders found</p>
            <p className="text-sm text-slate-400 mb-5">
              {activeFilterCount > 0 || selectedStatus !== "all" || searchInput
                ? "Try adjusting your filters or search"
                : "Orders will appear here once placed"}
            </p>
            {(activeFilterCount > 0 || selectedStatus !== "all" || searchInput) && (
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-purple-500/30"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* ── Order list ── */}
        {!showInitialLoader && sortedOrders.length > 0 && (
          <div className="space-y-3">
            {sortedOrders.map((order) => (
              <OrderCard
                key={order.order_id}
                order={order}
                onCancel={handleCancel}
                cancelLoading={cancelLoading}
              />
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={loadingRef} className="h-2" />

            {/* Load more skeletons */}
            {loadingMore && (
              <div className="space-y-3">
                <OrderSkeleton />
                <OrderSkeleton />
              </div>
            )}

            {/* End of list */}
            {!hasMore && !loadingMore && (
              <div className="text-center py-5">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <Check className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400 font-medium">All orders loaded</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Quick actions ── */}
        {!showInitialLoader && (
          <div className="mt-8 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Quick Actions
            </p>

            <Link
              to="/waiter/tables"
              className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-sm shadow-violet-500/30">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">New Order</p>
                  <p className="text-xs text-slate-400">Select a table to start</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
            </Link>

            <Link
              to="/waiter/kitchen-view"
              className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-sm shadow-orange-500/20">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Kitchen View</p>
                  <p className="text-xs text-slate-400">Track preparation live</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}