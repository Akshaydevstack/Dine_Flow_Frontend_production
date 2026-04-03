import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchRestaurantStaff,
  blockRestaurantStaff,
  blockSingleStaff,
  setStaffSearch,
  setStaffFilter,
  setStaffPage,
  resetStaffFilters,
  clearStaffMessages,
  selectSuperAdminStaffRestaurants,
  selectSuperAdminStaffLoading,
  selectSuperAdminStaffRefreshing,
  selectSuperAdminStaffLoadingMore,
  selectSuperAdminStaffFilters,
  selectSuperAdminStaffPagination,
  selectSuperAdminStaffSuccess,
  selectSuperAdminStaffError,
  selectSuperAdminStaffFetched
} from "../../../store/slices/superAdmin/superAdminStaffSlice";
import {
  Search, RefreshCw, ChevronRight,
  Users, UtensilsCrossed, Crown,
  ToggleLeft, ToggleRight, AlertTriangle, X,
  CheckCircle2, Loader2, AlertCircle, Store,
} from "lucide-react";

/* ══════════════════════════════════════════
   STYLE TOKEN
══════════════════════════════════════════ */
const panel = `bg-white dark:bg-[#0c1a2e] border border-slate-200/70 dark:border-[#2a2440] rounded-2xl`;

/* ══════════════════════════════════════════
   ROLE META
══════════════════════════════════════════ */
const ROLE_META = {
  "restaurant-admin": {
    label: "Admin", Icon: Crown,
    badge:  "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-500/20",
    avatar: "bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400",
  },
  waiter: {
    label: "Waiter", Icon: Users,
    badge:  "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-500/20",
    avatar: "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  "kitchen-staff": {
    label: "Kitchen", Icon: UtensilsCrossed,
    badge:  "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-1 ring-violet-200 dark:ring-violet-500/20",
    avatar: "bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
};

const fmt = iso => iso
  ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  : "—";

const initials = (name = "") =>
  name.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

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
   STAFF ROW
══════════════════════════════════════════ */
function StaffRow({ member, dispatch }) {
  const [confirm, setConfirm]   = useState(null);
  const [toggling, setToggling] = useState(false);
  const meta    = ROLE_META[member.role] || ROLE_META.waiter;
  const { Icon } = meta;

  const doToggle = async () => {
    setConfirm(null);
    setToggling(true);
    await dispatch(blockSingleStaff({ publicId: member.public_id, is_active: !member.is_active }));
    setToggling(false);
  };

  return (
    <>
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        description={confirm?.description}
        confirmLabel={confirm?.confirmLabel}
        danger={confirm?.danger}
        onConfirm={doToggle}
        onCancel={() => setConfirm(null)}
      />
      <tr className={`group border-b border-slate-100 dark:border-[#1e1a2e] transition-colors
        hover:bg-orange-50/40 dark:hover:bg-orange-500/5 ${!member.is_active ? "opacity-55" : ""}`}>

        <td className="px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black ${meta.avatar}`}>
              {initials(member.first_name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-[160px]">{member.first_name}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[160px]">{member.email}</p>
            </div>
          </div>
        </td>

        <td className="px-5 py-3.5">
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{member.public_id}</span>
        </td>

        <td className="px-5 py-3.5">
          <span className="text-xs text-slate-600 dark:text-slate-400">{member.mobile_number || "—"}</span>
        </td>

        <td className="px-5 py-3.5">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${meta.badge}`}>
            <Icon size={9} />{meta.label}
          </span>
        </td>

        <td className="px-5 py-3.5">
          <span className="text-xs text-slate-400 dark:text-slate-500">{fmt(member.created_at)}</span>
        </td>

        <td className="px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider
              ${member.is_active
                ? "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 ring-1 ring-teal-200 dark:ring-teal-500/20"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700/50"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${member.is_active ? "bg-teal-500 animate-pulse" : "bg-slate-400"}`} />
              {member.is_active ? "Active" : "Blocked"}
            </span>
            <button
              onClick={() => setConfirm({
                title:        member.is_active ? "Block Staff Member" : "Unblock Staff Member",
                description:  `${member.is_active ? "Block" : "Unblock"} ${member.first_name} (${member.email})?`,
                confirmLabel: member.is_active ? "Block" : "Unblock",
                danger:       member.is_active,
              })}
              disabled={toggling}
              className="opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
            >
              {toggling
                ? <Loader2 size={16} className="animate-spin text-slate-400" />
                : member.is_active
                  ? <ToggleRight size={20} className="text-teal-500" />
                  : <ToggleLeft  size={20} className="text-slate-300 dark:text-slate-600" />}
            </button>
          </div>
        </td>
      </tr>
    </>
  );
}

/* ══════════════════════════════════════════
   RESTAURANT CARD
══════════════════════════════════════════ */
function RestaurantCard({ restaurant, dispatch, defaultOpen }) {
  const [open, setOpen]         = useState(defaultOpen);
  const [confirm, setConfirm]   = useState(null);
  const [blocking, setBlocking] = useState(false);

  const allStaff    = [...restaurant.admins, ...restaurant.waiters, ...restaurant.kitchen_staff];
  const activeCount = allStaff.filter(s => s.is_active).length;
  const allActive   = allStaff.length > 0 && activeCount === allStaff.length;
  const allBlocked  = activeCount === 0;

  const doBulk = async () => {
    const { is_active } = confirm;
    setConfirm(null);
    setBlocking(true);
    await dispatch(blockRestaurantStaff({ restaurantId: restaurant.restaurant_id, is_active }));
    setBlocking(false);
  };

  const groups = [
    { label: "Admins",        list: restaurant.admins,        color: "text-orange-500 dark:text-orange-400", bg: "bg-orange-50/60 dark:bg-orange-500/5"  },
    { label: "Waiters",       list: restaurant.waiters,       color: "text-blue-500 dark:text-blue-400",     bg: "bg-blue-50/60 dark:bg-blue-500/5"      },
    { label: "Kitchen Staff", list: restaurant.kitchen_staff, color: "text-violet-500 dark:text-violet-400", bg: "bg-violet-50/60 dark:bg-violet-500/5"  },
  ];

  return (
    <>
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        description={confirm?.description}
        confirmLabel={confirm?.confirmLabel}
        danger={confirm?.danger}
        onConfirm={doBulk}
        onCancel={() => setConfirm(null)}
      />

      <div className={`${panel} overflow-hidden shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none transition-shadow`}>

        {/* ── Card Header ── */}
        <div
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-orange-50/40 dark:hover:bg-orange-500/5 transition-colors"
        >
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.18 }}>
            <ChevronRight size={15} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
          </motion.div>

          <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-black bg-gradient-to-br from-orange-500 to-red-600 shadow-md shadow-orange-500/20">
            {restaurant.restaurant_name[0].toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-800 dark:text-slate-100 truncate leading-tight">{restaurant.restaurant_name}</p>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{restaurant.restaurant_id}</p>
          </div>

          {/* Stat chips */}
          <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0 mr-2" onClick={e => e.stopPropagation()}>
            {[
              { label: "Admin",   count: restaurant.admins.length,  cls: "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-orange-200 dark:ring-orange-500/20" },
              { label: "Waiter",  count: restaurant.total_waiters,  cls: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-200 dark:ring-blue-500/20"             },
              { label: "Kitchen", count: restaurant.total_kitchen,  cls: "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-violet-200 dark:ring-violet-500/20" },
            ].map(c => (
              <span key={c.label} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ring-1 ${c.cls}`}>
                {c.count} {c.label}
              </span>
            ))}
          </div>

          {/* Active ratio */}
          <div className="flex-shrink-0 text-right mr-4" onClick={e => e.stopPropagation()}>
            <p className={`text-lg font-black leading-none
              ${allActive ? "text-teal-600 dark:text-teal-400" : allBlocked ? "text-rose-500 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}`}>
              {activeCount}<span className="text-xs opacity-60">/{allStaff.length}</span>
            </p>
            <p className="text-[8px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5">active</p>
          </div>

          {/* Bulk actions */}
          <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setConfirm({ title: "Unblock All Staff", description: `Unblock all ${allStaff.length} staff in ${restaurant.restaurant_name}?`, confirmLabel: "Unblock All", danger: false, is_active: true })}
              disabled={blocking || allActive}
              className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all
                bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20
                hover:bg-teal-100 dark:hover:bg-teal-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
            >Unblock All</button>
            <button
              onClick={() => setConfirm({ title: "Block All Staff", description: `Block all ${allStaff.length} staff in ${restaurant.restaurant_name}?`, confirmLabel: "Block All", danger: true, is_active: false })}
              disabled={blocking || allBlocked}
              className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all
                bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20
                hover:bg-rose-100 dark:hover:bg-rose-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
            >Block All</button>
          </div>
        </div>

        {/* ── Staff Table ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="border-t border-slate-100 dark:border-[#1e1a2e]">
                {allStaff.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">No staff members</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-[#1e1a2e] bg-slate-50/50 dark:bg-[#0f0d19]/40">
                          {["Member", "Public ID", "Phone", "Role", "Joined", "Status"].map(h => (
                            <th key={h} className="px-5 py-2.5 text-left text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {groups.map(({ label, list, color, bg }) =>
                          list.length > 0 ? (
                            <React.Fragment key={label}>
                              <tr className="border-b border-slate-100 dark:border-[#1e1a2e]">
                                <td colSpan={6} className={`px-5 py-1.5 ${bg}`}>
                                  <span className={`text-[9px] font-black uppercase tracking-[0.18em] ${color}`}>
                                    {label} · {list.length}
                                  </span>
                                </td>
                              </tr>
                              {list.map(member => (
                                <StaffRow key={member.public_id} member={member} dispatch={dispatch} />
                              ))}
                            </React.Fragment>
                          ) : null
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   SKELETON CARDS
══════════════════════════════════════════ */
function SkeletonCards() {
  return (
    <>
      <style>{`
        @keyframes rsm-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .rsm-shim{background:linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%);background-size:200% 100%;animation:rsm-shimmer 1.4s ease-in-out infinite;border-radius:6px}
        .dark .rsm-shim{background:linear-gradient(90deg,#0c1a2e 25%,#112540 50%,#0c1a2e 75%);background-size:200% 100%;animation:rsm-shimmer 1.4s ease-in-out infinite;border-radius:6px}
      `}</style>
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`${panel} p-5 shadow-sm dark:shadow-none`}>
          <div className="flex items-center gap-3">
            <div className="rsm-shim w-4 h-4 flex-shrink-0" />
            <div className="rsm-shim w-9 h-9 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="rsm-shim h-3.5 w-40" />
              <div className="rsm-shim h-2.5 w-24" />
            </div>
            <div className="hidden sm:flex gap-2">
              <div className="rsm-shim h-6 w-16 rounded-lg" />
              <div className="rsm-shim h-6 w-16 rounded-lg" />
              <div className="rsm-shim h-6 w-16 rounded-lg" />
            </div>
            <div className="rsm-shim h-8 w-14 rounded-lg" />
            <div className="rsm-shim h-7 w-20 rounded-lg" />
            <div className="rsm-shim h-7 w-20 rounded-lg" />
          </div>
        </div>
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
   MAIN PAGE
══════════════════════════════════════════ */
export default function RestaurantStaffManagement() {
  const dispatch    = useAppDispatch();
  const restaurants = useAppSelector(selectSuperAdminStaffRestaurants);
  const loading     = useAppSelector(selectSuperAdminStaffLoading);
  const refreshing  = useAppSelector(selectSuperAdminStaffRefreshing);
  const loadingMore = useAppSelector(selectSuperAdminStaffLoadingMore);
  const filters     = useAppSelector(selectSuperAdminStaffFilters);
  const pagination  = useAppSelector(selectSuperAdminStaffPagination);
  const success     = useAppSelector(selectSuperAdminStaffSuccess);
  const error       = useAppSelector(selectSuperAdminStaffError);
  const fetched       = useAppSelector(selectSuperAdminStaffFetched)

  const [search, setSearch] = useState(filters.searchQuery ?? "");
  const [toast, setToast]   = useState(null);

  // ── Single clean fetch pattern ──────────────────────────────
  // On mount: always fetch once unconditionally.
  // On filter change: prev-key guard fires only when a filter
  // value actually changes, avoiding double-fire and StrictMode issues.
  const mountedRef    = useRef(false);
  const prevFilterKey = useRef(null);

  useEffect(() => {
 if (!fetched)
    dispatch(fetchRestaurantStaff(filters));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Skip the very first run (handled by mount effect above)
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevFilterKey.current = JSON.stringify({
        q: filters.searchQuery, role: filters.role,
        active: filters.isActive, sort: filters.sortBy, page: filters.currentPage,
      });
      return;
    }

    const key = JSON.stringify({
      q: filters.searchQuery, role: filters.role,
      active: filters.isActive, sort: filters.sortBy, page: filters.currentPage,
    });

    if (key === prevFilterKey.current) return; // nothing changed
    prevFilterKey.current = key;
    dispatch(fetchRestaurantStaff(filters));

  }, [filters.searchQuery, filters.role, filters.isActive, filters.sortBy, filters.currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => dispatch(setStaffSearch(search)), 380);
    return () => clearTimeout(t);
  }, [search, dispatch]);

  // Toast messages
  useEffect(() => {
    if (success) { setToast({ msg: success, type: "success" }); dispatch(clearStaffMessages()); }
    if (error)   { setToast({ msg: error,   type: "error"   }); dispatch(clearStaffMessages()); }
  }, [success, error, dispatch]);

  const totalStaff   = restaurants.reduce((a, r) => a + r.total_staff, 0);
  const totalActive  = restaurants.reduce((a, r) =>
    a + [...r.admins, ...r.waiters, ...r.kitchen_staff].filter(s => s.is_active).length, 0);
  const totalBlocked = totalStaff - totalActive;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 dark:bg-[#07101f] transition-colors duration-300">

      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <div className="p-5 lg:p-7 max-w-[1400px]">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 min-w-0">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-orange-500 dark:text-orange-400 mb-1">
              Super Admin · Management
            </p>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Restaurant Staff
              {pagination.totalItems > 0 && (
                <span className="ml-3 text-sm font-medium text-slate-400 dark:text-slate-500 tracking-normal">
                  {pagination.totalItems} restaurants
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard label="Restaurants" value={pagination.totalItems || restaurants.length} icon={Store}        colorCls="bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-500/20" />
          <StatCard label="Total Staff"  value={totalStaff}                                 icon={Users}        colorCls="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-500/20"           />
          <StatCard label="Active"       value={totalActive}                                icon={CheckCircle2} colorCls="bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 ring-1 ring-teal-200 dark:ring-teal-500/20"           />
          <StatCard label="Blocked"      value={totalBlocked}                               icon={X}            colorCls="bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 ring-1 ring-rose-200 dark:ring-rose-500/20"           />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-5">
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search restaurant or staff…"
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

          {[
            {
              value: filters.role ?? "",
              onChange: e => dispatch(setStaffFilter({ role: e.target.value || null })),
              options: [["", "All Roles"], ["restaurant-admin", "Admin"], ["waiter", "Waiter"], ["kitchen-staff", "Kitchen"]],
            },
            {
              value: filters.isActive === null ? "" : String(filters.isActive),
              onChange: e => dispatch(setStaffFilter({ isActive: e.target.value === "" ? null : e.target.value === "true" })),
              options: [["", "All Status"], ["true", "Active"], ["false", "Blocked"]],
            },
            {
              value: filters.sortBy,
              onChange: e => dispatch(setStaffFilter({ sortBy: e.target.value })),
              options: [["newest", "Newest"], ["oldest", "Oldest"], ["nameAsc", "Name A–Z"], ["nameDesc", "Name Z–A"]],
            },
          ].map((sel, i) => (
            <select key={i} value={sel.value} onChange={sel.onChange}
              className="h-10 px-3 rounded-xl text-xs font-semibold outline-none cursor-pointer
                bg-white dark:bg-[#0c1a2e] border border-slate-200/70 dark:border-[#2a2440]
                text-slate-600 dark:text-slate-400 shadow-sm dark:shadow-none
                focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 dark:focus:border-orange-500/50">
              {sel.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}

          <button
            onClick={() => { dispatch(resetStaffFilters()); setSearch(""); }}
            className="h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider
              bg-white dark:bg-[#0c1a2e] border border-slate-200/70 dark:border-[#2a2440]
              text-slate-500 dark:text-slate-400 shadow-sm dark:shadow-none
              hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-300 dark:hover:border-orange-500/40 transition-all">
            Reset
          </button>

          <button
            onClick={() => dispatch(fetchRestaurantStaff({ ...filters, currentPage: 1 }))}
            disabled={refreshing}
            className="p-2.5 rounded-xl flex-shrink-0 bg-white dark:bg-[#0c1a2e] border border-slate-200/70 dark:border-[#2a2440]
              text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 shadow-sm dark:shadow-none transition-all">
            <RefreshCw size={16} className={refreshing ? "animate-spin text-orange-500 dark:text-orange-400" : ""} />
          </button>
        </div>

        {/* Restaurant list */}
        <div className="flex flex-col gap-4">
          {loading && !loadingMore && <SkeletonCards />}

          {!loading && restaurants.length === 0 && (
            <div className={`${panel} flex flex-col items-center justify-center py-20 shadow-sm dark:shadow-none`}>
              <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center mb-4">
                <Store size={28} className="text-orange-400 dark:text-orange-500" />
              </div>
              <p className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">No restaurants found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Try adjusting your filters or search query</p>
            </div>
          )}

          {restaurants.map((restaurant, i) => (
            <motion.div key={restaurant.restaurant_id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <RestaurantCard restaurant={restaurant} dispatch={dispatch} defaultOpen={i === 0} />
            </motion.div>
          ))}
        </div>

        {/* Load more */}
        {pagination.hasNext && !loading && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => dispatch(setStaffPage(filters.currentPage + 1))}
              disabled={loadingMore}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider
                bg-white dark:bg-[#0c1a2e] border border-slate-200/70 dark:border-[#2a2440]
                text-slate-500 dark:text-slate-400 shadow-sm dark:shadow-none
                hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-300 dark:hover:border-orange-500/40
                disabled:opacity-60 transition-all">
              {loadingMore
                ? <><Loader2 size={14} className="animate-spin text-orange-500 dark:text-orange-400" /> Loading…</>
                : "Load More"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}