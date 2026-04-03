// pages/waiter/WaiterProfile.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  Phone,
  Clock,
  LogOut,
  Settings,
  ChevronRight,
  Package,
  Zap,
  UtensilsCrossed,
  TrendingUp,
  ClipboardList,
  Check,
  X,
  ChefHat,
  Star,
  Calendar,
  AlertCircle,
  RefreshCw,
  Shield,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { logoutUser } from "../../../store/slices/authSlices/authSlice";
import {
  fetchWaiterOrders,
  setWaiterFilters,
} from "../../../store/slices/waiterSlice/waiterOrderSlice";

/* ═══════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════ */

const STATUS_CONFIG = {
  CREATED:   { label: "Placed",    color: "#7c3aed", bg: "#ede9fe" },
  PAID:      { label: "Paid",      color: "#0369a1", bg: "#e0f2fe" },
  ACCEPTED:  { label: "Accepted",  color: "#b45309", bg: "#fef3c7" },
  PREPARING: { label: "Cooking",   color: "#c2410c", bg: "#ffedd5" },
  READY:     { label: "Ready",     color: "#15803d", bg: "#dcfce7" },
  COMPLETED: { label: "Done",      color: "#0f766e", bg: "#ccfbf1" },
  CANCELLED: { label: "Cancelled", color: "#6b7280", bg: "#f3f4f6" },
};

const ACTIVE_STATUSES = ["CREATED", "PAID", "ACCEPTED", "PREPARING", "READY"];

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */

const formatAge = (d) => {
  const diff = Math.floor((Date.now() - new Date(d)) / 60000);
  if (diff < 1)  return "just now";
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24)    return `${h}h ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const fmt0 = (v) => parseFloat(v || 0).toFixed(0);

/* ═══════════════════════════════════════════════
   STAT TILE
═══════════════════════════════════════════════ */

function StatTile({ icon: Icon, label, value, color }) {
  return (
    <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-center shadow-sm">
      <div
        style={color ? { background: `${color}18` } : {}}
        className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2"
      >
        <Icon className="w-4 h-4" style={color ? { color } : { color: "#94a3b8" }} />
      </div>
      <p className="text-[17px] font-black text-slate-900 dark:text-white leading-tight">{value}</p>
      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ORDER ROW (compact)
═══════════════════════════════════════════════ */

function OrderRow({ order, showDivider }) {
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.CANCELLED;
  return (
    <div className={`${showDivider ? "border-b border-slate-100 dark:border-slate-800 pb-3" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[12px] font-bold text-slate-800 dark:text-slate-200">
              {order.order_id?.replace("ORD-", "")}
            </span>
            {order.table?.table_number && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                <MapPin className="w-2.5 h-2.5" />
                {order.table.table_number}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{formatAge(order.created_at)}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[13px] font-black text-slate-800 dark:text-slate-200">
            ₹{fmt0(order.total)}
          </span>
          <span
            style={{ color: cfg.color, background: cfg.bg }}
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          >
            {cfg.label}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SECTION CARD
═══════════════════════════════════════════════ */

function Section({ title, icon: Icon, accent = "#7c3aed", children, trailing }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div style={{ background: accent }} className="w-7 h-7 rounded-lg flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h2>
        </div>
        {trailing}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */

export default function WaiterProfile() {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  const user    = useAppSelector((s) => s.auth.user);
  const { orders = [], fetched, loading, count } =
    useAppSelector((s) => s.waiterOrder);

  /* ── Fetch orders once ── */
  useEffect(() => {
    if (!fetched) dispatch(fetchWaiterOrders(1));
  }, [fetched, dispatch]);

  /* ── Derived ── */
  const activeOrders    = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const readyOrders     = orders.filter((o) => o.status === "READY");
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED");

  const totalRevenue = completedOrders.reduce(
    (sum, o) => sum + parseFloat(o.total || 0), 0
  );

  const handleLogout = () => dispatch(logoutUser());

  /* ═══════════════════ TABS */
  const TABS = [
    { value: "profile",  label: "Profile" },
    { value: "orders",   label: "Orders" },
    { value: "stats",    label: "Stats" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28">

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-base font-bold text-slate-900 dark:text-white">My Profile</h1>
          <button
            onClick={() => navigate("/waiter/settings")}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
          >
            <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">

        {/* ═════════ PROFILE HERO CARD ════════ */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
          {/* Top gradient strip */}
          <div className="h-1 bg-gradient-to-r from-violet-600 to-purple-600" />

          <div className="p-4">
            <div className="flex items-center gap-4 mb-4">
              {/* Avatar */}
              <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30 flex-shrink-0">
                <User className="w-8 h-8 text-white" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-[17px] font-black text-slate-900 dark:text-white leading-tight truncate">
                  {user?.name || user?.username || "Waiter"}
                </h2>
                <p className="text-[12px] text-slate-400 truncate mt-0.5">
                  {user?.email || "—"}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-[10px] font-bold">
                    <Shield className="w-2.5 h-2.5" /> Waiter
                  </span>
                  {readyOrders.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold animate-pulse">
                      <Zap className="w-2.5 h-2.5" /> {readyOrders.length} Ready
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-violet-500/25 active:scale-[0.98] transition-transform"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>

        {/* ═════════ QUICK STATS ════════ */}
        <div className="flex gap-2">
          <StatTile icon={ClipboardList} label="Total"     value={count || orders.length} color="#7c3aed" />
          <StatTile icon={Zap}           label="Active"    value={activeOrders.length}    color="#15803d" />
          <StatTile icon={Check}         label="Completed" value={completedOrders.length} color="#0369a1" />
        </div>

        {/* ═════════ TABS ════════ */}
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.value
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/30"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════
            TAB: PROFILE
        ══════════════════════════════ */}
        {activeTab === "profile" && (
          <div className="space-y-3">

            {/* Ready orders alert */}
            {readyOrders.length > 0 && (
              <div className="flex items-center gap-3 bg-green-500 text-white rounded-2xl px-4 py-3 shadow-md shadow-green-500/25">
                <Zap className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold">{readyOrders.length} order{readyOrders.length > 1 ? "s" : ""} ready to serve!</p>
                  <p className="text-[11px] text-white/70">
                    {readyOrders.map((o) => o.table?.table_number).filter(Boolean).join(", ")}
                  </p>
                </div>
                <Link to="/waiter/orders" className="flex-shrink-0">
                  <ChevronRight className="w-5 h-5 text-white/70" />
                </Link>
              </div>
            )}

            {/* Active orders summary */}
            {activeOrders.length > 0 && (
              <Section
                title="Active Orders"
                icon={Zap}
                accent="#15803d"
                trailing={
                  <Link
                    to="/waiter/orders"
                    className="text-[11px] text-violet-500 font-semibold flex items-center gap-0.5"
                  >
                    View All <ChevronRight className="w-3 h-3" />
                  </Link>
                }
              >
                <div className="space-y-3">
                  {activeOrders.slice(0, 3).map((order, idx) => (
                    <OrderRow
                      key={order.order_id}
                      order={order}
                      showDivider={idx < Math.min(activeOrders.length, 3) - 1}
                    />
                  ))}
                  {activeOrders.length > 3 && (
                    <p className="text-[11px] text-slate-400 text-center pt-1">
                      +{activeOrders.length - 3} more active
                    </p>
                  )}
                </div>
              </Section>
            )}

            {/* Quick actions */}
            <Section title="Quick Actions" icon={ChefHat} accent="#7c3aed">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { to: "/waiter/orders",       icon: ClipboardList, label: "All Orders",    color: "#7c3aed" },
                  { to: "/waiter/tables",        icon: MapPin,        label: "Tables",         color: "#0369a1" },
                  { to: "/waiter/menu",          icon: UtensilsCrossed, label: "Menu",         color: "#b45309" },
                  { to: "/waiter/kitchen-view",  icon: ChefHat,       label: "Kitchen View",  color: "#c2410c" },
                ].map(({ to, icon: Icon, label, color }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex flex-col items-center gap-2 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div
                      style={{ background: `${color}18` }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{label}</span>
                  </Link>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* ══════════════════════════════
            TAB: ORDERS
        ══════════════════════════════ */}
        {activeTab === "orders" && (
          <div className="space-y-3">
            {loading && !fetched && (
              <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading orders…</span>
              </div>
            )}

            {orders.length === 0 && !loading && (
              <div className="flex flex-col items-center py-14 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-3">
                  <ClipboardList className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">No orders yet</p>
                <p className="text-[12px] text-slate-400">Orders you handle will appear here</p>
              </div>
            )}

            {/* Active */}
            {activeOrders.length > 0 && (
              <Section
                title={`Active  · ${activeOrders.length}`}
                icon={Zap}
                accent="#15803d"
                trailing={
                  <Link to="/waiter/orders" className="text-[11px] text-violet-500 font-semibold flex items-center gap-0.5">
                    All <ChevronRight className="w-3 h-3" />
                  </Link>
                }
              >
                <div className="space-y-3">
                  {activeOrders.map((order, idx) => (
                    <Link key={order.order_id} to={`/waiter/orders/${order.order_id}`} className="block">
                      <OrderRow order={order} showDivider={idx < activeOrders.length - 1} />
                    </Link>
                  ))}
                </div>
              </Section>
            )}

            {/* Completed */}
            {completedOrders.length > 0 && (
              <Section title={`Completed  · ${completedOrders.length}`} icon={Check} accent="#0f766e">
                <div className="space-y-3">
                  {completedOrders.slice(0, 5).map((order, idx) => (
                    <Link key={order.order_id} to={`/waiter/orders/${order.order_id}`} className="block">
                      <OrderRow order={order} showDivider={idx < Math.min(completedOrders.length, 5) - 1} />
                    </Link>
                  ))}
                  {completedOrders.length > 5 && (
                    <Link
                      to="/waiter/orders"
                      className="block text-center text-[11px] text-violet-500 font-semibold pt-1"
                    >
                      View all {completedOrders.length} completed
                    </Link>
                  )}
                </div>
              </Section>
            )}

            {/* Cancelled */}
            {cancelledOrders.length > 0 && (
              <Section title={`Cancelled  · ${cancelledOrders.length}`} icon={X} accent="#6b7280">
                <div className="space-y-3">
                  {cancelledOrders.slice(0, 3).map((order, idx) => (
                    <Link key={order.order_id} to={`/waiter/orders/${order.order_id}`} className="block">
                      <OrderRow order={order} showDivider={idx < Math.min(cancelledOrders.length, 3) - 1} />
                    </Link>
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}

        {/* ══════════════════════════════
            TAB: STATS
        ══════════════════════════════ */}
        {activeTab === "stats" && (
          <div className="space-y-3">

            {/* Revenue card */}
            <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-4 shadow-lg shadow-violet-500/25">
              <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">Total Revenue Served</p>
              <p className="text-[32px] font-black text-white leading-tight">
                ₹{totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-[11px] text-white/60 mt-1">
                From {completedOrders.length} completed order{completedOrders.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Stats grid */}
            <Section title="Order Breakdown" icon={TrendingUp} accent="#0369a1">
              <div className="space-y-3">
                {[
                  { label: "Total Orders",    value: count || orders.length,  color: "#7c3aed" },
                  { label: "Active",          value: activeOrders.length,     color: "#15803d" },
                  { label: "Ready to Serve",  value: readyOrders.length,      color: "#15803d" },
                  { label: "Completed",       value: completedOrders.length,  color: "#0f766e" },
                  { label: "Cancelled",       value: cancelledOrders.length,  color: "#6b7280" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[12px] text-slate-500 dark:text-slate-400">{label}</span>
                    <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">{value}</span>
                  </div>
                ))}

                {/* Divider */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">Completion Rate</span>
                    <span className="text-[13px] font-black text-violet-600 dark:text-violet-400">
                      {orders.length > 0
                        ? `${Math.round((completedOrders.length / orders.length) * 100)}%`
                        : "—"}
                    </span>
                  </div>
                  {/* Progress bar */}
                  {orders.length > 0 && (
                    <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.round((completedOrders.length / orders.length) * 100)}%`,
                        }}
                        className="h-full bg-gradient-to-r from-violet-600 to-purple-600 rounded-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* Status distribution pills */}
            <Section title="Status Distribution" icon={Star} accent="#b45309">
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                  const count = orders.filter((o) => o.status === status).length;
                  if (count === 0) return null;
                  return (
                    <div
                      key={status}
                      style={{ color: cfg.color, background: cfg.bg }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                    >
                      <span className="text-[11px] font-bold">{cfg.label}</span>
                      <span className="text-[11px] font-black">{count}</span>
                    </div>
                  );
                })}
                {orders.length === 0 && (
                  <p className="text-[12px] text-slate-400 italic">No data yet</p>
                )}
              </div>
            </Section>

            {/* Account info */}
            <Section title="Account Details" icon={User} accent="#6b7280">
              <div className="space-y-3">
                {[
                  { label: "Name",  value: user?.name || user?.username || "—" },
                  { label: "Email", value: user?.email || "—" },
                  { label: "Role",  value: "Waiter" },
                  ...(user?.phone ? [{ label: "Phone", value: user.phone }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <span className="text-[12px] text-slate-400 flex-shrink-0 w-16">{label}</span>
                    <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 text-right truncate">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}