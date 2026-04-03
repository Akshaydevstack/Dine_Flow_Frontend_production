import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../../../api/axiosClient";
import {
  fetchAdminCustomers,
  updateCustomerStatus,
  setAdminSearchQuery,
  setAdminStatusFilter,
  setAdminSortBy,
  setAdminCurrentPage,
  setAdminCustomerDateRange,
  clearAdminCustomerDateRange,
  resetAdminCustomerFilters,
  selectAdminCustomers,
  selectAdminCustomerFilters,
  selectAdminCustomerPagination,
  selectAdminCustomerLoading,
  selectAdminCustomerRefreshing,
  selectAdminCustomerLoadingMore,
  selectAdminCustomerFetched,
  selectAdminCustomerError,
  clearAdminCustomerError,
} from "../../../store/slices/restaurantAdminSlice/adminUserSlice";
import {
  Search,
  RefreshCw,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Loader2,
  SlidersHorizontal,
  AlertCircle,
  Calendar,
  CalendarRange,
  ArrowRight,
  X,
  ChevronDown,
  Clock,
  ShoppingBag,
  ShoppingCart,
  RotateCcw,
  CreditCard
} from "lucide-react";

/* ================================================================
   HELPERS
================================================================ */
const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString([], {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
const fmtTime = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
const timeAgo = (iso) => {
  if (!iso) return "";
  const d = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  if (d < 604800) return `${Math.floor(d / 86400)}d ago`;
  return fmtDate(iso);
};

/* ================================================================
   AVATAR — deterministic gradient from public_id
================================================================ */
const GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-500",
  "from-sky-500 to-blue-600",
  "from-indigo-500 to-violet-600",
  "from-fuchsia-500 to-pink-600",
  "from-cyan-500 to-sky-600",
];
const Avatar = ({ customer }) => {
  const initials =
    [customer.first_name, customer.last_name]
      .filter(Boolean)
      .map((n) => n[0].toUpperCase())
      .join("")
      .slice(0, 2) || "?";
  const idx = customer.public_id
    ? customer.public_id.charCodeAt(0) % GRADIENTS.length
    : 0;
  return (
    <div
      className={`w-9 h-9 rounded-full bg-gradient-to-br ${GRADIENTS[idx]} flex items-center justify-center flex-shrink-0`}
    >
      <span className="text-xs font-black text-white leading-none">
        {initials}
      </span>
    </div>
  );
};

/* ================================================================
   STATS STRIP — matches ReviewManagement StatsStrip exactly
================================================================ */
const StatsStrip = ({ customers, totalItems }) => {
  const active = customers.filter((c) => c.is_active).length;
  const blocked = customers.filter((c) => !c.is_active).length;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
      {[
        {
          label: "Total",
          value: totalItems || customers.length,
          color: "text-slate-800 dark:text-white",
        },
        { label: "Active", value: active, color: "text-emerald-500" },
        { label: "Blocked", value: blocked, color: "text-rose-500" },
        { label: "Loaded", value: customers.length, color: "text-violet-500" },
      ].map((s) => (
        <div
          key={s.label}
          className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 text-center"
        >
          <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
          <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mt-0.5">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
};

/* ================================================================
   FILTER PILL
================================================================ */
const FilterPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap
      ${
        active
          ? "bg-violet-600 text-white border-violet-600"
          : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-violet-400 dark:hover:border-violet-600 bg-white dark:bg-slate-800/60"
      }`}
  >
    {label}
  </button>
);

/* ================================================================
   DATE RANGE PICKER — violet accent to match page
================================================================ */
const DateRangePicker = ({ dateFrom, dateTo, onChange, onClear }) => {
  const hasRange = dateFrom || dateTo;
  return (
    <div>
      <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
        <CalendarRange size={11} /> Date Range
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Calendar
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
          />
          <input
            type="date"
            value={dateFrom || ""}
            max={dateTo || undefined}
            onChange={(e) =>
              onChange({ dateFrom: e.target.value || null, dateTo })
            }
            className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold outline-none focus:ring-2 ring-violet-500/20 focus:border-violet-400 dark:focus:border-violet-500/50 transition-all"
          />
        </div>
        <ArrowRight size={14} className="text-slate-400 flex-shrink-0" />
        <div className="relative">
          <Calendar
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
          />
          <input
            type="date"
            value={dateTo || ""}
            min={dateFrom || undefined}
            onChange={(e) =>
              onChange({ dateFrom, dateTo: e.target.value || null })
            }
            className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold outline-none focus:ring-2 ring-violet-500/20 focus:border-violet-400 dark:focus:border-violet-500/50 transition-all"
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
              const now = new Date();
              onChange({
                dateFrom: new Date(now.getFullYear(), now.getMonth(), 1)
                  .toISOString()
                  .slice(0, 10),
                dateTo: now.toISOString().slice(0, 10),
              });
            },
          },
        ].map((p) => (
          <button
            key={p.label}
            onClick={p.fn}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider hover:border-violet-400 dark:hover:border-violet-600 transition-all whitespace-nowrap"
          >
            {p.label}
          </button>
        ))}
        {hasRange && (
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
};

/* ================================================================
   ROW SKELETON — mirrors ReviewManagement RowSkeleton
================================================================ */
const RowSkeleton = () => (
  <>
    <div className="animate-pulse flex items-center gap-4 px-5 py-4">
      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-2.5 w-48 bg-slate-100 dark:bg-slate-800 rounded-full" />
        <div className="h-2.5 w-32 bg-slate-100 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="hidden lg:block h-10 w-28 bg-slate-100 dark:bg-slate-800 rounded-lg" />
      <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      <div className="flex gap-1.5">
        <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
    <div className="h-px w-full bg-violet-500/20" />
  </>
);

/* ================================================================
   CONFIRM MODAL — matches ReviewManagement DeleteModal style
================================================================ */
const ConfirmModal = ({ customer, onConfirm, onClose }) => {
  const [busy, setBusy] = useState(false);
  const handle = async () => {
    setBusy(true);
    await onConfirm();
    setBusy(false);
  };
  const isActive = customer.is_active;
  const fullName =
    [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
    "this customer";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 w-full max-w-sm">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4
          ${isActive ? "bg-rose-100 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400" : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}
        >
          {isActive ? <UserX size={22} /> : <UserCheck size={22} />}
        </div>
        <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
          {isActive ? "Restrict Account?" : "Restore Account?"}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5">
          {isActive ? "This will block" : "This will restore"}{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {fullName}
          </span>{" "}
          from placing orders.
        </p>
        <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mb-6">
          {customer.public_id}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={busy}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-black disabled:opacity-60 flex items-center justify-center gap-2
              ${isActive ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            {busy ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isActive ? (
              <UserX size={14} />
            ) : (
              <UserCheck size={14} />
            )}
            {isActive ? "Restrict" : "Restore"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   EMPTY STATE
================================================================ */
const EmptyState = ({ filtered, onReset }) => (
  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
    <span className="text-5xl mb-4">👤</span>
    <p className="font-bold uppercase text-xs tracking-widest">
      {filtered ? "No customers match your filters" : "No customers yet"}
    </p>
    {filtered && (
      <button
        onClick={onReset}
        className="mt-4 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-xs font-black hover:bg-violet-700 flex items-center gap-2"
      >
        <RotateCcw size={12} /> Clear filters
      </button>
    )}
  </div>
);

/* ================================================================
   ORDERS DRAWER
================================================================ */

const OrdersDrawer = ({ customer, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customer?.public_id) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(
          `/order/restaurant-admin/customer/${customer.public_id}/`,
        );

        setOrders(res.data?.orders || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customer]);

  if (!customer) return null;
  const fullName =
    [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
    "Unknown";

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10";
      case "PREPARING":
        return "text-amber-500 bg-amber-50 dark:bg-amber-500/10";
      case "READY":
        return "text-blue-500 bg-blue-50 dark:bg-blue-500/10";
      default:
        return "text-slate-500 bg-slate-50 dark:bg-slate-500/10";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white dark:bg-[#1e293b] h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 flex items-center justify-center">
              <ShoppingBag size={16} className="text-violet-500" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white leading-none">
                Order History
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">{fullName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:text-rose-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-10 text-slate-400 text-sm">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No orders found.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.order_id}
                className="border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      {order.order_id}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-white"
                      />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-tight">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Qty: {item.quantity} • {order.currency}{" "}
                          {item.unit_price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">
                    {order.table?.zone_name} • {order.table?.table_number}
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {order.currency} {order.total}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   CART DRAWER
================================================================ */


const CartDrawer = ({ customer, onClose }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      if (!customer?.public_id) return;
      try {
        setLoading(true);
        const res = await axiosClient.get(`/cart/restaurant-admin/${customer.public_id}/`);
        setCart(res.data);
      } catch (err) {
        console.error("Cart Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [customer]);

  if (!customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-[#1e293b] h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500">
              <ShoppingCart size={16} />
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">Active Cart</h2>
          </div>
          <button onClick={onClose} className="text-slate-400"><X size={20} /></button>
        </div>

        {/* Cart List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
             <div className="flex justify-center py-10 text-slate-400 text-xs italic">Checking cart...</div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <ShoppingCart size={32} className="opacity-20" />
              <p className="text-sm font-bold">Cart is empty</p>
              <p className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{customer.public_id}</p>
            </div>
          ) : (
            <div className="space-y-4">
               {cart.items.map((item, idx) => (
                 <div key={idx} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
                    <div className="text-xs font-bold dark:text-white">{item.name} <span className="text-slate-400">x{item.quantity}</span></div>
                    <div className="text-xs font-mono">₹{item.total}</div>
                 </div>
               ))}
            </div>
          )}
        </div>

        {/* Footer Totals */}
        {cart && cart.items.length > 0 && (
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between mb-2 text-xs text-slate-500">
              <span>Subtotal</span>
              <span>₹{cart.subtotal}</span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold dark:text-white">Total</span>
              <span className="text-xl font-black text-amber-500">₹{cart.subtotal}</span>
            </div>
            <button className="w-full py-4 bg-slate-900 dark:bg-violet-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2">
              <CreditCard size={18} />
              Checkout Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ================================================================
   CUSTOMER ROW — mirrors ReviewRow structure exactly
================================================================ */
const CustomerRow = ({
  customer,
  onStatusAction,
  onViewOrders,
  onViewCart,
  isLast,
}) => {
  const [expanded, setExpanded] = useState(false);
  const fullName =
    [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
    "Unknown";
  const email = customer.email || "";

  return (
    <div className="group">
      <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors duration-150">
        {/* Avatar with online dot — same as ReviewRow */}
        <div className="relative flex-shrink-0">
          <Avatar customer={customer} />
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#1e293b]
            ${customer.is_active ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-500"}`}
          />
        </div>

        {/* Name + contact — flex-1 zone, mirrors ReviewRow customer/comment */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-sm font-bold text-slate-900 dark:text-white leading-none">
              {fullName}
            </span>
            <span className="text-[9px] font-mono text-slate-500 dark:text-slate-600 bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600/50 leading-none">
              {customer.public_id?.slice(0, 16)}…
            </span>
          </div>
          {email && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
              <Mail size={10} className="text-slate-400 flex-shrink-0" />
              <span className={expanded ? "" : "truncate max-w-[220px]"}>
                {email}
              </span>
            </div>
          )}
          {customer.mobile_number && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
              <Phone size={10} className="flex-shrink-0" />
              {customer.mobile_number}
            </div>
          )}
          {email.length > 28 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-[10px] font-bold text-violet-500 hover:text-violet-400 mt-0.5 flex items-center gap-0.5"
            >
              {expanded ? "Less" : "More"}
              <ChevronDown
                size={9}
                className={`transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>

        {/* Joined date — same position as ReviewRow date column */}
        <div className="hidden lg:flex flex-col items-end flex-shrink-0 w-28">
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-none">
            {fmtDate(customer.created_at)}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">
            {fmtTime(customer.created_at)}
          </span>
          <span className="text-[9px] text-slate-300 dark:text-slate-600 mt-0.5 leading-none flex items-center gap-0.5">
            <Clock size={8} />
            {timeAgo(customer.created_at)}
          </span>
        </div>

        {/* Status badge — same position as ReviewRow rating */}
        <div className="flex-shrink-0">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border
            ${
              customer.is_active
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/40"
                : "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-700/30"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${customer.is_active ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
            />
            {customer.is_active ? "Active" : "Blocked"}
          </div>
        </div>

        {/* Actions — 3 buttons mirroring ReviewRow's action area */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Orders — always visible, violet */}
          <button
            onClick={() => onViewOrders(customer)}
            title="View Orders"
            className="w-8 h-8 rounded-xl border border-violet-200 dark:border-violet-800/50 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/40 flex items-center justify-center transition-all"
          >
            <ShoppingBag size={13} />
          </button>

          {/* Cart — always visible, amber */}
          <button
            onClick={() => onViewCart(customer)}
            title="View Cart"
            className="w-8 h-8 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 flex items-center justify-center transition-all"
          >
            <ShoppingCart size={13} />
          </button>

          {/* Restrict/Restore — hover-reveal, mirrors ReviewRow delete button */}
          <button
            onClick={() => onStatusAction(customer)}
            title={customer.is_active ? "Restrict" : "Restore"}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all opacity-0 group-hover:opacity-100
              ${
                customer.is_active
                  ? "border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                  : "border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
              }`}
          >
            {customer.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
          </button>
        </div>
      </div>

      {/* Violet divider — same pattern as ReviewRow's emerald divider */}
      {!isLast && <div className="h-px w-full bg-violet-500/20" />}
    </div>
  );
};

/* ================================================================
   MAIN
================================================================ */
const CustomerManagement = () => {
  const dispatch = useDispatch();

  const customers = useSelector(selectAdminCustomers);
  const filters = useSelector(selectAdminCustomerFilters);
  const pagination = useSelector(selectAdminCustomerPagination);
  const loading = useSelector(selectAdminCustomerLoading);
  const isRefreshing = useSelector(selectAdminCustomerRefreshing);
  const loadingMore = useSelector(selectAdminCustomerLoadingMore);
  const fetched = useSelector(selectAdminCustomerFetched);
  const error = useSelector(selectAdminCustomerError);

  const [searchTerm, setSearchTerm] = useState(filters.searchQuery || "");
  const [showFilters, setShowFilters] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [ordersTarget, setOrdersTarget] = useState(null);
  const [cartTarget, setCartTarget] = useState(null);

  const observerRef = useRef();
  const isMounted = useRef(false);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => dispatch(clearAdminCustomerError()), 4000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (!fetched) dispatch(fetchAdminCustomers(filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    dispatch(fetchAdminCustomers(filters));
  }, [
    dispatch,
    filters.searchQuery,
    filters.statusFilter,
    filters.sortBy,
    filters.currentPage,
    filters.dateFrom,
    filters.dateTo,
  ]);

  useEffect(() => {
    const t = setTimeout(() => dispatch(setAdminSearchQuery(searchTerm)), 400);
    return () => clearTimeout(t);
  }, [searchTerm, dispatch]);

  const lastRowRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && pagination.hasNext)
          dispatch(setAdminCurrentPage(filters.currentPage + 1));
      });
      if (node) observerRef.current.observe(node);
    },
    [loading, loadingMore, pagination.hasNext, filters.currentPage, dispatch],
  );

  const handleConfirmed = async () => {
    if (!confirmTarget) return;
    await dispatch(
      updateCustomerStatus({
        publicId: confirmTarget.public_id,
        isActive: !confirmTarget.is_active,
      }),
    );
    setConfirmTarget(null);
  };
  const handleRefresh = () =>
    dispatch(fetchAdminCustomers({ ...filters, currentPage: 1 }));
  const handleReset = () => {
    setSearchTerm("");
    dispatch(resetAdminCustomerFilters());
  };
  const handleDateChange = (range) =>
    dispatch(setAdminCustomerDateRange(range));
  const handleDateClear = () => dispatch(clearAdminCustomerDateRange());

  const activeFilterCount =
    (filters.statusFilter !== "all" ? 1 : 0) +
    (filters.sortBy !== "newest" ? 1 : 0) +
    (filters.dateFrom || filters.dateTo ? 1 : 0) +
    (filters.searchQuery ? 1 : 0);

  const isFiltered = activeFilterCount > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-4 lg:p-8 transition-colors duration-300">
      {/* ── Error toast ── */}
      {error && (
        <div className="fixed top-5 right-5 z-40 pointer-events-none">
          <div className="flex items-center gap-3 px-4 py-3 bg-rose-600 text-white rounded-2xl shadow-xl text-sm font-bold pointer-events-auto">
            <AlertCircle size={16} /> {error}
          </div>
        </div>
      )}

      {/* ── Modals / Drawers ── */}
      {confirmTarget && (
        <ConfirmModal
          customer={confirmTarget}
          onConfirm={handleConfirmed}
          onClose={() => setConfirmTarget(null)}
        />
      )}
      <OrdersDrawer
        customer={ordersTarget}
        onClose={() => setOrdersTarget(null)}
      />
      <CartDrawer customer={cartTarget} onClose={() => setCartTarget(null)} />

      {/* ── Header — mirrors ReviewManagement header ── */}
      <header className="flex flex-col lg:flex-row justify-between mb-8 gap-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Customer Registry
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Manage and audit customer accounts
            {pagination.totalItems > 0 && (
              <span className="ml-2 text-violet-500 font-bold">
                · {pagination.totalItems} total
              </span>
            )}
          </p>
          {(filters.dateFrom || filters.dateTo) && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-wide">
              <CalendarRange size={10} />
              {filters.dateFrom || "…"} → {filters.dateTo || "…"}
              <button
                onClick={handleDateClear}
                className="ml-1 hover:text-rose-500 transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 lg:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              size={18}
            />
            <input
              className="w-full pl-12 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-white outline-none focus:ring-2 ring-violet-500/20 focus:border-violet-400 dark:focus:border-violet-500/50 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
              placeholder="Search name, email, phone…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isRefreshing && (
              <Loader2
                size={14}
                className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-violet-400"
              />
            )}
          </div>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`relative p-3 rounded-2xl border transition-all
              ${
                showFilters || activeFilterCount > 0
                  ? "bg-violet-50 dark:bg-violet-500/10 border-violet-300 dark:border-violet-600/50 text-violet-600 dark:text-violet-400"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/60"
              }`}
          >
            <SlidersHorizontal size={20} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-violet-600 text-white text-[9px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            onClick={handleRefresh}
            className="p-3 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw
              size={20}
              className={
                loading || isRefreshing ? "animate-spin text-violet-400" : ""
              }
            />
          </button>
        </div>
      </header>

      {/* ── Stats strip ── */}
      {customers.length > 0 && (
        <StatsStrip customers={customers} totalItems={pagination.totalItems} />
      )}

      {/* ── Filter Panel — mirrors ReviewManagement filter panel ── */}
      {showFilters && (
        <div className="mb-6 bg-white dark:bg-[#1e293b] rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-5">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">
              Account Status
            </p>
            <div className="flex gap-2 flex-wrap">
              {[
                ["all", "All"],
                ["active", "🟢 Active"],
                ["blocked", "🔴 Blocked"],
              ].map(([v, l]) => (
                <FilterPill
                  key={v}
                  label={l}
                  active={filters.statusFilter === v}
                  onClick={() => dispatch(setAdminStatusFilter(v))}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">
                Sort by
              </p>
              <div className="flex gap-2 flex-wrap">
                {[
                  ["newest", "Newest"],
                  ["oldest", "Oldest"],
                  ["email", "By Email"],
                  ["mobile", "By Phone"],
                ].map(([v, l]) => (
                  <FilterPill
                    key={v}
                    label={l}
                    active={filters.sortBy === v}
                    onClick={() => dispatch(setAdminSortBy(v))}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
            <DateRangePicker
              dateFrom={filters.dateFrom}
              dateTo={filters.dateTo}
              onChange={handleDateChange}
              onClear={handleDateClear}
            />
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 transition-colors"
            >
              <RotateCcw size={11} /> ✕ Clear all
            </button>
          )}
        </div>
      )}

      {/* ── Active filter chips — mirrors ReviewManagement ── */}
      {isFiltered && (
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
            Active:
          </span>
          {filters.statusFilter !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700/30 text-violet-600 dark:text-violet-400 text-[10px] font-black">
              {filters.statusFilter}{" "}
              <button onClick={() => dispatch(setAdminStatusFilter("all"))}>
                <X size={9} />
              </button>
            </span>
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black">
              <Calendar size={9} /> {filters.dateFrom || "…"} →{" "}
              {filters.dateTo || "…"}
              <button onClick={handleDateClear}>
                <X size={9} />
              </button>
            </span>
          )}
          {filters.sortBy !== "newest" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black">
              Sort: {filters.sortBy}{" "}
              <button onClick={() => dispatch(setAdminSortBy("newest"))}>
                <X size={9} />
              </button>
            </span>
          )}
          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black">
              "{filters.searchQuery}"{" "}
              <button
                onClick={() => {
                  setSearchTerm("");
                  dispatch(setAdminSearchQuery(""));
                }}
              >
                <X size={9} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* ── TABLE — mirrors ReviewManagement table exactly ── */}
      <div className="bg-white dark:bg-[#1e293b] rounded-[1.5rem] border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-sm">
        {/* Column header */}
        <div className="flex items-center gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-800/40">
          <div className="w-9 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
              Customer
            </span>
          </div>
          <div className="hidden lg:block w-28 flex-shrink-0 text-right">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
              Joined
            </span>
          </div>
          <div className="flex-shrink-0">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
              Status
            </span>
          </div>
          {/* Actions legend — small icon+label badges */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40 text-[9px] font-black text-violet-500 dark:text-violet-400 uppercase">
              <ShoppingBag size={9} /> Orders
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 text-[9px] font-black text-amber-500 dark:text-amber-400 uppercase">
              <ShoppingCart size={9} /> Cart
            </span>
          </div>
        </div>

        {/* Violet divider under header */}
        <div className="h-px w-full bg-violet-500/30" />

        {/* Body */}
        {loading ? (
          <div>
            {[...Array(6)].map((_, i) => (
              <RowSkeleton key={i} />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <EmptyState filtered={isFiltered} onReset={handleReset} />
        ) : (
          <div
            className={`transition-opacity duration-200 ${isRefreshing ? "opacity-50" : "opacity-100"}`}
          >
            {customers.map((customer, i) => (
              <div
                key={customer.public_id}
                ref={i === customers.length - 1 ? lastRowRef : null}
              >
                <CustomerRow
                  customer={customer}
                  onStatusAction={setConfirmTarget}
                  onViewOrders={setOrdersTarget}
                  onViewCart={setCartTarget}
                  isLast={i === customers.length - 1}
                />
              </div>
            ))}
          </div>
        )}

        {loadingMore && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <Loader2 className="animate-spin text-violet-400" size={18} />
              <span className="text-xs font-black uppercase text-slate-400 tracking-widest">
                Loading…
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {customers.length > 0 && (
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
          Showing{" "}
          <span className="font-bold text-slate-600 dark:text-slate-300">
            {customers.length}
          </span>{" "}
          of{" "}
          <span className="font-bold text-slate-600 dark:text-slate-300">
            {pagination.totalItems}
          </span>{" "}
          customers
        </p>
      )}
    </div>
  );
};

export default CustomerManagement;
