import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  ChefHat,
  Bell,
  AlertCircle,
  Loader2,
  Receipt,
  Utensils,
  CreditCard,
  BadgeCheck,
  TimerReset,
  PackageCheck,
  CircleDot,
  Banknote,
  Hash,
  Users,
} from "lucide-react";
import axiosClient from "../../../api/axiosClient";
import useTheme from "../../../hooks/useTheme";

// ─── Status helpers ───────────────────────────────────────────────────────────

const ORDER_STATUS_META = {
  CREATED: { label: "Pending", icon: CircleDot, color: "amber" },
  ACCEPTED: { label: "Accepted", icon: BadgeCheck, color: "blue" },
  PREPARING: { label: "Preparing", icon: ChefHat, color: "orange" },
  READY: { label: "Ready", icon: PackageCheck, color: "emerald" },
  DELIVERED: { label: "Delivered", icon: CheckCircle2, color: "green" },
  CANCELLED: { label: "Cancelled", icon: AlertCircle, color: "rose" },
};

const PAYMENT_META = {
  PAID: { label: "Paid", color: "emerald" },
  PENDING: { label: "Unpaid", color: "rose" },
};

const colorMap = {
  amber: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300",
    dot: "bg-green-500",
  },
  rose: {
    bg: "bg-rose-100 dark:bg-rose-900/30",
    text: "text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
  },
};

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);

const fmtTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status, small }) => {
  const meta = ORDER_STATUS_META[status] || ORDER_STATUS_META.CREATED;
  const c = colorMap[meta.color];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold ${small ? "text-[9px]" : "text-[10px]"} ${c.bg} ${c.text}`}
    >
      <Icon className={small ? "w-2.5 h-2.5" : "w-3 h-3"} />
      {meta.label}
    </span>
  );
};

const PayBadge = ({ status }) => {
  const meta = PAYMENT_META[status] || PAYMENT_META.PENDING;
  const c = colorMap[meta.color];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold text-[9px] ${c.bg} ${c.text}`}
    >
      <Banknote className="w-2.5 h-2.5" />
      {meta.label}
    </span>
  );
};

const TimelineStep = ({ label, time, done }) => (
  <div className="flex items-center gap-2 text-[10px]">
    <div
      className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`}
    >
      {done ? (
        <CheckCircle2 className="w-2.5 h-2.5 text-white" />
      ) : (
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
      )}
    </div>
    <span
      className={
        done
          ? "text-slate-700 dark:text-slate-200 font-medium"
          : "text-slate-400 dark:text-slate-500"
      }
    >
      {label}
    </span>
    <span
      className={`ml-auto font-mono ${done ? "text-slate-500 dark:text-slate-400" : "text-slate-300 dark:text-slate-600"}`}
    >
      {time}
    </span>
  </div>
);

const OrderCard = ({ order, index }) => {
  const [expanded, setExpanded] = useState(false);
  const ts = order.timestamps;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-3 py-2.5"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
              #{index + 1}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
              {order.order_id}
            </p>
            <p className="text-[9px] text-slate-400">
              {fmtTime(ts.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <StatusBadge status={order.status} small />
            <PayBadge status={order.payment_status} />
          </div>
        </div>

        {/* Items preview */}
        <div className="mt-1.5 flex flex-wrap gap-1">
          {order.items.map((item) => (
            <span
              key={item.dish_id}
              className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-medium"
            >
              {item.quantity}× {item.dish_name}
            </span>
          ))}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-700 px-3 pb-3 pt-2 space-y-3">
          {/* Items table */}
          <div>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Items
            </p>
            <div className="space-y-1">
              {order.items.map((item) => (
                <div
                  key={item.dish_id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-slate-700 dark:text-slate-200 flex-1">
                    {item.dish_name}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 mx-2">
                    ×{item.quantity}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {fmt(item.total_price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financials */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-2 space-y-1">
            <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>Subtotal</span>
              <span>{fmt(order.financials.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>Tax (5%)</span>
              <span>{fmt(order.financials.tax)}</span>
            </div>
            {order.financials.discount > 0 && (
              <div className="flex justify-between text-[10px] text-emerald-600 dark:text-emerald-400">
                <span>Discount</span>
                <span>-{fmt(order.financials.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-1 mt-1">
              <span>Order Total</span>
              <span>{fmt(order.financials.total)}</span>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Timeline
            </p>
            <div className="space-y-1.5">
              <TimelineStep
                label="Created"
                time={fmtTime(ts.created_at)}
                done={!!ts.created_at}
              />
              <TimelineStep
                label="Accepted"
                time={fmtTime(ts.accepted_at)}
                done={!!ts.accepted_at}
              />
              <TimelineStep
                label="Preparing"
                time={fmtTime(ts.preparing_at)}
                done={!!ts.preparing_at}
              />
              <TimelineStep
                label="Ready"
                time={fmtTime(ts.ready_at)}
                done={!!ts.ready_at}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TableBill() {
  const { tableId } = useParams(); // e.g. tbl_c5f79bfc
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const id = tableId || localStorage.getItem("table_id");
    if (!id) {
      setError("No table selected.");
      setLoading(false);
      return;
    }

    axiosClient
      .get(`/order/waiter/table/${id}/checkout/`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.response?.data?.detail || "Failed to load bill.");
        setLoading(false);
      });
  }, [tableId]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading bill…
          </p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-5">
        <div className="bg-rose-50 dark:bg-rose-950/30 rounded-2xl p-5 border border-rose-200 dark:border-rose-900/50 max-w-sm w-full text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <p className="font-semibold text-rose-900 dark:text-rose-100 mb-1 text-sm">
            {error}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-3 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { table, session, summary, orders } = data;

  const pendingTotal = orders
    .filter((o) => o.payment_status === "PENDING")
    .reduce((sum, o) => sum + o.financials.total, 0);

  const paidTotal = orders
    .filter((o) => o.payment_status === "PAID")
    .reduce((sum, o) => sum + o.financials.total, 0);

  const sessionDuration = (() => {
    const start = new Date(session.started_at);
    const end = new Date(session.last_activity_at);
    const mins = Math.round((end - start) / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="px-3 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 active:scale-90 transition-transform flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
              <Receipt className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                {table.table_number} — Bill
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {table.zone_name}
              </p>
            </div>
          </div>

          {/* Session status chip */}
          <span
            className={`flex-shrink-0 px-2 py-1 rounded-lg text-[9px] font-bold ${
              session.status === "OPEN"
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            {session.status}
          </span>
        </div>
      </div>

      <div className="px-3 pt-3 pb-28 space-y-4">
        {/* ── Session Info ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3">
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            Session
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-2 text-center">
              <Hash className="w-3.5 h-3.5 text-purple-500 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-slate-900 dark:text-white truncate">
                {session.session_id}
              </p>
              <p className="text-[9px] text-slate-400">Session ID</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-2 text-center">
              <Utensils className="w-3.5 h-3.5 text-violet-500 mx-auto mb-1" />
              <p className="text-base font-bold text-slate-900 dark:text-white leading-none">
                {summary.orders_count}
              </p>
              <p className="text-[9px] text-slate-400">Orders</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-2 text-center">
              <Clock className="w-3.5 h-3.5 text-fuchsia-500 mx-auto mb-1" />
              <p className="text-base font-bold text-slate-900 dark:text-white leading-none">
                {sessionDuration}
              </p>
              <p className="text-[9px] text-slate-400">Duration</p>
            </div>
          </div>
        </div>

        {/* ── Payment Summary ── */}
        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-4 shadow-xl shadow-purple-500/20">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-white/80" />
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wide">
              Payment Summary
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-white/10 backdrop-blur rounded-xl p-2.5">
              <p className="text-[9px] text-white/60 font-medium mb-0.5">
                Subtotal
              </p>
              <p className="text-sm font-bold text-white">
                {fmt(summary.subtotal)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-2.5">
              <p className="text-[9px] text-white/60 font-medium mb-0.5">Tax</p>
              <p className="text-sm font-bold text-white">{fmt(summary.tax)}</p>
            </div>
            {summary.discount > 0 && (
              <div className="bg-white/10 backdrop-blur rounded-xl p-2.5">
                <p className="text-[9px] text-white/60 font-medium mb-0.5">
                  Discount
                </p>
                <p className="text-sm font-bold text-emerald-200">
                  -{fmt(summary.discount)}
                </p>
              </div>
            )}
            <div className="bg-white/10 backdrop-blur rounded-xl p-2.5">
              <p className="text-[9px] text-white/60 font-medium mb-0.5">
                Items
              </p>
              <p className="text-sm font-bold text-white">
                {summary.total_items}
              </p>
            </div>
          </div>

          <div className="border-t border-white/20 pt-3 flex items-end justify-between">
            <div>
              <p className="text-xs text-white/60">Grand Total</p>
              <p className="text-2xl font-black text-white">
                {fmt(summary.grand_total)}
              </p>
            </div>
            <div className="text-right space-y-1">
              <div className="text-[10px] font-semibold text-emerald-200">
                Paid: {fmt(paidTotal)}
              </div>
              <div className="text-[10px] font-semibold text-rose-200">
                Due: {fmt(pendingTotal)}
              </div>
            </div>
          </div>
        </div>

        {/* ── Payment breakdown bar ── */}
        {summary.grand_total > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3">
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Payment Status
            </p>
            <div className="flex rounded-full overflow-hidden h-3 mb-2">
              <div
                className="bg-emerald-500 transition-all"
                style={{ width: `${(paidTotal / summary.grand_total) * 100}%` }}
              />
              <div
                className="bg-rose-400 transition-all"
                style={{
                  width: `${(pendingTotal / summary.grand_total) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Paid {fmt(paidTotal)}
              </span>
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                Due {fmt(pendingTotal)}
              </span>
            </div>
          </div>
        )}

        {/* ── Orders List ── */}
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">
            Orders{" "}
            <span className="text-slate-400 font-medium">
              ({orders.length})
            </span>
          </p>
          <div className="space-y-2">
            {orders.map((order, i) => (
              <OrderCard key={order.order_id} order={order} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Action Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 px-3 py-3 safe-area-inset-bottom">
        <div className="flex gap-2.5">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm active:scale-95 transition-transform"
          >
            Back
          </button>
          <button
            disabled={pendingTotal <= 0}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-purple-500/30 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Banknote className="w-4 h-4" />
            Collect {fmt(pendingTotal)}
          </button>
        </div>
      </div>
    </div>
  );
}
