import { Search, X, SlidersHorizontal, ArrowLeft } from "lucide-react";
import { useRef, useState, useEffect } from "react";

// ==========================================
// 💀 SKELETON COMPONENT
// ==========================================
export function SearchBarSkeleton() {
  return (
    <div className="flex items-center px-4 h-[60px] gap-3">
      {/* Brand wordmark skeleton */}
      <div className="flex-1 flex flex-col justify-center gap-1.5">
        <div className="h-5 w-28 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-3 w-36 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
      </div>

      {/* Search icon pill skeleton */}
      <div className="w-10 h-10 flex-shrink-0 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />

      {/* Filter button skeleton */}
      <div className="w-10 h-10 flex-shrink-0 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
    </div>
  );
}

// ==========================================
// 🔍 REAL SEARCH BAR COMPONENT
// ==========================================
export default function SearchBar({
  searchInput,
  onSearchChange,
  onClearSearch,
  onToggleFilter,
  activeFiltersCount,
  isLoading // <-- Add an isLoading prop here if you want to swap it internally
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const searchInputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isExpanded]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        if (!searchInput) setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchInput]);

  const handleCollapse = () => {
    if (searchInput) onClearSearch();
    setIsExpanded(false);
  };

  // If loading, show the skeleton instead
  if (isLoading) {
    return <SearchBarSkeleton />;
  }

  return (
    <div
      ref={containerRef}
      className="flex items-center px-4 h-[60px] gap-3"
    >
      {!isExpanded ? (
        <>
          {/* Brand wordmark */}
          <div className="flex-1 flex flex-col justify-center">
            <span className="text-[22px] font-black tracking-tight text-gray-900 dark:text-white leading-none">
              Our Menu
            </span>
            <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium tracking-wide mt-0.5">
              What are you craving?
            </span>
          </div>

          {/* Search icon pill */}
          <button
            onClick={() => setIsExpanded(true)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Search"
          >
            <Search className="w-[18px] h-[18px] text-gray-600 dark:text-gray-300" strokeWidth={2.2} />
          </button>

          {/* Filter button */}
          <button
            onClick={onToggleFilter}
            className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 transition-colors shadow-lg shadow-violet-500/30"
            aria-label="Filters"
          >
            <SlidersHorizontal className="w-[17px] h-[17px] text-white" strokeWidth={2.2} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] flex items-center justify-center bg-rose-500 text-white rounded-full text-[10px] font-bold shadow-sm">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </>
      ) : (
        <>
          {/* Back */}
          <button
            onClick={handleCollapse}
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors -ml-1"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" strokeWidth={2.2} />
          </button>

          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search dishes, cuisines..."
              className="w-full pl-10 pr-9 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-violet-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none text-[14px] font-medium text-gray-900 dark:text-white placeholder:text-gray-400 transition-all duration-200"
            />
            {searchInput && (
              <button
                onClick={onClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-gray-300 dark:bg-gray-600 rounded-full transition-colors hover:bg-gray-400"
                aria-label="Clear"
              >
                <X className="w-3 h-3 text-gray-600 dark:text-gray-200" />
              </button>
            )}
          </div>

          {/* Filter still accessible */}
          <button
            onClick={onToggleFilter}
            className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-2xl bg-violet-600 hover:bg-violet-700 transition-colors shadow-lg shadow-violet-500/30"
            aria-label="Filters"
          >
            <SlidersHorizontal className="w-[17px] h-[17px] text-white" strokeWidth={2.2} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] flex items-center justify-center bg-rose-500 text-white rounded-full text-[10px] font-bold shadow-sm">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </>
      )}
    </div>
  );
}