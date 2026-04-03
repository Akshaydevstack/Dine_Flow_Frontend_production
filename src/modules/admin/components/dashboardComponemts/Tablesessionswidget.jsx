import React, { memo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  TableIcon,
  ClockIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ZapIcon,
  MapPinIcon,
  CalendarIcon,
} from "lucide-react";

import {
  fetchAdminTableSessions,
  selectAdminTableSessions,
  selectAdminTableSessionLoading,
  selectAdminTableSessionFilters,
  selectAdminTableSessionPageInfo,
} from "../../../../store/slices/restaurantAdminSlice/adminTableSessionsSlice";

/* ── helpers ── */
const STATUS_CONFIG = {
  CLOSED: {
    label: "Closed",
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-500 dark:text-slate-400",
    dot: "bg-slate-400",
    icon: CheckCircleIcon,
  },
  ACTIVE: {
    label: "Active",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    icon: ZapIcon,
  },
  PENDING: {
    label: "Pending",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-400",
    icon: ClockIcon,
  },
};

const fmt = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const duration = (start, end) => {
  if (!start || !end) return null;
  const ms = new Date(end) - new Date(start);
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};

/* ── Skeleton row ── */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(7)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4" />
      </td>
    ))}
  </tr>
);

/* ── Main Widget ── */
const TableSessionsWidget = memo(({ onShowAll }) => {
  const dispatch = useDispatch();
  const sessions = useSelector(selectAdminTableSessions);
  const loading = useSelector(selectAdminTableSessionLoading);
  const filters = useSelector(selectAdminTableSessionFilters);
  const { totalItems } = useSelector(selectAdminTableSessionPageInfo);

  useEffect(() => {
    if (sessions.length === 0) {
      dispatch(
        fetchAdminTableSessions({
          ...filters,
          currentPage: 1,
          itemsPerPage: 10,
        }),
      );
    }
  }, [dispatch]);

  const recent = sessions.slice(0, 10);

  return (
    <>
      <style>{`
        .sessions-table tbody tr {
          transition: background 0.15s ease;
        }
        .sessions-table tbody tr:hover {
          background: rgba(99, 102, 241, 0.04);
        }
        .dark .sessions-table tbody tr:hover {
          background: rgba(99, 102, 241, 0.08);
        }
        .sessions-scrollbar::-webkit-scrollbar { height: 4px; }
        .sessions-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .sessions-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .sessions-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
        .active-dot { animation: pulse-dot 1.6s ease-in-out infinite; }
      `}</style>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* ── Header ── */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-0.5">
              <TableIcon
                size={17}
                className="text-indigo-500 dark:text-indigo-400"
              />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                  Table Sessions
                </h2>
                {totalItems > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300">
                    {totalItems} total
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Track table turnover, session durations, and zone-level activity
                across your restaurant.
              </p>
            </div>
          </div>

          <button
            onClick={onShowAll}
            className="group shrink-0 flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-600 transition-colors mt-1"
          >
            View all
            <ArrowRightIcon
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </div>

        {/* ── Summary Pills ── */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = sessions.filter((s) => s.status === key).length;
            return (
              <div
                key={key}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${key === "ACTIVE" ? "active-dot" : ""}`}
                />
                {cfg.label}
                <span className="font-black">{count}</span>
              </div>
            );
          })}
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
            <CalendarIcon size={12} />
            Showing latest {recent.length} sessions
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto sessions-scrollbar">
          <table className="w-full text-left sessions-table">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/40">
                {[
                  "Session ID",
                  "Table",
                  "Zone",
                  "Status",
                  "Started",
                  "Closed",
                  "Duration",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading && sessions.length === 0 ? (
                [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
              ) : recent.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <TableIcon size={32} className="text-slate-300" />
                      <span className="text-[11px] font-bold uppercase text-slate-400">
                        No sessions found
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                recent.map((s) => {
                  const cfg = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.CLOSED;
                  const StatusIcon = cfg.icon;
                  const dur = duration(s.started_at, s.closed_at);

                  return (
                    <tr key={s.public_id}>
                      {/* Session ID */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-lg">
                          {s.public_id}
                        </span>
                      </td>

                      {/* Table */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <TableIcon
                              size={11}
                              className="text-slate-500 dark:text-slate-400"
                            />
                          </div>
                          <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">
                            {s.table_number}
                          </span>
                        </div>
                      </td>

                      {/* Zone */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <MapPinIcon size={11} className="text-slate-400" />
                          <span className="font-semibold">{s.zone_name}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${s.status === "ACTIVE" ? "active-dot" : ""}`}
                          />
                          <StatusIcon size={10} />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Started */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <ClockIcon
                            size={11}
                            className="text-slate-300 dark:text-slate-600"
                          />
                          {fmt(s.started_at)}
                        </div>
                      </td>

                      {/* Closed */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {s.closed_at ? (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <CheckCircleIcon
                              size={11}
                              className="text-emerald-400"
                            />
                            {fmt(s.closed_at)}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-300 dark:text-slate-600 italic">
                            Still open
                          </span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {dur ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                            <ClockIcon size={10} className="text-slate-400" />
                            {dur}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-300 dark:text-slate-600 italic">
                            Ongoing
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer ── */}
        {!loading && recent.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <button
              onClick={onShowAll}
              className="w-full py-2 rounded-xl text-xs font-bold text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 transition-all"
            >
              View All Table Sessions →
            </button>
          </div>
        )}
      </div>
    </>
  );
});

export default TableSessionsWidget;
