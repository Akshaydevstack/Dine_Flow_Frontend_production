import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  Plus,
  RefreshCw,
  Send,
  Edit3,
  Trash2,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  ChefHat,
  UserCheck,
  Globe,
  Megaphone,
  Clock,
  Search,
} from "lucide-react";
import {
  fetchBroadcastNotifications,
  createBroadcastNotification,
  updateBroadcastNotification,
  deleteBroadcastNotification,
  clearBroadcastMessages,
  setBroadcastSearch,
  selectBroadcastNotifications,
  selectBroadcastLoading,
  selectBroadcastRefreshing,
  selectBroadcastFetched,
  selectBroadcastSuccess,
  selectBroadcastError,
  selectBroadcastSearch,
} from "../../../store/slices/restaurantAdminSlice/adminBroadcastNotificationSlice";

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60)   return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
};

/* ══════════════════════════════════════════════════════════
   ROLE OPTIONS
══════════════════════════════════════════════════════════ */
const ROLE_OPTIONS = [
  { value: "",         label: "All Users",  icon: Globe,     color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-500/10"   },
  { value: "customer", label: "Customers",  icon: Users,     color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-500/10"      },
  { value: "staff",    label: "Staff",      icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  { value: "kitchen",  label: "Kitchen",    icon: ChefHat,   color: "text-orange-500",  bg: "bg-orange-50 dark:bg-orange-500/10"  },
];

const getRoleOption = (role) =>
  ROLE_OPTIONS.find((r) => r.value === (role ?? "")) ?? ROLE_OPTIONS[0];

/* ══════════════════════════════════════════════════════════
   STYLE TOKENS
══════════════════════════════════════════════════════════ */
const inputCls =
  "w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 ring-violet-500/20 text-sm transition-all";

const textareaCls =
  "w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 ring-violet-500/20 text-sm transition-all resize-none";

const FieldLabel = ({ children }) => (
  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
    {children}
  </label>
);

const ErrMsg = ({ msg }) =>
  msg ? (
    <p className="flex items-center gap-1 mt-1 text-[10px] font-bold text-rose-500">
      <AlertCircle size={10} className="flex-shrink-0" /> {msg}
    </p>
  ) : null;

/* ══════════════════════════════════════════════════════════
   TOAST BANNER
══════════════════════════════════════════════════════════ */
const ToastBanner = ({ success, error, onDismiss }) => {
  if (!success && !error) return null;
  const text = success || (typeof error === "object" ? Object.values(error).flat().join(" ") : error);
  return (
    <div className={`flex items-center justify-between gap-3 p-4 rounded-2xl text-sm font-bold border mb-5 ${
      success
        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
        : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
    }`}>
      <div className="flex items-center gap-3">
        {success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        <span>{text}</span>
      </div>
      <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0">
        <X size={15} />
      </button>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   ROLE BADGE
══════════════════════════════════════════════════════════ */
const RoleBadge = ({ role }) => {
  const opt = getRoleOption(role);
  const Icon = opt.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${opt.bg} ${opt.color} border-slate-200 dark:border-slate-700`}>
      <Icon size={10} /> {opt.label}
    </span>
  );
};

/* ══════════════════════════════════════════════════════════
   BROADCAST CARD
══════════════════════════════════════════════════════════ */
function BroadcastCard({ broadcast, onEdit, onDelete, deleting }) {
  const [confirmDel, setConfirmDel] = useState(false);

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:border-violet-200 dark:hover:border-violet-800/50 transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/5">
      {/* hover accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-violet-500 to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0">
              <Megaphone size={15} className="text-violet-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-800 dark:text-white leading-tight line-clamp-1">
                {broadcast.title}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock size={10} className="text-slate-400 flex-shrink-0" />
                <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">
                  {fmtDate(broadcast.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {!confirmDel ? (
            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(broadcast)}
                title="Edit"
                className="p-2 rounded-xl text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={() => setConfirmDel(true)}
                title="Delete"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] font-bold text-rose-500">Delete?</span>
              <button
                onClick={() => { onDelete(broadcast.reference_id); setConfirmDel(false); }}
                disabled={deleting}
                className="px-2.5 py-1 rounded-xl bg-rose-500 text-white text-[10px] font-black hover:bg-rose-600 disabled:opacity-60 transition-colors"
              >
                {deleting ? <Loader2 size={10} className="animate-spin" /> : "Yes"}
              </button>
              <button
                onClick={() => setConfirmDel(false)}
                className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                No
              </button>
            </div>
          )}
        </div>

        {/* Body text */}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 mb-3">
          {broadcast.body}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <RoleBadge role={broadcast.role} />
          <p
            className="text-[9px] font-mono text-slate-400 dark:text-slate-600 truncate max-w-[130px]"
            title={broadcast.reference_id}
          >
            {broadcast.reference_id}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CREATE / EDIT DRAWER
══════════════════════════════════════════════════════════ */
const VALIDATORS = {
  title: (v) =>
    !v.trim() ? "Title is required"
    : v.trim().length > 150 ? "Max 150 characters"
    : null,
  body: (v) => (!v.trim() ? "Message body is required" : null),
};

function BroadcastDrawer({ mode, broadcast, onClose, onSave, saving }) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState(
    isEdit
      ? { title: broadcast?.title ?? "", body: broadcast?.body ?? "", role: broadcast?.role ?? "" }
      : { title: "", body: "", role: "" }
  );
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  const set = (k) => (e) => {
    const val = e.target.value;
    setForm((f) => {
      const next = { ...f, [k]: val };
      if (touched[k]) setErrors((er) => ({ ...er, [k]: VALIDATORS[k]?.(val) ?? null }));
      return next;
    });
  };

  const blur = (k) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((er) => ({ ...er, [k]: VALIDATORS[k]?.(form[k] ?? "") ?? null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    Object.keys(VALIDATORS).forEach((k) => {
      const msg = VALIDATORS[k](form[k] ?? "");
      if (msg) errs[k] = msg;
    });
    setTouched({ title: true, body: true });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave(form);
  };

  const errCount = Object.values(errors).filter(Boolean).length;
  const fCls = (k) =>
    `${inputCls} ${errors[k] && touched[k] ? "border-rose-400 dark:border-rose-500" : ""}`;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(15,23,42,.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[490px] h-full bg-white dark:bg-slate-900 flex flex-col shadow-2xl"
        style={{ animation: "slideRight .28s cubic-bezier(.32,1,.5,1)" }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 bg-slate-50/60 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
              {isEdit
                ? <Edit3 size={16} className="text-violet-600 dark:text-violet-400" />
                : <Megaphone size={16} className="text-violet-600 dark:text-violet-400" />}
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {isEdit ? "Edit Broadcast" : "New Broadcast"}
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {errCount > 0
                  ? <span className="text-rose-500 font-bold">{errCount} field{errCount > 1 ? "s" : ""} need attention</span>
                  : isEdit ? "Update title and body" : "Push a message to your users"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5" noValidate>

          {/* Title */}
          <div>
            <FieldLabel>Notification Title *</FieldLabel>
            <input
              className={fCls("title")}
              value={form.title}
              onChange={set("title")}
              onBlur={blur("title")}
              placeholder="e.g. Weekend Special Offer 🎉"
              maxLength={150}
            />
            <div className="flex items-start justify-between mt-1">
              <ErrMsg msg={touched.title && errors.title} />
              <span className={`text-[9px] font-bold ml-auto ${form.title.length > 130 ? "text-orange-400" : "text-slate-400"}`}>
                {form.title.length}/150
              </span>
            </div>
          </div>

          {/* Body */}
          <div>
            <FieldLabel>Message Body *</FieldLabel>
            <textarea
              className={`${textareaCls} ${errors.body && touched.body ? "border-rose-400 dark:border-rose-500" : ""}`}
              value={form.body}
              onChange={set("body")}
              onBlur={blur("body")}
              placeholder="Write your broadcast message here…"
              rows={5}
            />
            <ErrMsg msg={touched.body && errors.body} />
          </div>

          {/* Audience selector — create only */}
          {!isEdit && (
            <div>
              <FieldLabel>Target Audience</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {ROLE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const sel = form.role === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, role: opt.value }))}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-left transition-all ${
                        sel
                          ? "border-violet-400 dark:border-violet-500 bg-violet-50 dark:bg-violet-500/15 shadow-md shadow-violet-500/10"
                          : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${sel ? "bg-violet-100 dark:bg-violet-500/30" : "bg-slate-100 dark:bg-slate-800"}`}>
                        <Icon size={13} className={sel ? "text-violet-600 dark:text-violet-400" : "text-slate-400"} />
                      </div>
                      <div>
                        <p className={`text-xs font-black leading-tight ${sel ? "text-violet-700 dark:text-violet-300" : "text-slate-700 dark:text-slate-300"}`}>
                          {opt.label}
                        </p>
                        {sel && <p className="text-[9px] text-violet-500 font-bold mt-0.5">Selected ✓</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[9px] text-slate-400 mt-2 font-semibold leading-relaxed">
                Only users with active device tokens for this restaurant will receive the push notification.
              </p>
            </div>
          )}

          {/* Live preview */}
          {(form.title || form.body) && (
            <div>
              <FieldLabel>Live Preview</FieldLabel>
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-6 h-6 rounded-lg bg-violet-500 flex items-center justify-center flex-shrink-0">
                    <Bell size={12} className="text-white" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Push Notification</span>
                </div>
                <p className="text-sm font-black text-slate-800 dark:text-white leading-snug">
                  {form.title || <span className="italic text-slate-400">Your title here…</span>}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-3">
                  {form.body || <span className="italic">Your message here…</span>}
                </p>
              </div>
            </div>
          )}

          {/* Error summary */}
          {errCount > 0 && Object.keys(touched).length > 0 && (
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
              <AlertCircle size={15} className="text-rose-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                Please fix {errCount} error{errCount > 1 ? "s" : ""} before sending.
              </p>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-2xl bg-violet-600 text-white text-sm font-black hover:bg-violet-700 flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-violet-500/30 transition-all active:scale-95"
            >
              {saving ? (
                <><Loader2 size={16} className="animate-spin" /> {isEdit ? "Saving…" : "Sending…"}</>
              ) : isEdit ? (
                <><Save size={16} /> Save Changes</>
              ) : (
                <><Send size={16} /> Send Broadcast</>
              )}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes slideRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SKELETON
══════════════════════════════════════════════════════════ */
const SkeletonPage = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-4 lg:p-8">
    <style>{`
      @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      .skel{background:linear-gradient(90deg,var(--skel-base) 25%,var(--skel-shine) 50%,var(--skel-base) 75%);background-size:200% 100%;animation:shimmer 1.6s ease-in-out infinite;}
      :root{--skel-base:#e2e8f0;--skel-shine:#f8fafc;}
      .dark{--skel-base:#1e293b;--skel-shine:#273548;}
    `}</style>
    <div className="flex justify-between items-start mb-8">
      <div className="space-y-2.5">
        <div className="skel h-9 w-72 rounded-2xl" />
        <div className="skel h-4 w-52 rounded-xl" />
      </div>
      <div className="flex gap-3">
        <div className="skel h-11 w-11 rounded-2xl" />
        <div className="skel h-11 w-44 rounded-2xl" />
      </div>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[...Array(4)].map((_, i) => <div key={i} className="skel h-20 rounded-3xl" />)}
    </div>
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden p-5">
      <div className="flex justify-between items-center mb-5">
        <div className="skel h-8 w-48 rounded-2xl" />
        <div className="skel h-9 w-52 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="skel w-9 h-9 rounded-2xl" />
              <div className="flex-1 space-y-1.5">
                <div className="skel h-3.5 w-3/4 rounded-lg" />
                <div className="skel h-2.5 w-1/3 rounded-lg" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="skel h-3 w-full rounded-lg" />
              <div className="skel h-3 w-5/6 rounded-lg" />
              <div className="skel h-3 w-2/3 rounded-lg" />
            </div>
            <div className="skel h-6 w-24 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function BroadcastNotificationPage() {
  const dispatch     = useDispatch();
  const broadcasts   = useSelector(selectBroadcastNotifications);
  const loading      = useSelector(selectBroadcastLoading);
  const isRefreshing = useSelector(selectBroadcastRefreshing);
  const fetched      = useSelector(selectBroadcastFetched);
  const successMsg   = useSelector(selectBroadcastSuccess);
  const errorMsg     = useSelector(selectBroadcastError);
  const reduxSearch  = useSelector(selectBroadcastSearch);

  const [drawer,      setDrawer]      = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [deletingId,  setDeletingId]  = useState(null);
  const [localSearch, setLocalSearch] = useState(reduxSearch ?? "");
  const [fetchError,  setFetchError]  = useState(null);
  const debounceRef  = useRef(null);
  // Once true, we never show the full-page skeleton again — subsequent
  // search / create re-fetches use isRefreshing (spinner) instead.
  const everFetched  = useRef(fetched);
  if (fetched) everFetched.current = true;

  /* ── Debounced search handlers ── */
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setLocalSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(setBroadcastSearch(val)); // resets fetched=false in slice
    }, 420);
  };

  const clearSearch = () => {
    setLocalSearch("");
    clearTimeout(debounceRef.current);
    dispatch(setBroadcastSearch("")); // resets fetched=false in slice
  };

  /* ── Single unified fetch effect ────────────────────────────────────
     Dependency: `fetched`
       • false on mount            → initial load
       • false after setBroadcastSearch  → search changed
       • false after createBroadcast     → new item added
     When fetched=true the slice already has fresh data — skip the call.
     This replaces the old double-useEffect (initial + reduxSearch) that
     caused two concurrent requests on mount and flickering on search.
  ─────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (fetched) return; // data is fresh, nothing to do
    dispatch(fetchBroadcastNotifications())
      .unwrap()
      .catch((err) => {
        // Only surface an error screen on the very first load failure.
        // Search re-fetch failures are shown via the toast (errorMessage).
        if (!everFetched.current) {
          setFetchError(err?.message ?? "Failed to load notifications.");
        }
      });
  }, [fetched, dispatch]);

  /* ── Toast auto-dismiss + close drawer on non-create success ── */
  useEffect(() => {
    if (successMsg || errorMsg) {
      setSaving(false);
      if (successMsg && !successMsg.includes("created")) setDrawer(null);
      const t = setTimeout(() => dispatch(clearBroadcastMessages()), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg, errorMsg, dispatch]);

  /* ── Action handlers ── */
  const handleCreate = (formData) => {
    setSaving(true);
    dispatch(createBroadcastNotification(formData));
  };

  const handleUpdate = (formData) => {
    if (!drawer?.broadcast) return;
    setSaving(true);
    dispatch(updateBroadcastNotification({
      referenceId: drawer.broadcast.reference_id,
      data: { title: formData.title, body: formData.body },
    }));
  };

  const handleDelete = (referenceId) => {
    setDeletingId(referenceId);
    dispatch(deleteBroadcastNotification(referenceId))
      .unwrap()
      .finally(() => setDeletingId(null));
  };

  const retryFetch = () => {
    setFetchError(null);
    // Slice still has fetched=false from the failed load, so the
    // unified useEffect([fetched]) will fire and retry automatically.
    // If for some reason fetched is true, dispatch directly.
    dispatch(fetchBroadcastNotifications())
      .unwrap()
      .catch((e) => {
        setFetchError(e?.message ?? "Error loading notifications.");
      });
  };

  /* ── Stat counts (from full unfiltered store list) ── */
  const todayCount = broadcasts.filter((b) => {
    if (!b.created_at) return false;
    return new Date(b.created_at).toDateString() === new Date().toDateString();
  }).length;

  /* ── Error text normalisation ── */
  const errorText = errorMsg && typeof errorMsg === "object"
    ? Object.values(errorMsg).flat().join(" ")
    : (errorMsg ?? null);

  /* ── States ── */
  // Only show full-page skeleton on the very first load (never after search re-fetches)
  if (loading && !everFetched.current && !broadcasts.length) return <SkeletonPage />;

  if (fetchError && !everFetched.current && !broadcasts.length) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
            <AlertCircle size={28} className="text-rose-500" />
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">Failed to Load</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{fetchError}</p>
          <button
            onClick={retryFetch}
            className="flex items-center gap-2 mx-auto px-5 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-black shadow-lg shadow-violet-500/30 transition-all active:scale-95"
          >
            <RefreshCw size={15} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
   <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-4 lg:p-8 transition-colors duration-300">

      {/* ── PAGE HEADER ── */}
      <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Broadcast Notifications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Push messages to users and staff across your restaurant
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => dispatch(fetchBroadcastNotifications())}
            disabled={isRefreshing}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin text-violet-400" : ""} />
          </button>
          <button
            onClick={() => setDrawer({ mode: "create" })}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-black shadow-lg shadow-violet-500/30 transition-all active:scale-95"
          >
            <Plus size={17} /> New Broadcast
          </button>
        </div>
      </header>

      {/* ── TOAST ── */}
      <ToastBanner
        success={successMsg}
        error={errorText}
        onDismiss={() => dispatch(clearBroadcastMessages())}
      />

      {/* ── STAT STRIP ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Sent",    value: broadcasts.length,                         color: "text-violet-600 dark:text-violet-400",   bg: "bg-violet-50 dark:bg-violet-900/20"   },
          { label: "Sent Today",    value: todayCount,                                color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "All Users",     value: broadcasts.filter(b => !b.role).length,    color: "text-slate-800 dark:text-white",         bg: "bg-white dark:bg-slate-900"           },
          { label: "Role-Targeted", value: broadcasts.filter(b => !!b.role).length,   color: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-50 dark:bg-blue-900/20"       },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border border-slate-200 dark:border-slate-800 rounded-3xl p-4 text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mt-0.5 tracking-widest">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── CARD GRID CONTAINER ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
              <Bell size={14} className="text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-sm font-black text-slate-800 dark:text-white">All Broadcasts</span>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
              {broadcasts.length}
            </span>
          </div>
          <div className="relative w-full sm:w-64">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {isRefreshing
                ? <Loader2 size={13} className="animate-spin text-violet-400" />
                : <Search size={13} className="text-slate-400" />}
            </div>
            <input
              value={localSearch}
              onChange={handleSearchChange}
              placeholder="Search title or body…"
              className="pl-8 pr-9 py-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm outline-none focus:ring-2 ring-violet-500/20 transition-all"
            />
            {localSearch && (
              <button
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="p-5">
          {broadcasts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Megaphone size={28} className="opacity-30" />
              </div>
              <p className="font-black text-sm">
                {localSearch ? "No broadcasts match your search" : "No broadcasts yet"}
              </p>
              {!localSearch && (
                <>
                  <p className="text-xs mt-1.5 mb-5 text-center">
                    Send your first broadcast notification to your users
                  </p>
                  <button
                    onClick={() => setDrawer({ mode: "create" })}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-black shadow-lg shadow-violet-500/30 transition-all active:scale-95"
                  >
                    <Plus size={15} /> Create First Broadcast
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {broadcasts.map((b) => (
                <BroadcastCard
                  key={b.reference_id}
                  broadcast={b}
                  onEdit={(bc) => setDrawer({ mode: "edit", broadcast: bc })}
                  onDelete={handleDelete}
                  deleting={deletingId === b.reference_id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── DRAWER ── */}
      {drawer && (
        <BroadcastDrawer
          mode={drawer.mode}
          broadcast={drawer.broadcast}
          onClose={() => { setDrawer(null); setSaving(false); }}
          onSave={drawer.mode === "create" ? handleCreate : handleUpdate}
          saving={saving}
        />
      )}
    </div>
  );
}