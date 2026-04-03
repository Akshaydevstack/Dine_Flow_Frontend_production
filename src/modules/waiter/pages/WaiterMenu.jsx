import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronLeft,
  Plus,
  Minus,
  Flame,
  Star,
  Check,
  Loader2,
  AlertCircle,
  LayoutGrid,
  List,
  UtensilsCrossed,
  Clock,
  Tag,
  Sparkles,
  ShoppingCart,
  ChefHat
} from "lucide-react";
import {
  fetchWaiterMenuDishes,
  setWaiterSearchQuery,
  setWaiterSelectedCategory,
  setWaiterPriceRange,
  setWaiterIsVeg,
  setWaiterIsSpicy,
  setWaiterSortBy,
  setWaiterCurrentPage,
  resetWaiterMenu,
  selectWaiterDishes,
  selectWaiterMenuFilters,
  selectWaiterMenuPagination,
  selectWaiterMenuLoading,
  selectWaiterMenuLoadingMore,
  selectWaiterMenuError,
  selectWaiterMenuFetched,
} from "../../../store/slices/waiterSlice/Waitermenudishesslice";
import { addToWaiterCart, updateWaiterCartItem, removeFromWaiterCart} from "../../../store/slices/waiterSlice/waiterCartSlice";
import { fetchWaiterCategories } from "../../../store/slices/waiterSlice/waiterCategorieSlice";

/* =========================================================
   SKELETONS
========================================================= */

const DishCardSkeleton = ({ viewMode }) => {
  if (viewMode === "list") {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 animate-pulse flex gap-3">
        <div className="w-24 h-24 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
        <div className="flex-1 py-1">
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-1.5" />
          <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
          <div className="flex items-center justify-between">
            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-pulse">
      <div className="h-40 bg-slate-200 dark:bg-slate-700" />
      <div className="p-3">
        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-1.5" />
        <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
        <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
        <div className="flex items-center justify-between">
          <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

const CategorySkeleton = () => (
  <div className="flex gap-2 overflow-x-auto pb-1">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex-shrink-0 h-9 w-20 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
    ))}
  </div>
);


/* =========================================================
   VEG INDICATOR
========================================================= */

const VegDot = ({ isVeg, size = "sm" }) => (
  <span className={`inline-flex items-center justify-center rounded-sm border-2 flex-shrink-0 ${
    isVeg ? "border-emerald-500" : "border-rose-500"
  } ${size === "sm" ? "w-4 h-4" : "w-5 h-5"}`}>
    <div className={`rounded-full ${isVeg ? "bg-emerald-500" : "bg-rose-500"} ${size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5"}`} />
  </span>
);

/* =========================================================
   DISH CARD - GRID (Enhanced)
========================================================= */

const DishCardGrid = ({ dish, qty, onAdd, onRemove, itemLoading, onGoToCart }) => (
  <Link
    to={`/waiter/dishes/${dish.public_id}`}
    className={`flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${
      qty > 0
        ? "border-emerald-400/60 dark:border-emerald-500/40 ring-1 ring-emerald-400/30 dark:ring-emerald-500/20"
        : "border-slate-200/80 dark:border-slate-700/80"
    }`}
  >
    {/* Image */}
    <div className="relative h-40 bg-slate-100 dark:bg-slate-700 overflow-hidden">
      {dish.images?.[0] ? (
        <img
          src={dish.images[0]}
          alt={dish.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
          <UtensilsCrossed className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          <span className="text-[10px] text-slate-400 dark:text-slate-500">No photo</span>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* Top-left: veg dot */}
      <div className="absolute top-2 left-2">
        <VegDot isVeg={dish.is_veg} />
      </div>

      {/* Top-right: spicy */}
      {dish.is_spicy && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center shadow-md">
          <Flame className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      {/* Bottom: badges row */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5">
        {dish.is_popular && (
          <span className="flex items-center gap-0.5 px-2 py-0.5 bg-amber-500 rounded-md shadow-md">
            <Star className="w-2.5 h-2.5 text-white fill-white" />
            <span className="text-white text-[9px] font-bold">Popular</span>
          </span>
        )}
        {dish.preparation_time && (
          <span className="flex items-center gap-0.5 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-md ml-auto">
            <Clock className="w-2.5 h-2.5 text-white/80" />
            <span className="text-white/90 text-[9px] font-medium">{dish.preparation_time}m</span>
          </span>
        )}
      </div>
    </div>

    {/* Body — flex-col so price row always sits at the bottom */}
    <div className="p-3 flex flex-col flex-1">
      {/* Name */}
      <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight line-clamp-1 mb-0.5">
        {dish.name}
      </h3>

      {/* Category */}
      {dish.category?.name && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
          <Tag className="w-2.5 h-2.5" />
          {dish.category.name}
        </p>
      )}

      {/* Description — fixed 2-line clamp so every card has same height */}
      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[28px]">
        {dish.description || ""}
      </p>

      {/* Rating row — always occupies space even when absent */}
      <div className="flex items-center gap-1 mt-1.5 mb-2 min-h-[16px]">
        {dish.average_rating > 0 ? (
          <>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-2.5 h-2.5 ${s <= Math.round(dish.average_rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-600 fill-current"}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {dish.average_rating}
              {dish.review_count > 0 && ` (${dish.review_count})`}
            </span>
          </>
        ) : null}
      </div>

      {/* Price + add — pushed to bottom with mt-auto */}
      <div className="flex items-center justify-between gap-2 mt-auto min-w-0">
        <div className="flex items-baseline gap-1 min-w-0 flex-shrink">
          <span className="text-sm font-extrabold text-violet-600 dark:text-violet-400 whitespace-nowrap">₹{dish.price}</span>
          {dish.original_price && dish.original_price > dish.price && qty==0  && (
            <span className="text-[10px] text-slate-400 line-through whitespace-nowrap">₹{dish.original_price}</span>
          )}
        </div>
        {qty > 0 ? (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onGoToCart(); }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-xl transition-colors active:scale-95 shadow-md shadow-emerald-500/25 whitespace-nowrap flex-shrink-0"
          >
            <ShoppingCart className="w-3 h-3 flex-shrink-0" />
            Go to Cart
          </button>
        ) : (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(); }}
            disabled={itemLoading}
            className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-bold rounded-xl flex items-center gap-1 transition-colors active:scale-95 shadow-md shadow-violet-500/30 disabled:opacity-50 whitespace-nowrap flex-shrink-0"
          >
            {itemLoading
              ? <Loader2 className="w-3 h-3 text-white animate-spin" />
              : "Add"
            }
          </button>
        )}
      </div>
    </div>
  </Link>
);

/* =========================================================
   DISH CARD - LIST (Enhanced)
========================================================= */

const DishCardList = ({ dish, qty, onAdd, onRemove, itemLoading, onGoToCart }) => (
  <Link
    to={`/waiter/dishes/${dish.public_id}`}
    className={`block bg-white dark:bg-slate-800 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
      qty > 0
        ? "border-emerald-400/60 dark:border-emerald-500/40 ring-1 ring-emerald-400/30 dark:ring-emerald-500/20"
        : "border-slate-200/80 dark:border-slate-700/80"
    }`}
  >
    <div className="flex gap-0">
      {/* Image */}
      <div className="relative w-28 flex-shrink-0 bg-slate-100 dark:bg-slate-700 self-stretch overflow-hidden">
        {dish.images?.[0] ? (
          <img src={dish.images[0]} alt={dish.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed className="w-7 h-7 text-slate-300 dark:text-slate-600" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <VegDot isVeg={dish.is_veg} size="sm" />
        </div>
        {dish.is_popular && (
          <div className="absolute bottom-0 left-0 right-0 py-1 bg-amber-500 flex items-center justify-center gap-0.5">
            <Star className="w-2.5 h-2.5 text-white fill-white" />
            <span className="text-white text-[9px] font-bold">Popular</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 p-3">
        {/* Name + badges */}
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight line-clamp-1 flex-1">
            {dish.name}
          </h3>
        </div>

        {/* Category */}
        {dish.category?.name && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
            <Tag className="w-2.5 h-2.5" />
            {dish.category.name}
          </p>
        )}

        {/* Description */}
        {dish.description && (
          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-1.5 leading-relaxed">
            {dish.description}
          </p>
        )}

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-1 mb-2">
          {dish.is_spicy && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-[9px] font-semibold rounded-md">
              <Flame className="w-2.5 h-2.5" /> Spicy
            </span>
          )}
          {dish.preparation_time && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[9px] font-semibold rounded-md">
              <Clock className="w-2.5 h-2.5" /> {dish.preparation_time}m
            </span>
          )}
          {dish.average_rating > 0 && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-[9px] font-semibold rounded-md">
              <Star className="w-2.5 h-2.5 fill-current" /> {dish.average_rating}
            </span>
          )}
        </div>

        {/* Price + actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-extrabold text-violet-600 dark:text-violet-400">₹{dish.price}</span>
            {dish.original_price && dish.original_price > dish.price && (
              <span className="text-[10px] text-slate-400 line-through">₹{dish.original_price}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {qty > 0 ? (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onGoToCart(); }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-xl transition-colors active:scale-95 shadow-md shadow-emerald-500/25"
              >
                <ShoppingCart className="w-3 h-3" />
                Go to Cart
              </button>
            ) : (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(); }}
                disabled={itemLoading}
                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-bold rounded-xl flex items-center gap-1 transition-colors active:scale-95 shadow-md shadow-violet-500/20 disabled:opacity-50"
              >
                {itemLoading
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : "Add"
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </Link>
);



/* =========================================================
   MAIN PAGE
========================================================= */

export default function WaiterMenu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const dishes      = useSelector(selectWaiterDishes);
  const filters     = useSelector(selectWaiterMenuFilters);
  const pagination  = useSelector(selectWaiterMenuPagination);
  const loading     = useSelector(selectWaiterMenuLoading);
  const loadingMore = useSelector(selectWaiterMenuLoadingMore);
  const error       = useSelector(selectWaiterMenuError);
  const fetched     = useSelector(selectWaiterMenuFetched);
  const cartItems   = useSelector((state) => state.waiterCart.items);
  const cartCount   = useSelector((state) => state.waiterCart.cartCount);
  const categories = useSelector((state)=> state.waiterCategories.categories)
  const categoriesLoading = useSelector((state)=> state.waiterCategories.loading)
  const categoriesFetched = useSelector((state)=> state.waiterCategories.fetched)

  const [searchInput,       setSearchInput]       = useState("");
  const [showSearch,        setShowSearch]        = useState(false);
  const [showFilters,       setShowFilters]       = useState(false);
  const [viewMode,          setViewMode]          = useState("grid");
  const [loadingDishId,     setLoadingDishId]     = useState(null);

  const searchDebounceRef = useRef();
  const observerRef       = useRef();

  

  useEffect(() => {
    if (!fetched || filters.currentPage > 1) {
      dispatch(fetchWaiterMenuDishes(filters));
    }

    if (!categoriesFetched){
      dispatch(fetchWaiterCategories())
    }
  }, [dispatch, filters]);

  useEffect(() => {
    setSearchInput(filters.searchQuery || "");
  }, [filters.searchQuery]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      dispatch(setWaiterSearchQuery(value));
    }, 300);
  };

  const lastDishRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && pagination.hasNext && !loadingMore) {
            dispatch(setWaiterCurrentPage(filters.currentPage + 1));
          }
        },
        { threshold: 0.1 }
      );
      if (node) observerRef.current.observe(node);
    },
    [loading, loadingMore, pagination.hasNext, filters.currentPage, dispatch]
  );

  const getQty = (dishId) => {
    const item = cartItems.find((i) => i.dish_id === dishId);
    return item ? item.quantity : 0;
  };

  const handleAdd = async (dishId) => {
    const currentQty = getQty(dishId);
    setLoadingDishId(dishId);
    try {
      if (currentQty === 0) {
        await dispatch(addToWaiterCart({ dish_id: dishId, quantity: 1 })).unwrap();
      } else {
        await dispatch(updateWaiterCartItem({ dish_id: dishId, quantity: currentQty + 1 })).unwrap();
      }
    } catch (e) {
      console.error("Add to cart failed", e);
    } finally {
      setLoadingDishId(null);
    }
  };

  const handleRemove = async (dishId, currentQty) => {
    setLoadingDishId(dishId);
    try {
      if (currentQty <= 1) {
        await dispatch(removeFromWaiterCart(dishId)).unwrap();
      } else {
        await dispatch(updateWaiterCartItem({ dish_id: dishId, quantity: currentQty - 1 })).unwrap();
      }
    } catch (e) {
      console.error("Remove from cart failed", e);
    } finally {
      setLoadingDishId(null);
    }
  };

  const getActiveFiltersCount = () => {
    let n = 0;
    if (filters.selectedCategory !== "all") n++;
    if (filters.isVeg !== null) n++;
    if (filters.isSpicy !== null) n++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) n++;
    if (filters.sortBy !== "priority") n++;
    return n;
  };

  const handleResetFilters = () => {
    dispatch(resetWaiterMenu());
    setSearchInput("");
  };

  const sortOptions = [
    { value: "priority",   label: "Recommended" },
    { value: "popular",    label: "Most Popular" },
    { value: "newest",     label: "Newest First" },
    { value: "price-low",  label: "Price: Low → High" },
    { value: "price-high", label: "Price: High → Low" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="px-3 py-2.5">

          {/* Row 1 */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:scale-95 transition-transform"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-violet-600" />
                  Menu
                </h1>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                  {fetched
                    ? `${pagination.totalItems} dishes available`
                    : "Loading menu…"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                  showSearch
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setShowFilters(true)}
                className="relative w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 active:scale-95 transition-transform"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {getActiveFiltersCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>

              {/* Cart badge — uses cartCount from waiterCart slice */}
              {cartCount > 0 && (
                <button
                  onClick={() => navigate("/waiter/cart")}
                  className="relative w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shadow-md shadow-violet-500/30 active:scale-95 transition-transform"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-white" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Search bar */}
          {showSearch && (
            <div className="relative mb-2.5 animate-in slide-in-from-top duration-200">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search dishes..."
                autoFocus
                className="w-full pl-9 pr-9 py-2 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(""); dispatch(setWaiterSearchQuery("")); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                </button>
              )}
            </div>
          )}

          {/* Category pills */}
          {categoriesLoading ? (
            <CategorySkeleton />
          ) : (
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide -mx-3 px-3">
              <button
                onClick={() => dispatch(setWaiterSelectedCategory("all"))}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                  filters.selectedCategory === "all"
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/25"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.public_id}
                  onClick={() => dispatch(setWaiterSelectedCategory(cat.public_id))}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                    filters.selectedCategory === cat.public_id
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/25"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── FILTERS SHEET ── */}
      {showFilters && (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-3xl p-5 pb-6 mb-20 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/30">
                  <SlidersHorizontal className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Filters & Sort</h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{getActiveFiltersCount()} active</p>
                </div>
              </div>
              <button onClick={() => setShowFilters(false)} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:scale-95">
                <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Sort */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Sort By</label>
                <div className="grid grid-cols-2 gap-2">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => dispatch(setWaiterSortBy(opt.value))}
                      className={`p-2.5 rounded-xl text-xs font-semibold text-left relative transition-all active:scale-95 ${
                        filters.sortBy === opt.value
                          ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {opt.label}
                      {filters.sortBy === opt.value && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diet */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Diet Preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "All",        value: null  },
                    { label: "🥦 Veg",     value: true  },
                    { label: "🍖 Non-Veg", value: false },
                  ].map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => dispatch(setWaiterIsVeg(opt.value))}
                      className={`py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                        filters.isVeg === opt.value
                          ? opt.value === true
                            ? "bg-emerald-500 text-white shadow-md"
                            : opt.value === false
                            ? "bg-rose-500 text-white shadow-md"
                            : "bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spicy */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Spice Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "All",          value: null },
                    { label: "🌶️ Spicy Only", value: true },
                  ].map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => dispatch(setWaiterIsSpicy(opt.value))}
                      className={`py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                        filters.isSpicy === opt.value
                          ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  Price Range · ₹{filters.priceRange.min} – {filters.priceRange.max === 10000 ? "Any" : `₹${filters.priceRange.max}`}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "All",        min: 0,    max: 10000 },
                    { label: "Under ₹200", min: 0,    max: 200   },
                    { label: "₹200–₹500",  min: 200,  max: 500   },
                    { label: "₹500–₹1k",   min: 500,  max: 1000  },
                    { label: "Above ₹1k",  min: 1000, max: 10000 },
                  ].map((range) => (
                    <button
                      key={range.label}
                      onClick={() => dispatch(setWaiterPriceRange({ min: range.min, max: range.max }))}
                      className={`py-2 rounded-xl text-[11px] font-semibold transition-all active:scale-95 ${
                        filters.priceRange.min === range.min && filters.priceRange.max === range.max
                          ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5 pt-5 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => { handleResetFilters(); setShowFilters(false); }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm active:scale-98 transition-transform"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-purple-500/30 active:scale-98 transition-transform"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="px-3 pt-3 pb-24">

      {/* Result count + view toggle */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {filters.selectedCategory !== "all"
                ? categories.find((c) => c.public_id === filters.selectedCategory)?.name || "Category"
                : "All Dishes"}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Showing {dishes.length} of {pagination.totalItems}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-all ${viewMode === "grid" ? "bg-white dark:bg-slate-700 text-violet-600 shadow-sm" : "text-slate-400"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-all ${viewMode === "list" ? "bg-white dark:bg-slate-700 text-violet-600 shadow-sm" : "text-slate-400"}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {getActiveFiltersCount() > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-hide">
            {filters.isVeg !== null && (
              <span className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold rounded-full">
                {filters.isVeg ? "🥦 Veg" : "🍖 Non-Veg"}
                <button onClick={() => dispatch(setWaiterIsVeg(null))}>
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {filters.isSpicy !== null && (
              <span className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-[10px] font-semibold rounded-full">
                🌶️ Spicy
                <button onClick={() => dispatch(setWaiterIsSpicy(null))}>
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {filters.sortBy !== "priority" && (
              <span className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-[10px] font-semibold rounded-full">
                <Sparkles className="w-2.5 h-2.5" />
                {sortOptions.find((s) => s.value === filters.sortBy)?.label}
                <button onClick={() => dispatch(setWaiterSortBy("priority"))}>
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {(filters.priceRange.min > 0 || filters.priceRange.max < 10000) && (
              <span className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-semibold rounded-full">
                ₹{filters.priceRange.min}–{filters.priceRange.max === 10000 ? "∞" : `₹${filters.priceRange.max}`}
                <button onClick={() => dispatch(setWaiterPriceRange({ min: 0, max: 10000 }))}>
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Content */}
        {loading && !fetched ? (
          <div className={viewMode === "grid" ? "grid grid-cols-2 gap-2.5" : "space-y-2.5"}>
            {[...Array(8)].map((_, i) => <DishCardSkeleton key={i} viewMode={viewMode} />)}
          </div>
        ) : error ? (
          <div className="bg-rose-50 dark:bg-rose-950/30 rounded-2xl p-4 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="font-semibold text-rose-900 dark:text-rose-100 mb-0.5 text-sm">Failed to load menu</h3>
              <p className="text-xs text-rose-700 dark:text-rose-300">{error.message || "Please try again"}</p>
            </div>
          </div>
        ) : dishes.length === 0 ? (
          <div className="text-center py-14">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-3">
              <UtensilsCrossed className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">No dishes found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Try adjusting your filters</p>
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={handleResetFilters}
                className="px-5 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold text-sm shadow-md shadow-purple-500/30 active:scale-95 transition-transform"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-2 gap-2.5" : "space-y-2.5"}>
            {dishes.map((dish, index) => {
              const isLast      = index === dishes.length - 1;
              const qty         = getQty(dish.public_id);
              const itemLoading = loadingDishId === dish.public_id;
              const cardProps   = {
                dish,
                qty,
                itemLoading,
                onAdd:      () => handleAdd(dish.public_id),
                onRemove:   () => handleRemove(dish.public_id, qty),
                onGoToCart: () => navigate("/waiter/cart"),
              };
              return (
                <div key={dish.public_id} ref={isLast ? lastDishRef : null}>
                  {viewMode === "grid"
                    ? <DishCardGrid {...cardProps} />
                    : <DishCardList {...cardProps} />
                  }
                </div>
              );
            })}
          </div>
        )}

        {/* Load more skeletons */}
        {loadingMore && (
          <div className={`mt-2.5 ${viewMode === "grid" ? "grid grid-cols-2 gap-2.5" : "space-y-2.5"}`}>
            {[...Array(4)].map((_, i) => <DishCardSkeleton key={i} viewMode={viewMode} />)}
          </div>
        )}

        {/* All loaded */}
        {!loading && !loadingMore && dishes.length > 0 && !pagination.hasNext && (
          <div className="text-center py-5 mt-3">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
              <Check className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">All dishes loaded</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}