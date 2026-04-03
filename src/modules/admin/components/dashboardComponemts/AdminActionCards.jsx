import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectDashboardOrderStats,
  selectDashboardKitchenStats,
  selectCustomerStats,
  selectDishStats,
} from "../../../../store/slices/restaurantAdminSlice/adminChartSlice";
import { selectAdminTableStats } from "../../../../store/slices/restaurantAdminSlice/adminTableSlice";

// ─── Icons ────────────────────────────────────────────────────────────────────

const TableIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 6h18M3 14h18M3 18h18" />
  </svg>
);
const OrderIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
const KitchenIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);
const CustomerIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const DishIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2.2} fill="none" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" />
  </svg>
);

// ─── Stat row ─────────────────────────────────────────────────────────────────

function StatRow({ label, value, color, barColor, total }) {
  const pct = total > 0 ? Math.min(100, Math.round(((value ?? 0) / total) * 100)) : 0;
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium truncate leading-none">
          {label}
        </span>
        <span className={`text-[11px] font-black tabular-nums leading-none flex-shrink-0 ${color}`}>
          {value ?? 0}
        </span>
      </div>
      <div className="h-[2px] w-full rounded-full bg-gray-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${pct}%`, transition: "width 0.8s ease" }}
        />
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function ActionCard({
  icon, accent, label,
  primary, primaryLabel,
  badge, badgePulse,
  rows, total, onClick,
}) {
  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col gap-2 p-3 rounded-xl cursor-pointer
                 bg-white dark:bg-slate-900
                 border border-gray-100 dark:border-slate-800
                 hover:border-gray-200 dark:hover:border-slate-700
                 hover:shadow-md hover:-translate-y-0.5
                 transition-all duration-200 overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-4 -left-4 w-16 h-16 rounded-full blur-2xl opacity-[0.08]"
        style={{ background: accent }}
      />

      {/* Row 1 — icon · label · badge */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 rounded-lg" style={{ background: `${accent}18` }}>
            <span style={{ color: accent }}>{icon}</span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.12em] text-gray-400 dark:text-slate-500">
            {label}
          </span>
        </div>
        {badge && (
          <span
            className={`text-[8px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 ${badgePulse ? "animate-pulse" : ""}`}
            style={{
              background: `${accent}15`,
              color: accent,
              border: `1px solid ${accent}35`,
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Row 2 — big number + label inline */}
      <div className="flex items-baseline gap-1.5 px-0.5">
        <span
          className="text-[1.75rem] font-black leading-none tabular-nums"
          style={{ color: accent }}
        >
          {primary ?? "—"}
        </span>
        <span className="text-[9px] text-gray-400 dark:text-slate-600 font-semibold leading-tight">
          {primaryLabel}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 dark:bg-slate-800" />

      {/* Stat rows */}
      <div className="flex flex-col gap-1.5">
        {rows.map((row, i) => (
          <StatRow key={i} {...row} total={total ?? 1} />
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminActionCards() {
  const navigate = useNavigate();

  const o = useSelector(selectDashboardOrderStats);
  const k = useSelector(selectDashboardKitchenStats);
  const c = useSelector(selectCustomerStats);
  const d = useSelector(selectDishStats);
  const t = useSelector(selectAdminTableStats);

  const liveKitchen =
    (k?.tickets?.received ?? 0) +
    (k?.tickets?.accepted ?? 0) +
    (k?.tickets?.preparing ?? 0);

  const cards = [
    {
      accent: "#818cf8",
      icon: <TableIcon />,
      label: "Tables",
      primary: t?.total,
      primaryLabel: "on floor",
      badge: t?.occupied > 0 ? `${t.occupied} busy` : "all free",
      badgePulse: t?.occupied > 0,
      total: t?.total ?? 1,
      rows: [
        { label: "Available",     value: t?.available, color: "text-emerald-500", barColor: "bg-emerald-500" },
        { label: "Reserved",      value: t?.reserved,  color: "text-amber-500",   barColor: "bg-amber-500"   },
        { label: "Out of service",value: t?.inactive,  color: "text-gray-400 dark:text-slate-500", barColor: "bg-gray-300 dark:bg-slate-700" },
      ],
      onClick: () => navigate("/restaurant/admin/table-management"),
    },
    {
      accent: "#f59e0b",
      icon: <OrderIcon />,
      label: "Orders",
      primary: o?.total_orders,
      primaryLabel: "total orders",
      badge: o?.active_orders > 0 ? `${o.active_orders} active` : null,
      badgePulse: true,
      total: o?.total_orders ?? 1,
      rows: [
        { label: "Completed",  value: o?.completed,    color: "text-emerald-500", barColor: "bg-emerald-500" },
        { label: "Cancelled",  value: o?.cancelled,    color: "text-red-500",     barColor: "bg-red-500"     },
        { label: "Paid",       value: o?.payment_paid, color: "text-sky-500",     barColor: "bg-sky-500"     },
      ],
      onClick: () => navigate("/restaurant/admin/order-management"),
    },
    {
      accent: "#f97316",
      icon: <KitchenIcon />,
      label: "Kitchen",
      primary: k?.tickets?.total,
      primaryLabel: "tickets",
      badge: liveKitchen > 0 ? `${liveKitchen} live` : null,
      badgePulse: liveKitchen > 0,
      total: k?.tickets?.total ?? 1,
      rows: [
        { label: "Cooking",    value: k?.tickets?.preparing, color: "text-orange-500",  barColor: "bg-orange-500"  },
        { label: "Ready",      value: k?.tickets?.ready,     color: "text-emerald-500", barColor: "bg-emerald-500" },
        { label: "Items live", value: k?.items?.preparing,   color: "text-amber-500",   barColor: "bg-amber-500"   },
      ],
      onClick: () => navigate("/restaurant/admin/kitchenticket-management"),
    },
    {
      accent: "#0ea5e9",
      icon: <CustomerIcon />,
      label: "Customers",
      primary: c?.total_users,
      primaryLabel: "registered",
      badge: c?.today_users > 0 ? `+${c.today_users} today` : null,
      badgePulse: false,
      total: c?.total_users ?? 1,
      rows: [
        { label: "Active",    value: c?.active_users,   color: "text-emerald-500", barColor: "bg-emerald-500" },
        { label: "This month",value: c?.month_users,    color: "text-sky-500",     barColor: "bg-sky-500"     },
        { label: "Dormant",   value: c?.inactive_users, color: "text-gray-400 dark:text-slate-500", barColor: "bg-gray-300 dark:bg-slate-700" },
      ],
      onClick: () => navigate("/restaurant/admin/customer-management"),
    },
    {
      accent: "#10b981",
      icon: <DishIcon />,
      label: "Menu",
      primary: d?.total_dishes,
      primaryLabel: "dishes",
      badge: d?.today_reviews > 0 ? `${d.today_reviews} review` : null,
      badgePulse: false,
      total: d?.total_dishes ?? 1,
      rows: [
        { label: "Active",   value: d?.active_dishes,   color: "text-emerald-500", barColor: "bg-emerald-500" },
        { label: "Inactive", value: d?.inactive_dishes, color: "text-gray-400 dark:text-slate-500", barColor: "bg-gray-300 dark:bg-slate-700" },
        { label: "Reviews",  value: d?.total_reviews,   color: "text-sky-500",     barColor: "bg-sky-500"     },
      ],
      onClick: () => navigate("/restaurant/admin/menu-management"),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => (
        <ActionCard key={card.label} {...card} />
      ))}
    </div>
  );
}