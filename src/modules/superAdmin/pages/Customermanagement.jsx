import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchSuperAdminCustomers,
  updateCustomerStatus,
  setCustomerSearch,
  setCustomerFilter,
  setCustomerPage,
  resetCustomerFilters,
  clearCustomerMessages,
  selectSuperAdminCustomers,
  selectSuperAdminCustomersLoading,
  selectSuperAdminCustomersRefreshing,
  selectSuperAdminCustomersLoadingMore,
  selectSuperAdminCustomerFilters,
  selectSuperAdminCustomerPagination,
  selectSuperAdminCustomerSuccess,
  selectSuperAdminCustomerError,
  selectSuperAdminCustomersFetched
} from "../../../store/slices/superAdmin/superAdminCustomerSlice";
import {
  Search, RefreshCw, X, Users,
  CheckCircle2, Loader2, AlertCircle,
  ToggleLeft, ToggleRight, AlertTriangle,
  Calendar, SlidersHorizontal, Eye,
  Phone, Mail, Hash,
} from "lucide-react";

/* ══════════════════════════════════════════
   STYLE TOKEN  (matches the dashboard system)
══════════════════════════════════════════ */
const panel = `bg-white dark:bg-[#0c1a2e] border border-slate-200/70 dark:border-[#2a2440] rounded-2xl`;

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
const fmt = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";

const initials = (name = "") =>
  name.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

/* consistent avatar color per public_id */
const AVATAR_COLORS = [
  "bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400",
  "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400",
  "bg-teal-100 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400",
  "bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400",
  "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400",
];
const avatarColor = (id = "") =>
  AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];

/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */
function Toast({ message, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-2xl border backdrop-blur-sm
      ${type === "success"
        ? "bg-white/95 dark:bg-[#0c1a2e]/95 border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-300"
        : "bg-white/95 dark:bg-[#0c1a2e]/95 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300"}`}>
      {type === "success" ? <CheckCircle2 size={17} className="flex-shrink-0" /> : <AlertCircle size={17} className="flex-shrink-0" />}
      <span>{message}</span>
    </div>
  );
}

/* ══════════════════════════════════════════
   CONFIRM DIALOG
══════════════════════════════════════════ */
function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onCancel, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px]" onClick={onCancel} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className={`relative w-full max-w-sm ${panel} p-7 text-center shadow-2xl`}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4
          ${danger
            ? "bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20"
            : "bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20"}`}>
          <AlertTriangle size={22} className={danger ? "text-rose-500" : "text-orange-500"} />
        </div>
        <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">{description}</p>
        <div className="flex gap-2.5">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-[#2a2440] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#0f2035] transition-all">
            Cancel
          </button>
          <button onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all
              ${danger
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20"
                : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25"}`}>
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════
   CUSTOMER DETAIL DRAWER
══════════════════════════════════════════ */
function CustomerDetailDrawer({ customer, onClose, onToggle, toggling }) {
  if (!customer) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 60, opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative w-full max-w-sm h-full flex flex-col bg-white dark:bg-[#0c1a2e] border-l border-slate-200 dark:border-[#2a2440] shadow-2xl"
      >
        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-[#1e1a2e] flex-shrink-0">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500 dark:text-orange-400 mb-0.5">Customer Profile</p>
            <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">Details</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e1a2e] transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {/* Avatar + name */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black ${avatarColor(customer.public_id)}`}>
              {initials(customer.first_name)}
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{customer.first_name}</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider mt-1.5
                ${customer.is_active
                  ? "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 ring-1 ring-teal-200 dark:ring-teal-500/20"
                  : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700/50"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${customer.is_active ? "bg-teal-500 animate-pulse" : "bg-slate-400"}`} />
                {customer.is_active ? "Active" : "Blocked"}
              </span>
            </div>
          </div>

          {/* Info grid */}
          <div className="space-y-2.5">
            {[
              { icon: Hash,    label: "Public ID",    value: customer.public_id,     mono: true  },
              { icon: Mail,    label: "Email",        value: customer.email,         mono: false },
              { icon: Phone,   label: "Mobile",       value: customer.mobile_number, mono: true  },
              { icon: Calendar,label: "Joined",       value: `${fmt(customer.created_at)} · ${fmtTime(customer.created_at)}`, mono: false },
              { icon: Calendar,label: "Last Updated", value: `${fmt(customer.updated_at)} · ${fmtTime(customer.updated_at)}`, mono: false },
            ].map(({ icon: Icon, label, value, mono }) => (
              <div key={label} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0f2035] border border-slate-100 dark:border-[#2a2440]">
                <Icon size={13} className="text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
                  <p className={`text-xs font-semibold text-slate-700 dark:text-slate-200 break-all leading-snug ${mono ? "font-mono" : ""}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer action */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-[#1e1a2e] bg-slate-50/60 dark:bg-[#0f0d19]/60 flex-shrink-0">
          <button
            onClick={() => onToggle(customer)}
            disabled={toggling}
            className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
              ${customer.is_active
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20"
                : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25"}`}
          >
            {toggling ? <Loader2 size={15} className="animate-spin" /> : null}
            {customer.is_active ? "Block Customer" : "Unblock Customer"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════
   CUSTOMER TABLE ROW
══════════════════════════════════════════ */
function CustomerRow({ customer, onView, onToggle, toggling }) {
  return (
    <tr className={`group border-b border-slate-100 dark:border-[#1e1a2e] transition-colors
      hover:bg-orange-50/40 dark:hover:bg-orange-500/5 ${!customer.is_active ? "opacity-60" : ""}`}>

      {/* Name + avatar */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black ${avatarColor(customer.public_id)}`}>
            {initials(customer.first_name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-[140px]">{customer.first_name}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{customer.public_id}</p>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-5 py-3.5">
        <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{customer.email}</p>
      </td>

      {/* Phone */}
      <td className="px-5 py-3.5">
        <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{customer.mobile_number}</span>
      </td>

      {/* Joined */}
      <td className="px-5 py-3.5">
        <p className="text-xs text-slate-500 dark:text-slate-400">{fmt(customer.created_at)}</p>
        <p className="text-[10px] text-slate-400 dark:text-slate-600">{fmtTime(customer.created_at)}</p>
      </td>

      {/* Status */}
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider
          ${customer.is_active
            ? "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 ring-1 ring-teal-200 dark:ring-teal-500/20"
            : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700/50"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${customer.is_active ? "bg-teal-500 animate-pulse" : "bg-slate-400"}`} />
          {customer.is_active ? "Active" : "Blocked"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* View */}
          <button
            onClick={() => onView(customer)}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
            title="View details"
          >
            <Eye size={14} />
          </button>
          {/* Toggle */}
          <button
            onClick={() => onToggle(customer)}
            disabled={toggling === customer.public_id}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 transition-all disabled:opacity-40
              hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/10"
            title={customer.is_active ? "Block" : "Unblock"}
          >
            {toggling === customer.public_id
              ? <Loader2 size={16} className="animate-spin" />
              : customer.is_active
                ? <ToggleRight size={18} className="text-teal-500" />
                : <ToggleLeft  size={18} className="text-slate-300 dark:text-slate-600" />}
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ══════════════════════════════════════════
   SKELETON
══════════════════════════════════════════ */
function SkeletonRows() {
  return (
    <>
      <style>{`
        @keyframes cm-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .cm-shim{background:linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%);background-size:200% 100%;animation:cm-shimmer 1.4s ease-in-out infinite;border-radius:5px}
        .dark .cm-shim{background:linear-gradient(90deg,#0c1a2e 25%,#112540 50%,#0c1a2e 75%);background-size:200% 100%;animation:cm-shimmer 1.4s ease-in-out infinite;border-radius:5px}
      `}</style>
      {[...Array(8)].map((_, i) => (
        <tr key={i} className="border-b border-slate-100 dark:border-[#1e1a2e]">
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="cm-shim w-8 h-8 rounded-xl flex-shrink-0" />
              <div className="space-y-1.5">
                <div className="cm-shim h-3 w-28" />
                <div className="cm-shim h-2.5 w-20" />
              </div>
            </div>
          </td>
          <td className="px-5 py-3.5"><div className="cm-shim h-3 w-40" /></td>
          <td className="px-5 py-3.5"><div className="cm-shim h-3 w-28" /></td>
          <td className="px-5 py-3.5"><div className="cm-shim h-3 w-20" /></td>
          <td className="px-5 py-3.5"><div className="cm-shim h-5 w-16 rounded-lg" /></td>
          <td className="px-4 py-3.5"><div className="cm-shim h-5 w-12 rounded-lg" /></td>
        </tr>
      ))}
    </>
  );
}

/* ══════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════ */
function StatCard({ label, value, icon: Icon, colorCls }) {
  return (
    <div className={`${panel} p-5 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none transition-shadow`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colorCls}`}><Icon size={16} /></div>
      <p className="text-[26px] font-black text-slate-900 dark:text-white leading-none mb-1">{value}</p>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{label}</p>
    </div>
  );
}

/* ══════════════════════════════════════════
   DATE RANGE FILTER PANEL
══════════════════════════════════════════ */
function FilterPanel({ filters, dispatch, onReset }) {
  const today = new Date().toISOString().split("T")[0];
  const hasDate = filters.startDate || filters.endDate;
  const hasAny  = filters.isActive !== null || hasDate || filters.sortBy !== "newest";

  return (
    <div className={`${panel} mb-5 overflow-hidden shadow-sm dark:shadow-none`}>
      <div className="h-0.5 w-full bg-gradient-to-r from-orange-500 to-red-500" />
      <div className="p-5 space-y-5">

        {/* Row 1: Status + Sort */}
        <div className="flex flex-wrap gap-6">
          {/* Status */}
          <div className="flex-1 min-w-[160px]">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-2.5">Status</p>
            <div className="flex flex-wrap gap-2">
              {[["all", "All"], ["true", "Active"], ["false", "Blocked"]].map(([v, l]) => (
                <button key={v}
                  onClick={() => dispatch(setCustomerFilter({ isActive: v === "all" ? null : v === "true" }))}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap
                    ${(v === "all" ? filters.isActive === null : String(filters.isActive) === v)
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm shadow-orange-500/25"
                      : "bg-white dark:bg-[#0f2035] border border-slate-200 dark:border-[#2a2440] text-slate-500 dark:text-slate-400 hover:border-orange-300 dark:hover:border-orange-500/40 hover:text-orange-600 dark:hover:text-orange-400"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="flex-1 min-w-[200px]">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-2.5">Sort By</p>
            <div className="flex flex-wrap gap-2">
              {[["newest", "Newest"], ["oldest", "Oldest"], ["emailAsc", "Email A–Z"], ["emailDesc", "Email Z–A"]].map(([v, l]) => (
                <button key={v}
                  onClick={() => dispatch(setCustomerFilter({ sortBy: v }))}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap
                    ${filters.sortBy === v
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm shadow-orange-500/25"
                      : "bg-white dark:bg-[#0f2035] border border-slate-200 dark:border-[#2a2440] text-slate-500 dark:text-slate-400 hover:border-orange-300 dark:hover:border-orange-500/40 hover:text-orange-600 dark:hover:text-orange-400"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-[#1e1a2e]" />

        {/* Row 2: Date range */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-3">Date Joined</p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Calendar size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input type="date" value={filters.startDate || ""}
                max={filters.endDate || today}
                onChange={e => dispatch(setCustomerFilter({ startDate: e.target.value || null }))}
                className="pl-8 pr-3 py-1.5 rounded-lg text-[11px] font-semibold outline-none cursor-pointer
                  bg-white dark:bg-[#0f2035] border border-slate-200 dark:border-[#2a2440]
                  text-slate-700 dark:text-slate-300
                  focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 dark:focus:border-orange-500/60 transition-all"
              />
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">to</span>
            <div className="relative">
              <Calendar size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input type="date" value={filters.endDate || ""}
                min={filters.startDate || undefined} max={today}
                onChange={e => dispatch(setCustomerFilter({ endDate: e.target.value || null }))}
                className="pl-8 pr-3 py-1.5 rounded-lg text-[11px] font-semibold outline-none cursor-pointer
                  bg-white dark:bg-[#0f2035] border border-slate-200 dark:border-[#2a2440]
                  text-slate-700 dark:text-slate-300
                  focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 dark:focus:border-orange-500/60 transition-all"
              />
            </div>
            {hasDate && (
              <button
                onClick={() => dispatch(setCustomerFilter({ startDate: null, endDate: null }))}
                className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-600 transition-colors">
                <X size={10} /> Clear dates
              </button>
            )}
          </div>
          {(filters.startDate || filters.endDate) && (
            <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
              <Calendar size={10} className="text-orange-500 dark:text-orange-400" />
              <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 font-mono">
                {filters.startDate ? `from ${filters.startDate}` : ""}
                {filters.startDate && filters.endDate ? " · " : ""}
                {filters.endDate ? `to ${filters.endDate}` : ""}
              </span>
            </div>
          )}
        </div>

        {/* Clear all */}
        {hasAny && (
          <div className="pt-1 border-t border-slate-100 dark:border-[#1e1a2e]">
            <button onClick={onReset}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-rose-500 hover:text-rose-600 transition-colors">
              <X size={10} /> Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function CustomerManagement() {
  const dispatch    = useAppDispatch();
  const customers   = useAppSelector(selectSuperAdminCustomers);
  const loading     = useAppSelector(selectSuperAdminCustomersLoading);
  const refreshing  = useAppSelector(selectSuperAdminCustomersRefreshing);
  const loadingMore = useAppSelector(selectSuperAdminCustomersLoadingMore);
  const filters     = useAppSelector(selectSuperAdminCustomerFilters);
  const pagination  = useAppSelector(selectSuperAdminCustomerPagination);
  const success     = useAppSelector(selectSuperAdminCustomerSuccess);
  const error       = useAppSelector(selectSuperAdminCustomerError);
  const feched      = useAppSelector(selectSuperAdminCustomersFetched)

  const [search, setSearch]         = useState(filters.searchQuery ?? "");
  const [toast, setToast]           = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewing, setViewing]       = useState(null);
  const [confirm, setConfirm]       = useState(null);
  const [toggling, setToggling]     = useState(null); // public_id of toggling customer

  const mountedRef    = useRef(false);
  const prevFilterKey = useRef(null);
  const lastRowRef    = useRef(null);

  /* ── Initial fetch ── */
  useEffect(() => {
    if(!feched){
 dispatch(fetchSuperAdminCustomers(filters));
    }
   
  }, []); // eslint-disable-line

  /* ── Refetch on filter changes ── */
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevFilterKey.current = JSON.stringify({
        q: filters.searchQuery, active: filters.isActive,
        sort: filters.sortBy, page: filters.currentPage,
        start: filters.startDate, end: filters.endDate,
      });
      return;
    }
    const key = JSON.stringify({
      q: filters.searchQuery, active: filters.isActive,
      sort: filters.sortBy, page: filters.currentPage,
      start: filters.startDate, end: filters.endDate,
    });
    if (key === prevFilterKey.current) return;
    prevFilterKey.current = key;
    dispatch(fetchSuperAdminCustomers(filters));
  }, [filters.searchQuery, filters.isActive, filters.sortBy, filters.currentPage, filters.startDate, filters.endDate]); // eslint-disable-line

  /* ── Search debounce ── */
  useEffect(() => {
    const t = setTimeout(() => dispatch(setCustomerSearch(search)), 380);
    return () => clearTimeout(t);
  }, [search, dispatch]);

  /* ── Infinite scroll ── */
  useEffect(() => {
    if (!lastRowRef.current) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination.hasNext && !loadingMore) {
        dispatch(setCustomerPage(filters.currentPage + 1));
      }
    }, { threshold: 0.5 });
    obs.observe(lastRowRef.current);
    return () => obs.disconnect();
  }, [customers, pagination.hasNext, loadingMore, filters.currentPage, dispatch]);

  /* ── Toast ── */
  useEffect(() => {
    if (success) { setToast({ msg: success, type: "success" }); dispatch(clearCustomerMessages()); }
    if (error)   { setToast({ msg: error,   type: "error"   }); dispatch(clearCustomerMessages()); }
  }, [success, error, dispatch]);

  /* ── Toggle customer status ── */
  const handleToggle = useCallback((customer) => {
    setConfirm({
      customer,
      title:        customer.is_active ? "Block Customer" : "Unblock Customer",
      description:  `${customer.is_active ? "Block" : "Unblock"} ${customer.first_name} (${customer.email})?`,
      confirmLabel: customer.is_active ? "Block" : "Unblock",
      danger:       customer.is_active,
    });
  }, []);

  const doToggle = useCallback(async () => {
    if (!confirm) return;
    const { customer } = confirm;
    setConfirm(null);
    setToggling(customer.public_id);
    // Close drawer if viewing this customer
    if (viewing?.public_id === customer.public_id) setViewing(null);
    await dispatch(updateCustomerStatus({ userId: customer.public_id, is_active: !customer.is_active }));
    setToggling(null);
  }, [confirm, viewing, dispatch]);

  /* ── Active filter count for badge ── */
  const activeFilterCount =
    (filters.isActive !== null ? 1 : 0) +
    (filters.startDate || filters.endDate ? 1 : 0) +
    (filters.sortBy !== "newest" ? 1 : 0);

  /* ── Stats ── */
  const totalActive  = customers.filter(c => c.is_active).length;
  const totalBlocked = customers.filter(c => !c.is_active).length;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 dark:bg-[#07101f] transition-colors duration-300">

      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        description={confirm?.description}
        confirmLabel={confirm?.confirmLabel}
        danger={confirm?.danger}
        onConfirm={doToggle}
        onCancel={() => setConfirm(null)}
      />

      <AnimatePresence>
        {viewing && (
          <CustomerDetailDrawer
            key="drawer"
            customer={customers.find(c => c.public_id === viewing.public_id) ?? viewing}
            onClose={() => setViewing(null)}
            onToggle={handleToggle}
            toggling={toggling === viewing.public_id}
          />
        )}
      </AnimatePresence>

      <div className="p-5 lg:p-7 max-w-[1400px]">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 mb-6 min-w-0">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-orange-500 dark:text-orange-400 mb-1">
              Super Admin · Management
            </p>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Restaurant Customers
              {pagination.totalItems > 0 && (
                <span className="ml-3 text-sm font-medium text-slate-400 dark:text-slate-500 tracking-normal">
                  {pagination.totalItems} restaurants
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard label="Total"   value={pagination.totalItems || customers.length} icon={Users}        colorCls="bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-500/20" />
          <StatCard label="Loaded"  value={customers.length}                          icon={Users}        colorCls="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-500/20"           />
          <StatCard label="Active"  value={totalActive}                               icon={CheckCircle2} colorCls="bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 ring-1 ring-teal-200 dark:ring-teal-500/20"           />
          <StatCard label="Blocked" value={totalBlocked}                              icon={X}            colorCls="bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 ring-1 ring-rose-200 dark:ring-rose-500/20"           />
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-2 mb-5">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, phone or ID…"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm outline-none
                bg-white dark:bg-[#0c1a2e] border border-slate-200/70 dark:border-[#2a2440]
                text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500
                focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 dark:focus:border-orange-500/50
                shadow-sm dark:shadow-none transition-all"
            />
            {refreshing
              ? <Loader2 size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-orange-500" />
              : search && (
                  <button onClick={() => setSearch("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 transition-colors">
                    <X size={13} />
                  </button>
                )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`relative p-2.5 rounded-xl border flex-shrink-0 transition-all shadow-sm dark:shadow-none
              ${showFilters || activeFilterCount > 0
                ? "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-400"
                : "bg-white dark:bg-[#0c1a2e] border-slate-200/70 dark:border-[#2a2440] text-slate-400 hover:text-orange-500 dark:hover:text-orange-400"}`}
          >
            <SlidersHorizontal size={16} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-[8px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Refresh */}
          <button
            onClick={() => dispatch(fetchSuperAdminCustomers({ ...filters, currentPage: 1 }))}
            disabled={refreshing}
            className="p-2.5 rounded-xl flex-shrink-0 bg-white dark:bg-[#0c1a2e] border border-slate-200/70 dark:border-[#2a2440]
              text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 shadow-sm dark:shadow-none transition-all">
            <RefreshCw size={16} className={refreshing ? "animate-spin text-orange-500 dark:text-orange-400" : ""} />
          </button>
        </div>

        {/* ── Filter panel ── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <FilterPanel
                filters={filters}
                dispatch={dispatch}
                onReset={() => { dispatch(resetCustomerFilters()); setSearch(""); }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Table ── */}
        {loading && !loadingMore ? (
          <div className={`${panel} overflow-hidden shadow-sm dark:shadow-none`}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[#1e1a2e] bg-slate-50/50 dark:bg-[#0f0d19]/40">
                  {["Customer", "Email", "Phone", "Joined", "Status", ""].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody><SkeletonRows /></tbody>
            </table>
          </div>
        ) : customers.length === 0 ? (
          <div className={`${panel} flex flex-col items-center justify-center py-20 shadow-sm dark:shadow-none`}>
            <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center mb-4">
              <Users size={28} className="text-orange-400 dark:text-orange-500" />
            </div>
            <p className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">No customers found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className={`${panel} overflow-hidden shadow-sm dark:shadow-none`}>
            {/* Table sub-header */}
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-[#1e1a2e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-slate-800 dark:text-slate-100">All Customers</p>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">· {customers.length} loaded</span>
              </div>
              {refreshing && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-orange-500 dark:text-orange-400">
                  <Loader2 size={12} className="animate-spin" /> Syncing
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[#1e1a2e] bg-slate-50/50 dark:bg-[#0f0d19]/40">
                    {["Customer", "Email", "Phone", "Joined", "Status", ""].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, i) => (
                    <React.Fragment key={customer.public_id}>
                      <CustomerRow
                        customer={customer}
                        onView={setViewing}
                        onToggle={handleToggle}
                        toggling={toggling}
                      />
                      {/* Infinite scroll sentinel */}
                      {i === customers.length - 1 && (
                        <tr ref={lastRowRef}><td colSpan={6} className="p-0" /></tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Load more indicator */}
            {loadingMore && (
              <div className="flex justify-center py-5 border-t border-slate-100 dark:border-[#1e1a2e]">
                <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white dark:bg-[#0c1a2e] border border-slate-200/70 dark:border-[#2a2440] shadow-sm">
                  <Loader2 size={14} className="animate-spin text-orange-500 dark:text-orange-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Loading more</span>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}