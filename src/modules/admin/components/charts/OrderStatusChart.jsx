import React, { useMemo, useState, memo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip);

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const pct = (val, total) => (total === 0 ? 0 : Math.round((val / total) * 100));
const fmt = (n) => (n ?? 0).toLocaleString();

/* ─────────────────────────────────────────
   TABS CONFIG
───────────────────────────────────────── */
const TABS = [
  { key: "kitchen", label: "Kitchen" },
  { key: "outcomes", label: "Outcomes" },
  { key: "finance", label: "Finance" },
];

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2 ">
      <span>{children}</span>
      <span className="h-px flex-1 bg-slate-100 dark:bg-slate-700/60" />
    </p>
  );
}

function StatusRow({ label, count, total, color, bg }) {
  const percentage = pct(count, total);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${bg}`} />
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-400 font-semibold">
            {percentage}%
          </span>
          <span className="text-xs font-black dark:text-white w-5 text-right">
            {fmt(count)}
          </span>
        </div>
      </div>
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}

function StatBadge({ label, value, accent }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl px-3 py-2 gap-0.5"
      style={{ background: accent + "15", border: `1px solid ${accent}25` }}
    >
      <span
        className="text-lg font-black leading-none"
        style={{ color: accent }}
      >
        {fmt(value)}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN
───────────────────────────────────────── */
const OrderStatusChart = memo(({ data, loading }) => {
  const [activeTab, setActiveTab] = useState("kitchen");

  const total = data?.total_orders ?? 0;
  const active = data?.active_orders ?? 0;
  const completed = data?.completed ?? 0;
  const cancelled = data?.cancelled ?? 0;
  const pipeline =
    (data?.created ?? 0) +
    (data?.accepted ?? 0) +
    (data?.preparing ?? 0) +
    (data?.ready ?? 0);
  const payTotal =
    (data?.payment_paid ?? 0) +
    (data?.payment_pending ?? 0) +
    (data?.payment_failed ?? 0);
  const cancelRate = pct(cancelled, total);
  const highCancel = cancelRate >= 40;

  /* Doughnut data */
  const chartData = useMemo(
    () => ({
      labels: [
        "New",
        "Accepted",
        "Preparing",
        "Ready",
        "Completed",
        "Cancelled",
        "Paid",
        "Pending",
        "Failed",
      ],
      datasets: [
        {
          label: "Lifecycle",
          data: [
            data?.created ?? 0,
            data?.accepted ?? 0,
            data?.preparing ?? 0,
            data?.ready ?? 0,
            completed,
            cancelled,
            0,
            0,
            0,
          ],
          backgroundColor: [
            "#f59e0b",
            "#3b82f6",
            "#8b5cf6",
            "#10b981",
            "#059669",
            "#ef4444",
            "transparent",
            "transparent",
            "transparent",
          ],
          borderWidth: 0,
          borderRadius: 4,
          spacing: 3,
          weight: 1,
        },
        {
          label: "Payments",
          data: [
            0,
            0,
            0,
            0,
            0,
            0,
            data?.payment_paid ?? 0,
            data?.payment_pending ?? 0,
            data?.payment_failed ?? 0,
          ],
          backgroundColor: [
            "transparent",
            "transparent",
            "transparent",
            "transparent",
            "transparent",
            "transparent",
            "#10b981",
            "#f59e0b",
            "#dc2626",
          ],
          borderWidth: 0,
          borderRadius: 4,
          spacing: 3,
          weight: 0.55,
        },
      ],
    }),
    [data, completed, cancelled],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      cutout: "62%",
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0f172a",
          padding: 10,
          cornerRadius: 10,
          callbacks: {
            label: (ctx) => {
              if (ctx.parsed === 0) return null;
              const ringTotal = ctx.datasetIndex === 0 ? total : payTotal;
              return `  ${ctx.label}: ${fmt(ctx.parsed)}  (${pct(ctx.parsed, ringTotal)}%)`;
            },
          },
        },
      },
    }),
    [total, payTotal],
  );

  /* Tab panels — fixed content, no scroll needed */
  const panels = {
    kitchen: (
      <div className="grid grid-cols-2 gap-2 ">
        <StatusRow
          label="New"
          count={data?.created}
          total={total}
          color="#f59e0b"
          bg="bg-amber-500"
        />
        <StatusRow
          label="Accepted"
          count={data?.accepted}
          total={total}
          color="#3b82f6"
          bg="bg-blue-500"
        />
        <StatusRow
          label="Preparing"
          count={data?.preparing}
          total={total}
          color="#8b5cf6"
          bg="bg-violet-500"
        />
        <StatusRow
          label="Ready"
          count={data?.ready}
          total={total}
          color="#10b981"
          bg="bg-emerald-500"
        />
      </div>
    ),
    outcomes: (
      <div className="grid grid-cols-1 gap-2">
        <StatusRow
          label="Completed"
          count={data?.completed}
          total={total}
          color="#059669"
          bg="bg-emerald-700"
        />
        <StatusRow
          label="Cancelled"
          count={data?.cancelled}
          total={total}
          color="#ef4444"
          bg="bg-red-500"
        />
      </div>
    ),
    finance: (
      <div className="grid grid-cols-1 gap-2">
        <StatusRow
          label="Paid"
          count={data?.payment_paid}
          total={payTotal}
          color="#10b981"
          bg="bg-emerald-500"
        />
        <StatusRow
          label="Pending"
          count={data?.payment_pending}
          total={payTotal}
          color="#f59e0b"
          bg="bg-amber-500"
        />
        <StatusRow
          label="Failed"
          count={data?.payment_failed}
          total={payTotal}
          color="#dc2626"
          bg="bg-red-600"
        />
      </div>
    ),
  };

  const panelLabels = {
    kitchen: "Kitchen & Floor",
    outcomes: "Outcomes",
    finance: "Financial Status",
  };

  /* Loading */
  if (loading && (!data || Object.keys(data).length === 0)) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-blue-500 animate-spin" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Loading Analytics
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-5 flex flex-col gap-3 bg-white dark:bg-gray-900 transition-colors overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between shrink-0">
        <div>
          <h3 className="font-black text-gray-800 dark:text-white tracking-tight leading-tight">
            Order Analytics
          </h3>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">
            Lifecycle · Payments
          </p>
        </div>
        {highCancel && (
          <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 px-2 py-1 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] font-black text-red-500 uppercase tracking-wider">
              {cancelRate}% cancelled
            </span>
          </div>
        )}
      </div>

      {/* Doughnut chart */}
      <div className="relative shrink-0" style={{ height: 200 }}>
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-0.5">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">
            Total
          </span>
          <span className="text-3xl font-black dark:text-white leading-tight">
            {fmt(total)}
          </span>
          <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">
              {fmt(active)} active
            </span>
          </div>
        </div>
      </div>

      {/* Stat badges */}
      <div className="grid grid-cols-3 gap-2 shrink-0">
        <StatBadge label="Pipeline" value={pipeline} accent="#3b82f6" />
        <StatBadge label="Done" value={completed} accent="#059669" />
        <StatBadge label="Cancelled" value={cancelled} accent="#ef4444" />
      </div>

      {/* Tab switcher pill */}
      <div className="shrink-0 flex rounded-xl bg-slate-100 dark:bg-slate-800/60 p-0.5 gap-0.5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-white dark:bg-slate-700 text-gray-800 dark:text-white shadow-sm"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active panel — static height, zero scroll */}
      <div className="shrink-0">
        <SectionLabel>{panelLabels[activeTab]}</SectionLabel>
        {panels[activeTab]}
      </div>
    </div>
  );
});

export default OrderStatusChart;
