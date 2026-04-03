import React, { useMemo, memo, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip);

const pct = (val, total) => (total === 0 ? 0 : Math.round((val / total) * 100));
const fmt = (n) => (n ?? 0).toLocaleString();

const TICKET_STATUSES = [
  { key: "received", label: "Received", hex: "#0ea5e9", tw: "bg-sky-400" },
  { key: "accepted", label: "Accepted", hex: "#6366f1", tw: "bg-indigo-500" },
  { key: "preparing", label: "Preparing", hex: "#f59e0b", tw: "bg-amber-500" },
  { key: "ready", label: "Ready", hex: "#10b981", tw: "bg-emerald-500" },
  { key: "cancelled", label: "Cancelled", hex: "#ef4444", tw: "bg-rose-500" },
];

const ITEM_STATUSES = [
  { key: "pending", label: "Pending", hex: "#94a3b8", tw: "bg-slate-400" },
  { key: "preparing", label: "Preparing", hex: "#f59e0b", tw: "bg-amber-500" },
  { key: "ready", label: "Ready", hex: "#10b981", tw: "bg-emerald-500" },
  { key: "cancelled", label: "Cancelled", hex: "#ef4444", tw: "bg-rose-500" },
];

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "tickets", label: "Tickets" },
  { id: "items", label: "Items" },
  { id: "pipeline", label: "Pipeline" },
];

/* ── Shared UI ── */
const TabBtn = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
      ${
        active
          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
          : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
      }`}
  >
    {label}
  </button>
);

const BarRow = ({ label, count, total, hex, tw }) => {
  const p = pct(count, total);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${tw} flex-shrink-0`} />
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] text-slate-400 tabular-nums">{p}%</span>
          <span className="text-xs font-black text-slate-800 dark:text-white tabular-nums w-8 text-right">
            {fmt(count)}
          </span>
        </div>
      </div>
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${p}%`, backgroundColor: hex }}
        />
      </div>
    </div>
  );
};

const MiniDonut = ({ values, colors, centerVal, centerLabel }) => {
  const chartData = {
    datasets: [
      { data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 },
    ],
  };
  const opts = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        padding: 8,
        cornerRadius: 6,
        bodyFont: { size: 11, weight: "900" },
        callbacks: { label: (c) => `  ${fmt(c.raw)}` },
      },
    },
  };
  return (
    <div className="relative" style={{ height: 150 }}>
      <Doughnut data={chartData} options={opts} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-lg font-black text-slate-900 dark:text-white leading-none">
          {fmt(centerVal)}
        </span>
        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 mt-0.5">
          {centerLabel}
        </span>
      </div>
    </div>
  );
};

const Tile = ({ label, value, hex, subtle }) => (
  <div
    className="rounded-xl p-3 flex flex-col gap-1 border"
    style={{ background: subtle, borderColor: `${hex}30` }}
  >
    <span
      className="text-[8px] font-black uppercase tracking-widest"
      style={{ color: hex }}
    >
      {label}
    </span>
    <span className="text-xl font-black text-slate-900 dark:text-white leading-none tabular-nums">
      {fmt(value)}
    </span>
  </div>
);

const Desc = ({ children }) => (
  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
    {children}
  </p>
);

/* ── Overview Tab ── */
const OverviewSection = ({ tickets, items }) => {
  const tTotal = tickets.total ?? 0;
  const iTotal = items.total ?? 0;
  const active = tTotal - (tickets.cancelled ?? 0);

  return (
    <div className="space-y-4">
      <Desc>
        A snapshot of all kitchen activity — how many orders are in-flight, how
        many items are being worked, and how many tickets ended in cancellation.
      </Desc>
      <div className="grid grid-cols-2 gap-2">
        <Tile
          label="Tickets"
          value={tTotal}
          hex="#6366f1"
          subtle="rgba(99,102,241,0.06)"
        />
        <Tile
          label="Active"
          value={active}
          hex="#0ea5e9"
          subtle="rgba(14,165,233,0.06)"
        />
        <Tile
          label="Items"
          value={iTotal}
          hex="#10b981"
          subtle="rgba(16,185,129,0.06)"
        />
        <Tile
          label="Cancelled"
          value={tickets.cancelled ?? 0}
          hex="#ef4444"
          subtle="rgba(239,68,68,0.06)"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 text-center">
            Tickets
          </p>
          <MiniDonut
            values={TICKET_STATUSES.map((s) => tickets[s.key] ?? 0)}
            colors={TICKET_STATUSES.map((s) => s.hex)}
            centerVal={tTotal}
            centerLabel="total"
          />
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 text-center">
            Items
          </p>
          <MiniDonut
            values={ITEM_STATUSES.map((s) => items[s.key] ?? 0)}
            colors={ITEM_STATUSES.map((s) => s.hex)}
            centerVal={iTotal}
            centerLabel="total"
          />
        </div>
      </div>
      <Desc>
        Each ring shows how work is distributed across stages. Hover a segment
        to see the exact count for that status.
      </Desc>
    </div>
  );
};

/* ── Tickets Tab ── */
const TicketsSection = ({ tickets }) => {
  const total = tickets.total ?? 0;
  const active = total - (tickets.cancelled ?? 0);

  return (
    <div className="space-y-7">
      <Desc>
        Tracks every order ticket from the moment it's received to its final
        outcome. Each stage represents where the ticket currently sits in the
        kitchen workflow.
      </Desc>
      <div className="grid grid-cols-3 gap-2">
        <Tile
          label="Total"
          value={total}
          hex="#6366f1"
          subtle="rgba(99,102,241,0.06)"
        />
        <Tile
          label="Active"
          value={active}
          hex="#0ea5e9"
          subtle="rgba(14,165,233,0.06)"
        />
        <Tile
          label="Cancelled"
          value={tickets.cancelled ?? 0}
          hex="#ef4444"
          subtle="rgba(239,68,68,0.06)"
        />
      </div>
      <div className="space-y-2.5">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          Status breakdown
        </p>
        <Desc>
          Percentage share of each status out of all tickets received. Cancelled
          tickets are included in the total so the split reflects true
          throughput.
        </Desc>
        {TICKET_STATUSES.map((s) => (
          <BarRow
            key={s.key}
            label={s.label}
            count={tickets[s.key] ?? 0}
            total={total}
            hex={s.hex}
            tw={s.tw}
          />
        ))}
      </div>
    </div>
  );
};

/* ── Items Tab ── */
const ItemsSection = ({ items }) => {
  const total = items.total ?? 0;
  const inWork = (items.preparing ?? 0) + (items.ready ?? 0);

  return (
    <div className="space-y-12">
      <Desc>
        Tracks individual menu items across all active orders. An item starts as
        Pending until the kitchen begins work — then moves through Preparing and
        Ready.
      </Desc>
      <div className="grid grid-cols-3 gap-2">
        <Tile
          label="Total"
          value={total}
          hex="#10b981"
          subtle="rgba(16,185,129,0.06)"
        />
        <Tile
          label="Pending"
          value={items.pending ?? 0}
          hex="#94a3b8"
          subtle="rgba(148,163,184,0.06)"
        />
        <Tile
          label="In Work"
          value={inWork}
          hex="#f59e0b"
          subtle="rgba(245,158,11,0.06)"
        />
      </div>
      <div className="space-y-2.5">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          Status breakdown
        </p>
        <Desc>
          Shows what share of total items are at each stage. Pending items are
          queued but not yet being cooked. In Work combines Preparing and Ready.
        </Desc>
        {ITEM_STATUSES.map((s) => (
          <BarRow
            key={s.key}
            label={s.label}
            count={items[s.key] ?? 0}
            total={total}
            hex={s.hex}
            tw={s.tw}
          />
        ))}
      </div>
    </div>
  );
};

/* ── Pipeline Tab ── */
const PipelineSection = ({ tickets, items }) => {
  const barData = useMemo(
    () => ({
      labels: ["Received", "Accepted", "Preparing", "Ready"],
      datasets: [
        {
          label: "Tickets",
          data: [
            tickets.received ?? 0,
            tickets.accepted ?? 0,
            tickets.preparing ?? 0,
            tickets.ready ?? 0,
          ],
          backgroundColor: "#6366f1",
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 12,
        },
        {
          label: "Items (active)",
          data: [0, 0, items.preparing ?? 0, items.ready ?? 0],
          backgroundColor: "#10b981",
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 12,
        },
      ],
    }),
    [tickets, items],
  );

  const barOpts = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      indexAxis: "y",
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0f172a",
          padding: 10,
          cornerRadius: 8,
          titleFont: { size: 11, weight: "bold" },
          bodyFont: { size: 12, weight: "900" },
          callbacks: {
            label: (c) => `  ${c.dataset.label}: ${fmt(c.parsed.x)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: "#94a3b8", font: { size: 10 } },
        },
        y: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: "#94a3b8", font: { size: 10, weight: "bold" } },
        },
      },
    }),
    [],
  );

  const stages = [
    { label: "Received", tickets: tickets.received ?? 0, items: null },
    { label: "Accepted", tickets: tickets.accepted ?? 0, items: null },
    {
      label: "Preparing",
      tickets: tickets.preparing ?? 0,
      items: items.preparing ?? 0,
    },
    { label: "Ready", tickets: tickets.ready ?? 0, items: items.ready ?? 0 },
  ];

  return (
    <div className="space-y-4">
      <Desc>
        Side-by-side overview of active kitchen tickets and their corresponding
        items across each operational stage.
      </Desc>
      <div className="grid grid-cols-2 gap-1.5">
  {stages.map((s) => (
    <div
      key={s.label}
      className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-2"
    >
      <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-1">
        {s.label}
      </p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[7px] text-slate-400 mb-0.5 font-bold flex items-center gap-0.5">
            <span className="w-1 h-1 rounded-full bg-indigo-500 inline-block" />
            Tickets
          </p>
          <p className="text-sm font-black text-slate-900 dark:text-white leading-none">
            {fmt(s.tickets)}
          </p>
        </div>
        {s.items !== null && (
          <div className="text-right">
            <p className="text-[7px] text-slate-400 mb-0.5 font-bold flex items-center gap-0.5 justify-end">
              <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
              Items
            </p>
            <p className="text-sm font-black text-slate-900 dark:text-white leading-none">
              {fmt(s.items)}
            </p>
          </div>
        )}
      </div>
    </div>
  ))}
</div>
      <div className="flex gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-indigo-500 inline-block" />
          <span className="text-[9px] font-black uppercase text-slate-400">
            Tickets
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />
          <span className="text-[9px] font-black uppercase text-slate-400">
            Items active
          </span>
        </div>
      </div>
      <div style={{ height: 150 }}>
        <Bar data={barData} options={barOpts} />
      </div>
      <Desc>
        Items are only tracked from the Preparing stage onward. Earlier stages
        such as Received and Accepted represent tickets that have not yet
        entered the active cooking workflow.
      </Desc>
    </div>
  );
};

/* ── Main ── */
const KitchenLoadChart = memo(({ data, loading }) => {
  const [tab, setTab] = useState("overview");
  const tickets = data?.tickets ?? {};
  const items = data?.items ?? {};

  if (loading && !data?.tickets) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-indigo-500 animate-spin" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Syncing Kitchen
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden transition-colors">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
            Kitchen Load
          </h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            {fmt(tickets.total)} tickets · {fmt(items.total)} items
          </p>
        </div>
        {pct(tickets.cancelled, tickets.total) >= 30 && (
          <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 px-2 py-1 rounded-lg flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider">
              {pct(tickets.cancelled, tickets.total)}% cancelled
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
        {TABS.map((t) => (
          <TabBtn
            key={t.id}
            label={t.label}
            active={tab === t.id}
            onClick={() => setTab(t.id)}
          />
        ))}
      </div>
      <div className="flex-1 px-4 py-3 overflow-y-auto min-h-0">
        {tab === "overview" && (
          <OverviewSection tickets={tickets} items={items} />
        )}
        {tab === "tickets" && <TicketsSection tickets={tickets} />}
        {tab === "items" && <ItemsSection items={items} />}
        {tab === "pipeline" && (
          <PipelineSection tickets={tickets} items={items} />
        )}
      </div>
    </div>
  );
});

export default KitchenLoadChart;
