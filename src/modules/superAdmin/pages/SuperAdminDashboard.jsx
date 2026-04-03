import { useEffect, useState } from "react";
import {
  RefreshCw,
  Bell,
  Store,
  Users,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Ban,
} from "lucide-react";
import ServerHealthMonitor from "../components/dashboardComponents/Serverhealthmonitor";

/* ═══════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════ */

const KPI_DATA = [
  {
    label: "Restaurants",
    value: "1,284",
    delta: "+18",
    up: true,
    icon: Store,
    accent: "orange",
  },
  {
    label: "Active Users",
    value: "48,320",
    delta: "+2,140",
    up: true,
    icon: Users,
    accent: "indigo",
  },
  {
    label: "Orders Today",
    value: "12,847",
    delta: "+8.3%",
    up: true,
    icon: ShoppingBag,
    accent: "teal",
  },
  {
    label: "Revenue",
    value: "₹9.4L",
    delta: "+14.2%",
    up: true,
    icon: DollarSign,
    accent: "amber",
  },
  {
    label: "Errors",
    value: "7",
    delta: "-63%",
    up: false,
    icon: AlertCircle,
    accent: "rose",
  },
  {
    label: "Avg Response",
    value: "142ms",
    delta: "-22ms",
    up: true,
    icon: Zap,
    accent: "teal",
  },
];

const ACCENT_CLS = {
  orange: {
    icon: "bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20 text-orange-500 dark:text-orange-400",
  },
  indigo: {
    icon: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-500 dark:text-indigo-400",
  },
  teal: {
    icon: "bg-teal-50  dark:bg-teal-500/10  border-teal-100  dark:border-teal-500/20  text-teal-500  dark:text-teal-400",
  },
  amber: {
    icon: "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-500 dark:text-amber-400",
  },
  rose: {
    icon: "bg-rose-50  dark:bg-rose-500/10  border-rose-100  dark:border-rose-500/20  text-rose-500  dark:text-rose-400",
  },
};

/* ═══════════════════════════════════════════════════════
   SHARED
═══════════════════════════════════════════════════════ */
const panel =
  "bg-white dark:bg-[#0c1a2e] border border-slate-200/70 dark:border-[#2a2440] rounded-2xl";

/* ═══════════════════════════════════════════════════════
   SECTION A — KPI STRIP
═══════════════════════════════════════════════════════ */

function KpiStrip() {
  return (
    <div className="grid grid-cols-6 gap-3">
      {KPI_DATA.map((k) => {
        const Icon = k.icon;
        const ac = ACCENT_CLS[k.accent];
        return (
          <div
            key={k.label}
            className={`${panel} p-4 hover:shadow-md dark:hover:shadow-none transition-shadow`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center border ring-0 ${ac.icon}`}
              >
                <Icon size={14} />
              </div>
              {k.up ? (
                <ArrowUpRight
                  size={12}
                  className="text-teal-500 dark:text-teal-400 mt-0.5"
                />
              ) : (
                <ArrowDownRight
                  size={12}
                  className="text-rose-500 dark:text-rose-400 mt-0.5"
                />
              )}
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1.5">
              {k.value}
            </p>
            <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 mb-1">
              {k.label}
            </p>
            <p
              className={`text-[10px] font-bold ${k.up ? "text-teal-500 dark:text-teal-400" : "text-rose-500 dark:text-rose-400"}`}
            >
              {k.delta}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SECTION E — PLATFORM HEALTH
═══════════════════════════════════════════════════════ */
function PlatformHealth() {
  const metrics = [
    {
      label: "Uptime",
      value: "99.97%",
      bar: 99.97,
      cls: "bg-teal-400 dark:bg-teal-400",
    },
    {
      label: "Avg Load",
      value: "34%",
      bar: 34,
      cls: "bg-orange-400 dark:bg-orange-400",
    },
    {
      label: "Active Now",
      value: "3,218",
      bar: 64,
      cls: "bg-indigo-400 dark:bg-indigo-400",
    },
    {
      label: "Error Rate",
      value: "0.04%",
      bar: 4,
      cls: "bg-rose-400 dark:bg-rose-400",
    },
    {
      label: "Cache Hit",
      value: "91.2%",
      bar: 91,
      cls: "bg-teal-400 dark:bg-teal-400",
    },
  ];
  const valueColors = [
    "text-teal-500 dark:text-teal-400",
    "text-orange-500 dark:text-orange-400",
    "text-indigo-500 dark:text-indigo-400",
    "text-rose-500 dark:text-rose-400",
    "text-teal-500 dark:text-teal-400",
  ];
  return (
    <div
      className={`${panel} w-full h-full flex flex-col overflow-hidden shadow-sm dark:shadow-none`}
    >
      <div className="h-0.5 w-full bg-gradient-to-r from-teal-400 to-sky-400 flex-shrink-0" />
      <div className="px-5 py-4 border-b border-slate-100 dark:border-[#1e1a2e] flex-shrink-0">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500 dark:text-orange-400 mb-0.5">
          Super Admin · System
        </p>
        <p className="text-base font-black text-slate-900 dark:text-white leading-none">
          Platform Health
        </p>
      </div>
      <div className="flex-1 flex flex-col justify-between p-5">
        {metrics.map((m, idx) => (
          <div key={m.label}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {m.label}
              </span>
              <span className={`text-sm font-black ${valueColors[idx]}`}>
                {m.value}
              </span>
            </div>
            <div className="h-1 rounded-full bg-slate-100 dark:bg-[#1e1a2e] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${m.cls}`}
                style={{ width: `${m.bar}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ROOT DASHBOARD
═══════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#07101f] transition-colors duration-300 overflow-x-hidden">
      <div className="p-6 lg:p-7 flex flex-col gap-5">
        {/* ══ HEADER ═══════════════════════════════════════ */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-orange-500 dark:text-orange-400 mb-1.5">
              Super Admin · Infrastructure
            </p>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">
              Infrastructure Dashboard
            </h1>
            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
              {now.toLocaleDateString([], {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
              {" · "}
              {now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" · "}
              <span className="text-orange-400 dark:text-orange-400">
                v4.1.0
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400">
                All Systems Nominal
              </span>
            </div>
            <button className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#0c1a2e] border border-slate-200/70 dark:border-[#2a2440] text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 hover:border-orange-300 dark:hover:border-orange-500/30 transition-all shadow-sm dark:shadow-none">
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </header>

        {/* ══ KPI STRIP ════════════════════════════════════ */}
        <KpiStrip />

        {/* ══ SERVICE HEALTH ═══════════════════════════════ */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-2.5">
            Live Service Health
          </p>

          <div className="grid grid-cols-3 gap-4 items-stretch">
            {/* Server Health - 2/3 width */}
            <div className="col-span-2">
              <ServerHealthMonitor />
            </div>

            {/* Platform Health - 1/3 width */}
            <div className="col-span-1">
              <PlatformHealth />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
