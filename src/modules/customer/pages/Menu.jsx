import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { fetchCategories } from "../../../store/slices/categorieSlice";
import {
  fetchMenuDishes,
  fetchQuickSections,
  setSearchQuery,
  setSelectedCategory,
  setSortBy,
  setCurrentPage,
  setIsVeg,
  setIsSpicy,
  resetMenu,
  clearError,
  selectDishes,
  selectPopular,
  selectTrending,
  selectQuickBites,
  selectFilters,
  selectPagination,
  selectLoading,
  selectSectionsLoading,
  selectFetched,
  selectSectionsFetched,
  selectError,
} from "../../../store/slices/menuDishesSlice";

import SearchBar from "../components/menuComponents/Searchbar";
import CategoryFilter from "../components/menuComponents/Categoryfilter";
import ActiveFilters from "../components/menuComponents/Activefilters";
import QuickSections from "../components/menuComponents/Quicksections";
import DishGrid from "../components/menuComponents/DishGrid";
import FilterPanel from "../components/menuComponents/Filterpanel";
import ErrorBanner from "../components/menuComponents/Errorbanner";
import FeaturesBanner from "../components/menuComponents/Featuresbanner";

export default function Menu() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  // ── Redux selectors ──────────────────────────────────────────────────────────
  const dishes = useAppSelector(selectDishes);
  const popularDishes = useAppSelector(selectPopular);
  const trendingDishes = useAppSelector(selectTrending);
  const quickBitesDishes = useAppSelector(selectQuickBites);
  const filters = useAppSelector(selectFilters);
  const pagination = useAppSelector(selectPagination);
  const loading = useAppSelector(selectLoading);
  const sectionsLoading = useAppSelector(selectSectionsLoading);
  const fetched = useAppSelector(selectFetched);
  const sectionsFetched = useAppSelector(selectSectionsFetched);
  const error = useAppSelector(selectError);
  const { categories, fetched: categoriesFetched } = useAppSelector(
    (s) => s.categories,
  );

  // ── Local UI state ───────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showAllPopular, setShowAllPopular] = useState(false);
  const [showAllTrending, setShowAllTrending] = useState(false);
  const [showAllQuickBites, setShowAllQuickBites] = useState(false);
  const [accumulatedDishes, setAccumulatedDishes] = useState(() => dishes);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const searchDebounceTimer = useRef(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const initialFetchDone = useRef(fetched);

  // ── FLICKER FIX ──────────────────────────────────────────────────────────────
  // spacerRef points to the spacer div, headerRef to the fixed header.
  // The ref callback fires synchronously when the header mounts and measures
  // its height immediately — before the browser paints — so the spacer is
  // correct on the very first render and never causes a layout jump.
  const spacerRef = useRef(null);
  const headerRef = useRef(null);

  const setHeaderRef = useCallback((node) => {
    headerRef.current = node;
    if (!node) return;

    // Sync read on mount — no state update, no re-render, no flicker
    const syncHeight = () => {
      if (spacerRef.current) {
        spacerRef.current.style.height = `${node.offsetHeight}px`;
      }
    };

    // Immediate sync measurement
    syncHeight();

    // Then keep it updated if the header changes height (filter row appearing etc.)
    const ro = new ResizeObserver(syncHeight);
    ro.observe(node);

    // Cleanup stored on the ref itself so we can disconnect on unmount
    headerRef._ro = ro;
  }, []);

  // Disconnect ResizeObserver on unmount
  useEffect(() => {
    return () => {
      if (headerRef._ro) headerRef._ro.disconnect();
    };
  }, []);

  // ── Hide-on-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < 10) setHeaderVisible(true);
        else if (y > lastScrollY.current + 8) {
          setHeaderVisible(false);
          setIsSearchOpen(false);
        } else if (y < lastScrollY.current - 8) setHeaderVisible(true);
        lastScrollY.current = y;
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Data fetches ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!categoriesFetched) dispatch(fetchCategories());
  }, [dispatch, categoriesFetched]);

  useEffect(() => {
    if (!sectionsFetched && !sectionsLoading) dispatch(fetchQuickSections());
  }, [dispatch, sectionsFetched, sectionsLoading]);

  useEffect(() => {
    if (!fetched && !loading) dispatch(fetchMenuDishes(filters));
    initialFetchDone.current = true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && cat !== filters.selectedCategory) {
      dispatch(setSelectedCategory(cat));
      setAccumulatedDishes([]);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);
    searchDebounceTimer.current = setTimeout(() => {
      if (searchInput !== filters.searchQuery)
        dispatch(setSearchQuery(searchInput));
    }, 300);
    return () => clearTimeout(searchDebounceTimer.current);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!initialFetchDone.current) return;
    if (filters.currentPage === 1) setAccumulatedDishes([]);
    dispatch(fetchMenuDishes(filters));
  }, [
    dispatch,
    filters.searchQuery,
    filters.selectedCategory,
    filters.sortBy,
    filters.currentPage,
    filters.isVeg,
    filters.isSpicy,
    filters.priceRange?.min,
    filters.priceRange?.max,
  ]);

  useEffect(() => {
    if (loading || dishes.length === 0) return;
    setAccumulatedDishes((prev) => {
      if (filters.currentPage === 1) {
        if (
          prev.length === dishes.length &&
          prev[0]?.public_id === dishes[0]?.public_id
        )
          return prev;
        return dishes;
      }
      const ids = new Set(prev.map((d) => d.public_id));
      const newOnes = dishes.filter((d) => !ids.has(d.public_id));
      return newOnes.length === 0 ? prev : [...prev, ...newOnes];
    });
    setIsLoadingMore(false);
  }, [dishes, loading, filters.currentPage]);

  useEffect(() => {
    let count = 0;
    if (filters.selectedCategory !== "all") count++;
    if (filters.isVeg) count++;
    if (filters.isSpicy) count++;
    if (filters.priceRange?.min > 0 || filters.priceRange?.max < 5000) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  useEffect(() => {
    return () => {
      if (searchDebounceTimer.current)
        clearTimeout(searchDebounceTimer.current);
    };
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleCategorySelect = useCallback(
    (catId) => {
      dispatch(setSelectedCategory(catId));
      dispatch(setCurrentPage(1));
      setShowAllPopular(false);
      setShowAllTrending(false);
      setShowAllQuickBites(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [dispatch],
  );

  const handleShowAllPopular = useCallback(() => {
    setShowAllPopular(true);
    setShowAllTrending(false);
    setShowAllQuickBites(false);
    dispatch(setSelectedCategory("all"));
    dispatch(setSortBy("popular"));
    setAccumulatedDishes([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dispatch]);

  const handleShowAllTrending = useCallback(() => {
    setShowAllTrending(true);
    setShowAllPopular(false);
    setShowAllQuickBites(false);
    dispatch(setSelectedCategory("all"));
    dispatch(setSortBy("priority"));
    setAccumulatedDishes([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dispatch]);

  const handleShowAllQuickBites = useCallback(() => {
    setShowAllQuickBites(true);
    setShowAllPopular(false);
    setShowAllTrending(false);
    dispatch(setSelectedCategory("all"));
    setAccumulatedDishes([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dispatch]);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    dispatch(setSearchQuery(""));
    setIsSearchOpen(false);
  }, [dispatch]);

  const handleSortChange = useCallback(
    (sortId) => {
      dispatch(setSortBy(sortId));
      setAccumulatedDishes([]);
      setShowAllPopular(false);
      setShowAllTrending(false);
      setShowAllQuickBites(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [dispatch],
  );

  const handleRetry = useCallback(() => {
    dispatch(clearError());
    dispatch(fetchMenuDishes(filters));
  }, [dispatch, filters]);

  const handleClearFilters = useCallback(() => {
    dispatch(setSelectedCategory("all")); 
    dispatch(setSortBy("")); 
    dispatch(setSearchQuery("")); 
    
   
    dispatch(setIsVeg(null));
    dispatch(setIsSpicy(null));
    dispatch(setPriceRange({ min: 0, max: 10000 }));

    setAccumulatedDishes([]);
    setShowFilterPanel(false); 
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dispatch]);

  const handleToggleVeg = useCallback(() => {
    dispatch(setIsVeg(!filters.isVeg));
    setAccumulatedDishes([]);
  }, [dispatch, filters.isVeg]);
  const handleToggleSpicy = useCallback(() => {
    dispatch(setIsSpicy(!filters.isSpicy));
    setAccumulatedDishes([]);
  }, [dispatch, filters.isSpicy]);

  const handleLoadMore = useCallback(() => {
    if (pagination.hasNext && !loading && !isLoadingMore) {
      setIsLoadingMore(true);
      dispatch(setCurrentPage(filters.currentPage + 1));
    }
  }, [
    dispatch,
    pagination.hasNext,
    loading,
    isLoadingMore,
    filters.currentPage,
  ]);

  // ── Derived ───────────────────────────────────────────────────────────────────
  const shouldShowSections =
    filters.selectedCategory === "all" &&
    !searchInput &&
    !showAllPopular &&
    !showAllTrending &&
    !showAllQuickBites;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f13] pb-24">
      {error && (
        <ErrorBanner
          error={error}
          onRetry={handleRetry}
          onDismiss={() => dispatch(clearError())}
        />
      )}

      {/* Fixed header */}
      <div
        ref={setHeaderRef}
        className={`fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60 shadow-sm transition-transform duration-300 ease-in-out ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ willChange: "transform" }}
      >
        <SearchBar
          searchInput={searchInput}
          isLoading={sectionsLoading}
          onSearchChange={setSearchInput}
          onClearSearch={handleClearSearch}
          onToggleFilter={() => setShowFilterPanel(!showFilterPanel)}
          activeFiltersCount={activeFiltersCount}
          isSearchOpen={isSearchOpen}
          onCloseSearch={() => {
            setIsSearchOpen(false);
            handleClearSearch();
          }}
        />
        <CategoryFilter
          categories={categories}
          isLoading={sectionsLoading}
          selectedCategory={filters.selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
        {activeFiltersCount > 0 && (
          <ActiveFilters
            filters={filters}
            categories={categories}
            onClearAll={handleClearFilters}
            onRemoveCategory={() => dispatch(setSelectedCategory("all"))}
            onRemoveSearch={handleClearSearch}
            onRemoveVeg={handleToggleVeg}
            onRemoveSpicy={handleToggleSpicy}
          />
        )}
      </div>

      {/*
        Spacer — height is written directly to the DOM node via the ResizeObserver
        callback, bypassing React state entirely. Zero re-renders, zero flicker.
      */}
      <div ref={spacerRef} aria-hidden="true" />

      {showFilterPanel && (
        <FilterPanel
          filters={filters}
          categories={categories}
          onClose={() => setShowFilterPanel(false)}
          onSortChange={handleSortChange}
          onCategorySelect={handleCategorySelect}
          onClearAll={handleClearFilters}
          onToggleVeg={handleToggleVeg}
          onToggleSpicy={handleToggleSpicy}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {shouldShowSections && (
          <QuickSections
            popularDishes={popularDishes}
            trendingDishes={trendingDishes}
            quickBitesDishes={quickBitesDishes}
            sectionsLoading={sectionsLoading}
            onShowAllPopular={handleShowAllPopular}
            onShowAllTrending={handleShowAllTrending}
            onShowAllQuickBites={handleShowAllQuickBites}
          />
        )}

        {shouldShowSections && accumulatedDishes.length > 0 && (
          <div className="px-4 pt-4 pb-2 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              All Dishes
            </span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          </div>
        )}

        <DishGrid
          dishes={accumulatedDishes}
          isLoadingMore={isLoadingMore}
          hasMore={pagination.hasNext}
          searchInput={searchInput}
          showAllPopular={showAllPopular}
          showAllTrending={showAllTrending}
          showAllQuickBites={showAllQuickBites}
          selectedCategory={filters.selectedCategory}
          categories={categories}
          totalItems={pagination.totalItems}
          onLoadMore={handleLoadMore}
          onClearSearch={handleClearSearch}
        />

        {shouldShowSections && <FeaturesBanner />}
      </div>
    </div>
  );
}
