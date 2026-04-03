import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminEmployees,
  createAdminEmployee,
  updateAdminEmployee,
  deleteAdminEmployee,
  setEmployeeSearch,
  setEmployeeRoleFilter,
  setEmployeeActiveFilter,
  setEmployeeSortBy,
  setEmployeeCurrentPage,
  resetEmployeeFilters,
  clearEmployeeMessages,
  selectAdminEmployees,
  selectEmployeeFilters,
  selectEmployeePagination,
  selectEmployeeLoading,
  selectEmployeeRefreshing,
  selectEmployeeLoadingMore,
  selectEmployeeError,
  selectEmployeeSuccess,
  selectEmployeeFetched,
  selectEmployeeMutating,
} from "../../../store/slices/restaurantAdminSlice/adminEmployeeslice";
import {
  Search, Plus, Loader2, X, Save, SlidersHorizontal,
  CheckCircle2, AlertCircle, Pencil, Trash2, Mail, Phone,
  Eye, EyeOff, RefreshCw, ToggleLeft, ToggleRight, User,
  UserCheck, UserX, Hash, Calendar, Clock, Shield, ChevronDown,
  AtSign, Smartphone, BadgeCheck, RotateCcw,
} from "lucide-react";

/* ================================================================
   CONSTANTS
================================================================ */
const ROLES = [
  { value: "waiter",           label: "Waiter",        emoji: "🍽️", color: "from-blue-500 to-cyan-600",     pill: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700/40",    dot: "bg-blue-500"   },
  { value: "kitchen-staff",    label: "Kitchen Staff", emoji: "👨‍🍳", color: "from-amber-500 to-orange-600",  pill: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700/40", dot: "bg-amber-500"  },
  { value: "restaurant-admin", label: "Admin",         emoji: "📋", color: "from-violet-500 to-purple-600", pill: "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-700/40", dot: "bg-violet-500" },
];

const getRoleInfo = (role) =>
  ROLES.find((r) => r.value === role) ?? {
    value: role, label: role, emoji: "👤",
    color: "from-slate-500 to-slate-600",
    pill: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    dot: "bg-slate-400",
  };

const SORT_OPTS = [
  ["newest", "Newest"],
  ["oldest", "Oldest"],
  ["nameAZ", "Name A→Z"],
  ["nameZA", "Name Z→A"],
  ["emailAZ", "Email A→Z"],
];

/* ================================================================
   HELPERS
================================================================ */
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
const timeAgo = (iso) => {
  if (!iso) return "";
  const d = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (d < 60)     return "just now";
  if (d < 3600)   return `${Math.floor(d / 60)}m ago`;
  if (d < 86400)  return `${Math.floor(d / 3600)}h ago`;
  if (d < 604800) return `${Math.floor(d / 86400)}d ago`;
  return fmtDate(iso);
};
const wasEdited = (e) => e.updated_at && e.updated_at !== e.created_at;

/* ================================================================
   FILTER PILL
================================================================ */
const FilterPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap
      ${active
        ? "bg-violet-600 text-white border-violet-600"
        : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-violet-400 dark:hover:border-violet-600 bg-white dark:bg-slate-800/60"
      }`}
  >
    {label}
  </button>
);

/* ================================================================
   AVATAR
================================================================ */
const Avatar = ({ employee }) => {
  const roleInfo = getRoleInfo(employee.role);
  const initials = (employee.first_name || "?")[0].toUpperCase();
  return (
    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${roleInfo.color} flex items-center justify-center font-black text-white text-base shadow-md flex-shrink-0`}>
      {initials}
    </div>
  );
};

/* ================================================================
   ROW SKELETON
================================================================ */
const RowSkeleton = () => (
  <>
    <div className="animate-pulse flex items-center gap-4 px-5 py-4">
      <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <div className="h-3.5 w-32 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="h-3.5 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="flex gap-2">
          <div className="h-2.5 w-40 bg-slate-100 dark:bg-slate-800 rounded-full" />
          <div className="h-2.5 w-28 bg-slate-100 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="flex gap-2">
          <div className="h-2.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full" />
        </div>
      </div>
      <div className="hidden lg:block space-y-1.5 w-40">
        <div className="h-2.5 w-28 bg-slate-100 dark:bg-slate-800 rounded-full ml-auto" />
        <div className="h-2.5 w-20 bg-slate-100 dark:bg-slate-800 rounded-full ml-auto" />
        <div className="h-2.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full ml-auto" />
      </div>
      <div className="h-7 w-20 bg-slate-200 dark:bg-slate-700 rounded-xl flex-shrink-0" />
      <div className="flex gap-1.5">
        <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
    <div className="h-px w-full bg-violet-500/15" />
  </>
);

/* ================================================================
   EMPLOYEE ROW — flat list, all API fields
================================================================ */
const EmployeeRow = React.forwardRef(({ employee, onEdit, isLast }, ref) => {
  const dispatch   = useDispatch();
  const mutating   = useSelector(selectEmployeeMutating);
  const busy       = !!mutating[employee.public_id];
  const roleInfo   = getRoleInfo(employee.role);
  const edited     = wasEdited(employee);

  const [confirming, setConfirming] = useState(false);
  const [toggling,   setToggling]   = useState(false);
  const [expanded,   setExpanded]   = useState(false);

  const handleToggleActive = async () => {
    setToggling(true);
    await dispatch(updateAdminEmployee({ publicId: employee.public_id, data: { is_active: !employee.is_active } }));
    setToggling(false);
  };

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return; }
    await dispatch(deleteAdminEmployee(employee.public_id));
    setConfirming(false);
  };

  return (
    <div ref={ref} className="group">
      {/* ── Main row ── */}
      <div className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors duration-150 ${(busy || toggling) ? "opacity-50" : ""} ${!employee.is_active ? "opacity-60" : ""}`}>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar employee={employee} />
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#1e293b]
            ${employee.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
        </div>

        {/* Core info — flex-1 */}
        <div className="flex-1 min-w-0">
          {/* Line 1 — name + public_id chip + is_staff badge */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-bold text-slate-900 dark:text-white leading-none">
              {employee.first_name || "—"}
            </span>
            <span className="text-[9px] font-mono text-slate-500 dark:text-slate-600 bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600/50 leading-none">
              {employee.public_id}
            </span>
            {employee.is_staff && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-700/30 leading-none">
                <Shield size={8} /> Staff
              </span>
            )}
          </div>

          {/* Line 2 — username + email + phone */}
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
              <AtSign size={9} className="flex-shrink-0 text-violet-400" />
              <span className="font-mono text-[10px]">{employee.username}</span>
            </div>
            {employee.email && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <Mail size={9} className="flex-shrink-0 text-slate-400" />
                <span className="truncate max-w-[180px]">{employee.email}</span>
              </div>
            )}
            {employee.mobile_number && (
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                <Smartphone size={9} className="flex-shrink-0" />
                {employee.mobile_number}
              </div>
            )}
          </div>

          {/* Line 3 — role pill */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${roleInfo.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${roleInfo.dot}`} />
              {roleInfo.emoji} {roleInfo.label}
            </span>
          </div>
        </div>

        {/* ── Timestamps column (lg+) — same as TableManagement ── */}
        <div className="hidden lg:flex flex-col items-end flex-shrink-0 w-44 gap-0.5">
          <p className="text-[9px] font-black uppercase text-slate-300 dark:text-slate-600 tracking-wider">Joined</p>
          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-none">{fmtDate(employee.created_at)}</p>
          <p className="text-[10px] text-slate-400 leading-none">{fmtTime(employee.created_at)}</p>
          <p className="text-[9px] text-slate-300 dark:text-slate-600 leading-none">{timeAgo(employee.created_at)}</p>
          {edited && (
            <>
              <div className="w-full border-t border-dashed border-slate-100 dark:border-slate-700/40 my-1" />
              <p className="text-[9px] font-black uppercase text-amber-400/70 tracking-wider">Updated</p>
              <p className="text-[11px] font-semibold text-amber-500 leading-none">{fmtDate(employee.updated_at)}</p>
              <p className="text-[10px] text-amber-400 leading-none">{fmtTime(employee.updated_at)}</p>
              <p className="text-[9px] text-amber-400/60 leading-none">{timeAgo(employee.updated_at)}</p>
            </>
          )}
        </div>

        {/* Status badge — active/inactive */}
        <div className="flex-shrink-0">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border
            ${employee.is_active
              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/40"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${employee.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            {employee.is_active ? "Active" : "Inactive"}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Toggle active */}
          <button
            onClick={handleToggleActive}
            disabled={toggling || busy}
            title={employee.is_active ? "Deactivate" : "Activate"}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all
              ${employee.is_active
                ? "border-emerald-200 dark:border-emerald-700/40 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
          >
            {toggling
              ? <Loader2 size={12} className="animate-spin" />
              : employee.is_active ? <UserCheck size={12} /> : <UserX size={12} />
            }
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(employee)}
            title="Edit"
            className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-violet-600 hover:border-violet-300 flex items-center justify-center transition-all"
          >
            <Pencil size={13} />
          </button>

          {/* Delete */}
          {confirming ? (
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold text-rose-500">Sure?</span>
              <button
                onClick={handleDelete}
                disabled={busy}
                className="h-8 px-2 rounded-xl bg-rose-500 text-white text-[9px] font-black hover:bg-rose-600 flex items-center gap-1"
              >
                {busy && <Loader2 size={9} className="animate-spin" />}Yes
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="h-8 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-black"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={handleDelete}
              title="Delete"
              className="w-8 h-8 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-1 px-5 py-1 text-[9px] font-black uppercase text-slate-300 dark:text-slate-700 hover:text-violet-400 transition-colors"
      >
        <ChevronDown size={10} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
        {expanded ? "Less" : "Full details"}
      </button>

      {/* ── Expanded detail panel — all API fields ── */}
      {expanded && (
        <div className="mx-5 mb-3 rounded-2xl border border-slate-100 dark:border-slate-700/40 bg-slate-50 dark:bg-slate-800/30 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-700/40">

            {/* Col 1 — Identifiers */}
            <div className="px-4 py-3 space-y-2">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-2">Identifiers</p>
              {[
                { label: "Public ID",  value: employee.public_id      },
                { label: "Username",   value: employee.username        },
                { label: "Email",      value: employee.email           },
                { label: "Mobile",     value: employee.mobile_number   },
                { label: "Role",       value: employee.role            },
                { label: "Is Staff",   value: employee.is_staff ? "Yes" : "No" },
                { label: "Is Active",  value: employee.is_active ? "Active" : "Inactive" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-baseline gap-2">
                  <p className="text-[9px] font-black uppercase text-slate-400 flex-shrink-0">{label}</p>
                  <p className="text-[10px] font-mono text-slate-600 dark:text-slate-300 text-right truncate">{value || "—"}</p>
                </div>
              ))}
            </div>

            {/* Col 2 — Timestamps */}
            <div className="px-4 py-3 space-y-3">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Timestamps</p>
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 mb-0.5 flex items-center gap-1">
                  <Calendar size={8} /> Created / Joined
                </p>
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{fmtDate(employee.created_at)}</p>
                <p className="text-[10px] font-mono text-slate-400">{fmtTime(employee.created_at)}</p>
                <p className="text-[9px] text-slate-300 dark:text-slate-600">{timeAgo(employee.created_at)}</p>
              </div>
              <div>
                <p className={`text-[9px] font-black uppercase mb-0.5 flex items-center gap-1 ${edited ? "text-amber-400" : "text-slate-400"}`}>
                  <Clock size={8} /> Last Updated
                </p>
                {edited ? (
                  <>
                    <p className="text-[11px] font-semibold text-amber-500">{fmtDate(employee.updated_at)}</p>
                    <p className="text-[10px] font-mono text-amber-400">{fmtTime(employee.updated_at)}</p>
                    <p className="text-[9px] text-amber-400/60">{timeAgo(employee.updated_at)}</p>
                  </>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">Never modified</p>
                )}
              </div>
            </div>

            {/* Col 3 — Role & Access */}
            <div className="px-4 py-3 space-y-3">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Role & Access</p>
              {/* Role card */}
              <div className={`p-3 rounded-xl bg-gradient-to-br ${getRoleInfo(employee.role).color} text-white`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{getRoleInfo(employee.role).emoji}</span>
                  <div>
                    <p className="text-xs font-black leading-none">{getRoleInfo(employee.role).label}</p>
                    <p className="text-[9px] font-mono opacity-70 mt-0.5">{employee.role}</p>
                  </div>
                </div>
              </div>
              {/* Access flags */}
              <div className="space-y-1.5">
                {[
                  { label: "Staff Access",  value: employee.is_staff,  on: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/30", off: "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700" },
                  { label: "Active Account", value: employee.is_active, on: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/30", off: "bg-rose-50 dark:bg-rose-900/20 text-rose-500 border-rose-200 dark:border-rose-700/30" },
                ].map(({ label, value, on, off }) => (
                  <div key={label} className={`flex items-center justify-between px-3 py-2 rounded-xl border text-[10px] font-black uppercase ${value ? on : off}`}>
                    <span>{label}</span>
                    <span>{value ? "Yes" : "No"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!isLast && <div className="h-px w-full bg-violet-500/15" />}
    </div>
  );
});
EmployeeRow.displayName = "EmployeeRow";

/* ================================================================
   EMPLOYEE FORM MODAL — unchanged logic, restyled to match system
================================================================ */
const EMPTY_FORM = {
  first_name: "", email: "", phone_number: "", role: "waiter", password: "", is_active: true,
};

const EmployeeFormModal = ({ initial = null, onClose }) => {
  const dispatch = useDispatch();
  const isEdit   = !!initial;

  const [form, setFormState] = useState({
    ...EMPTY_FORM,
    ...(initial ? {
      first_name: initial.first_name,
      email: initial.email || "",
      phone_number: initial.mobile_number || "",
      role: initial.role,
      is_active: initial.is_active,
    } : {}),
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]    = useState({});
  const [showPwd,    setShowPwd]   = useState(false);

  const set = (k, v) => { setFormState((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.first_name.trim())                            e.first_name   = "Name is required";
    if (!form.email.trim())                                 e.email        = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))             e.email        = "Enter a valid email";
    if (!form.phone_number.trim())                          e.phone_number = "Phone is required";
    if (!isEdit && !form.password)                         e.password     = "Password required for new employees";
    if (form.password && form.password.length < 6)         e.password     = "Min 6 characters";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const result = isEdit
        ? await dispatch(updateAdminEmployee({ publicId: initial.public_id, data: form }))
        : await dispatch(createAdminEmployee(form));
      if (!result.error) { onClose(); }
      else {
        const apiErr = result.payload;
        if (typeof apiErr === "object") {
          const fieldErrors = {};
          Object.entries(apiErr).forEach(([k, v]) => {
            const fk = k === "mobile_number" ? "phone_number" : k;
            fieldErrors[fk] = Array.isArray(v) ? v[0] : v;
          });
          setErrors(fieldErrors);
        }
      }
    } finally { setSubmitting(false); }
  };

  const inputCls = (err) =>
    `w-full px-4 py-3 rounded-2xl border text-sm bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 ring-violet-500/20 transition-all
     ${err ? "border-rose-400 focus:ring-rose-500/20" : "border-slate-200 dark:border-slate-700 focus:border-violet-400"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative z-10 w-full sm:max-w-lg bg-white dark:bg-[#1e293b] rounded-t-[2.5rem] sm:rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${getRoleInfo(form.role).color} flex items-center justify-center shadow-lg`}>
              <User size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {isEdit ? `Edit — ${initial.first_name}` : "Add Employee"}
              </h2>
              <p className="text-xs text-slate-400">{isEdit ? "Update employee details" : "Create a new staff account"}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* Role selector */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Role</label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(({ value, label, emoji, color }) => (
                <button key={value} type="button" onClick={() => set("role", value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all
                    ${form.role === value
                      ? `bg-gradient-to-r ${color} text-white border-transparent shadow-sm`
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-violet-300"
                    }`}
                >
                  {emoji} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Full Name *</label>
            <input type="text" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder="e.g. Arun Kumar" className={inputCls(errors.first_name)} />
            {errors.first_name && <p className="text-xs text-rose-500 mt-1">{errors.first_name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Email *</label>
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="john@restaurant.com" className={`${inputCls(errors.email)} pl-10`} />
            </div>
            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Phone Number *</label>
            <div className="relative">
              <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="tel" value={form.phone_number} onChange={(e) => set("phone_number", e.target.value)} placeholder="+1234567890" className={`${inputCls(errors.phone_number)} pl-10`} />
            </div>
            {errors.phone_number && <p className="text-xs text-rose-500 mt-1">{errors.phone_number}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
              {isEdit ? "New Password (leave blank to keep)" : "Password *"}
            </label>
            <div className="relative">
              <input type={showPwd ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder={isEdit ? "Enter new password to change…" : "Min. 6 characters"} className={`${inputCls(errors.password)} pr-10`} />
              <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div>
              <p className="text-sm font-black text-slate-800 dark:text-white">Active Account</p>
              <p className="text-xs text-slate-400 mt-0.5">Inactive employees cannot log in</p>
            </div>
            <button type="button" onClick={() => set("is_active", !form.is_active)}>
              {form.is_active ? <ToggleRight size={34} className="text-violet-600" /> : <ToggleLeft size={34} className="text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700/60 flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button type="submit" disabled={submitting}
            className={`flex-1 py-3 rounded-2xl text-white text-sm font-black transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg bg-gradient-to-r ${getRoleInfo(form.role).color} hover:opacity-90`}>
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Add Employee"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================================================================
   MAIN COMPONENT
================================================================ */
const EmployeeManagement = () => {
  const dispatch      = useDispatch();
  const employees     = useSelector(selectAdminEmployees);
  const filters       = useSelector(selectEmployeeFilters);
  const pagination    = useSelector(selectEmployeePagination);
  const loading       = useSelector(selectEmployeeLoading);
  const isRefreshing  = useSelector(selectEmployeeRefreshing);
  const loadingMore   = useSelector(selectEmployeeLoadingMore);
  const error         = useSelector(selectEmployeeError);
  const success       = useSelector(selectEmployeeSuccess);
  const fetched       = useSelector(selectEmployeeFetched);

  const [searchTerm,  setSearchTerm]  = useState(filters.searchQuery || "");
  const [showFilters, setShowFilters] = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [editingEmp,  setEditingEmp]  = useState(null);

  const observer  = useRef();
  const isMounted = useRef(false);

  /* auto-clear toasts */
  useEffect(() => {
    if (success || error) {
      const t = setTimeout(() => dispatch(clearEmployeeMessages()), 4000);
      return () => clearTimeout(t);
    }
  }, [success, error, dispatch]);

  /* initial fetch */
  useEffect(() => {
    if (!fetched) dispatch(fetchAdminEmployees(filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* filter watcher */
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    dispatch(fetchAdminEmployees(filters));
  }, [dispatch, filters.searchQuery, filters.role, filters.activeStatus, filters.sortBy, filters.currentPage]);

  /* debounced search */
  useEffect(() => {
    const t = setTimeout(() => dispatch(setEmployeeSearch(searchTerm)), 400);
    return () => clearTimeout(t);
  }, [searchTerm, dispatch]);

  /* infinite scroll */
  const lastEmpRef = useCallback((node) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && pagination.hasNext) dispatch(setEmployeeCurrentPage(filters.currentPage + 1));
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, pagination.hasNext, filters.currentPage, dispatch]);

  const handleReset   = () => { setSearchTerm(""); dispatch(resetEmployeeFilters()); };
  const handleRefresh = () => dispatch(fetchAdminEmployees(filters));
  const openAdd       = () => { setEditingEmp(null); setShowModal(true); };
  const openEdit      = (emp) => { setEditingEmp(emp); setShowModal(true); };
  const closeModal    = () => { setShowModal(false); setEditingEmp(null); };

  const isFiltered = filters.role !== "all" || filters.activeStatus !== "all" || !!filters.searchQuery;
  const activeFilterCount =
    (filters.role !== "all"        ? 1 : 0) +
    (filters.activeStatus !== "all"? 1 : 0) +
    (searchTerm                    ? 1 : 0);

  /* stats */
  const roleCounts  = employees.reduce((acc, e) => { acc[e.role] = (acc[e.role] || 0) + 1; return acc; }, {});
  const activeCount = employees.filter((e) => e.is_active).length;

  return (
    <>
      {/* Fixed toast */}
      {(success || error) && (
        <div className="fixed top-5 right-5 z-40 pointer-events-none">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-bold pointer-events-auto
            ${success ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
            {success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{success || error}</span>
            <button onClick={() => dispatch(clearEmployeeMessages())} className="ml-1 opacity-70 hover:opacity-100"><X size={14} /></button>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-4 lg:p-8 transition-colors duration-300">

        {/* ── Header ── */}
        <header className="flex flex-col lg:flex-row justify-between mb-8 gap-5">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Staff Management</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Manage your restaurant team
              {pagination.totalItems > 0 && <span className="ml-2 text-violet-500 font-bold">· {pagination.totalItems} employees</span>}
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex gap-3">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                className="w-full pl-12 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 dark:text-white outline-none focus:ring-2 ring-violet-500/20 focus:border-violet-400 dark:focus:border-violet-500/50 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                placeholder="Search name, email, ID…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {isRefreshing && <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-violet-400" />}
            </div>

            <button onClick={() => setShowFilters((v) => !v)}
              className={`relative p-3 rounded-2xl border transition-all
                ${showFilters || activeFilterCount > 0
                  ? "bg-violet-50 dark:bg-violet-500/10 border-violet-300 dark:border-violet-600/50 text-violet-600 dark:text-violet-400"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/60"
                }`}>
              <SlidersHorizontal size={20} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-violet-600 text-white text-[9px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button onClick={handleRefresh}
              className="p-3 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
              <RefreshCw size={20} className={loading || isRefreshing ? "animate-spin text-violet-400" : ""} />
            </button>

            <button onClick={openAdd}
              className="flex items-center gap-2 px-5 py-3 bg-violet-600 text-white rounded-2xl text-sm font-black hover:bg-violet-700 shadow-lg shadow-violet-500/30 transition-all">
              <Plus size={20} />
              <span className="hidden sm:inline">Add Employee</span>
            </button>
          </div>
        </header>

        {/* ── Stats strip ── */}
        {employees.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {[
              { label: "Total",   value: pagination.totalItems || employees.length, color: "text-slate-800 dark:text-white" },
              { label: "Active",  value: activeCount,                               color: "text-emerald-500"               },
              { label: "Inactive",value: employees.length - activeCount,            color: "text-slate-400"                 },
              { label: "Waiters", value: roleCounts["waiter"] || 0,                 color: "text-blue-500"                  },
              { label: "Kitchen", value: roleCounts["kitchen-staff"] || 0,          color: "text-amber-500"                 },
              { label: "Admins",  value: roleCounts["restaurant-admin"] || 0,       color: "text-violet-500"                },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 text-center">
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Filter panel ── */}
        {showFilters && (
          <div className="mb-6 bg-white dark:bg-[#1e293b] rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-5">
            {/* Role */}
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Role</p>
              <div className="flex flex-wrap gap-2">
                <FilterPill label="All" active={filters.role === "all"} onClick={() => dispatch(setEmployeeRoleFilter("all"))} />
                {ROLES.map((r) => (
                  <FilterPill key={r.value} label={`${r.emoji} ${r.label}`} active={filters.role === r.value} onClick={() => dispatch(setEmployeeRoleFilter(r.value))} />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              {/* Status */}
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Status</p>
                <div className="flex gap-2">
                  {[["all","All"],["true","✅ Active"],["false","⛔ Inactive"]].map(([val, label]) => (
                    <FilterPill key={val} label={label} active={filters.activeStatus === val} onClick={() => dispatch(setEmployeeActiveFilter(val))} />
                  ))}
                </div>
              </div>
              {/* Sort */}
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Sort By</p>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTS.map(([val, label]) => (
                    <FilterPill key={val} label={label} active={filters.sortBy === val} onClick={() => dispatch(setEmployeeSortBy(val))} />
                  ))}
                </div>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button onClick={handleReset} className="flex items-center gap-1.5 text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 transition-colors">
                <RotateCcw size={11} /> ✕ Clear all
              </button>
            )}
          </div>
        )}

        {/* Active filter chips */}
        {isFiltered && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Active:</span>
            {filters.role !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700/30 text-violet-600 dark:text-violet-400 text-[10px] font-black">
                {getRoleInfo(filters.role).emoji} {getRoleInfo(filters.role).label}
                <button onClick={() => dispatch(setEmployeeRoleFilter("all"))}><X size={9} /></button>
              </span>
            )}
            {filters.activeStatus !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black">
                {filters.activeStatus === "true" ? "✅ Active" : "⛔ Inactive"}
                <button onClick={() => dispatch(setEmployeeActiveFilter("all"))}><X size={9} /></button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black">
                "{searchTerm}" <button onClick={() => setSearchTerm("")}><X size={9} /></button>
              </span>
            )}
          </div>
        )}

        {/* ── FLAT LIST ── */}
        <div className="bg-white dark:bg-[#1e293b] rounded-[1.5rem] border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-sm">

          {/* Column header */}
          <div className="flex items-center gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-800/40">
            <div className="w-11 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
                Employee · Contact · Role
              </span>
            </div>
            <div className="hidden lg:block w-44 flex-shrink-0 text-right">
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Joined · Updated</span>
            </div>
            <div className="flex-shrink-0">
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Status</span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] font-black text-slate-400 uppercase">
                <Pencil size={9} /> Actions
              </span>
            </div>
          </div>

          {/* Violet divider */}
          <div className="h-px w-full bg-violet-500/30" />

          {/* Body */}
          {loading && employees.length === 0 ? (
            <div>{[...Array(5)].map((_, i) => <RowSkeleton key={i} />)}</div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <span className="text-5xl mb-4">👥</span>
              <p className="font-bold uppercase text-xs tracking-widest mb-1">
                {isFiltered ? "No employees match your filters" : "No employees yet"}
              </p>
              {isFiltered ? (
                <button onClick={handleReset} className="mt-4 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-xs font-black hover:bg-violet-700 flex items-center gap-2">
                  <RotateCcw size={12} /> Clear filters
                </button>
              ) : (
                <button onClick={openAdd} className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-xs font-black hover:bg-violet-700 shadow-lg shadow-violet-500/30">
                  <Plus size={14} /> Add Employee
                </button>
              )}
            </div>
          ) : (
            <div className={`transition-opacity duration-200 ${isRefreshing ? "opacity-50" : "opacity-100"}`}>
              {employees.map((emp, i) => (
                <EmployeeRow
                  key={emp.public_id}
                  ref={i === employees.length - 1 ? lastEmpRef : null}
                  employee={emp}
                  isLast={i === employees.length - 1}
                  onEdit={openEdit}
                />
              ))}
            </div>
          )}

          {loadingMore && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <Loader2 className="animate-spin text-violet-400" size={18} />
                <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Loading more…</span>
              </div>
            </div>
          )}
        </div>

        {employees.length > 0 && (
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
            Showing <span className="font-bold text-slate-600 dark:text-slate-300">{employees.length}</span> of{" "}
            <span className="font-bold text-slate-600 dark:text-slate-300">{pagination.totalItems}</span> employees
          </p>
        )}
      </div>

      {showModal && <EmployeeFormModal initial={editingEmp} onClose={closeModal} />}
    </>
  );
};

export default EmployeeManagement;