// pages/waiter/WaiterOrders.jsx
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  ChefHat,
  ArrowLeft,
  X,
  RefreshCw,
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
  Inbox,
  User,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchWaiterOrders,
  fetchOrdersToAccept,
  fetchReadyOrders,
  acceptWaiterOrder,
  setWaiterFilters,
  cancelWaiterOrder,
  clearWaiterCurrentOrder,
  invalidateCache,
} from "../../../store/slices/waiterSlice/waiterOrderSlice";
import { debounce } from "lodash";

/* ═══════════════════════════════════════════════
   CONFIG & HELPERS
═══════════════════════════════════════════════ */

const STATUS_CONFIG = {
  CREATED: {
    label: "Placed",
    color: "#7c3aed",
    bg: "#ede9fe",
    ring: "#c4b5fd",
    icon: Clock,
  },
  PAID: {
    label: "Paid",
    color: "#0369a1",
    bg: "#e0f2fe",
    ring: "#7dd3fc",
    icon: CheckCircle,
  },
  ACCEPTED: {
    label: "Accepted",
    color: "#b45309",
    bg: "#fef3c7",
    ring: "#fcd34d",
    icon: ChefHat,
  },
  PREPARING: {
    label: "Cooking",
    color: "#c2410c",
    bg: "#ffedd5",
    ring: "#fdba74",
    icon: ChefHat,
  },
  READY: {
    label: "Ready",
    color: "#15803d",
    bg: "#dcfce7",
    ring: "#86efac",
    icon: Zap,
  },
  COMPLETED: {
    label: "Completed",
    color: "#0f766e",
    bg: "#ccfbf1",
    ring: "#5eead4",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#6b7280",
    bg: "#f3f4f6",
    ring: "#d1d5db",
    icon: X,
  },
};

const PAYMENT_CONFIG = {
  PENDING: { label: "Unpaid", color: "#b45309", bg: "#fefce8" },
  PAID: { label: "Paid", color: "#15803d", bg: "#f0fdf4" },
  FAILED: { label: "Failed", color: "#b91c1c", bg: "#fef2f2" },
  REFUNDED: { label: "Refunded", color: "#1d4ed8", bg: "#eff6ff" },
};

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "CREATED", label: "Placed" },
  { value: "PAID", label: "Paid" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "PREPARING", label: "Cooking" },
  { value: "READY", label: "Ready" },
  { value: "COMPLETED", label: "Done" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PAYMENT_OPTIONS = [
  { value: null, label: "All" },
  { value: "PENDING", label: "Unpaid" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

const ZONE_OPTIONS = [
  { value: null, label: "All Zones" },
  { value: "zone_f55add81", label: "AC Dining" },
  { value: "zone_bcc90da7", label: "Sea View" },
  { value: "zone_8f20afce", label: "Non-AC" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "total-high", label: "Amount ↑" },
  { value: "total-low", label: "Amount ↓" },
];

const formatTime = (d) =>
  new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const formatAge = (d) => {
  const diff = Math.floor((Date.now() - new Date(d)) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const shortId = (id) => id?.replace("ORD-", "") ?? "—";
const fmt = (v) => parseFloat(v || 0).toFixed(0);
const fmt2 = (v) => parseFloat(v || 0).toFixed(2);
const getTable = (order) => ({
  number: order.table?.table_number ?? null,
  zone: order.table?.zone_name ?? null,
});

/* ═══════════════════════════════════════════════
   ORDER CARD
═══════════════════════════════════════════════ */
function OrderCard({
  order,
  onCancel,
  onAccept,
  cancelLoading,
  acceptLoading,
  hideCancel = false,
}) {
  const [itemsOpen, setItemsOpen] = useState(false);

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.CANCELLED;
  const pay = PAYMENT_CONFIG[order.payment_status] || PAYMENT_CONFIG.PENDING;
  const StatusIcon = cfg.icon;
  const table = getTable(order);

  const canCancel =
    !hideCancel && ["CREATED", "PAID", "ACCEPTED"].includes(order.status);
  const isReady = order.status === "READY";
  const hasDiscount = parseFloat(order.discount || 0) > 0;
  const totalItems =
    order.items?.reduce((s, i) => s + (i.quantity || 1), 0) ?? 0;

  const isMine = order.placed_by_me;

  return (
    <div
      className={`relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 
      ${
        isMine
          ? "ring-2 ring-violet-500 shadow-violet-500/20 border border-violet-500" // 🟢 FIX: Used 'ring' instead of 'border' to preserve layout flow
          : "border border-slate-200/80 dark:border-slate-700/80"
      }`}
    >
      <div
        style={{
          background: `linear-gradient(180deg, ${cfg.color} 0%, ${cfg.ring} 100%)`,
        }}
        // 🟢 FIX: Hide the absolute left bar if it's 'Mine' so the purple ring takes over perfectly
        className={`absolute left-0 top-0 bottom-0 w-[3px] ${isMine ? "hidden" : ""}`}
      />

      <div className={`pl-[14px] pr-4 pt-3.5 pb-3 ${isMine ? "pl-4" : ""}`}>
        {/* Row 1: ID · Table · Badge · Time */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-[13px] font-extrabold text-slate-900 dark:text-white tracking-wider">
                {shortId(order.order_id)}
              </span>

              {isMine && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-violet-600 bg-violet-100 dark:bg-violet-900/40 dark:text-violet-400 px-1.5 py-0.5 rounded-md">
                  <User className="w-3 h-3" /> Mine
                </span>
              )}

              {table.number ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  <MapPin className="w-2.5 h-2.5 text-violet-500" />
                  {table.number}
                  {table.zone && (
                    <span className="text-slate-400 dark:text-slate-500 font-normal">
                      · {table.zone}
                    </span>
                  )}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  No table
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {formatTime(order.created_at)} · {formatAge(order.created_at)}
            </p>
          </div>
          <span
            style={{
              color: cfg.color,
              background: cfg.bg,
              border: `1px solid ${cfg.ring}`,
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold flex-shrink-0 whitespace-nowrap"
          >
            <StatusIcon className="w-3 h-3" />
            {cfg.label}
          </span>
        </div>

        {/* Special request */}
        {order.special_request && (
          <div className="flex items-start gap-1.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl px-2.5 py-1.5 mb-2.5">
            <MessageSquare className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] italic text-amber-700 dark:text-amber-300 line-clamp-1">
              {order.special_request}
            </p>
          </div>
        )}

        {/* Items accordion */}
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
                    (order.items?.length > 2
                      ? ` +${order.items.length - 2} more`
                      : "")
                  }`}
            </span>
          </div>
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${itemsOpen ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}
          >
            <ChevronRight
              className={`w-3 h-3 transition-transform duration-200 ${itemsOpen ? "rotate-90" : ""}`}
            />
          </div>
        </button>

        {itemsOpen && (
          <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden mb-2.5">
            {order.items?.map((item, idx) => (
              <div
                key={item.dish_id ?? idx}
                className={`flex items-center gap-3 px-3 py-2.5 ${idx !== 0 ? "border-t border-slate-100 dark:border-slate-800" : ""}`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UtensilsCrossed className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    ₹{fmt2(item.unit_price)} × {item.quantity}
                  </p>
                </div>
                <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 flex-shrink-0">
                  ₹{fmt(item.total)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Totals */}
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
            <span
              style={{ color: pay.color, background: pay.bg }}
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            >
              {pay.label}
            </span>
            <span className="text-[15px] font-black text-slate-900 dark:text-white">
              ₹{fmt(order.total)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onAccept && (
              <button
                onClick={() => onAccept(order.order_id)}
                disabled={acceptLoading === order.order_id}
                className="inline-flex items-center gap-1 px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[12px] font-bold shadow-sm shadow-green-500/20 transition-all disabled:opacity-50"
              >
                {acceptLoading === order.order_id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Accept
              </button>
            )}
            {isReady && !onAccept && (
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
                {cancelLoading === order.order_id ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> Cancelling
                  </>
                ) : (
                  "✕ Cancel"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SKELETON & SHEETS 
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
        <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    </div>
  );
}

function SheetOption({ label, active, onClick, checkmark = true }) {
  return (
    <button
      onClick={onClick}
      className={`p-2.5 rounded-xl text-xs font-semibold relative transition-all ${active ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-md" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}
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
  const location = useLocation();

  const [viewMode, setViewMode] = useState(location.state?.tab || "ready");

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [localSort, setLocalSort] = useState("newest");
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [cancelLoading, setCancelLoading] = useState(null);
  const [acceptLoading, setAcceptLoading] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  const loadingRef = useRef();
  const searchRef = useRef();

  const {
    orders = [],
    toAcceptOrders = [],
    readyOrders = [],
    loading,
    loadingToAccept,
    loadingReady,
    fetched,
    hasMore,
    page,
    filters,
    count,
    error,
  } = useAppSelector((s) => s.waiterOrder);

  useEffect(() => {
    if (location.state?.tab) {
      setViewMode(location.state.tab);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    dispatch(fetchOrdersToAccept());
    dispatch(fetchReadyOrders());
  }, [dispatch]);

  useEffect(() => {
    if (!fetched) {
      dispatch(fetchWaiterOrders(1));
    }
  }, [fetched, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearWaiterCurrentOrder());
    };
  }, [dispatch]);

  useEffect(() => {
    const el = loadingRef.current;
    if (!el || viewMode !== "all") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
          setLoadingMore(true);
          dispatch(fetchWaiterOrders(page + 1)).finally(() =>
            setLoadingMore(false),
          );
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [hasMore, loading, loadingMore, page, dispatch, viewMode]);

  const applyFilters = useCallback(
    (patch) => {
      dispatch(setWaiterFilters(patch));
    },
    [dispatch],
  );

  const debouncedSearch = useCallback(
    debounce((val) => applyFilters({ search: val }), 400),
    [applyFilters],
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
    applyFilters({
      status: null,
      payment_status: null,
      zone: null,
      table: null,
      search: "",
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (viewMode === "pending") {
      await dispatch(fetchOrdersToAccept());
    } else if (viewMode === "ready") {
      await dispatch(fetchReadyOrders());
    } else {
      dispatch(invalidateCache());
    }
    setRefreshing(false);
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    setCancelLoading(id);
    await dispatch(cancelWaiterOrder(id));
    setCancelLoading(null);
  };

  const handleAccept = async (id) => {
    setAcceptLoading(id);
    await dispatch(acceptWaiterOrder(id));
    setAcceptLoading(null);
  };

  const activeFilterCount = useMemo(
    () =>
      [filters.payment_status, filters.zone, filters.table].filter(Boolean)
        .length,
    [filters],
  );

  const localReadyOrders = useMemo(
    () => orders.filter((o) => o.status === "READY"),
    [orders],
  );

  const sortedAllOrders = useMemo(() => {
    const arr = [...orders];
    switch (localSort) {
      case "oldest":
        arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case "total-high":
        arr.sort((a, b) => parseFloat(b.total) - parseFloat(a.total));
        break;
      case "total-low":
        arr.sort((a, b) => parseFloat(a.total) - parseFloat(b.total));
        break;
      default:
        arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    return arr.sort((a, b) => {
      if (a.placed_by_me && !b.placed_by_me) return -1;
      if (!a.placed_by_me && b.placed_by_me) return 1;
      return 0;
    });
  }, [orders, localSort]);

  const sortedReadyOrders = useMemo(() => {
    const arr = [...readyOrders];
    return arr.sort((a, b) => {
      if (a.placed_by_me && !b.placed_by_me) return -1;
      if (!a.placed_by_me && b.placed_by_me) return 1;
      return 0;
    });
  }, [readyOrders]);

  const sortedToAcceptOrders = useMemo(() => {
    const arr = [...toAcceptOrders];
    return arr.sort((a, b) => {
      if (a.placed_by_me && !b.placed_by_me) return -1;
      if (!a.placed_by_me && b.placed_by_me) return 1;
      return 0;
    });
  }, [toAcceptOrders]);

  const currentDataset =
    viewMode === "pending"
      ? sortedToAcceptOrders
      : viewMode === "ready"
        ? sortedReadyOrders
        : sortedAllOrders;

  const isInitialLoading =
    viewMode === "pending"
      ? loadingToAccept
      : viewMode === "ready"
        ? loadingReady
        : loading && !fetched;

  const showEmpty = !isInitialLoading && currentDataset.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28">
      {/* ══════════════════════════════════════
          STICKY HEADER
      ══════════════════════════════════════ */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              <div>
                <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Orders
                </h1>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {viewMode === "pending"
                    ? `${toAcceptOrders.length} pending`
                    : viewMode === "ready"
                      ? `${readyOrders.length} ready`
                      : `${count} total`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {viewMode === "all" && (
                <>
                  <button
                    onClick={() => setShowSearch((v) => !v)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${showSearch ? "bg-violet-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}
                  >
                    <Search className="w-4 h-4" />
                  </button>
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
                </>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center disabled:opacity-40"
              >
                <RefreshCw
                  className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode("pending")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === "pending" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              <Inbox className="w-3.5 h-3.5" /> Pending
              {toAcceptOrders.length > 0 && (
                <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[9px]">
                  {toAcceptOrders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setViewMode("ready")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === "ready" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              <Zap className="w-3.5 h-3.5" /> Ready
              {readyOrders.length > 0 && (
                <span className="bg-green-500 text-white px-1.5 py-0.5 rounded-full text-[9px]">
                  {readyOrders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setViewMode("all")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === "all" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              My Orders
            </button>
          </div>

          {viewMode === "all" && (
            <div className="mt-3">
              {showSearch && (
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchInput}
                    onChange={handleSearchChange}
                    placeholder="Search order ID..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/30"
                  />
                  {searchInput && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => handleStatusTab(tab.value)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedStatus === tab.value ? "bg-violet-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          FILTER BOTTOM SHEET
      ══════════════════════════════════════ */}
      {showFilters && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-5 pb-8 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Filters & Sort
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeFilterCount} active
                  </p>
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
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Sort By
                </p>
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
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Zone
                </p>
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
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Payment Status
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <SheetOption
                      key={String(opt.value)}
                      label={opt.label}
                      active={filters.payment_status === opt.value}
                      onClick={() =>
                        applyFilters({ payment_status: opt.value })
                      }
                      checkmark={opt.value !== null}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  handleReset();
                  setShowFilters(false);
                }}
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
        {viewMode === "all" && localReadyOrders.length > 0 && (
          <button
            onClick={() => setViewMode("ready")}
            className="w-full flex items-center gap-3 bg-green-500 hover:bg-green-600 transition-colors text-white rounded-2xl px-4 py-3 mb-4 shadow-md text-left"
          >
            <Zap className="w-5 h-5 flex-shrink-0 animate-pulse" />
            <p className="text-sm font-bold flex-1">
              {localReadyOrders.length} order
              {localReadyOrders.length > 1 && "s"} ready to serve!
            </p>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>
        )}

        {isInitialLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        )}

        {showEmpty && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
              {viewMode === "pending" ? (
                <Inbox className="w-10 h-10 text-slate-300" />
              ) : viewMode === "ready" ? (
                <Zap className="w-10 h-10 text-slate-300" />
              ) : (
                <UtensilsCrossed className="w-10 h-10 text-slate-300" />
              )}
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
              {viewMode === "pending"
                ? "No orders to accept"
                : viewMode === "ready"
                  ? "No orders ready right now"
                  : "No orders found"}
            </p>
            <p className="text-sm text-slate-400 mb-5">
              {viewMode === "pending"
                ? "You're all caught up!"
                : viewMode === "ready"
                  ? "Check back later or wait for kitchen alerts."
                  : "Try adjusting filters or orders will appear here"}
            </p>
          </div>
        )}

        {!isInitialLoading && currentDataset.length > 0 && (
          <div className="space-y-3">
            {currentDataset.map((order) => (
              <OrderCard
                key={order.order_id}
                order={order}
                onCancel={handleCancel}
                cancelLoading={cancelLoading}
                onAccept={viewMode === "pending" ? handleAccept : null}
                acceptLoading={acceptLoading}
                hideCancel={viewMode === "pending"}
              />
            ))}

            {viewMode === "all" && (
              <>
                <div ref={loadingRef} className="h-2" />
                {loadingMore && (
                  <div className="space-y-3 mt-3">
                    <OrderSkeleton />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
