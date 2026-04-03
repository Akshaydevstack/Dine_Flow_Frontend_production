// pages/waiter/WaiterDishDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Star,
  Clock,
  Flame,
  Zap,
  TrendingUp,
  Award,
  Leaf,
  ShoppingBag,
  Tag,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  ImageOff,
  MessageSquare,
  BarChart3,
  User,
} from "lucide-react";
import axiosClient from "../../../api/axiosClient";

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */

const fmt2 = (v) => parseFloat(v || 0).toFixed(2);

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

const formatReviewDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

const discountPct = (original, current) => {
  const o = parseFloat(original);
  const c = parseFloat(current);
  if (!o || o <= c) return 0;
  return Math.round(((o - c) / o) * 100);
};

/* ═══════════════════════════════════════════════
   COPY BUTTON
═══════════════════════════════════════════════ */

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-green-500" />
        : <Copy className="w-3.5 h-3.5 text-slate-400" />}
    </button>
  );
}

/* ═══════════════════════════════════════════════
   BADGE
═══════════════════════════════════════════════ */

function Badge({ icon: Icon, label, color, bg, ring }) {
  return (
    <span
      style={{ color, background: bg, border: `1px solid ${ring}` }}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold"
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
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
          <div
            style={{ background: accent }}
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          >
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
   STAT TILE
═══════════════════════════════════════════════ */

function StatTile({ label, value, sub, color, icon: Icon }) {
  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-center">
      {Icon && (
        <Icon className="w-4 h-4 mx-auto mb-1" style={color ? { color } : { color: "#94a3b8" }} />
      )}
      <p
        style={color ? { color } : {}}
        className="text-[17px] font-black text-slate-900 dark:text-white leading-tight"
      >
        {value}
      </p>
      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   STAR ROW
═══════════════════════════════════════════════ */

function StarRow({ rating, size = "w-3.5 h-3.5" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${size} ${
            s <= rating
              ? "text-amber-400 fill-amber-400"
              : "text-slate-200 dark:text-slate-700 fill-slate-200 dark:fill-slate-700"
          }`}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   RATING BAR (breakdown per star)
═══════════════════════════════════════════════ */

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-slate-500 dark:text-slate-400 w-3 flex-shrink-0 text-right">{star}</span>
      <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 flex-shrink-0" />
      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          style={{ width: `${pct}%` }}
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
        />
      </div>
      <span className="text-[11px] text-slate-400 w-5 text-right flex-shrink-0">{count}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   REVIEW CARD
═══════════════════════════════════════════════ */

function ReviewCard({ review }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
          {review.user_avatar ? (
            <img
              src={review.user_avatar}
              alt={review.user_name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-4 h-4 text-slate-400" />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">
              {review.user_name || "Anonymous"}
            </p>
            <span className="text-[10px] text-slate-400 flex-shrink-0 whitespace-nowrap">
              {formatReviewDate(review.created_at)}
            </span>
          </div>

          {/* Stars */}
          <StarRow rating={review.rating} size="w-3 h-3" />

          {/* Comment */}
          {review.comment && (
            <p className="text-[12px] text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════ */

function PageSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="w-full h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="flex gap-2 pt-1">
          {[16, 20, 16].map((w, i) => (
            <div key={i} style={{ width: `${w * 4}px` }} className="h-7 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3].map(i => <div key={i} className="flex-1 h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 h-40" />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */

export default function WaiterDishDetail() {
  const { dishId } = useParams();

  const [dish,       setDish]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [imgIndex,   setImgIndex]   = useState(0);
  const [imgError,   setImgError]   = useState(false);

  const fetchDish = async () => {
    try {
      setError(null);
      const response = await axiosClient.get(`/menu/waiter/dishe/${dishId}/`);
      setDish(response.data);
      setImgIndex(0);
      setImgError(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dish");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDish(); }, [dishId]);

  const handleRefresh = () => { setRefreshing(true); fetchDish(); };

  /* ── Derived ── */
  const discount  = dish ? discountPct(dish.original_price, dish.price) : 0;
  const images    = dish?.images ?? [];
  const heroImage = images[imgIndex];
  const rating    = parseFloat(dish?.average_rating || 0);
  const hasRating = rating > 0;
  const reviews   = dish?.reviews ?? [];

  // Star breakdown from actual reviews array
  const starBreakdown = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));

  // Average from actual reviews when API rating is 0
  const computedRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const displayRating = hasRating ? rating : computedRating;
  const showRating    = displayRating > 0;

  /* ═══════════════════════ RENDER */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28">

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[180px]">
                {dish?.name ?? "Dish Details"}
              </h1>
              {dish && (
                <p className="text-[11px] text-slate-400">{dish.category_name}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="px-4 pt-4 space-y-3">

        {loading && <PageSkeleton />}

        {error && !loading && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-2xl p-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">Failed to load dish</p>
              <p className="text-xs text-red-500 mt-0.5">{error}</p>
              <button onClick={handleRefresh} className="mt-2 text-xs font-semibold text-red-600 underline">Retry</button>
            </div>
          </div>
        )}

        {dish && !loading && (
          <>
            {/* ═════════ HERO IMAGE ════════ */}
            <div className="relative w-full h-72 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-sm">
              {heroImage && !imgError ? (
                <img
                  src={heroImage}
                  alt={dish.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <ImageOff className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                  <p className="text-xs text-slate-400">No image</p>
                </div>
              )}

              {/* Dark gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              {/* Multi-image nav */}
              {images.length > 1 && (
                <>
                  {/* Dot indicators top center */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIndex(i)}
                        className={`rounded-full transition-all ${
                          i === imgIndex ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                  {/* Arrow buttons */}
                  <button
                    onClick={() => setImgIndex((i) => Math.max(0, i - 1))}
                    disabled={imgIndex === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center disabled:opacity-20 text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setImgIndex((i) => Math.min(images.length - 1, i + 1))}
                    disabled={imgIndex === images.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center disabled:opacity-20 text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Availability */}
              <div className="absolute bottom-3 left-3">
                {dish.is_available ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-green-500/90 backdrop-blur-sm text-white text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    Available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-700/90 backdrop-blur-sm text-slate-300 text-[11px] font-bold">
                    Unavailable
                  </span>
                )}
              </div>

              {/* Discount */}
              {discount > 0 && (
                <div className="absolute bottom-3 right-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-500/90 backdrop-blur-sm text-white text-[11px] font-bold">
                    <Tag className="w-3 h-3" />
                    {discount}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setImgIndex(i); setImgError(false); }}
                    className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      i === imgIndex
                        ? "border-violet-600 shadow-md shadow-violet-500/30"
                        : "border-transparent opacity-60"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* ═════════ INFO CARD ════════ */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm p-4">

              {/* Name + veg indicator */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <h2 className="text-[20px] font-black text-slate-900 dark:text-white leading-tight flex-1">
                  {dish.name}
                </h2>
                <div
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    dish.is_veg
                      ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                      : "border-red-600 bg-red-50 dark:bg-red-900/20"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${dish.is_veg ? "bg-green-600" : "bg-red-600"}`} />
                </div>
              </div>

              <p className="text-[12px] text-slate-400 mb-3">{dish.category_name}</p>

              {/* Description with left accent */}
              {dish.description && (
                <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed mb-4 border-l-2 border-violet-200 dark:border-violet-800 pl-3 italic">
                  {dish.description}
                </p>
              )}

              {/* Price row */}
              <div className="flex items-end gap-3 mb-4">
                <span className="text-[24px] font-black text-violet-600 dark:text-violet-400">
                  ₹{fmt2(dish.price)}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-[15px] text-slate-400 line-through mb-0.5">
                      ₹{fmt2(dish.original_price)}
                    </span>
                    <span className="text-[11px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-lg mb-0.5">
                      Save ₹{(parseFloat(dish.original_price) - parseFloat(dish.price)).toFixed(0)}
                    </span>
                  </>
                )}
              </div>

              {/* Inline rating row */}
              {showRating && (
                <div className="flex items-center gap-2 mb-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl px-3 py-2">
                  <StarRow rating={Math.round(displayRating)} size="w-3.5 h-3.5" />
                  <span className="text-[13px] font-bold text-amber-600 dark:text-amber-400">
                    {displayRating.toFixed(1)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                {dish.is_veg && (
                  <Badge icon={Leaf}       label="Veg"        color="#15803d" bg="#f0fdf4" ring="#86efac" />
                )}
                {!dish.is_veg && (
                  <Badge icon={Flame}      label="Non-Veg"    color="#b91c1c" bg="#fef2f2" ring="#fca5a5" />
                )}
                {dish.is_spicy && (
                  <Badge icon={Flame}      label="Spicy"      color="#c2410c" bg="#ffedd5" ring="#fdba74" />
                )}
                {dish.is_popular && (
                  <Badge icon={Award}      label="Popular"    color="#b45309" bg="#fef3c7" ring="#fcd34d" />
                )}
                {dish.is_trending && (
                  <Badge icon={TrendingUp} label="Trending"   color="#7c3aed" bg="#ede9fe" ring="#c4b5fd" />
                )}
                {dish.is_quick_bites && (
                  <Badge icon={Zap}        label="Quick Bite" color="#0369a1" bg="#e0f2fe" ring="#7dd3fc" />
                )}
              </div>
            </div>

            {/* ═════════ QUICK STATS ════════ */}
            <div className="flex gap-2">
              <StatTile icon={Clock}      label="Prep Time" value={`${dish.prep_time}m`}                                   color="#7c3aed" />
              <StatTile icon={ShoppingBag} label="Orders"   value={dish.total_orders ?? 0}                                 color="#0369a1" />
              <StatTile icon={Star}       label="Rating"    value={showRating ? displayRating.toFixed(1) : "—"}
                sub={`${reviews.length} review${reviews.length !== 1 ? "s" : ""}`}
                color={showRating ? "#b45309" : undefined}
              />
            </div>

            {/* ═════════ REVIEWS ════════ */}
            <Section
              title="Customer Reviews"
              icon={MessageSquare}
              accent="#b45309"
              trailing={
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {reviews.length}
                </span>
              }
            >
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <Star className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">No reviews yet</p>
                  <p className="text-[12px] text-slate-400">Customer reviews will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Rating summary */}
                  <div className="flex gap-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                    <div className="text-center flex-shrink-0 flex flex-col items-center justify-center">
                      <p className="text-[38px] font-black text-amber-500 leading-none">
                        {displayRating.toFixed(1)}
                      </p>
                      <StarRow rating={Math.round(displayRating)} size="w-3 h-3" />
                      <p className="text-[10px] text-slate-400 mt-1">{reviews.length} reviews</p>
                    </div>
                    <div className="w-px bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5 justify-center flex flex-col">
                      {starBreakdown.map(({ star, count }) => (
                        <RatingBar key={star} star={star} count={count} total={reviews.length} />
                      ))}
                    </div>
                  </div>

                  {/* Individual reviews */}
                  <div className="space-y-2.5">
                    {reviews.map((review) => (
                      <ReviewCard key={review.public_id} review={review} />
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {/* ═════════ DISH INFO ════════ */}
            <Section title="Dish Information" icon={BarChart3} accent="#6b7280">
              <div className="space-y-3">
                {[
                  { label: "Dish ID",     value: dish.public_id,      mono: true,  copy: true },
                  { label: "Category",    value: dish.category_name },
                  { label: "Category ID", value: dish.category,       mono: true,  copy: true },
                  { label: "Price",       value: `₹${fmt2(dish.price)}` },
                  ...(discount > 0 ? [
                    { label: "Was",       value: `₹${fmt2(dish.original_price)}` },
                    { label: "Discount",  value: `${discount}% off` },
                  ] : []),
                  { label: "Prep Time",   value: `${dish.prep_time} min` },
                  { label: "Priority",    value: `#${dish.priority}` },
                  { label: "Available",   value: dish.is_available ? "Yes" : "No" },
                  { label: "Added on",    value: formatDate(dish.created_at) },
                ].map(({ label, value, mono, copy }) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <span className="text-[12px] text-slate-400 dark:text-slate-500 flex-shrink-0 w-24">
                      {label}
                    </span>
                    <div className="flex items-center gap-1 justify-end min-w-0">
                      <span className={`text-[12px] font-semibold text-slate-700 dark:text-slate-300 text-right truncate ${mono ? "font-mono" : ""}`}>
                        {value}
                      </span>
                      {copy && <CopyButton text={value} />}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* ═════════ CTA ════════ */}
            <Link
              to="/waiter/tables"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Place an Order</p>
                  <p className="text-[11px] text-white/70">Select a table to add this dish</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/60" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}