import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminTableSessions,
  closeAdminTableSession,
  setSessionSearch,
  setSessionFilter,
  setSessionDateRange,
  clearSessionDateRange,
  setSessionPage,
  resetSessionFilters,
  clearSessionMessages,
  selectAdminTableSessions,
  selectAdminTableSessionLoading,
  selectAdminTableSessionRefreshing,
  selectAdminTableSessionLoadingMore,
  selectAdminTableSessionClosingIds,
  selectAdminTableSessionError,
  selectAdminTableSessionSuccess,
  selectAdminTableSessionFilters,
  selectAdminTableSessionPageInfo,
  selectAdminTableSessionFeched,
} from "../../../store/slices/restaurantAdminSlice/adminTableSessionsSlice";

import {
  Search,
  RefreshCw,
  SlidersHorizontal,
  MapPin,
  Clock,
  CheckCircle2,
  Zap,
  XCircle,
  Loader2,
  AlertCircle,
  Calendar,
  CalendarRange,
  ArrowRight,
  Table2,
  TimerIcon,
  TrendingUp,
  Hash,
  ChevronRight,
  X,
  Hourglass,
} from "lucide-react";

/* ================================================================
   STATUS CONFIG
================================================================ */
const STATUS_CFG = {
  ACTIVE: {
    label: "Active",
    icon: Zap,
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
    pulse: true,
  },
  CLOSED: {
    label: "Closed",
    icon: CheckCircle2,
    pill: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    bar: "bg-slate-400",
    dot: "bg-slate-400",
    pulse: false,
  },
  PENDING: {
    label: "Pending",
    icon: Hourglass,
    pill: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    bar: "bg-amber-400",
    dot: "bg-amber-400",
    pulse: false,
  },
};

/* ================================================================
   HELPERS
================================================================ */
const fmtDateTime = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return {
    time: d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    date: d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };
};

const getDuration = (start, end) => {
  if (!start) return null;
  const ms = (end ? new Date(end) : new Date()) - new Date(start);
  if (ms < 0) return null;
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return m % 60 > 0 ? `${h}h ${m % 60}m` : `${h}h`;
};

const timeAgo = (iso) => {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

/* ================================================================
   SUB-COMPONENTS
================================================================ */

const FilterPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap
      ${
        active
          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/30"
          : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-900"
      }`}
  >
    {label}
  </button>
);

const DateRangePicker = ({ dateFrom, dateTo, onChange, onClear }) => (
  <div>
    <p className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-1.5">
      <CalendarRange size={11} /> Date Range
    </p>
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Calendar
          size={12}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="date"
          value={dateFrom || ""}
          max={dateTo || undefined}
          onChange={(e) => onChange({ dateFrom: e.target.value, dateTo })}
          className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-400 transition-all"
        />
      </div>
      <ArrowRight size={14} className="text-slate-400 flex-shrink-0" />
      <div className="relative">
        <Calendar
          size={12}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="date"
          value={dateTo || ""}
          min={dateFrom || undefined}
          onChange={(e) => onChange({ dateFrom, dateTo: e.target.value })}
          className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-400 transition-all"
        />
      </div>
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
            const n = new Date();
            onChange({
              dateFrom: new Date(n.getFullYear(), n.getMonth(), 1)
                .toISOString()
                .slice(0, 10),
              dateTo: n.toISOString().slice(0, 10),
            });
          },
        },
      ].map((p) => (
        <button
          key={p.label}
          onClick={p.fn}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider hover:border-indigo-300 dark:hover:border-indigo-700 transition-all whitespace-nowrap"
        >
          {p.label}
        </button>
      ))}
      {(dateFrom || dateTo) && (
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

const StatsStrip = ({ sessions, totalItems }) => {
  const active = sessions.filter((s) => s.status === "ACTIVE").length;
  const closed = sessions.filter((s) => s.status === "CLOSED").length;
  const avgDur = (() => {
    const w = sessions.filter((s) => s.started_at && s.closed_at);
    if (!w.length) return "—";
    const avg =
      w.reduce(
        (sum, s) => sum + (new Date(s.closed_at) - new Date(s.started_at)),
        0,
      ) / w.length;
    const m = Math.floor(avg / 60000);
    return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`;
  })();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        {
          label: "Total Sessions",
          value: totalItems || sessions.length,
          color: "text-indigo-500",
          Icon: Hash,
        },
        {
          label: "Active Now",
          value: active,
          color: "text-emerald-500",
          Icon: Zap,
        },
        {
          label: "Closed",
          value: closed,
          color: "text-slate-500 dark:text-slate-400",
          Icon: CheckCircle2,
        },
        {
          label: "Avg Duration",
          value: avgDur,
          color: "text-amber-500",
          Icon: TimerIcon,
        },
      ].map(({ label, value, color, Icon }) => (
        <div
          key={label}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4"
        >
          <div className="flex items-start justify-between mb-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {label}
            </p>
            <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800">
              <Icon size={13} className={color} />
            </div>
          </div>
          <p className={`text-2xl font-black ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
};

const SkeletonRow = () => (
  <tr className="border-b border-slate-100 dark:border-slate-800 animate-pulse">
    {[...Array(9)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
      </td>
    ))}
  </tr>
);

const EmptyState = ({ filtered, onReset }) => (
  <tr>
    <td colSpan={9} className="px-4 py-24 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Table2 size={28} className="text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-sm font-black uppercase tracking-widest text-slate-400">
          {filtered ? "No sessions match your filters" : "No sessions found"}
        </p>
        {filtered && (
          <button
            onClick={onReset}
            className="mt-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    </td>
  </tr>
);

const Toast = ({ message, type, onClose }) => (
  <div
    className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold
    ${
      type === "success"
        ? "bg-emerald-50 dark:bg-emerald-900/80 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
        : "bg-rose-50 dark:bg-rose-900/80 border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300"
    }`}
  >
    {type === "success" ? (
      <CheckCircle2 size={16} />
    ) : (
      <AlertCircle size={16} />
    )}
    {message}
    <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
      <X size={14} />
    </button>
  </div>
);

/* Session Table Row */
const SessionRow = React.forwardRef(({ session, isClosing, onClose }, ref) => {
  const cfg = STATUS_CFG[session.status] ?? STATUS_CFG.CLOSED;
  const StatusIcon = cfg.icon;
  const dur = getDuration(session.started_at, session.closed_at);
  const isActive = session.status === "ACTIVE";
  const startedFmt = fmtDateTime(session.started_at);
  const closedFmt = fmtDateTime(session.closed_at);

  return (
    <tr
      ref={ref}
      className={`group border-b border-slate-100 dark:border-slate-800 transition-all duration-200 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 ${isClosing ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* Session ID */}
      <td className="pl-5 pr-4 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot} ${cfg.pulse ? "animate-pulse" : ""}`}
          />
          <span className="font-mono text-[11px] font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1 rounded-lg">
            {session.public_id}
          </span>
        </div>
      </td>

      {/* Table */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-700 flex items-center justify-center shadow-sm">
          <span className="text-[10px] font-black text-white leading-none">
            {session.table_number}
          </span>
        </div>
      </td>

      {/* Zone */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <MapPin size={11} className="text-slate-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
            {session.zone_name}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase ${cfg.pill}`}
        >
          {isClosing ? (
            <Loader2 size={10} className="animate-spin" />
          ) : (
            <StatusIcon size={10} />
          )}
          {cfg.label}
        </span>
      </td>

      {/* Started */}
      <td className="px-4 py-4 whitespace-nowrap">
        {startedFmt ? (
          <div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {startedFmt.time}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {startedFmt.date}
            </p>
          </div>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>

      {/* Closed */}
      <td className="px-4 py-4 whitespace-nowrap">
        {closedFmt ? (
          <div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {closedFmt.time}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {closedFmt.date}
            </p>
          </div>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
            Live
          </span>
        )}
      </td>

      {/* Duration */}
      <td className="px-4 py-4 whitespace-nowrap">
        {dur ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
            <Clock size={10} className="text-slate-400" />
            {dur}
            {isActive && (
              <span className="text-[9px] text-emerald-500 font-black">+</span>
            )}
          </span>
        ) : (
          <span className="text-[10px] text-slate-300 dark:text-slate-600 italic">
            —
          </span>
        )}
      </td>

      {/* Last Activity */}
      <td className="px-4 py-4 whitespace-nowrap">
        <span className="text-[10px] text-slate-400 font-medium">
          {timeAgo(session.last_activity_at)}
        </span>
      </td>

      {/* Action */}
      <td className="px-4 py-4 whitespace-nowrap">
        {isActive ? (
          <button
            onClick={() => onClose(session.public_id)}
            disabled={isClosing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-wide hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
          >
            {isClosing ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <XCircle size={11} />
            )}
            Close
          </button>
        ) : (
          <span className="text-[10px] text-slate-300 dark:text-slate-700 font-black">
            —
          </span>
        )}
      </td>
    </tr>
  );
});
SessionRow.displayName = "SessionRow";

/* ================================================================
   MAIN PAGE
================================================================ */
const SessionManagement = () => {
  const dispatch = useDispatch();

  const sessions = useSelector(selectAdminTableSessions);
  const filters = useSelector(selectAdminTableSessionFilters);
  const { totalItems, hasNext } = useSelector(selectAdminTableSessionPageInfo);
  const loading = useSelector(selectAdminTableSessionLoading);
  const isRefreshing = useSelector(selectAdminTableSessionRefreshing);
  const loadingMore = useSelector(selectAdminTableSessionLoadingMore);
  const closingIds = useSelector(selectAdminTableSessionClosingIds);
  const error = useSelector(selectAdminTableSessionError);
  const success = useSelector(selectAdminTableSessionSuccess);
  const fetched = useSelector(selectAdminTableSessionFeched);

  const [searchTerm, setSearchTerm] = useState(filters.searchQuery || "");
  const [showFilters, setShowFilters] = useState(false);

  const isMounted = useRef(false);
  const observerRef = useRef();

  /* Infinite scroll */
  const lastRowRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNext) {
          const next = filters.currentPage + 1;
          dispatch(setSessionPage(next));
          dispatch(fetchAdminTableSessions({ ...filters, currentPage: next }));
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loading, loadingMore, hasNext, filters, dispatch],
  );

  /* Initial fetch */
  useEffect(() => {
    if (!fetched) {
      dispatch(fetchAdminTableSessions(filters));
    }
  }, []);

  /* Filter watcher */
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    dispatch(fetchAdminTableSessions(filters));
  }, [
    dispatch,
    filters.searchQuery,
    filters.status,
    filters.dateFrom,
    filters.dateTo,
  ]);

  /* Debounced search */
  useEffect(() => {
    const t = setTimeout(() => dispatch(setSessionSearch(searchTerm)), 400);
    return () => clearTimeout(t);
  }, [searchTerm, dispatch]);

  /* Auto-dismiss toast */
  useEffect(() => {
    if (success || error) {
      const t = setTimeout(() => dispatch(clearSessionMessages()), 4000);
      return () => clearTimeout(t);
    }
  }, [success, error, dispatch]);

  const handleRefresh = () =>
    dispatch(fetchAdminTableSessions({ ...filters, currentPage: 1 }));
  const handleReset = () => {
    setSearchTerm("");
    dispatch(resetSessionFilters());
  };
  const handleClose = (id) => dispatch(closeAdminTableSession(id));
  const handleDateChange = ({ dateFrom, dateTo }) =>
    dispatch(
      setSessionDateRange({
        dateFrom: dateFrom ?? filters.dateFrom,
        dateTo: dateTo ?? filters.dateTo,
      }),
    );

  const isFiltered = !!(
    filters.status ||
    filters.searchQuery ||
    filters.dateFrom ||
    filters.dateTo
  );
  const activeFilterCount =
    (filters.status ? 1 : 0) +
    (searchTerm ? 1 : 0) +
    (filters.dateFrom || filters.dateTo ? 1 : 0);

  const dateRangeLabel =
    filters.dateFrom && filters.dateTo
      ? `${filters.dateFrom} → ${filters.dateTo}`
      : filters.dateFrom
        ? `From ${filters.dateFrom}`
        : filters.dateTo
          ? `To ${filters.dateTo}`
          : null;

  const activeLive = sessions.filter((s) => s.status === "ACTIVE").length;

  return (
     <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-4 lg:p-8 transition-colors duration-300">
      {/* PAGE HEADER */}
      <header className="flex flex-col lg:flex-row justify-between mb-8 gap-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Table2 size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Table Sessions
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm ml-[52px]">
            Monitor, manage &amp; close dining sessions
            {totalItems > 0 && (
              <span className="ml-2 text-indigo-500 font-bold">
                · {totalItems} total
              </span>
            )}
          </p>
          {dateRangeLabel && (
            <div className="mt-2 ml-[52px] inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wide">
              <CalendarRange size={10} />
              {dateRangeLabel}
              <button
                onClick={() => dispatch(clearSessionDateRange())}
                className="ml-1 hover:text-rose-500 transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3 items-start">
          <div className="relative flex-1 lg:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              className="w-full pl-12 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-300 transition-all"
              placeholder="Search sessions, tables, zones…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isRefreshing && (
              <Loader2
                size={14}
                className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-indigo-400"
              />
            )}
          </div>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`relative p-3 rounded-2xl border transition-all ${
              showFilters || activeFilterCount > 0
                ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-700 text-indigo-600"
                : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900"
            }`}
          >
            <SlidersHorizontal size={20} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            onClick={handleRefresh}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <RefreshCw
              size={20}
              className={
                loading || isRefreshing ? "animate-spin text-indigo-500" : ""
              }
            />
          </button>
        </div>
      </header>

      {/* STATS */}
      {sessions.length > 0 && (
        <StatsStrip sessions={sessions} totalItems={totalItems} />
      )}

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="mb-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-5">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-2">
              Session Status
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: null, label: "All" },
                { value: "ACTIVE", label: "Active" },
                { value: "CLOSED", label: "Closed" },
                { value: "PENDING", label: "Pending" },
              ].map((s) => (
                <FilterPill
                  key={s.label}
                  label={s.label}
                  active={filters.status === s.value}
                  onClick={() =>
                    dispatch(setSessionFilter({ status: s.value }))
                  }
                />
              ))}
            </div>
          </div>
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
            <DateRangePicker
              dateFrom={filters.dateFrom}
              dateTo={filters.dateTo}
              onChange={handleDateChange}
              onClear={() => dispatch(clearSessionDateRange())}
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

      {/* ERROR BANNER */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-200 dark:border-rose-500/20 text-sm font-bold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Table header bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-indigo-500" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Session Log
            </span>
          </div>
          {activeLive > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {activeLive} live session{activeLive > 1 ? "s" : ""}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50">
                {[
                  "Session ID",
                  "Table",
                  "Zone",
                  "Status",
                  "Started",
                  "Closed",
                  "Duration",
                  "Last Activity",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 whitespace-nowrap first:pl-5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && sessions.length === 0 ? (
                [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
              ) : sessions.length === 0 ? (
                <EmptyState filtered={isFiltered} onReset={handleReset} />
              ) : (
                sessions.map((session, index) => (
                  <SessionRow
                    key={session.public_id}
                    session={session}
                    isClosing={closingIds.includes(session.public_id)}
                    onClose={handleClose}
                    ref={index === sessions.length - 1 ? lastRowRef : null}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Load more spinner */}
        {loadingMore && (
          <div className="flex justify-center p-8 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700">
              <Loader2 className="animate-spin text-indigo-500" size={18} />
              <span className="text-xs font-black uppercase text-slate-400 tracking-widest">
                Loading more…
              </span>
            </div>
          </div>
        )}

        {/* Footer summary */}
        {!loading && sessions.length > 0 && (
          <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">
              Showing {sessions.length} of {totalItems} sessions
            </span>
            {hasNext && !loadingMore && (
              <button
                onClick={() => {
                  const next = filters.currentPage + 1;
                  dispatch(setSessionPage(next));
                  dispatch(
                    fetchAdminTableSessions({ ...filters, currentPage: next }),
                  );
                }}
                className="flex items-center gap-1.5 text-[11px] font-black text-indigo-500 hover:text-indigo-600 uppercase tracking-wide transition-colors"
              >
                Load more <ChevronRight size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* TOASTS */}
      {success && (
        <Toast
          message={success}
          type="success"
          onClose={() => dispatch(clearSessionMessages())}
        />
      )}
    </div>
  );
};

export default SessionManagement;
