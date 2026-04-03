import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminReviews,
  updateAdminReview,
  deleteAdminReview,
  setReviewSearch,
  setReviewFilter,
  setReviewDateRange,
  clearReviewDateRange,
  setReviewPage,
  resetReviewFilters,
  clearReviewMessages,
  selectAdminReviews,
  selectAdminReviewFilters,
  selectAdminReviewPageInfo,
  selectAdminReviewLoading,
  selectAdminReviewRefresh,
  selectAdminReviewError,
  selectAdminReviewSuccess,
  selectFeched,
} from "../../../store/slices/restaurantAdminSlice/adminReviewSlice";
import {
  Star, Search, RefreshCw, Loader2, SlidersHorizontal,
  Trash2, Eye, EyeOff, Calendar, CalendarRange, X, ChevronDown,
  AlertTriangle, Check, RotateCcw, Clock, ArrowRight,
} from "lucide-react";

/* ── Stars ── */
const Stars = ({ rating, size = 12 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={size}
        className={
          s <= rating
            ? "fill-amber-400 text-amber-400"
            : "fill-slate-300 text-slate-300 dark:fill-slate-600 dark:text-slate-600"
        }
      />
    ))}
  </div>
);

/* ── Rating meta ── */
const ratingMeta = (r) => {
  if (r >= 5) return { label: "Excellent", pill: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700/40" };
  if (r >= 4) return { label: "Good",      pill: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-700/40" };
  if (r >= 3) return { label: "Average",   pill: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/40" };
  if (r >= 2) return { label: "Poor",      pill: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700/40" };
  return             { label: "Terrible",  pill: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-700/40" };
};

/* ── Filter Pill ── */
const FilterPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap
      ${active
        ? "bg-amber-500 text-white border-amber-500"
        : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-amber-400 dark:hover:border-amber-600 bg-white dark:bg-slate-800/60"
      }`}
  >
    {label}
  </button>
);

/* ── Date Range Picker ── */
const DateRangePicker = ({ dateFrom, dateTo, onChange, onClear }) => {
  const hasRange = dateFrom || dateTo;
  return (
    <div>
      <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
        <CalendarRange size={11} />
        Date Range
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {/* From */}
        <div className="relative">
          <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="date"
            value={dateFrom || ""}
            max={dateTo || undefined}
            onChange={(e) => onChange({ dateFrom: e.target.value || null, dateTo })}
            className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold outline-none focus:ring-2 ring-amber-500/20 focus:border-amber-400 dark:focus:border-amber-500/50 transition-all"
          />
        </div>

        <ArrowRight size={14} className="text-slate-400 flex-shrink-0" />

        {/* To */}
        <div className="relative">
          <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="date"
            value={dateTo || ""}
            min={dateFrom || undefined}
            onChange={(e) => onChange({ dateFrom, dateTo: e.target.value || null })}
            className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold outline-none focus:ring-2 ring-amber-500/20 focus:border-amber-400 dark:focus:border-amber-500/50 transition-all"
          />
        </div>

        {/* Quick presets */}
        {[
          {
            label: "Today",
            fn: () => { const t = new Date().toISOString().slice(0, 10); onChange({ dateFrom: t, dateTo: t }); },
          },
          {
            label: "Last 7d",
            fn: () => {
              const to   = new Date().toISOString().slice(0, 10);
              const from = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
              onChange({ dateFrom: from, dateTo: to });
            },
          },
          {
            label: "This Month",
            fn: () => {
              const now  = new Date();
              const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
              onChange({ dateFrom: from, dateTo: now.toISOString().slice(0, 10) });
            },
          },
        ].map((p) => (
          <button
            key={p.label}
            onClick={p.fn}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider hover:border-amber-400 dark:hover:border-amber-600 transition-all whitespace-nowrap"
          >
            {p.label}
          </button>
        ))}

        {hasRange && (
          <button onClick={onClear} className="text-[10px] font-black uppercase text-rose-400 hover:text-rose-500 transition-colors">
            ✕ Clear
          </button>
        )}
      </div>
    </div>
  );
};

/* ── Helpers ── */
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
  return "";
};
const avatarFallback = (name = "?") =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

/* ── Stats Strip ── */
const StatsStrip = ({ reviews, totalItems }) => {
  const visible  = reviews.filter((r) => r.show_review).length;
  const hidden   = reviews.filter((r) => !r.show_review).length;
  const avg      = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";
  const fiveStar = reviews.filter((r) => r.rating === 5).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {[
        { label: "Total",      value: totalItems || reviews.length, color: "text-slate-800 dark:text-white"   },
        { label: "Avg Rating", value: avg,                          color: "text-amber-500"                   },
        { label: "5-Star",     value: fiveStar,                     color: "text-emerald-500"                 },
        { label: "Visible",    value: visible,                      color: "text-violet-500"                  },
        { label: "Hidden",     value: hidden,                       color: "text-rose-500"                    },
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

/* ── Skeleton ── */
const RowSkeleton = () => (
  <>
    <div className="animate-pulse flex items-center gap-4 px-5 py-4">
      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>
      <div className="hidden md:block h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      <div className="hidden lg:block h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-xl" />
    </div>
    <div className="h-px w-full bg-emerald-500/40" />
  </>
);

/* ── Delete Modal ── */
const DeleteModal = ({ review, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 w-full max-w-sm">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center mb-4">
        <AlertTriangle size={22} className="text-rose-500 dark:text-rose-400" />
      </div>
      <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">Delete this review?</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5">
        By <span className="font-semibold text-slate-700 dark:text-slate-200">{review?.user_name}</span>
      </p>
      <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mb-0.5">{review?.public_id}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{review?.dish_name}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500 italic mb-6 line-clamp-2">
        "{review?.comment}"
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-black disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          Delete
        </button>
      </div>
    </div>
  </div>
);

/* ── Review Row ── */
const ReviewRow = ({ review, onToggleVisibility, onDelete, mutating, isLast }) => {
  const [expanded, setExpanded] = useState(false);
  const meta = ratingMeta(review.rating);
  const busy = !!mutating;
  const wasEdited = review.updated_at && review.updated_at !== review.created_at;

  return (
    <div className={`group ${busy ? "opacity-60 pointer-events-none" : ""}`}>
      <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors duration-150">

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
            <span className="text-xs font-black text-slate-600 dark:text-slate-300 leading-none">
              {avatarFallback(review.user_name)}
            </span>
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#1e293b]
              ${review.show_review ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-500"}`}
          />
        </div>

        {/* Customer / Comment */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-sm font-bold text-slate-900 dark:text-white leading-none">
              {review.user_name}
            </span>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 leading-none">
              {review.user_public_id}
            </span>
            <span className="text-[9px] font-mono text-slate-500 dark:text-slate-600 bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600/50 leading-none">
              {review.public_id}
            </span>
          </div>
          <p className={`text-xs text-slate-500 dark:text-slate-400 leading-snug ${expanded ? "" : "truncate"}`}>
            {review.comment}
          </p>
          {review.comment?.length > 60 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-[10px] font-bold text-amber-500 hover:text-amber-400 mt-0.5 flex items-center gap-0.5"
            >
              {expanded ? "Less" : "More"}
              <ChevronDown size={9} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>

        {/* Dish */}
        <div className="hidden md:flex flex-col flex-shrink-0 w-40">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 truncate leading-none">
            {review.dish_public_id}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate leading-none">
            {review.dish_name}
          </span>
        </div>

        {/* Rating */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1.5 w-32">
          <Stars rating={review.rating} />
          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded border leading-none ${meta.pill}`}>
            {meta.label}
          </span>
        </div>

        {/* Date */}
        <div className="hidden lg:flex flex-col items-end flex-shrink-0 w-28">
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-none">
            {fmtDate(review.created_at)}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">
            {fmtTime(review.created_at)}
          </span>
          <span className="text-[9px] text-slate-300 dark:text-slate-600 mt-0.5 leading-none">
            {timeAgo(review.created_at)}
          </span>
          {wasEdited && (
            <div className="flex items-center gap-1 mt-1">
              <Clock size={8} className="text-amber-500" />
              <span className="text-[9px] text-amber-500 leading-none">
                edited {timeAgo(review.updated_at)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onToggleVisibility(review)}
            disabled={busy}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all
              ${review.show_review
                ? "border-emerald-300 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                : "border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
          >
            {busy
              ? <Loader2 size={13} className="animate-spin" />
              : review.show_review
              ? <Eye size={13} />
              : <EyeOff size={13} />
            }
          </button>
          <button
            onClick={() => onDelete(review)}
            className="w-8 h-8 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Divider */}
      {!isLast && <div className="h-px w-full bg-emerald-500/30" />}
    </div>
  );
};

/* ── Empty State ── */
const EmptyState = ({ filtered, onReset }) => (
  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
    <span className="text-5xl mb-4">💬</span>
    <p className="font-bold uppercase text-xs tracking-widest">
      {filtered ? "No reviews match your filters" : "No reviews yet"}
    </p>
    {filtered && (
      <button
        onClick={onReset}
        className="mt-4 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-black hover:bg-amber-600 flex items-center gap-2"
      >
        <RotateCcw size={12} /> Clear filters
      </button>
    )}
  </div>
);

/* ================================================================
   MAIN
================================================================ */
const ReviewManagement = () => {
  const dispatch = useDispatch();

  const reviews      = useSelector(selectAdminReviews);
  const filters      = useSelector(selectAdminReviewFilters);
  const pagination   = useSelector(selectAdminReviewPageInfo);
  const loading      = useSelector(selectAdminReviewLoading);
  const isRefreshing = useSelector(selectAdminReviewRefresh);
  const error        = useSelector(selectAdminReviewError);
  const success      = useSelector(selectAdminReviewSuccess);
  const feched       = useSelector(selectFeched);

  const [searchTerm,   setSearchTerm]   = useState(filters.searchQuery || "");
  const [showFilters,  setShowFilters]  = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [mutating,     setMutating]     = useState({});

  const observerRef = useRef();
  const isMounted   = useRef(false);

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => dispatch(clearReviewMessages()), 3500);
      return () => clearTimeout(t);
    }
  }, [error, success, dispatch]);

  useEffect(() => {
    if (!feched) dispatch(fetchAdminReviews(filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    dispatch(fetchAdminReviews(filters));
  }, [dispatch, filters.searchQuery, filters.rating, filters.showReview, filters.sortBy, filters.currentPage, filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    const t = setTimeout(() => dispatch(setReviewSearch(searchTerm)), 400);
    return () => clearTimeout(t);
  }, [searchTerm, dispatch]);

  const lastRowRef = useCallback((node) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && pagination.hasNext)
        dispatch(setReviewPage(filters.currentPage + 1));
    });
    if (node) observerRef.current.observe(node);
  }, [loading, pagination.hasNext, filters.currentPage, dispatch]);

  const handleRefresh = () => dispatch(fetchAdminReviews({ ...filters, currentPage: 1 }));
  const handleReset   = () => { setSearchTerm(""); dispatch(resetReviewFilters()); };
  const handleDateChange = ({ dateFrom, dateTo }) => dispatch(setReviewDateRange({ dateFrom: dateFrom ?? filters.dateFrom, dateTo: dateTo ?? filters.dateTo }));
  const handleDateClear  = () => dispatch(clearReviewDateRange());

  const handleToggleVisibility = async (review) => {
    setMutating((m) => ({ ...m, [review.public_id]: true }));
    await dispatch(updateAdminReview({ publicId: review.public_id, data: { show_review: !review.show_review } }));
    setMutating((m) => ({ ...m, [review.public_id]: false }));
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setMutating((m) => ({ ...m, [deleteTarget.public_id]: true }));
    await dispatch(deleteAdminReview(deleteTarget.public_id));
    setMutating((m) => ({ ...m, [deleteTarget.public_id]: false }));
    setDeleteTarget(null);
  };

  const activeFilterCount =
    (filters.rating       !== null     ? 1 : 0) +
    (filters.showReview   !== null     ? 1 : 0) +
    (filters.sortBy       !== "newest" ? 1 : 0) +
    (filters.dateFrom || filters.dateTo ? 1 : 0) +
    (filters.searchQuery               ? 1 : 0);

  const isFiltered = activeFilterCount > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-4 lg:p-8 transition-colors duration-300">

      {/* ── Toasts ── */}
      <div className="fixed top-5 right-5 z-40 space-y-2 pointer-events-none">
        {success && (
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-2xl shadow-xl text-sm font-bold pointer-events-auto">
            <Check size={16} /> {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-rose-600 text-white rounded-2xl shadow-xl text-sm font-bold pointer-events-auto">
            <AlertTriangle size={16} /> {error}
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteModal
          review={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={!!mutating[deleteTarget?.public_id]}
        />
      )}

      {/* ── Header ── */}
      <header className="flex flex-col lg:flex-row justify-between mb-8 gap-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Reviews</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Customer Feedback & Visibility Control
            {pagination.totalItems > 0 && (
              <span className="ml-2 text-amber-500 font-bold">· {pagination.totalItems} total</span>
            )}
          </p>
          {/* Active date range badge */}
          {(filters.dateFrom || filters.dateTo) && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wide">
              <CalendarRange size={10} />
              {filters.dateFrom || "…"} → {filters.dateTo || "…"}
              <button onClick={handleDateClear} className="ml-1 hover:text-rose-500 transition-colors">✕</button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              className="w-full pl-12 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-white outline-none focus:ring-2 ring-amber-500/20 focus:border-amber-400 dark:focus:border-amber-500/50 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
              placeholder="Search name, comment, ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isRefreshing && (
              <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-amber-400" />
            )}
          </div>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`relative p-3 rounded-2xl border transition-all
              ${showFilters || activeFilterCount > 0
                ? "bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-600/50 text-amber-600 dark:text-amber-400"
                : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/60"
              }`}
          >
            <SlidersHorizontal size={20} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            onClick={handleRefresh}
            className="p-3 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={20} className={loading || isRefreshing ? "animate-spin text-amber-400" : ""} />
          </button>
        </div>
      </header>

      {/* ── Stats ── */}
      {reviews.length > 0 && <StatsStrip reviews={reviews} totalItems={pagination.totalItems} />}

      {/* ── Filter Panel ── */}
      {showFilters && (
        <div className="mb-6 bg-white dark:bg-[#1e293b] rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-5">
          {/* Rating */}
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Rating</p>
            <div className="flex flex-wrap gap-2">
              {[null, 1, 2, 3, 4, 5].map((r) => (
                <FilterPill
                  key={r ?? "all"}
                  label={r === null ? "All" : `${r} ★`}
                  active={filters.rating === r}
                  onClick={() => dispatch(setReviewFilter({ rating: r }))}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            {/* Visibility */}
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Visibility</p>
              <div className="flex gap-2">
                {[[null, "All"], [true, "Visible"], [false, "Hidden"]].map(([v, l]) => (
                  <FilterPill
                    key={String(v)}
                    label={l}
                    active={filters.showReview === v}
                    onClick={() => dispatch(setReviewFilter({ showReview: v }))}
                  />
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Sort by</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  ["newest",     "Newest"],
                  ["oldest",     "Oldest"],
                  ["ratingHigh", "Highest rated"],
                  ["ratingLow",  "Lowest rated"],
                ].map(([val, label]) => (
                  <FilterPill
                    key={val}
                    label={label}
                    active={filters.sortBy === val}
                    onClick={() => dispatch(setReviewFilter({ sortBy: val }))}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Date range — full width row, same pattern as order/kitchen pages */}
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

      {/* ── Active filter chips ── */}
      {isFiltered && (
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
            Active:
          </span>
          {filters.rating !== null && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 text-amber-600 dark:text-amber-400 text-[10px] font-black">
              {filters.rating}★{" "}
              <button onClick={() => dispatch(setReviewFilter({ rating: null }))}><X size={9} /></button>
            </span>
          )}
          {filters.showReview !== null && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black">
              {filters.showReview ? "Visible" : "Hidden"}{" "}
              <button onClick={() => dispatch(setReviewFilter({ showReview: null }))}><X size={9} /></button>
            </span>
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black">
              <Calendar size={9} /> {filters.dateFrom || "…"} → {filters.dateTo || "…"}
              <button onClick={() => dispatch(clearReviewDateRange())}><X size={9} /></button>
            </span>
          )}
          {filters.sortBy !== "newest" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black">
              Sort: {filters.sortBy}{" "}
              <button onClick={() => dispatch(setReviewFilter({ sortBy: "newest" }))}><X size={9} /></button>
            </span>
          )}
          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black">
              "{filters.searchQuery}"{" "}
              <button onClick={() => { setSearchTerm(""); dispatch(setReviewSearch("")); }}><X size={9} /></button>
            </span>
          )}
        </div>
      )}

      {/* ── TABLE ── */}
      <div className="bg-white dark:bg-[#1e293b] rounded-[1.5rem] border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-sm">

        {/* Column header */}
        <div className="flex items-center gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-800/40">
          <div className="w-9 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
              Customer / Comment
            </span>
          </div>
          <div className="hidden md:block w-40 flex-shrink-0">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
              Dish
            </span>
          </div>
          <div className="w-32 flex-shrink-0 text-center">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
              Rating
            </span>
          </div>
          <div className="hidden lg:block w-28 flex-shrink-0 text-right">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
              Date
            </span>
          </div>
          <div className="w-[4.25rem] flex-shrink-0" />
        </div>

        {/* Green divider under header */}
        <div className="h-px w-full bg-emerald-500/40" />

        {/* Body */}
        {loading ? (
          <div>{[...Array(5)].map((_, i) => <RowSkeleton key={i} />)}</div>
        ) : reviews.length === 0 ? (
          <EmptyState filtered={isFiltered} onReset={handleReset} />
        ) : (
          <div className={`transition-opacity duration-200 ${isRefreshing ? "opacity-50" : "opacity-100"}`}>
            {reviews.map((review, i) => (
              <div key={review.public_id} ref={i === reviews.length - 1 ? lastRowRef : null}>
                <ReviewRow
                  review={review}
                  onToggleVisibility={handleToggleVisibility}
                  onDelete={setDeleteTarget}
                  mutating={mutating[review.public_id]}
                  isLast={i === reviews.length - 1}
                />
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <Loader2 className="animate-spin text-amber-400" size={18} />
              <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-400 tracking-widest">
                Loading…
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer count */}
      {reviews.length > 0 && (
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
          Showing{" "}
          <span className="font-bold text-slate-600 dark:text-slate-300">{reviews.length}</span> of{" "}
          <span className="font-bold text-slate-600 dark:text-slate-300">{pagination.totalItems}</span> reviews
        </p>
      )}
    </div>
  );
};

export default ReviewManagement;