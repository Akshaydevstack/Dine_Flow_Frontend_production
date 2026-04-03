import { useState, useRef, useCallback, useEffect } from "react";
import { Search, Clock, Star, X, ArrowRight, TrendingUp, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../../api/axiosClient";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  const navigate = useNavigate();
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const cacheRef = useRef({});

  /* ----------------------------------
     Load recent searches from localStorage
  ---------------------------------- */
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  /* ----------------------------------
     Save to recent searches
  ---------------------------------- */
  const saveRecentSearch = useCallback((searchQuery) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  /* ----------------------------------
     Remove a specific recent search
  ---------------------------------- */
  const removeRecentSearch = useCallback((e, searchToRemove) => {
    e.stopPropagation(); // Prevent triggering the search
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== searchToRemove);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  /* ----------------------------------
     Clear all recent searches
  ---------------------------------- */
  const clearAllRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  }, []);

  /* ----------------------------------
     SEARCH with caching
  ---------------------------------- */
  const search = useCallback((value) => {
    const trimmedValue = value.trim();
    
    if (!trimmedValue) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Check cache first
    if (cacheRef.current[trimmedValue]) {
      setResults(cacheRef.current[trimmedValue]);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);

    axiosClient
      .get("/menu/customer/dishes/", {
        params: { search: trimmedValue, page_size: 6 },
        signal: abortRef.current.signal,
      })
      .then((res) => {
        const newResults = res.data.results || [];
        setResults(newResults);
        cacheRef.current[trimmedValue] = newResults;
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "CanceledError") {
          setResults([]);
          setLoading(false);
        }
      });
  }, []);

  /* ----------------------------------
     INPUT CHANGE
  ---------------------------------- */
  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    setOpen(true);

    clearTimeout(debounceRef.current);
    
    if (value.trim()) {
      setLoading(true);
      debounceRef.current = setTimeout(() => search(value), 300);
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [search]);

  /* ----------------------------------
     NAVIGATION
  ---------------------------------- */
  const handleViewAll = useCallback(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    
    saveRecentSearch(trimmedQuery);
    setOpen(false);
    navigate(`/customer/menu?search=${encodeURIComponent(trimmedQuery)}`);
  }, [query, navigate, saveRecentSearch]);

  const handleSelectDish = useCallback((id) => {
    saveRecentSearch(query);
    setOpen(false);
    navigate(`/customer/dish/${id}`);
  }, [navigate, query, saveRecentSearch]);

  const handleRecentSearch = useCallback((searchQuery) => {
    setQuery(searchQuery);
    setOpen(true);
    search(searchQuery);
    inputRef.current?.focus();
  }, [search]);

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
    setLoading(false);
    clearTimeout(debounceRef.current);
    abortRef.current?.abort();
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      handleViewAll();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }, [handleViewAll]);

  /* ----------------------------------
     CLOSE ON BACKDROP CLICK
  ---------------------------------- */
  const handleBackdropClick = useCallback(() => {
    setOpen(false);
  }, []);

  /* ----------------------------------
     CLEANUP
  ---------------------------------- */
  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const showDropdown = open;
  const showRecent = !query && recentSearches.length > 0;
  const hasResults = results.length > 0;

  return (
    <>
      {/* Backdrop - Behind everything */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/30 z-[100]"
          onClick={handleBackdropClick}
          style={{ animation: "fadeIn 0.2s ease-out" }}
        />
      )}

      <div ref={containerRef} className="relative mb-4 z-[101]">
        {/* INPUT */}
        <div className={`flex items-center bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border-2 transition-all ${
          open 
            ? "border-purple-500 shadow-lg" 
            : "border-gray-200 dark:border-gray-700"
        }`}>
          <Search className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors ${
            open ? "text-purple-500" : "text-gray-400 dark:text-gray-500"
          }`} />

          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search for dishes, cuisines..."
            className="flex-1 outline-none text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            autoComplete="off"
          />

          {query && (
            <button 
              onClick={handleClear} 
              className="mr-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all active:scale-90"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}

          {query.trim() && (
            <button
              onClick={handleViewAll}
              className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all active:scale-95 shadow-sm"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* DROPDOWN */}
        {showDropdown && (
          <div 
            className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[70vh] overflow-hidden"
            style={{ animation: "slideDown 0.25s ease-out" }}
          >
            <div className="overflow-y-auto max-h-[70vh] custom-scrollbar">
              
              {/* Recent Searches */}
              {showRecent && (
                <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Recent Searches
                      </span>
                    </div>
                    <button
                      onClick={clearAllRecentSearches}
                      className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  {recentSearches.map((recent, idx) => (
                    <div
                      key={idx}
                      className="group flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      <button
                        onClick={() => handleRecentSearch(recent)}
                        className="flex-1 text-left text-sm text-gray-700 dark:text-gray-300"
                      >
                        {recent}
                      </button>
                      <button
                        onClick={(e) => removeRecentSearch(e, recent)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all active:scale-90"
                        aria-label="Remove search"
                      >
                        <X className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Loading Skeletons */}
              {loading && (
                <div className="p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-3 animate-pulse">
                      <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2" />
                      </div>
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-12" />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && query && !hasResults && (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    No dishes found
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Try searching with different keywords
                  </p>
                </div>
              )}

              {/* Results */}
              {!loading && hasResults && (
                <>
                  <div className="p-2">
                    {results.map((dish, index) => (
                      <button
                        key={dish.public_id}
                        onClick={() => handleSelectDish(dish.public_id)}
                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all text-left group active:scale-[0.98]"
                        style={{
                          animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
                        }}
                      >
                        <div className="relative flex-shrink-0">
                          {dish.images?.[0] ? (
                            <img
                              src={dish.images[0]}
                              alt={dish.name}
                              className="w-16 h-16 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-purple-500/20 transition-all"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {dish.name}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            {dish.average_rating > 0 && (
                              <span className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-md font-medium">
                                <Star className="w-3 h-3 fill-current" />
                                {dish.average_rating}
                              </span>
                            )}
                            {dish.prep_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {dish.prep_time} min
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <span className="text-base font-bold text-gray-900 dark:text-white">
                            ₹{dish.price}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="sticky bottom-0 bg-gradient-to-t from-white dark:from-gray-800 via-white dark:via-gray-800 to-transparent pt-4 pb-2 px-2">
                    <button
                      onClick={handleViewAll}
                      className="w-full py-3 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all border-2 border-dashed border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 active:scale-[0.98]"
                    >
                      View all results for "{query}" →
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}