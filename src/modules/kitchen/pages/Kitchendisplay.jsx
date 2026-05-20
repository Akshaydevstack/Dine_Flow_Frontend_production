// pages/kitchen/KitchenDisplay.jsx
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useKitchenSocket } from "../hooks/useKitchenSocket";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../store/slices/authSlices/authSlice";
import { useAppSelector } from "../../../store/hooks";
import {
  fetchKitchenTickets,
  fetchKitchenTicketById,
  updateKitchenTicketStatus,
  cancelKitchenTicket,
  updateKitchenItemStatus,
  setKitchenSearch,
  setKitchenStatusFilter,
  setKitchenOrderId,
  setKitchenDateRange,
  resetKitchenFilters,
  wsTicketCreated,
  wsTicketCancelled,
  clearKitchenDetail,
  selectKitchenTickets,
  selectKitchenFilters,
  selectKitchenLoading,
  selectKitchenRefreshing,
  selectKitchenError,
  selectKitchenMutating,
  selectKitchenDetail,
  selectDetailLoading,
  selectDetailError,
} from "../../../store/slices/kitchenSlices/kitchenSlice";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  Bell,
  CalendarDays,
  CheckCircle,
  ChefHat,
  Clock,
  ExternalLink,
  Filter,
  Flame,
  Hash,
  Loader2,
  Moon,
  Package,
  RefreshCw,
  Search,
  Star,
  Sun,
  Timer,
  TrendingUp,
  UtensilsCrossed,
  Wifi,
  WifiOff,
  X,
  Zap,
  MonitorDot,
  LogOut,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════════════ */
const THEMES = {
  dark: {
    bg: "#06080f",
    headerBg: "linear-gradient(180deg,#0a0e17 0%,#0d1220 100%)",
    headerBorder: "#1e2535",
    filterBg: "#0a0e17",
    cardBg: "linear-gradient(145deg,#0d1117 0%,#111827 100%)",
    cardDoneBg: "#0d1117",
    colBorder: "#1a2235",
    footerBg: "#0a0e17",
    footerBorder: "#1e2535",
    inputBg: "#0f1520",
    inputBorder: "#1e2a3a",
    text: "#e2e8f0",
    textMuted: "#64748b",
    textFaint: "#2d3748",
    divider: "#1a2235",
    pillActive: "#6d28d9",
    statsBg: "#0f1520",
    statsBorder: "#1e2a3a",
    modalBg: "#0d1117",
    overlay: "rgba(0,0,0,0.72)",
  },
  light: {
    bg: "#f0f4f8",
    headerBg: "linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)",
    headerBorder: "#e2e8f0",
    filterBg: "#ffffff",
    cardBg: "linear-gradient(145deg,#ffffff 0%,#f8fafc 100%)",
    cardDoneBg: "#f8fafc",
    colBorder: "#e2e8f0",
    footerBg: "#ffffff",
    footerBorder: "#e2e8f0",
    inputBg: "#f8fafc",
    inputBorder: "#cbd5e1",
    text: "#1e293b",
    textMuted: "#64748b",
    textFaint: "#cbd5e1",
    divider: "#e2e8f0",
    pillActive: "#7c3aed",
    statsBg: "#f1f5f9",
    statsBorder: "#e2e8f0",
    modalBg: "#ffffff",
    overlay: "rgba(0,0,0,0.45)",
  },
};

/* ═══════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════ */
const TICKET_STATUS = {
  RECEIVED: {
    label: "New",
    color: "#a78bfa",
    ring: "#c4b5fd",
    bg: "#a78bfa12",
    glow: "rgba(167,139,250,0.18)",
  },
  ACCEPTED: {
    label: "Accepted",
    color: "#38bdf8",
    ring: "#7dd3fc",
    bg: "#38bdf812",
    glow: "rgba(56,189,248,0.18)",
  },
  PREPARING: {
    label: "Cooking",
    color: "#fb923c",
    ring: "#fdba74",
    bg: "#fb923c12",
    glow: "rgba(251,146,60,0.18)",
  },
  READY: {
    label: "Ready",
    color: "#4ade80",
    ring: "#86efac",
    bg: "#4ade8012",
    glow: "rgba(74,222,128,0.18)",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#ef4444",
    ring: "#fca5a5",
    bg: "#ef444412",
    glow: "rgba(239,68,68,0.1)",
  },
};
const NEXT_STATUS = {
  RECEIVED: "ACCEPTED",
  ACCEPTED: "PREPARING",
  PREPARING: "READY",
};
const NEXT_LABEL = {
  RECEIVED: {
    label: "Accept Order",
    icon: CheckCircle,
    cls: "from-blue-600   to-blue-500",
  },
  ACCEPTED: {
    label: "Start Cooking",
    icon: Flame,
    cls: "from-orange-600 to-orange-500",
  },
  PREPARING: {
    label: "Mark Ready",
    icon: Zap,
    cls: "from-emerald-600 to-green-500",
  },
};
const ITEM_STATUS = {
  PENDING: { label: "Pending", color: "#64748b" },
  PREPARING: { label: "Cooking", color: "#fb923c" },
  READY: { label: "Done", color: "#4ade80" },
  CANCELLED: { label: "Skipped", color: "#ef4444" },
};
const ITEM_NEXT = {
  PENDING: {
    status: "PREPARING",
    label: "Cook",
    cls: "bg-orange-500/15  text-orange-400  border-orange-500/30  hover:bg-orange-500/25",
  },
  PREPARING: {
    status: "READY",
    label: "Done",
    cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25",
  },
};
const COLUMNS = ["RECEIVED", "ACCEPTED", "PREPARING", "READY"];
const STATUS_FILTER_OPTS = [
  "",
  "RECEIVED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "CANCELLED",
];
const CANCELLABLE = new Set(["RECEIVED", "ACCEPTED"]);

/* ═══════════════════════════════════════════════════════
   DATE PRESETS
═══════════════════════════════════════════════════════ */
const iso = (d) => d.toISOString().slice(0, 10);
const DATE_PRESETS = [
  { label: "Today", from: () => iso(new Date()), to: () => iso(new Date()) },
  {
    label: "Yesterday",
    from: () => iso(new Date(Date.now() - 86400000)),
    to: () => iso(new Date(Date.now() - 86400000)),
  },
  {
    label: "Last 7d",
    from: () => iso(new Date(Date.now() - 6 * 86400000)),
    to: () => iso(new Date()),
  },
  {
    label: "Last 30d",
    from: () => iso(new Date(Date.now() - 29 * 86400000)),
    to: () => iso(new Date()),
  },
];

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
const elapsedSecs = (d) => Math.floor((Date.now() - new Date(d)) / 1000);
const elapsedMins = (d) => Math.floor(elapsedSecs(d) / 60);
const fmtClock = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const urgency = (m) => (m >= 20 ? "critical" : m >= 10 ? "warn" : "ok");
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtTime = (v) =>
  v
    ? new Date(v).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : null;
const fmtDay = (v) =>
  v
    ? new Date(v).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      })
    : "";
const fmtFull = (v) =>
  v
    ? new Date(v).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "—";

const allItemsDone = (items) =>
  !items?.length ||
  items.every((i) => i.status === "READY" || i.status === "CANCELLED");

/* ═══════════════════════════════════════════════════════
   WALL CLOCK
═══════════════════════════════════════════════════════ */
const WallClock = memo(function WallClock({ t }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
      style={{ background: t.statsBg, borderColor: t.statsBorder }}
    >
      <Clock
        className="w-3.5 h-3.5 flex-shrink-0"
        style={{ color: t.textMuted }}
      />
      <span
        className="font-mono text-sm tabular-nums"
        style={{ color: t.text }}
      >
        {now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })}
      </span>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
   ELAPSED TIMER
═══════════════════════════════════════════════════════ */
const ElapsedTimer = memo(function ElapsedTimer({ createdAt }) {
  const [secs, setSecs] = useState(() => elapsedSecs(createdAt));
  useEffect(() => {
    const id = setInterval(() => setSecs(elapsedSecs(createdAt)), 1000);
    return () => clearInterval(id);
  }, [createdAt]);
  const lvl = urgency(Math.floor(secs / 60));
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold tabular-nums font-mono ${
        lvl === "critical"
          ? "bg-red-500/15    text-red-400   border border-red-500/30"
          : lvl === "warn"
            ? "bg-amber-500/12  text-amber-400 border border-amber-500/25"
            : "bg-slate-500/10  text-slate-500 border border-slate-500/20"
      }`}
    >
      <Timer
        className={`w-2.5 h-2.5 ${lvl === "critical" ? "animate-pulse" : ""}`}
      />
      {fmtClock(secs)}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
   TIMESTAMP BLOCK
═══════════════════════════════════════════════════════ */
const TimestampBlock = memo(function TimestampBlock({ ticket, t }) {
  const rows = useMemo(
    () =>
      [
        { label: "Created", v: ticket.created_at, color: t.textMuted },
        { label: "Accepted", v: ticket.accepted_at, color: "#38bdf8" },
        { label: "Cooking", v: ticket.preparing_at, color: "#fb923c" },
        { label: "Ready", v: ticket.ready_at, color: "#4ade80" },
      ].filter((r) => r.v),
    [
      ticket.created_at,
      ticket.accepted_at,
      ticket.preparing_at,
      ticket.ready_at,
      t.textMuted,
    ],
  );
  if (!rows.length) return null;
  return (
    <div
      className="mx-4 mb-3 px-3 py-2 rounded-xl"
      style={{ background: t.statsBg, border: `1px solid ${t.statsBorder}` }}
    >
      {rows.map(({ label, v, color }) => (
        <div key={label} className="flex items-center gap-2 py-[2px]">
          <span
            className="text-[9px] font-bold uppercase tracking-widest flex-shrink-0"
            style={{ color: t.textMuted, width: 46 }}
          >
            {label}
          </span>
          <span
            className="font-mono text-[10px] font-semibold"
            style={{ color }}
          >
            {fmtTime(v)}
          </span>
          <span className="text-[9px]" style={{ color: t.textMuted }}>
            {fmtDay(v)}
          </span>
        </div>
      ))}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
   ITEM ROW  — ticketDone suppresses action buttons
═══════════════════════════════════════════════════════ */
const ItemRow = memo(function ItemRow({
  item,
  onUpdate,
  isUpdating,
  t,
  ticketDone,
}) {
  const cfg = ITEM_STATUS[item.status] ?? ITEM_STATUS.PENDING;
  const next = ticketDone ? null : ITEM_NEXT[item.status]; // ← no actions on terminal tickets
  const done = item.status === "READY" || item.status === "CANCELLED";
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors duration-150"
      style={{
        background: done ? "transparent" : t.statsBg,
        borderColor: done ? "transparent" : t.statsBorder,
        opacity: done ? 0.35 : 1,
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
        style={{ background: t.divider, color: done ? t.textMuted : t.text }}
      >
        {item.quantity}x
      </div>
      <p
        className="flex-1 text-[13px] font-semibold leading-tight min-w-0 truncate"
        style={{
          textDecoration: done ? "line-through" : "none",
          color: done ? t.textMuted : t.text,
        }}
      >
        {item.dish_name}
      </p>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] font-bold" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
        {next && (
          <button
            disabled={isUpdating}
            onClick={() => onUpdate(item.id, next.status)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all active:scale-95 disabled:opacity-40 ${next.cls}`}
          >
            {isUpdating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              next.label
            )}
          </button>
        )}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
   CANCEL CONFIRM INLINE
═══════════════════════════════════════════════════════ */
const CancelInline = memo(function CancelInline({
  publicId,
  isCancelling,
  onCancel,
  t,
}) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1.5"
        style={{
          background: "transparent",
          borderColor: "#ef444428",
          color: "#ef4444",
        }}
      >
        <Ban className="w-3 h-3" /> Cancel Ticket
      </button>
    );
  return (
    <div className="flex gap-1.5">
      <button
        onClick={() => setOpen(false)}
        className="flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all"
        style={{
          background: t.statsBg,
          borderColor: t.statsBorder,
          color: t.textMuted,
        }}
      >
        Keep
      </button>
      <button
        onClick={() => {
          onCancel(publicId);
          setOpen(false);
        }}
        disabled={isCancelling}
        className="flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all disabled:opacity-40"
        style={{
          background: "#ef444415",
          borderColor: "#ef444440",
          color: "#ef4444",
        }}
      >
        {isCancelling ? (
          <Loader2 className="w-3 h-3 animate-spin mx-auto" />
        ) : (
          "Confirm Cancel"
        )}
      </button>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
   TICKET CARD
═══════════════════════════════════════════════════════ */
const TicketCard = memo(function TicketCard({
  ticket,
  mutating,
  onTicketUpdate,
  onItemUpdate,
  onCancel,
  onDetail,
  t,
}) {
  const cfg = TICKET_STATUS[ticket.status] ?? TICKET_STATUS.RECEIVED;
  const nextStatus = NEXT_STATUS[ticket.status];
  const nextLabel = NEXT_LABEL[ticket.status];
  const BtnIcon = nextLabel?.icon;
  const isUpdating = !!mutating[ticket.public_id];
  const isCancelling = !!mutating[`cancel_${ticket.public_id}`];
  const mins = elapsedMins(ticket.created_at);
  const lvl = urgency(mins);
  const isDone = ticket.status === "READY" || ticket.status === "CANCELLED";
  const isCancelled = ticket.status === "CANCELLED";
  const items = ticket.items ?? [];
  const doneCount = useMemo(
    () =>
      items.filter((i) => i.status === "READY" || i.status === "CANCELLED")
        .length,
    [items],
  );
  const progress = items.length
    ? Math.round((doneCount / items.length) * 100)
    : 0;
  const itemsDone = useMemo(() => allItemsDone(items), [items]);
  const canAdvance = nextStatus !== "READY" || itemsDone;

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden border transition-all duration-200"
      style={{
        background: isCancelled ? t.cardDoneBg : t.cardBg,
        borderColor: isCancelled
          ? t.divider
          : ticket.status === "READY"
            ? "#4ade8066"
            : lvl === "critical"
              ? "#ef4444"
              : lvl === "warn"
                ? "#f59e0b"
                : t.colBorder,
        boxShadow: isCancelled
          ? "none"
          : ticket.status === "READY"
            ? "0 0 16px rgba(74,222,128,0.15), 0 2px 8px rgba(0,0,0,0.07)"
            : lvl === "critical"
              ? `0 0 20px ${cfg.glow},0 4px 14px rgba(0,0,0,0.2)`
              : "0 2px 8px rgba(0,0,0,0.07)",
      }}
    >
      {/* Accent stripe */}
      <div
        className="h-[3px] flex-shrink-0"
        style={{
          background: `linear-gradient(90deg,${cfg.color}cc,${cfg.ring}44)`,
        }}
      />

      {/* Header */}
      <div className="px-3.5 pt-3 pb-2.5 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
              style={{
                background: `${cfg.color}20`,
                color: cfg.color,
                border: `1px solid ${cfg.color}30`,
              }}
            >
              {ticket.table_number ?? "?"}
            </div>
            <div className="min-w-0">
              <p
                className="font-black text-[13px] leading-tight truncate"
                style={{ color: t.text }}
              >
                {ticket.table_number
                  ? `Table ${ticket.table_number}`
                  : "Takeaway"}
              </p>
              <p
                className="font-mono text-[9px]"
                style={{ color: t.textMuted }}
              >
                #{(ticket.public_id ?? "").slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
          {ticket.order_id && (
            <div className="flex items-center gap-1 mt-0.5">
              <Hash
                className="w-2.5 h-2.5 flex-shrink-0"
                style={{ color: t.textFaint }}
              />
              <span
                className="font-mono text-[10px] truncate"
                style={{ color: t.textMuted }}
              >
                {ticket.order_id}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDetail(ticket.public_id)}
              title="View details"
              className="p-1 rounded-lg transition-all hover:bg-slate-500/15"
              style={{ color: t.textMuted }}
            >
              <ExternalLink className="w-3 h-3" />
            </button>
            <div
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wide"
              style={{
                color: cfg.color,
                background: cfg.bg,
                border: `1px solid ${cfg.color}30`,
              }}
            >
              {ticket.status === "PREPARING" && <Flame className="w-3 h-3" />}
              {ticket.status === "READY" && <Zap className="w-3 h-3" />}
              {ticket.status === "RECEIVED" && <Bell className="w-3 h-3" />}
              {ticket.status === "ACCEPTED" && (
                <CheckCircle className="w-3 h-3" />
              )}
              {ticket.status === "CANCELLED" && <Ban className="w-3 h-3" />}
              {cfg.label.toUpperCase()}
            </div>
          </div>
          {!isCancelled && !isDone && (
            <ElapsedTimer createdAt={ticket.created_at} />
          )}
        </div>
      </div>

      {/* Timestamps */}
      <TimestampBlock ticket={ticket} t={t} />

      {/* Overdue / warn banners */}
      {lvl === "critical" && !isDone && (
        <div className="mx-3 mb-2 flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-1.5">
          <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0 animate-pulse" />
          <p className="text-[11px] font-bold text-red-300">
            Overdue — {mins}m waiting
          </p>
        </div>
      )}
      {lvl === "warn" && !isDone && (
        <div className="mx-3 mb-2 flex items-center gap-2 bg-amber-500/6 border border-amber-500/15 rounded-xl px-3 py-1.5">
          <Clock className="w-3 h-3 text-amber-500 flex-shrink-0" />
          <p className="text-[11px] font-semibold text-amber-400/80">
            Running late · {mins}m
          </p>
        </div>
      )}
      {ticket.special_request && (
        <div className="mx-3 mb-2 flex items-start gap-2 bg-violet-500/6 border border-violet-500/20 rounded-xl px-3 py-1.5">
          <Star className="w-3 h-3 text-violet-400 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-violet-400 italic leading-relaxed">
            {ticket.special_request}
          </p>
        </div>
      )}

      {/* Progress bar */}
      {items.length > 0 && !isCancelled && (
        <div className="px-3.5 mb-2.5">
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-[10px] font-bold"
              style={{ color: t.textMuted }}
            >
              {doneCount}/{items.length} items
            </span>
            <span
              className="text-[10px] font-bold"
              style={{ color: progress === 100 ? "#4ade80" : t.textMuted }}
            >
              {progress}%
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: t.divider }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background:
                  progress === 100
                    ? "linear-gradient(90deg,#4ade80,#22d3ee)"
                    : "linear-gradient(90deg,#fb923c,#f59e0b)",
              }}
            />
          </div>
        </div>
      )}

      {/* Items list — ticketDone suppresses Cook/Done buttons */}
      <div
        className="px-3 pb-2.5 space-y-1.5 overflow-y-auto max-h-40"
        style={{ scrollbarWidth: "none" }}
      >
        {items.length === 0 ? (
          <p
            className="text-[11px] italic flex items-center justify-center gap-1.5 py-3"
            style={{ color: t.textMuted }}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" /> No items
          </p>
        ) : (
          items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onUpdate={onItemUpdate}
              isUpdating={!!mutating[`item_${item.id}`]}
              t={t}
              ticketDone={isDone}
            />
          ))
        )}
      </div>

      {/* Actions — hidden for READY and CANCELLED */}
      {!isDone && (
        <div className="px-3 pb-3 space-y-1.5 flex-shrink-0">
          {nextStatus === "READY" && !itemsDone && (
            <div className="flex items-center gap-2 bg-amber-500/8 border border-amber-500/20 rounded-xl px-3 py-1.5">
              <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
              <p className="text-[11px] text-amber-400 font-semibold">
                Mark all items done first
              </p>
            </div>
          )}
          {nextStatus && nextLabel && (
            <button
              onClick={() =>
                canAdvance && onTicketUpdate(ticket.public_id, nextStatus)
              }
              disabled={isUpdating || !canAdvance}
              title={
                !canAdvance ? "Complete all items before marking ready" : ""
              }
              className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 bg-gradient-to-r ${nextLabel.cls} text-white shadow-md`}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {BtnIcon && <BtnIcon className="w-4 h-4" />}
                  {nextLabel.label}
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </>
              )}
            </button>
          )}
          {CANCELLABLE.has(ticket.status) && (
            <CancelInline
              publicId={ticket.public_id}
              isCancelling={isCancelling}
              onCancel={onCancel}
              t={t}
            />
          )}
        </div>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
   COLUMN
═══════════════════════════════════════════════════════ */
const Column = memo(function Column({
  status,
  tickets,
  mutating,
  onTicketUpdate,
  onItemUpdate,
  onCancel,
  onDetail,
  t,
}) {
  const cfg = TICKET_STATUS[status];
  return (
    <div className="flex flex-col min-h-0 h-full">
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 flex-shrink-0"
        style={{ background: cfg.bg, border: `1px solid ${cfg.color}25` }}
      >
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: cfg.color, boxShadow: `0 0 5px ${cfg.color}` }}
        />
        <span
          className="text-xs font-black tracking-widest uppercase"
          style={{ color: cfg.color }}
        >
          {cfg.label}
        </span>
        <span
          className="ml-auto px-2 py-0.5 rounded-lg text-xs font-black tabular-nums"
          style={{ color: cfg.color, background: `${cfg.color}22` }}
        >
          {tickets.length}
        </span>
      </div>
      <div
        className="flex-1 overflow-y-auto space-y-3 min-h-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-25">
            <UtensilsCrossed
              className="w-7 h-7 mb-2"
              style={{ color: t.textMuted }}
            />
            <p
              className="text-[10px] font-semibold"
              style={{ color: t.textMuted }}
            >
              No {cfg.label.toLowerCase()}
            </p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.public_id}
              ticket={ticket}
              mutating={mutating}
              onTicketUpdate={onTicketUpdate}
              onItemUpdate={onItemUpdate}
              onCancel={onCancel}
              onDetail={onDetail}
              t={t}
            />
          ))
        )}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
   TICKET DETAIL MODAL
═══════════════════════════════════════════════════════ */
const DetailModal = memo(function DetailModal({
  ticket,
  loading,
  error,
  mutating,
  onClose,
  onTicketUpdate,
  onItemUpdate,
  onCancel,
  t,
}) {
  const cfg = ticket
    ? (TICKET_STATUS[ticket.status] ?? TICKET_STATUS.RECEIVED)
    : null;
  const isDone =
    ticket && (ticket.status === "READY" || ticket.status === "CANCELLED");
  const nextStatus = ticket && NEXT_STATUS[ticket.status];
  const nextLabel = ticket && NEXT_LABEL[ticket.status];
  const BtnIcon = nextLabel?.icon;
  const items = ticket?.items ?? [];
  const itemsDone = useMemo(() => allItemsDone(items), [items]);
  const canAdvance = nextStatus !== "READY" || itemsDone;
  const isUpdating = ticket && !!mutating[ticket.public_id];

  const timeline = useMemo(
    () =>
      ticket
        ? [
            { label: "Created", v: ticket.created_at, color: t.textMuted },
            { label: "Updated", v: ticket.updated_at, color: t.textMuted },
            { label: "Accepted", v: ticket.accepted_at, color: "#38bdf8" },
            { label: "Cooking", v: ticket.preparing_at, color: "#fb923c" },
            { label: "Ready", v: ticket.ready_at, color: "#4ade80" },
            { label: "Cancelled", v: ticket.cancelled_at, color: "#ef4444" },
          ]
        : [],
    [ticket, t.textMuted],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: t.overlay }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: t.modalBg, border: `1px solid ${t.colBorder}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-b flex-shrink-0"
          style={{ background: t.headerBg, borderColor: t.colBorder }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: cfg ? `${cfg.color}20` : t.statsBg,
                border: `1px solid ${cfg ? `${cfg.color}30` : t.statsBorder}`,
              }}
            >
              {loading ? (
                <Loader2
                  className="w-4 h-4 animate-spin"
                  style={{ color: t.textMuted }}
                />
              ) : (
                <ExternalLink
                  className="w-3.5 h-3.5"
                  style={{ color: cfg?.color ?? t.textMuted }}
                />
              )}
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: t.text }}>
                Ticket Detail
              </p>
              {ticket && (
                <p
                  className="font-mono text-[10px]"
                  style={{ color: t.textMuted }}
                >
                  {ticket.public_id}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-500/10 transition-all"
            style={{ color: t.textMuted }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
          style={{ scrollbarWidth: "none" }}
        >
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: t.textMuted }}
              />
            </div>
          )}
          {error && !loading && (
            <div className="flex items-center gap-3 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-[12px] text-red-400">
                {typeof error === "string" ? error : "Failed to load ticket"}
              </p>
            </div>
          )}

          {ticket && cfg && !loading && (
            <>
              {/* Status row */}
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black"
                  style={{
                    color: cfg.color,
                    background: cfg.bg,
                    border: `1px solid ${cfg.color}30`,
                  }}
                >
                  {ticket.status === "PREPARING" && (
                    <Flame className="w-3.5 h-3.5" />
                  )}
                  {ticket.status === "READY" && <Zap className="w-3.5 h-3.5" />}
                  {ticket.status === "RECEIVED" && (
                    <Bell className="w-3.5 h-3.5" />
                  )}
                  {ticket.status === "ACCEPTED" && (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  {ticket.status === "CANCELLED" && (
                    <Ban className="w-3.5 h-3.5" />
                  )}
                  {cfg.label.toUpperCase()}
                </div>
                <span
                  className="font-mono text-[10px] px-2 py-1 rounded-lg"
                  style={{
                    background: t.statsBg,
                    border: `1px solid ${t.statsBorder}`,
                    color: t.textMuted,
                  }}
                >
                  {ticket.kitchenTicket_version ?? "v1"}
                </span>
                <ElapsedTimer createdAt={ticket.created_at} />
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Order ID", v: ticket.order_id },
                  { label: "User", v: ticket.user_id },
                  { label: "Restaurant", v: ticket.restaurant_id },
                  {
                    label: "Table",
                    v: ticket.table_number
                      ? `Table ${ticket.table_number}`
                      : "Takeaway",
                  },
                ].map(({ label, v }) => (
                  <div
                    key={label}
                    className="px-3 py-2.5 rounded-xl"
                    style={{
                      background: t.statsBg,
                      border: `1px solid ${t.statsBorder}`,
                    }}
                  >
                    <p
                      className="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                      style={{ color: t.textMuted }}
                    >
                      {label}
                    </p>
                    <p
                      className="font-mono text-[11px] font-semibold truncate"
                      style={{ color: t.text }}
                    >
                      {v ?? "—"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: `1px solid ${t.statsBorder}` }}
              >
                <div className="px-3 py-2" style={{ background: t.statsBg }}>
                  <p
                    className="text-[9px] font-black uppercase tracking-widest"
                    style={{ color: t.textMuted }}
                  >
                    Timeline
                  </p>
                </div>
                {timeline.map(({ label, v, color }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 px-3 py-2 border-t"
                    style={{
                      borderColor: t.statsBorder,
                      opacity: v ? 1 : 0.28,
                    }}
                  >
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider flex-shrink-0"
                      style={{ color: t.textMuted, width: 60 }}
                    >
                      {label}
                    </span>
                    <span
                      className="font-mono text-[11px]"
                      style={{ color: v ? color : t.textFaint }}
                    >
                      {fmtFull(v)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Items — ticketDone suppresses action buttons */}
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-widest mb-2"
                  style={{ color: t.textMuted }}
                >
                  Items ({items.length})
                </p>
                <div className="space-y-2">
                  {items.map((item) => {
                    const icfg =
                      ITEM_STATUS[item.status] ?? ITEM_STATUS.PENDING;
                    const inext = isDone ? null : ITEM_NEXT[item.status]; // ← terminal guard
                    return (
                      <div
                        key={item.id}
                        className="rounded-xl overflow-hidden"
                        style={{ border: `1px solid ${t.statsBorder}` }}
                      >
                        <div
                          className="flex items-center gap-3 px-3 py-2.5"
                          style={{ background: t.statsBg }}
                        >
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                            style={{ background: t.divider, color: t.text }}
                          >
                            {item.quantity}x
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[13px] font-bold truncate"
                              style={{ color: t.text }}
                            >
                              {item.dish_name}
                            </p>
                            <p
                              className="font-mono text-[9px]"
                              style={{ color: t.textMuted }}
                            >
                              {item.dish_id}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className="text-[10px] font-bold"
                              style={{ color: icfg.color }}
                            >
                              {icfg.label}
                            </span>
                            {inext && (
                              <button
                                disabled={!!mutating[`item_${item.id}`]}
                                onClick={() =>
                                  onItemUpdate(item.id, inext.status)
                                }
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all disabled:opacity-40 ${inext.cls}`}
                              >
                                {!!mutating[`item_${item.id}`] ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  inext.label
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                        {(item.started_at ||
                          item.finished_at ||
                          item.estimated_prep_time_seconds != null) && (
                          <div
                            className="grid grid-cols-3 gap-3 px-3 py-2 border-t"
                            style={{ borderColor: t.statsBorder }}
                          >
                            {[
                              {
                                label: "Started",
                                v: item.started_at
                                  ? fmtTime(item.started_at)
                                  : "—",
                              },
                              {
                                label: "Finished",
                                v: item.finished_at
                                  ? fmtTime(item.finished_at)
                                  : "—",
                              },
                              {
                                label: "Est. prep",
                                v:
                                  item.estimated_prep_time_seconds != null
                                    ? `${item.estimated_prep_time_seconds}s`
                                    : "—",
                              },
                            ].map(({ label, v }) => (
                              <div key={label}>
                                <p
                                  className="text-[8px] uppercase tracking-wider mb-0.5"
                                  style={{ color: t.textMuted }}
                                >
                                  {label}
                                </p>
                                <p
                                  className="font-mono text-[10px] font-semibold"
                                  style={{ color: t.text }}
                                >
                                  {v}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        {ticket && !isDone && !loading && (
          <div
            className="px-5 py-3.5 border-t flex-shrink-0 space-y-2"
            style={{ borderColor: t.colBorder }}
          >
            {nextStatus === "READY" && !itemsDone && (
              <div className="flex items-center gap-2 bg-amber-500/8 border border-amber-500/20 rounded-xl px-3 py-2">
                <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <p className="text-[11px] text-amber-400">
                  Complete all items before marking ready
                </p>
              </div>
            )}
            <div className="flex gap-2">
              {nextLabel && (
                <button
                  onClick={() =>
                    canAdvance && onTicketUpdate(ticket.public_id, nextStatus)
                  }
                  disabled={isUpdating || !canAdvance}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 bg-gradient-to-r ${nextLabel.cls} text-white`}
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {BtnIcon && <BtnIcon className="w-4 h-4" />}
                      {nextLabel.label}
                    </>
                  )}
                </button>
              )}
              {CANCELLABLE.has(ticket.status) && (
                <CancelInline
                  publicId={ticket.public_id}
                  isCancelling={!!mutating[`cancel_${ticket.public_id}`]}
                  onCancel={(id) => {
                    onCancel(id);
                    onClose();
                  }}
                  t={t}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
   CANCELLED SLIDE-OVER PANEL
═══════════════════════════════════════════════════════ */
const CancelledPanel = memo(function CancelledPanel({
  tickets,
  t,
  onClose,
  onDetail,
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-stretch justify-end"
      style={{ background: "rgba(0,0,0,0.45)" }}
    >
      <div className="flex-1" onClick={onClose} />
      <div
        className="flex flex-col h-full shadow-2xl"
        style={{
          width: 360,
          background: t.filterBg,
          borderLeft: `1px solid ${t.colBorder}`,
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: t.colBorder }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 flex items-center justify-center">
              <Ban className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: t.text }}>
                Cancelled
              </p>
              <p className="text-[10px]" style={{ color: t.textMuted }}>
                {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-500/10"
            style={{ color: t.textMuted }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{ scrollbarWidth: "none" }}
        >
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-30">
              <Package
                className="w-10 h-10 mb-3"
                style={{ color: t.textMuted }}
              />
              <p
                className="text-sm font-semibold"
                style={{ color: t.textMuted }}
              >
                No cancelled tickets
              </p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <TicketCard
                key={ticket.public_id}
                ticket={ticket}
                mutating={{}}
                onTicketUpdate={() => {}}
                onItemUpdate={() => {}}
                onCancel={() => {}}
                onDetail={onDetail}
                t={t}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
   ROOT PAGE
═══════════════════════════════════════════════════════ */
export default function KitchenDisplay() {
  const dispatch = useDispatch();
  const token = useAppSelector(
    (state) => state.auth.accessToken
  );

  const navigate = useNavigate();
  const isLoggingOut = useSelector((state) => state.auth.loading);

  const [isDark, setIsDark] = useState(true);
  const t = useMemo(() => (isDark ? THEMES.dark : THEMES.light), [isDark]);

  /* ── WebSocket ── */
  const handleWsMessage = useCallback(
    (data) => {
      if (data.event_type === "KITCHEN_TICKET_CREATED")
        dispatch(wsTicketCreated(data.ticket ?? data));
      if (data.event_type === "KITCHEN_TICKET_CANCELLED")
        dispatch(wsTicketCancelled(data.ticket ?? data));
    },
    [dispatch],
  );
  useKitchenSocket({ token, onMessage: handleWsMessage });

  /* ── Redux selectors ── */
  const tickets = useSelector(selectKitchenTickets);
  const filters = useSelector(selectKitchenFilters);
  const loading = useSelector(selectKitchenLoading);
  const isRefreshing = useSelector(selectKitchenRefreshing);
  const error = useSelector(selectKitchenError);
  const mutating = useSelector(selectKitchenMutating);
  const detail = useSelector(selectKitchenDetail);
  const detailLoad = useSelector(selectDetailLoading);
  const detailError = useSelector(selectDetailError);

  /* ── Local UI state ── */
  const [showFilter, setShowFilter] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const [wsConnected] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const debounceRef = useRef(null);
  const autoRef = useRef(null);

  /* ── Fetch on filter change ── */
  useEffect(() => {
    dispatch(fetchKitchenTickets({ ...filters }));
  }, [
    dispatch,
    filters.restaurant_id,
    filters.status,
    filters.order_id,
    filters.search,
    filters.from_date,
    filters.to_date,
  ]);

  /* ── Auto-refresh every 60s ── */
  useEffect(() => {
    clearInterval(autoRef.current);
    if (!autoRefresh) return;
    autoRef.current = setInterval(() => {
      dispatch(fetchKitchenTickets({ ...filters }));
      setLastRefreshed(new Date());
    }, 60_000);
    return () => clearInterval(autoRef.current);
  }, [autoRefresh, dispatch, filters]);

  /* ── Stable callbacks ── */
  const refresh = useCallback(() => {
    dispatch(fetchKitchenTickets({ ...filters }));
    setLastRefreshed(new Date());
  }, [dispatch, filters]);

  const handleDateRange = useCallback(
    (from, to) =>
      dispatch(setKitchenDateRange({ from_date: from, to_date: to })),
    [dispatch],
  );
  const handleClearAll = useCallback(() => {
    dispatch(resetKitchenFilters());
    setSearchInput("");
  }, [dispatch]);
  const handleTicketUpdate = useCallback(
    (pid, status) =>
      dispatch(updateKitchenTicketStatus({ public_id: pid, status })),
    [dispatch],
  );
  const handleItemUpdate = useCallback(
    (item_id, status) => dispatch(updateKitchenItemStatus({ item_id, status })),
    [dispatch],
  );
  const handleCancel = useCallback(
    (pid) => dispatch(cancelKitchenTicket(pid)),
    [dispatch],
  );
  const handleDetail = useCallback(
    (pid) => {
      dispatch(fetchKitchenTicketById(pid));
      setShowDetail(true);
    },
    [dispatch],
  );
  const handleCloseDetail = useCallback(() => {
    setShowDetail(false);
    dispatch(clearKitchenDetail());
  }, [dispatch]);
  const handleSearch = useCallback(
    (val) => {
      setSearchInput(val);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(
        () => dispatch(setKitchenSearch(val)),
        400,
      );
    },
    [dispatch],
  );

  const handleLogout = useCallback(async () => {
    await dispatch(logoutUser());
    navigate("/"); // adjust to your actual login route
  }, [dispatch, navigate]);

  /* ── Derived data ── */
  const colTickets = useMemo(() => {
    const sort = (arr) =>
      [...arr].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return {
      RECEIVED: sort(tickets.filter((t) => t.status === "RECEIVED")),
      ACCEPTED: sort(tickets.filter((t) => t.status === "ACCEPTED")),
      PREPARING: sort(tickets.filter((t) => t.status === "PREPARING")),
      READY: sort(tickets.filter((t) => t.status === "READY")),
    };
  }, [tickets]);

  const cancelled = useMemo(
    () =>
      tickets
        .filter((t) => t.status === "CANCELLED")
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [tickets],
  );

  const overdue = useMemo(
    () =>
      tickets.filter(
        (t) =>
          !["READY", "CANCELLED"].includes(t.status) &&
          elapsedMins(t.created_at) >= 20,
      ).length,
    [tickets],
  );

  const today = todayStr();
  const dateModified = filters.from_date !== today || filters.to_date !== today;
  const activeCount = useMemo(
    () =>
      [filters.status, filters.order_id, filters.search].filter(Boolean).length,
    [filters.status, filters.order_id, filters.search],
  );
  const totalBadge = activeCount + (dateModified ? 1 : 0);
  const isFirstLoad = loading && tickets.length === 0;

  /* ══════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════ */
  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: t.bg,
        fontFamily: "'IBM Plex Mono','JetBrains Mono','Courier New',monospace",
      }}
    >
      <style>{`*::-webkit-scrollbar{display:none}`}</style>

      {/* ════ HEADER ════ */}
      <header
        className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 border-b"
        style={{ background: t.headerBg, borderColor: t.headerBorder }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-600/25">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <div
              className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${wsConnected ? "bg-green-400" : "bg-red-500"}`}
              style={{ borderColor: isDark ? "#0a0e17" : "#fff" }}
            />
          </div>
          <div className="hidden lg:block leading-tight">
            <p
              className="text-sm font-black tracking-tight"
              style={{ color: t.text }}
            >
              Kitchen Display
            </p>
            <p
              className="text-[9px] tracking-[0.15em] uppercase"
              style={{ color: t.textMuted }}
            >
              Live Order Board
            </p>
          </div>
        </div>

        <div
          className="w-px h-7 flex-shrink-0"
          style={{ background: t.divider }}
        />

        {/* Stats pills */}
        <div className="flex items-center gap-1.5">
          {[
            {
              icon: MonitorDot,
              label: "Total",
              value: tickets.length,
              color: t.textMuted,
              pulse: false,
            },
            {
              icon: Flame,
              label: "Cooking",
              value: colTickets.PREPARING.length,
              color: "#fb923c",
              pulse: colTickets.PREPARING.length > 0,
            },
            {
              icon: Zap,
              label: "Ready",
              value: colTickets.READY.length,
              color: "#4ade80",
              pulse: colTickets.READY.length > 0,
            },
          ].map(({ icon: Icon, label, value, color, pulse }) => (
            <div
              key={label}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl border text-[11px] font-bold"
              style={{
                color,
                background: `${color}12`,
                borderColor: `${color}25`,
              }}
            >
              <Icon
                className={`w-3 h-3 flex-shrink-0 ${pulse ? "animate-pulse" : ""}`}
              />
              <span style={{ color: t.textMuted }}>{label}</span>
              <span style={{ color }}>{value}</span>
            </div>
          ))}
          {overdue > 0 && (
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl border text-[11px] font-bold bg-red-500/10 border-red-500/25 text-red-400">
              <AlertTriangle className="w-3 h-3 animate-pulse" />
              <span style={{ color: t.textMuted }}>Overdue</span>
              <span>{overdue}</span>
            </div>
          )}
        </div>

        <div
          className="w-px h-7 flex-shrink-0"
          style={{ background: t.divider }}
        />

        {/* ── Unified search in navbar ── */}
        <div className="relative flex-shrink-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: t.textMuted }}
          />
          <input
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Order ID, ticket, user…"
            className="w-52 text-xs font-mono px-3 py-2 pl-9 rounded-xl focus:outline-none border transition-colors"
            style={{
              background: t.inputBg,
              borderColor: searchInput ? "#7c3aed60" : t.inputBorder,
              color: t.text,
            }}
          />
          {searchInput && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
              style={{ color: t.textMuted }}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex-1" />

        {/* Right controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
            <WallClock t={t} />
            <div className="w-px h-5 mx-0.5" style={{ background: t.divider }} />

            {/* WS Status */}
            <div
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold border ${
                wsConnected
                  ? "bg-green-500/8 border-green-500/20 text-green-500"
                  : "bg-red-500/8 border-red-500/20 text-red-400"
              }`}
            >
              {wsConnected ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3 animate-pulse" />
              )}
              <span className="hidden xl:inline">{wsConnected ? "Live" : "Offline"}</span>
            </div>

            {/* Auto Refresh */}
            <button
              onClick={() => setAutoRefresh((v) => !v)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold border"
              style={{
                background: t.statsBg,
                borderColor: t.statsBorder,
                color: t.textMuted,
              }}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${autoRefresh ? "bg-green-400 animate-pulse" : "bg-slate-500"}`}
              />
              <span className="hidden xl:inline">{autoRefresh ? "Auto" : "Paused"}</span>
            </button>

            {/* Refresh */}
            <button
              onClick={refresh}
              disabled={loading || isRefreshing}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold border disabled:opacity-40"
              style={{
                background: t.statsBg,
                borderColor: t.statsBorder,
                color: t.textMuted,
              }}
            >
              <RefreshCw
                className={`w-3 h-3 ${loading || isRefreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden xl:inline">Refresh</span>
            </button>

            {/* Cancelled */}
            <button
              onClick={() => setShowCancelled(true)}
              className="relative flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold border"
              style={{
                background: cancelled.length > 0 ? "#ef444412" : t.statsBg,
                borderColor: cancelled.length > 0 ? "#ef444430" : t.statsBorder,
                color: cancelled.length > 0 ? "#ef4444" : t.textMuted,
              }}
            >
              <Ban className="w-3 h-3" />
              <span className="hidden xl:inline">Cancelled</span>
              {cancelled.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                  {cancelled.length}
                </span>
              )}
            </button>

            {/* Filters */}
            <button
              onClick={() => setShowFilter((v) => !v)}
              className="relative flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold border"
              style={{
                background: showFilter || totalBadge > 0 ? "#7c3aed18" : t.statsBg,
                borderColor: showFilter || totalBadge > 0 ? "#7c3aed50" : t.statsBorder,
                color: showFilter || totalBadge > 0 ? "#a78bfa" : t.textMuted,
              }}
            >
              <Filter className="w-3 h-3" />
              <span className="hidden xl:inline">Filters</span>
              {totalBadge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-violet-600 text-white text-[9px] font-black flex items-center justify-center">
                  {totalBadge}
                </span>
              )}
            </button>

            <div className="w-px h-5 mx-0.5" style={{ background: t.divider }} />

            {/* Theme toggle */}
            <button
              onClick={() => setIsDark((v) => !v)}
              className="p-1.5 rounded-lg border"
              style={{ background: t.statsBg, borderColor: t.statsBorder }}
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-yellow-400" />
              ) : (
                <Moon className="w-3.5 h-3.5" style={{ color: t.textMuted }} />
              )}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold border disabled:opacity-40 transition-all"
              style={{
                background: "#ef444410",
                borderColor: "#ef444430",
                color: "#ef4444",
              }}
            >
              {isLoggingOut ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <LogOut className="w-3 h-3" />
              )}
              <span>Logout</span>
            </button>
          </div>
      </header>

      {/* ════ FILTER PANEL — status + date only (search moved to navbar) ════ */}
      {showFilter && (
        <div
          className="flex-shrink-0 border-b px-5 py-3 space-y-2.5"
          style={{ background: t.filterBg, borderColor: t.colBorder }}
        >
          {/* Row 1 — status pills */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className="text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
              style={{ color: t.textMuted }}
            >
              Status
            </span>
            <div className="flex gap-1">
              {STATUS_FILTER_OPTS.map((s) => {
                const scfg = s ? TICKET_STATUS[s] : null;
                const isActive = filters.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => dispatch(setKitchenStatusFilter(s))}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all"
                    style={
                      isActive && scfg
                        ? {
                            color: scfg.color,
                            background: scfg.bg,
                            borderColor: `${scfg.color}40`,
                          }
                        : isActive
                          ? {
                              color: "#fff",
                              background: t.pillActive,
                              borderColor: t.pillActive,
                            }
                          : {
                              color: t.textMuted,
                              background: t.statsBg,
                              borderColor: t.statsBorder,
                            }
                    }
                  >
                    {s ? TICKET_STATUS[s].label : "All"}
                  </button>
                );
              })}
            </div>
            {totalBadge > 0 && (
              <button
                onClick={handleClearAll}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border"
                style={{
                  background: t.statsBg,
                  borderColor: t.statsBorder,
                  color: t.textMuted,
                }}
              >
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          {/* Row 2 — date range */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className="text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
              style={{ color: t.textMuted }}
            >
              Date
            </span>
            <div className="flex gap-1 flex-shrink-0">
              {DATE_PRESETS.map((p) => {
                const active =
                  filters.from_date === p.from() && filters.to_date === p.to();
                return (
                  <button
                    key={p.label}
                    onClick={() => handleDateRange(p.from(), p.to())}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all"
                    style={{
                      background: active ? t.pillActive : t.statsBg,
                      color: active ? "#fff" : t.textMuted,
                      borderColor: active ? t.pillActive : t.statsBorder,
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <CalendarDays
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: t.textMuted }}
              />
              <input
                type="date"
                value={filters.from_date}
                onChange={(e) =>
                  handleDateRange(e.target.value, filters.to_date)
                }
                className="text-[11px] font-mono px-2.5 py-1.5 rounded-xl focus:outline-none w-36 border"
                style={{
                  background: t.inputBg,
                  borderColor: t.inputBorder,
                  color: t.text,
                }}
              />
              <span
                className="text-[11px] font-bold flex-shrink-0"
                style={{ color: t.textMuted }}
              >
                to
              </span>
              <input
                type="date"
                value={filters.to_date}
                min={filters.from_date}
                onChange={(e) =>
                  handleDateRange(filters.from_date, e.target.value)
                }
                className="text-[11px] font-mono px-2.5 py-1.5 rounded-xl focus:outline-none w-36 border"
                style={{
                  background: t.inputBg,
                  borderColor: t.inputBorder,
                  color: t.text,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ════ ERROR BANNER ════ */}
      {error && (
        <div
          className="flex-shrink-0 flex items-center gap-3 px-5 py-2.5 border-b text-red-400 text-[11px]"
          style={{ background: "#ef444408", borderColor: "#ef444420" }}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold">
            {typeof error === "string" ? error : error?.detail || "Error"}
          </span>
          <button onClick={refresh} className="ml-auto font-black underline">
            Retry
          </button>
        </div>
      )}

      {/* ════ BOARD ════ */}
      {isFirstLoad ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto animate-pulse shadow-lg shadow-orange-600/25">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-bold" style={{ color: t.textMuted }}>
              Loading tickets…
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden min-h-0">
          {COLUMNS.map((status, idx) => (
            <div
              key={status}
              className="flex flex-col min-h-0 px-3 py-4"
              style={{
                flex: status === "READY" ? "0 0 280px" : "1 1 0", // ← 280px for READY
                borderRight:
                  idx < COLUMNS.length - 1
                    ? `1px solid ${t.colBorder}`
                    : "none",
                minWidth: status === "READY" ? 0 : 220,
              }}
            >
              <Column
                status={status}
                tickets={colTickets[status]}
                mutating={mutating}
                onTicketUpdate={handleTicketUpdate}
                onItemUpdate={handleItemUpdate}
                onCancel={handleCancel}
                onDetail={handleDetail}
                t={t}
              />
            </div>
          ))}
        </div>
      )}

      {/* ════ FOOTER ════ */}
      <footer
        className="flex-shrink-0 flex items-center justify-between px-5 py-2 border-t"
        style={{ background: t.footerBg, borderColor: t.footerBorder }}
      >
        <div className="flex items-center gap-3 font-mono text-[10px] flex-wrap">
          {COLUMNS.map((s, i) => (
            <span key={s} className="flex items-center gap-1.5">
              {i > 0 && <span style={{ color: t.textFaint }}>·</span>}
              <span style={{ color: TICKET_STATUS[s].color }}>
                {TICKET_STATUS[s].label}: {colTickets[s].length}
              </span>
            </span>
          ))}
          <span style={{ color: t.textFaint }}>·</span>
          <span style={{ color: "#ef4444" }}>
            Cancelled: {cancelled.length}
          </span>
          <span style={{ color: t.textFaint }}>·</span>
          <span style={{ color: t.textMuted }}>Total: {tickets.length}</span>
          <span style={{ color: t.textFaint }}>·</span>
          <span
            className="flex items-center gap-1"
            style={{ color: t.textMuted }}
          >
            <CalendarDays className="w-2.5 h-2.5" />
            {filters.from_date === filters.to_date
              ? filters.from_date
              : `${filters.from_date} → ${filters.to_date}`}
          </span>
        </div>
        <div
          className="font-mono text-[10px] flex items-center gap-2 flex-shrink-0"
          style={{ color: t.textMuted }}
        >
          <TrendingUp className="w-3 h-3" />
          <span>
            Synced{" "}
            {lastRefreshed.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </span>
          <span style={{ color: t.textFaint }}>·</span>
          <span>{autoRefresh ? "Auto 60s" : "Manual"}</span>
        </div>
      </footer>

      {/* ════ DETAIL MODAL ════ */}
      {showDetail && (
        <DetailModal
          ticket={detail}
          loading={detailLoad}
          error={detailError}
          mutating={mutating}
          onClose={handleCloseDetail}
          onTicketUpdate={handleTicketUpdate}
          onItemUpdate={handleItemUpdate}
          onCancel={handleCancel}
          t={t}
        />
      )}

      {/* ════ CANCELLED SLIDE-OVER ════ */}
      {showCancelled && (
        <CancelledPanel
          tickets={cancelled}
          t={t}
          onClose={() => setShowCancelled(false)}
          onDetail={handleDetail}
        />
      )}
    </div>
  );
}
