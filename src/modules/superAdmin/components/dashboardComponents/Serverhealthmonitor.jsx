import { useEffect, useState, useCallback, useRef } from "react";
import { RefreshCw } from "lucide-react";

/* ═══════════════════════════════════════════════════════
   MONITOR REGISTRY
═══════════════════════════════════════════════════════ */
const MONITORS = [
  {
    id: "prod",
    eyebrow: "Production · Cluster A",
    title: "API Services",
    baseURL: import.meta.env.VITE_API_URL,
    services: [
      { name: "API Gateway", path: "/gateway/health/" },
      { name: "Auth", path: "/auth/health/" },
      { name: "Menu", path: "/menu/health/" },
      { name: "Cart", path: "/cart/health/" },
      { name: "Order", path: "/order/health/" },
      { name: "Kitchen", path: "/kitchen/health/" },
      { name: "Notification", path: "/notification/health/" },
    ],
  },
];

const POLL_INTERVAL = 10000;

/* ═══════════════════════════════════════════════════════
   STATUS CONFIG
═══════════════════════════════════════════════════════ */
function statusInfo(s) {
  switch (s) {
    case "online":
      return {
        dot: "bg-teal-400 dark:bg-teal-400",
        badge:
          "bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/30 text-teal-600 dark:text-teal-400",
        label: "Online",
        pulse: true,
      };
    case "degraded":
      return {
        dot: "bg-amber-400 dark:bg-amber-400",
        badge:
          "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400",
        label: "Degraded",
        pulse: false,
      };
    case "offline":
      return {
        dot: "bg-rose-400 dark:bg-rose-400",
        badge:
          "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-500 dark:text-rose-400",
        label: "Offline",
        pulse: false,
      };
    default:
      return {
        dot: "bg-slate-400 dark:bg-slate-600",
        badge:
          "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500",
        label: "…",
        pulse: false,
      };
  }
}

function latencyColor(ms) {
  if (ms == null)
    return {
      text: "text-slate-400 dark:text-slate-600",
      bar: "bg-slate-300 dark:bg-slate-700",
      label: "N/A",
    };
  if (ms < 150)
    return {
      text: "text-teal-500 dark:text-teal-400",
      bar: "bg-teal-400 dark:bg-teal-400",
      label: "fast",
    };
  if (ms < 400)
    return {
      text: "text-amber-500 dark:text-amber-400",
      bar: "bg-amber-400 dark:bg-amber-400",
      label: "ok",
    };
  return {
    text: "text-rose-500 dark:text-rose-400",
    bar: "bg-rose-400 dark:bg-rose-400",
    label: "slow",
  };
}

/* ═══════════════════════════════════════════════════════
   SERVICE ROW
═══════════════════════════════════════════════════════ */
function ServiceRow({ svc, data, initialDone, isLast }) {
  const status = initialDone ? (data?.status ?? "offline") : "checking";
  const si = statusInfo(status);
  const ms = data?.latency ?? null;
  const lc = latencyColor(ms);
  const code = data?.code ?? null;
  const pct = ms != null ? Math.min((ms / 500) * 100, 100) : 0;

  return (
    <div
      className={`grid items-center gap-0 px-4 py-2 transition-colors hover:bg-orange-50/40 dark:hover:bg-orange-500/5 ${!isLast ? "border-b border-slate-100 dark:border-[#1e1a2e]" : ""}`}
      style={{ gridTemplateColumns: "24px 1fr 160px 100px 64px" }}
    >
      {/* Status dot */}
      <div className="flex items-center justify-center">
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${si.dot} ${si.pulse && initialDone ? "animate-pulse" : ""}`}
        />
      </div>

      {/* Service name + path */}
      <div className="min-w-0 pr-4">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
          {svc.name}
        </p>
        <p className="text-[10px] font-mono text-slate-400 dark:text-slate-600 truncate">
          {svc.path}
        </p>
      </div>

      {/* Latency bar */}
      <div className="pr-5">
        {!initialDone ? (
          <div className="h-3.5 rounded bg-slate-100 dark:bg-[#1c1929] animate-pulse w-24" />
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-bold font-mono ${lc.text}`}>
                {ms != null ? `${ms} ms` : "—"}
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-600">
                {lc.label}
              </span>
            </div>
            <div className="h-1 rounded-full bg-slate-100 dark:bg-[#1e1a2e] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${lc.bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* Status badge */}
      <div>
        {!initialDone ? (
          <div className="h-5 w-18 rounded-full bg-slate-100 dark:bg-[#1c1929] animate-pulse" />
        ) : (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${si.badge}`}
          >
            {si.label}
          </span>
        )}
      </div>

      {/* HTTP code */}
      <div className="text-right">
        {!initialDone ? (
          <div className="h-3.5 w-7 rounded bg-slate-100 dark:bg-[#1c1929] animate-pulse ml-auto" />
        ) : (
          <span
            className={`text-[11px] font-black font-mono
            ${!code ? "text-slate-400 dark:text-slate-600" : code < 300 ? "text-teal-500 dark:text-teal-400" : code < 500 ? "text-amber-500 dark:text-amber-400" : "text-rose-500 dark:text-rose-400"}`}
          >
            {code ?? "—"}
          </span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MONITOR PANEL
═══════════════════════════════════════════════════════ */
function MonitorPanel({ monitor }) {
  const [statuses, setStatuses] = useState({});
  const [initialDone, setInitialDone] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(POLL_INTERVAL / 1000);
  const cdRef = useRef(POLL_INTERVAL / 1000);

  const checkAll = useCallback(
    async (manual = false) => {
      if (manual) setRefreshing(true);
      const results = await Promise.all(
        monitor.services.map(async (svc) => {
          const t0 = performance.now();
          try {
            const res = await fetch(monitor.baseURL + svc.path, {
              signal: AbortSignal.timeout(5000),
            });
            const ms = Math.round(performance.now() - t0);
            return {
              name: svc.name,
              status: res.ok ? "online" : "degraded",
              latency: ms,
              code: res.status,
            };
          } catch {
            return {
              name: svc.name,
              status: "offline",
              latency: null,
              code: null,
            };
          }
        }),
      );
      const map = {};
      results.forEach((r) => {
        map[r.name] = r;
      });
      setStatuses(map);
      setLastChecked(new Date());
      setInitialDone(true);
      setRefreshing(false);
      cdRef.current = POLL_INTERVAL / 1000;
      setCountdown(POLL_INTERVAL / 1000);
    },
    [monitor],
  );

  useEffect(() => {
    checkAll();
    const id = setInterval(checkAll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [checkAll]);

  useEffect(() => {
    const id = setInterval(() => {
      cdRef.current =
        cdRef.current > 1 ? cdRef.current - 1 : POLL_INTERVAL / 1000;
      setCountdown(cdRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const vals = Object.values(statuses);
  const total = monitor.services.length;
  const online = vals.filter((v) => v.status === "online").length;
  const degraded = vals.filter((v) => v.status === "degraded").length;
  const offline = vals.filter((v) => v.status === "offline").length;
  const allOk = initialDone && online === total;
  const barPct = Math.round((countdown / (POLL_INTERVAL / 1000)) * 100);
  const avgMs = vals
    .filter((v) => v.latency != null)
    .reduce((s, v, _, a) => s + v.latency / a.length, 0);

  return (
    <div className="bg-white dark:bg-[#0c1a2e] border border-slate-200/70 dark:border-[#2a2440] rounded-2xl overflow-hidden">
      {/* Accent bar */}
      <div
        className={`h-0.5 w-full ${allOk ? "bg-gradient-to-r from-teal-400 to-sky-400" : "bg-gradient-to-r from-orange-500 to-red-500"} transition-all duration-1000`}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-[#1e1a2e]">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-0.5 font-mono">
            {monitor.eyebrow}
          </p>
          <p className="text-base font-black text-slate-900 dark:text-white leading-none">
            {monitor.title}
          </p>
        </div>

        {/* Summary pills */}
        {initialDone && (
          <div className="flex items-center gap-2 flex-1 justify-center flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/25 text-teal-600 dark:text-teal-400">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 animate-pulse" />
              {online}/{total} online
            </span>
            {degraded > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 text-amber-600 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                {degraded} degraded
              </span>
            )}
            {offline > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 text-rose-500 dark:text-rose-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400" />
                {offline} offline
              </span>
            )}
            {avgMs > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/25 text-indigo-600 dark:text-indigo-400 font-mono">
                avg {Math.round(avgMs)}ms
              </span>
            )}
          </div>
        )}

        {/* Time + refresh */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {lastChecked && (
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              {lastChecked.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          )}
          <button
            onClick={() => checkAll(true)}
            disabled={refreshing}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-[#1c1929] border border-slate-200 dark:border-[#2a2440] text-slate-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-400 hover:border-orange-300 dark:hover:border-orange-500/30 disabled:opacity-50 transition-all"
          >
            <RefreshCw
              size={13}
              className={
                refreshing
                  ? "animate-spin text-orange-500 dark:text-orange-400"
                  : ""
              }
            />
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div
        className="grid px-5 py-2.5 bg-slate-50/60 dark:bg-[#0f0d19]/50 border-b border-slate-100 dark:border-[#1e1a2e]"
        style={{ gridTemplateColumns: "24px 1fr 160px 100px 64px" }}
      >
        {["", "Service", "Latency", "Status", "HTTP"].map((h, i) => (
          <p
            key={i}
            className={`text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-600 ${i === 4 ? "text-right" : ""}`}
          >
            {h}
          </p>
        ))}
      </div>

      {/* Rows */}
      <div>
        {monitor.services.map((svc, i) => (
          <ServiceRow
            key={svc.name}
            svc={svc}
            data={statuses[svc.name]}
            initialDone={initialDone}
            isLast={i === monitor.services.length - 1}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-[#1e1a2e] bg-slate-50/60 dark:bg-[#0f0d19]/50">
        <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
          {total} services · polling every {POLL_INTERVAL / 1000}s
        </p>
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
            next check in {countdown}s
          </span>
          <div className="w-16 h-1 rounded-full bg-slate-100 dark:bg-[#1e1a2e] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${allOk ? "bg-gradient-to-r from-teal-400 to-sky-400" : "bg-gradient-to-r from-orange-500 to-red-500"}`}
              style={{ width: `${barPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EXPORT
═══════════════════════════════════════════════════════ */
export default function ServerHealthMonitor() {
  return (
    <div className="w-full flex flex-col gap-5">
      {MONITORS.map((m) => (
        <MonitorPanel key={m.id} monitor={m} />
      ))}
    </div>
  );
}
