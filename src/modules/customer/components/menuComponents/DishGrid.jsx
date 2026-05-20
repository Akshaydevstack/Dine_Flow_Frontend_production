import { Check, LayoutGrid, List } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { DishCardGrid, DishCardList } from "./DishCard";

/* ── Skeleton ─────────────────────────────────────────────────────────────── */
function Skeleton({ viewMode }) {
  if (viewMode === "list") {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse flex overflow-hidden">
        <div className="w-[100px] flex-shrink-0 h-[88px] bg-gray-200 dark:bg-gray-700/60" />
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700/60 rounded-md" />
            <div className="h-2.5 w-1/3 bg-gray-200 dark:bg-gray-700/60 rounded-md" />
            <div className="h-2.5 w-2/3 bg-gray-200 dark:bg-gray-700/60 rounded-md" />
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="h-4 w-14 bg-gray-200 dark:bg-gray-700/60 rounded-md" />
            <div className="h-7 w-14 bg-gray-200 dark:bg-gray-700/60 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="h-[120px] bg-gray-200 dark:bg-gray-700/60" />
      <div className="p-2.5 space-y-2">
        <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700/60 rounded-md" />
        <div className="h-2.5 w-1/3 bg-gray-200 dark:bg-gray-700/60 rounded-md" />
        <div className="h-2.5 w-2/3 bg-gray-200 dark:bg-gray-700/60 rounded-md" />
        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="h-4 w-14 bg-gray-200 dark:bg-gray-700/60 rounded-md" />
          <div className="h-7 w-12 bg-gray-200 dark:bg-gray-700/60 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function SkeletonGrid({ viewMode, count = 6 }) {
  return (
    <div
      className={
        viewMode === "grid" ? "grid grid-cols-2 gap-2.5" : "space-y-2.5"
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} viewMode={viewMode} />
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────── */

export default function DishGrid({
  dishes,
  isLoading,
  isLoadingMore,
  hasMore,
  searchInput,
  showAllPopular,
  showAllTrending,
  showAllQuickBites,
  selectedCategory,
  categories,
  totalItems,
  onLoadMore,
  onClearSearch,
}) {
  const [viewMode, setViewMode] = useState("grid");

  // OPTIMIZATION: Use local state to hold "stale" data during loading
  const [displayedDishes, setDisplayedDishes] = useState(dishes);
  const prevLoading = useRef(isLoading);

  useEffect(() => {
    const wasLoading = prevLoading.current;
    prevLoading.current = isLoading;

    if (dishes.length > 0) {
      // If we have data, update immediately (or when fetch finishes with data)
      setDisplayedDishes(dishes);
    } else if (wasLoading && !isLoading && dishes.length === 0) {
      // ONLY show the empty state if we just FINISHED a loading cycle with 0 results.
      // This prevents the split-second flash when switching filters.
      setDisplayedDishes([]);
    }
  }, [dishes, isLoading]);

  // Infinite scroll
  const observerTarget = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );
    const el = observerTarget.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, isLoading, isLoadingMore, onLoadMore]);

  const getTitle = () => {
    if (showAllPopular) return "Popular Dishes";
    if (showAllTrending) return "Trending Dishes";
    if (showAllQuickBites) return "Quick Bites";
    if (selectedCategory !== "all")
      return (
        categories.find((c) => c.public_id === selectedCategory)?.name ??
        "All Dishes"
      );
    return "All Dishes";
  };

  // State calculations
  const isInitialLoad = isLoading && displayedDishes.length === 0;
  const isRefreshing = isLoading && displayedDishes.length > 0;
  const isGenuinelyEmpty = !isLoading && dishes.length === 0;

  return (
    <div className="px-3 py-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[13px] font-bold text-gray-900 dark:text-white">
            {getTitle()}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">
            {isInitialLoad
              ? "Loading…"
              : `${totalItems ?? displayedDishes.length} ${(totalItems ?? displayedDishes.length) === 1 ? "item" : "items"} available`}
          </p>
        </div>

        <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {[
            ["grid", LayoutGrid],
            ["list", List],
          ].map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`p-2 rounded-lg transition-all duration-150 ${
                viewMode === mode
                  ? "bg-white dark:bg-gray-700 text-violet-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      {isInitialLoad ? (
        <SkeletonGrid viewMode={viewMode} count={6} />
      ) : isGenuinelyEmpty ? (
        <div className="py-12">
          <div className="max-w-xs mx-auto text-center bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 p-10">
            <div className="text-5xl mb-4 opacity-30">🍽️</div>
            <h3 className="text-[14px] font-bold text-gray-900 dark:text-white mb-1">
              No dishes found
            </h3>
            <p className="text-[11px] text-gray-400 mb-4">
              {searchInput
                ? `No results for "${searchInput}"`
                : "Try adjusting your filters"}
            </p>
            {searchInput && (
              <button
                onClick={onClearSearch}
                className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-[12px] active:scale-95 transition-transform"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`transition-opacity duration-200 ${isRefreshing ? "opacity-50 pointer-events-none" : "opacity-100"}`}
        >
          <div
            className={
              viewMode === "grid" ? "grid grid-cols-2 gap-2.5" : "space-y-2.5"
            }
          >
            {displayedDishes.map((dish) =>
              viewMode === "grid" ? (
                <DishCardGrid key={dish.public_id} dish={dish} />
              ) : (
                <DishCardList key={dish.public_id} dish={dish} />
              ),
            )}
          </div>
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={observerTarget} className="pt-3">
        {isLoadingMore && <SkeletonGrid viewMode={viewMode} count={4} />}
        {!hasMore &&
          !isLoadingMore &&
          displayedDishes.length > 0 &&
          !isLoading && (
            <div className="py-4 flex justify-center">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Check className="w-3 h-3 text-gray-400" />
                <span className="text-[11px] text-gray-400 font-medium">
                  All dishes loaded
                </span>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
