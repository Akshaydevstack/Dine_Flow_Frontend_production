import { Flame, TrendingUp, Zap, ChevronRight, Star, Clock, ShoppingCart, Loader2 } from "lucide-react";
import { useState, memo, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { addToCart } from "../../../../store/slices/cartSlice";
import { useNavigate } from "react-router-dom";

/* ── Veg / Non-veg inline tag ─────────────────────── */
const VegTag = memo(function VegTag({ isVeg }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-[3px] rounded-md text-[9px] font-bold flex-shrink-0 ${
        isVeg
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25"
      }`}
    >
      <span
        className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${
          isVeg ? "bg-emerald-500" : "bg-rose-500"
        }`}
      />
      {isVeg ? "VEG" : "NON-VEG"}
    </span>
  );
});

/* ── Price formatter ─────────────────────────────────────────────────────── */
function fmt(price) {
  const n = parseFloat(price);
  return isNaN(n) ? "0" : n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

/* ── Per-dish cart selector ─────────── */
function useDishInCart(dishId) {
  return useAppSelector(
    useCallback((state) => state.cart.items.some((i) => i.dish_id === dishId), [dishId])
  );
}

/* ── Horizontal dish card — memoized ─────────────────────────────────────── */
const QuickDishCard = memo(function QuickDishCard({ dish, bgColor }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const inCart = useDishInCart(dish.public_id);

  const handleAdd = useCallback(async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await dispatch(addToCart({ dish_id: dish.public_id, quantity: 1 })).unwrap();
    } catch (err) {
      console.error("Add to cart failed", err);
    } finally {
      setLoading(false);
    }
  }, [dispatch, dish.public_id]);

  const handleGoToCart = useCallback((e) => {
    e.stopPropagation();
    navigate("/customer/cart");
  }, [navigate]);

  const handleClick = useCallback(() => {
    navigate(`/customer/dish/${dish.public_id}`);
  }, [navigate, dish.public_id]);

  const discount = dish.original_price && parseFloat(dish.original_price) > parseFloat(dish.price)
    ? Math.round(((dish.original_price - dish.price) / dish.original_price) * 100)
    : 0;

  return (
    <div
      onClick={handleClick}
      className={`${bgColor} rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all duration-200 border shadow-sm ${
        inCart
          ? "border-emerald-400/60 dark:border-emerald-500/40 ring-1 ring-emerald-400/30"
          : "border-gray-200 dark:border-gray-800"
      }`}
    >
      <div className="flex gap-3 p-3">
        {/* Image with Overlays */}
        <div className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800">
          {dish.images?.[0] ? (
            <img
              src={dish.images[0]}
              alt={dish.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">
              🍽️
            </div>
          )}

          {/* Dark gradient so white text pops regardless of image brightness */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {dish.is_spicy && (
            <span className="absolute top-1 right-1 text-sm drop-shadow-md">🌶️</span>
          )}

          {/* Rating (Bottom Left) */}
          {dish.average_rating > 0 && (
            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/10">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-bold text-white leading-none mt-[1px]">
                {parseFloat(dish.average_rating).toFixed(1)}
              </span>
            </div>
          )}

          {/* Prep Time (Bottom Right) */}
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/10">
            <Clock className="w-2.5 h-2.5 text-gray-200" />
            <span className="text-[10px] font-bold text-white leading-none mt-[1px]">
              {dish.prep_time || 20}m
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            {/* Name + veg tag on same row */}
            <div className="flex items-start gap-1.5 mb-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 flex-1 leading-tight">
                {dish.name}
              </h3>
              <VegTag isVeg={dish.is_veg} />
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {dish.description || "Delicious and fresh"}
            </p>
          </div>

          {/* Price + action (Pushed to bottom via justify-between) */}
          <div className="flex items-end justify-between mt-auto">
            <div className="flex flex-col">
              <div className="text-sm font-black text-gray-900 dark:text-white leading-none">₹{fmt(dish.price)}</div>
              {discount > 0 && (
                <div className="text-[10px] text-gray-400 line-through mt-1">₹{fmt(dish.original_price)}</div>
              )}
            </div>
            {inCart ? (
              <button
                onClick={handleGoToCart}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold shadow-md shadow-emerald-500/25 transition-colors active:scale-95"
              >
                <ShoppingCart className="w-3 h-3" />
                Cart
              </button>
            ) : (
              <button
                onClick={handleAdd}
                disabled={loading}
                className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors active:scale-95 disabled:opacity-50 uppercase"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Add"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

/* ── Static section config ───────────── */
const SECTION_META = [
  {
    id: "popular",
    title: "Popular Right Now",
    subtitle: "Most loved by customers",
    icon: Flame,
    iconBg: "bg-gradient-to-br from-orange-500 to-red-500",
    cardBg: "bg-orange-50 dark:bg-orange-900/10",
  },
  {
    id: "trending",
    title: "Trending This Week",
    subtitle: "Hot picks of the week",
    icon: TrendingUp,
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    cardBg: "bg-violet-50 dark:bg-violet-900/10",
  },
  {
    id: "quickbites",
    title: "Quick Bites",
    subtitle: "Ready in 15 minutes",
    icon: Zap,
    iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
    cardBg: "bg-blue-50 dark:bg-blue-900/10",
  },
];

/* ── Section row — memoized ───── */
const SectionRow = memo(function SectionRow({ meta, dishes, onShowAll }) {
  if (!dishes?.length) return null;
  const Icon = meta.icon;
  const slicedDishes = useMemo(() => dishes.slice(0, 6), [dishes]);

  return (
    <div>
      <div className="px-4 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 ${meta.iconBg} rounded-xl shadow-lg flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">{meta.title}</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{meta.subtitle}</p>
          </div>
        </div>
        <button
          onClick={onShowAll}
          className="flex items-center gap-0.5 text-xs font-bold text-violet-600 dark:text-violet-400 active:opacity-70 transition-opacity whitespace-nowrap"
        >
          See All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
        className="flex gap-4 overflow-x-auto px-4 pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {slicedDishes.map((dish) => (
          <div key={dish.public_id} className="flex-shrink-0 w-72">
            <QuickDishCard dish={dish} bgColor={meta.cardBg} />
          </div>
        ))}
      </div>
    </div>
  );
});

/* ── Main export — memoized ───────────────────────────────────────────────── */
export default memo(function QuickSections({
  popularDishes,
  trendingDishes,
  quickBitesDishes,
  sectionsLoading,
  onShowAllPopular,
  onShowAllTrending,
  onShowAllQuickBites,
}) {
  const hasData = popularDishes?.length > 0 || trendingDishes?.length > 0 || quickBitesDishes?.length > 0;
  
  if (sectionsLoading && !hasData) {
    return (
      <div className="py-4 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-4">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                <div>
                  <div className="h-4 w-36 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-1.5" />
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-3 w-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
            
            {/* Card Skeletons */}
            <div className="flex gap-4 overflow-hidden">
              {[1, 2].map((j) => (
                <div key={j} className="flex-shrink-0 w-72 p-3 bg-gray-100 dark:bg-gray-800/50 rounded-2xl animate-pulse border border-gray-200 dark:border-gray-800">
                  <div className="flex gap-3">
                    {/* Image Placeholder */}
                    <div className="w-24 h-24 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                    
                    {/* Content Placeholders */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        {/* Title and Tag */}
                        <div className="flex justify-between items-start mb-2">
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                          <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                        {/* Description */}
                        <div className="space-y-1">
                          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                          <div className="h-2 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </div>
                      
                      {/* Price and Button */}
                      <div className="flex justify-between items-end mt-auto">
                        <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-6 w-14 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const dishes   = [popularDishes, trendingDishes, quickBitesDishes];
  const handlers = [onShowAllPopular, onShowAllTrending, onShowAllQuickBites];

  return (
    <div className="py-4 space-y-4">
      {SECTION_META.map((meta, i) => (
        <SectionRow
          key={meta.id}
          meta={meta}
          dishes={dishes[i]}
          onShowAll={handlers[i]}
        />
      ))}
    </div>
  );
});