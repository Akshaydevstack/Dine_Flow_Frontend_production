// pages/waiter/WaiterOrderDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  ChefHat,
  Zap,
  X,
  MapPin,
  MessageSquare,
  Receipt,
  CreditCard,
  UtensilsCrossed,
  RefreshCw,
  AlertCircle,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import axiosClient from "../../../api/axiosClient";

/* ═══════════════════════════════════════════════
   CONFIG  (mirrors WaiterOrders)
═══════════════════════════════════════════════ */

const STATUS_CONFIG = {
  CREATED:   { label: "Order Placed",     color: "#7c3aed", bg: "#ede9fe", ring: "#c4b5fd", icon: Clock,        step: 1 },
  PAID:      { label: "Payment Confirmed",color: "#0369a1", bg: "#e0f2fe", ring: "#7dd3fc", icon: CheckCircle,  step: 2 },
  ACCEPTED:  { label: "Accepted by Chef", color: "#b45309", bg: "#fef3c7", ring: "#fcd34d", icon: ChefHat,      step: 3 },
  PREPARING: { label: "Being Prepared",   color: "#c2410c", bg: "#ffedd5", ring: "#fdba74", icon: ChefHat,      step: 4 },
  READY:     { label: "Ready to Serve",   color: "#15803d", bg: "#dcfce7", ring: "#86efac", icon: Zap,          step: 5 },
  COMPLETED: { label: "Completed",        color: "#0f766e", bg: "#ccfbf1", ring: "#5eead4", icon: CheckCircle,  step: 6 },
  CANCELLED: { label: "Cancelled",        color: "#6b7280", bg: "#f3f4f6", ring: "#d1d5db", icon: X,            step: 0 },
};

const PAYMENT_CONFIG = {
  PENDING:  { label: "Payment Pending",  color: "#b45309", bg: "#fefce8", ring: "#fde68a" },
  PAID:     { label: "Paid",             color: "#15803d", bg: "#f0fdf4", ring: "#86efac" },
  FAILED:   { label: "Payment Failed",   color: "#b91c1c", bg: "#fef2f2", ring: "#fca5a5" },
  REFUNDED: { label: "Refunded",         color: "#1d4ed8", bg: "#eff6ff", ring: "#93c5fd" },
};

// The full ordered pipeline (excluding CANCELLED which is a branch)
const STATUS_PIPELINE = ["CREATED", "PAID", "ACCEPTED", "PREPARING", "READY", "COMPLETED"];

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */

const fmt2 = (v) => parseFloat(v || 0).toFixed(2);
const fmt0 = (v) => parseFloat(v || 0).toFixed(0);

const formatDateTime = (d) => {
  if (!d) return null;
  return new Date(d).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatTimeOnly = (d) => {
  if (!d) return null;
  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const durationBetween = (start, end) => {
  if (!start || !end) return null;
  const diff = Math.floor((new Date(end) - new Date(start)) / 60000);
  if (diff < 1) return "< 1 min";
  if (diff < 60) return `${diff} min`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

/* ═══════════════════════════════════════════════
   STATUS TIMELINE COMPONENT
═══════════════════════════════════════════════ */

function StatusTimeline({ order }) {
  const isCancelled = order.status === "CANCELLED";
  const currentStep = STATUS_CONFIG[order.status]?.step ?? 0;

  // Map API timestamp fields to pipeline steps
  const timestamps = {
    CREATED:   order.created_at,
    PAID:      order.paid_at      ?? null,
    ACCEPTED:  order.accepted_at  ?? null,
    PREPARING: order.preparing_at ?? null,
    READY:     order.ready_at     ?? null,
    COMPLETED: order.completed_at ?? null,
  };

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
          <X className="w-4 h-4 text-slate-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Order Cancelled</p>
          <p className="text-[11px] text-slate-400">{formatDateTime(order.created_at)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {STATUS_PIPELINE.map((status, idx) => {
        const cfg        = STATUS_CONFIG[status];
        const Icon       = cfg.icon;
        const stepNum    = cfg.step;
        const isDone     = currentStep >= stepNum;
        const isActive   = order.status === status;
        const ts         = timestamps[status];
        const isLast     = idx === STATUS_PIPELINE.length - 1;

        // Duration from previous step
        const prevStatus = idx > 0 ? STATUS_PIPELINE[idx - 1] : null;
        const prevTs     = prevStatus ? timestamps[prevStatus] : null;
        const duration   = durationBetween(prevTs, ts);

        return (
          <div key={status} className="flex gap-3">
            {/* Left: icon + connector line */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                style={
                  isDone
                    ? { background: cfg.color, boxShadow: `0 0 0 3px ${cfg.ring}` }
                    : {}
                }
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                  isDone
                    ? "text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700"
                } ${isActive ? "scale-110" : ""}`}
              >
                {isActive ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                ) : isDone ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                )}
              </div>
              {!isLast && (
                <div
                  style={isDone && !isActive ? { background: cfg.color } : {}}
                  className={`w-0.5 flex-1 min-h-[28px] my-1 rounded-full transition-all duration-300 ${
                    isDone && !isActive
                      ? "opacity-40"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              )}
            </div>

            {/* Right: label + time */}
            <div className={`flex-1 pb-4 ${isLast ? "pb-0" : ""}`}>
              <div className="flex items-start justify-between gap-2 pt-1">
                <div>
                  <p
                    className={`text-sm font-semibold leading-tight ${
                      isActive
                        ? "text-slate-900 dark:text-white"
                        : isDone
                        ? "text-slate-700 dark:text-slate-300"
                        : "text-slate-400 dark:text-slate-600"
                    }`}
                  >
                    {cfg.label}
                  </p>
                  {ts && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {formatTimeOnly(ts)}
                      {duration && (
                        <span className="ml-1.5 text-slate-300 dark:text-slate-600">
                          · {duration} after prev.
                        </span>
                      )}
                    </p>
                  )}
                  {!isDone && !ts && (
                    <p className="text-[11px] text-slate-300 dark:text-slate-700 mt-0.5">
                      Waiting…
                    </p>
                  )}
                </div>

                {isActive && (
                  <span
                    style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.ring}` }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  >
                    Now
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SECTION CARD  wrapper
═══════════════════════════════════════════════ */

function Section({ title, icon: Icon, children, accent }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div
          style={accent ? { background: accent } : {}}
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            !accent ? "bg-slate-100 dark:bg-slate-800" : ""
          }`}
        >
          <Icon className="w-3.5 h-3.5 text-white" style={!accent ? { color: "#94a3b8" } : {}} />
        </div>
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   COPY BUTTON
═══════════════════════════════════════════════ */

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-green-500" />
        : <Copy className="w-3.5 h-3.5 text-slate-400" />}
    </button>
  );
}

/* ═══════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════ */

function PageSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <div className="flex justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
        <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
      {/* Timeline card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>
      {/* Items card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        {[1,2].map(i => (
          <div key={i} className="flex gap-3">
            <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */

export default function WaiterOrderDetail() {
  const { orderId } = useParams();

  const [order,     setOrder]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = async () => {
    try {
      setError(null);
      const res = await axiosClient.get(`/order/waiter/${orderId}/`);
      setOrder(res.data.order);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load order");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrder();
  };

  /* ── Derived ── */
  const cfg = order ? (STATUS_CONFIG[order.status] || STATUS_CONFIG.CANCELLED) : null;
  const pay = order ? (PAYMENT_CONFIG[order.payment_status] || PAYMENT_CONFIG.PENDING) : null;
  const table = order?.table ?? {};
  const hasDiscount = order ? parseFloat(order.discount || 0) > 0 : false;
  const totalItems = order?.items?.reduce((s, i) => s + (i.quantity || 1), 0) ?? 0;

  /* ═══════════════════════ RENDER */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28">

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              to="/waiter/orders"
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Order Detail
              </h1>
              {order && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  {order.order_id}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center disabled:opacity-40"
          >
            <RefreshCw
              className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="px-4 pt-4 space-y-3">

        {/* Loading */}
        {loading && <PageSkeleton />}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-2xl p-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">Failed to load order</p>
              <p className="text-xs text-red-500 mt-0.5">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-xs font-semibold text-red-600 underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Main content */}
        {order && !loading && (
          <>
            {/* ═════════ HERO CARD — status + table ════════ */}
            <div
              className="rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-700/80"
              style={{ background: `linear-gradient(135deg, ${cfg.color}18 0%, ${cfg.ring}10 100%)` }}
            >
              {/* Top accent bar */}
              <div
                style={{ background: `linear-gradient(90deg, ${cfg.color}, ${cfg.ring})` }}
                className="h-1"
              />

              <div className="p-4">
                {/* Order ID row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[17px] font-extrabold text-slate-900 dark:text-white tracking-wider">
                        {order.order_id}
                      </span>
                      <CopyButton text={order.order_id} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {formatDateTime(order.created_at)}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.ring}` }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold flex-shrink-0"
                  >
                    {order.status === "READY" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                    )}
                    {cfg.label}
                  </span>
                </div>

                {/* Table + Zone */}
                <div className="flex items-center gap-3 flex-wrap">
                  {table.table_number ? (
                    <div className="flex items-center gap-1.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/40 dark:border-slate-700/40">
                      <MapPin className="w-3.5 h-3.5 text-violet-500" />
                      <span className="text-[12px] font-bold text-slate-800 dark:text-slate-200">
                        {table.table_number}
                      </span>
                      {table.zone_name && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          · {table.zone_name}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-white/60 dark:bg-slate-800/60 px-3 py-2 rounded-xl border border-white/40 dark:border-slate-700/40">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[12px] text-slate-400">No table assigned</span>
                    </div>
                  )}

                  {/* Payment status */}
                  <div
                    style={{ color: pay.color, background: `${pay.bg}cc`, border: `1px solid ${pay.ring}` }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span className="text-[12px] font-bold">{pay.label}</span>
                  </div>
                </div>

                {/* Special request */}
                {order.special_request && (
                  <div className="mt-3 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl px-3 py-2.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[12px] italic text-amber-700 dark:text-amber-300">
                      "{order.special_request}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ═════════ STATUS TIMELINE ════════ */}
            <Section title="Order Progress" icon={Clock} accent={cfg.color}>
              <StatusTimeline order={order} />
            </Section>

            {/* ═════════ ORDER ITEMS ════════ */}
            <Section title={`Items · ${totalItems} item${totalItems !== 1 ? "s" : ""}`} icon={UtensilsCrossed} accent="#7c3aed">
              <div className="space-y-3">
                {order.items?.map((item, idx) => (
                  <div
                    key={item.dish_id ?? idx}
                    className={`flex items-center gap-3 ${
                      idx !== 0 ? "pt-3 border-t border-slate-100 dark:border-slate-800" : ""
                    }`}
                  >
                    {/* Image */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UtensilsCrossed className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                        </div>
                      )}
                    </div>

                    {/* Name + price breakdown */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        ₹{fmt2(item.unit_price)} × {item.quantity}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {item.dish_id}
                      </p>
                    </div>

                    {/* Line total */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-[14px] font-black text-slate-900 dark:text-white">
                        ₹{fmt2(item.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* ═════════ BILL SUMMARY ════════ */}
            <Section title="Bill Summary" icon={Receipt} accent="#0369a1">
              <div className="space-y-2.5">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    ₹{fmt2(order.subtotal)}
                  </span>
                </div>

                {/* Tax */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Tax & Charges</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    ₹{fmt2(order.tax)}
                  </span>
                </div>

                {/* Discount */}
                {hasDiscount && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400">Discount</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      −₹{fmt2(order.discount)}
                    </span>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
                    <div className="text-right">
                      <p className="text-xl font-black text-slate-900 dark:text-white">
                        ₹{fmt2(order.total)}
                      </p>
                      <p className="text-[10px] text-slate-400">{order.currency}</p>
                    </div>
                  </div>
                </div>

                {/* Payment status pill */}
                <div
                  style={{ color: pay.color, background: pay.bg, border: `1px solid ${pay.ring}` }}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 mt-1"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm font-semibold">{pay.label}</span>
                  </div>
                  <span className="text-[11px] font-medium opacity-70">{order.currency}</span>
                </div>
              </div>
            </Section>

            {/* ═════════ ORDER META ════════ */}
            <Section title="Order Information" icon={Receipt} accent="#6b7280">
              <div className="space-y-3">
                {[
                  { label: "Order ID",      value: order.order_id, mono: true, copy: true },
                  { label: "Created",       value: formatDateTime(order.created_at) },
                  { label: "Status",        value: cfg.label },
                  ...(table.table_number ? [
                    { label: "Table",       value: table.table_number },
                    { label: "Zone",        value: table.zone_name },
                    { label: "Table ID",    value: table.table_public_id, mono: true, copy: true },
                    { label: "Zone ID",     value: table.zone_public_id,  mono: true, copy: true },
                  ] : []),
                  ...(order.accepted_at  ? [{ label: "Accepted",  value: formatDateTime(order.accepted_at) }]  : []),
                  ...(order.preparing_at ? [{ label: "Preparing", value: formatDateTime(order.preparing_at) }] : []),
                  ...(order.ready_at     ? [{ label: "Ready",     value: formatDateTime(order.ready_at) }]     : []),
                  ...(order.completed_at ? [{ label: "Completed", value: formatDateTime(order.completed_at) }] : []),
                ].map(({ label, value, mono, copy }) => value ? (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <span className="text-[12px] text-slate-400 dark:text-slate-500 flex-shrink-0 w-24">
                      {label}
                    </span>
                    <div className="flex items-center gap-1 flex-1 justify-end min-w-0">
                      <span
                        className={`text-[12px] font-semibold text-slate-700 dark:text-slate-300 text-right ${
                          mono ? "font-mono" : ""
                        } truncate`}
                      >
                        {value}
                      </span>
                      {copy && <CopyButton text={value} />}
                    </div>
                  </div>
                ) : null)}
              </div>
            </Section>

            {/* ═════════ READY ACTION ════════ */}
            {order.status === "READY" && (
              <div className="bg-green-500 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-green-500/25">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Ready to Serve!</p>
                  <p className="text-[11px] text-white/70">
                    {table.table_number ? `Deliver to ${table.table_number}` : "Deliver to customer"}
                    {table.zone_name ? ` · ${table.zone_name}` : ""}
                  </p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              </div>
            )}

            {/* ═════════ CANCELLED NOTICE ════════ */}
            {order.status === "CANCELLED" && (
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 flex items-center gap-3 border border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <X className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Order Cancelled</p>
                  <p className="text-[11px] text-slate-400">This order was cancelled and is no longer active.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}