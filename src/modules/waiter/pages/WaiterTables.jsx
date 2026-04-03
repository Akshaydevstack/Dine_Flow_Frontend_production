import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Users,
  Loader2,
  Grid3x3,
  Sofa,
  Armchair,
  CircleDot,
  Search,
  AlertCircle,
  Sun,
  Moon,
  TrendingUp,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  Check,
  DollarSign,
  Star,
  XCircle,
} from "lucide-react";
import { fetchWaiterZones } from "../../../store/slices/waiterSlice/waiterZonesSlice";
import {
  fetchWaiterTables,
  setZone,
  setStatus,
  setSearch,
  setTableType,
  setCurrentPage,
  resetWaiterTables,
  selectTables,
  selectWaiterFilters,
  selectWaiterPagination,
  selectWaiterLoading,
  selectWaiterError,
  selectWaiterFetched,
} from "../../../store/slices/waiterSlice/waiterTablesSlice";
import useTheme from "../../../hooks/useTheme";
import axiosClient from "../../../api/axiosClient";

// Skeleton Component
const TableCardSkeleton = ({ viewMode }) => {
  if (viewMode === "grid") {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 border-2 border-slate-200 dark:border-slate-700 animate-pulse">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div>
              <div className="h-3.5 w-12 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
              <div className="h-2.5 w-10 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
          <div className="h-5 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
        <div className="space-y-1.5 mb-2">
          <div className="flex items-center justify-between">
            <div className="h-2.5 w-14 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-2.5 w-14 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 border-2 border-slate-200 dark:border-slate-700 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
        <div className="flex-1">
          <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-1.5" />
          <div className="h-2.5 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="w-16 h-7 bg-slate-200 dark:bg-slate-700 rounded-lg flex-shrink-0" />
      </div>
    </div>
  );
};

export default function ModernTables() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const observerRef = useRef();
  const searchDebounceRef = useRef();
  const { theme, setTheme } = useTheme();

  const { zones, fetched: zonesFetched } = useSelector(
    (state) => state.waiterZones,
  );

  const tables = useSelector(selectTables);
  const filters = useSelector(selectWaiterFilters);
  const pagination = useSelector(selectWaiterPagination);
  const loading = useSelector(selectWaiterLoading);
  const error = useSelector(selectWaiterError);
  const fetched = useSelector(selectWaiterFetched);

  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedZoneName, setSelectedZoneName] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [showSearch, setShowSearch] = useState(false);
  const [assigningTable, setAssigningTable] = useState(null);
  const [showAssignError, setShowAssignError] = useState(false);
  const [assignErrorMessage, setAssignErrorMessage] = useState("");
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [showEmpty, setShowEmpty] = useState(false);

  useEffect(() => {
    const savedTableId = localStorage.getItem("table_id");
    if (savedTableId) setSelectedTableId(savedTableId);
  }, []);

  useEffect(() => {
    if (!zonesFetched) dispatch(fetchWaiterZones());
  }, [dispatch, zonesFetched]);

  useEffect(() => {
    dispatch(fetchWaiterTables(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  // Delayed empty state
  useEffect(() => {
    if (tables.length === 0 && !loading && fetched) {
      const timer = setTimeout(() => setShowEmpty(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowEmpty(false);
    }
  }, [tables.length, loading, fetched]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      dispatch(setSearch(value));
    }, 300);
  };

  const handleZoneSelect = (zone) => {
    if (selectedZone === zone.public_id) {
      setSelectedZone(null);
      setSelectedZoneName("");
      dispatch(setZone(null));
    } else {
      setSelectedZone(zone.public_id);
      setSelectedZoneName(zone.name);
      dispatch(setZone(zone.public_id));
    }
  };

  const handleStatusSelect = (status) => dispatch(setStatus(status));
  const handleTableTypeSelect = (type) => dispatch(setTableType(type));

  const handleResetFilters = () => {
    dispatch(resetWaiterTables());
    setSelectedZone(null);
    setSelectedZoneName("");
    setSearchInput("");
  };

  const lastTableElementRef = useCallback(
    (node) => {
      if (loading || isLoadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && pagination.hasNext) {
          setIsLoadingMore(true);
          dispatch(setCurrentPage(filters.currentPage + 1));
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loading, isLoadingMore, pagination.hasNext, filters.currentPage, dispatch],
  );

  useEffect(() => {
    if (!loading && isLoadingMore) setIsLoadingMore(false);
  }, [loading]);

  const getTableIcon = (tableType) => {
    switch (tableType) {
      case "booth":
        return <Sofa className="w-4 h-4" />;
      case "bar":
        return <Armchair className="w-4 h-4" />;
      default:
        return <Grid3x3 className="w-4 h-4" />;
    }
  };

  const getStatusColor = (isOccupied, isSelected) => {
    if (isSelected)
      return {
        gradient: "from-violet-500 to-purple-600",
        bg: "bg-violet-50 dark:bg-violet-950/30",
        text: "text-violet-700 dark:text-violet-300",
        border: "border-violet-200 dark:border-violet-900/50",
        ring: "ring-violet-500/20",
        dot: "bg-violet-500",
        glow: "shadow-violet-500/20",
      };
    return isOccupied
      ? {
          gradient: "from-rose-500 to-red-600",
          bg: "bg-rose-50 dark:bg-rose-950/30",
          text: "text-rose-700 dark:text-rose-300",
          border: "border-rose-200 dark:border-rose-900/50",
          ring: "ring-rose-500/20",
          dot: "bg-rose-500",
          glow: "shadow-rose-500/20",
        }
      : {
          gradient: "from-emerald-500 to-green-600",
          bg: "bg-emerald-50 dark:bg-emerald-950/30",
          text: "text-emerald-700 dark:text-emerald-300",
          border: "border-emerald-200 dark:border-emerald-900/50",
          ring: "ring-emerald-500/20",
          dot: "bg-emerald-500",
          glow: "shadow-emerald-500/20",
        };
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedZone) count++;
    if (filters.status !== "all") count++;
    if (filters.search) count++;
    if (filters.tableType) count++;
    return count;
  };

  const occupancyRate =
    pagination.totalItems > 0
      ? Math.round(
          (tables.filter((t) => t.is_occupied).length / pagination.totalItems) *
            100,
        )
      : 0;

  const handleOrderPlacement = async (table_id) => {
    try {
      setAssigningTable(table_id);
      setShowAssignError(false);
      const res = await axiosClient.get(
        `/auth/waiter/check-tabel-status/${table_id}/`,
      );
      if (!res.data.is_occupied) {
        localStorage.setItem("table_id", table_id);
        setSelectedTableId(table_id);
        navigate("/waiter/menu");
      } else {
        setAssignErrorMessage(
          "This table is currently occupied. Please choose another table.",
        );
        setShowAssignError(true);
        setTimeout(() => setShowAssignError(false), 3000);
      }
    } catch (error) {
      console.error("Error checking table status:", error);
      setAssignErrorMessage("Failed to assign table. Please try again.");
      setShowAssignError(true);
      setTimeout(() => setShowAssignError(false), 3000);
    } finally {
      setAssigningTable(null);
    }
  };

  const handleRemoveSelection = () => {
    localStorage.removeItem("table_id");
    setSelectedTableId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Error Toast */}
      {showAssignError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-rose-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-sm mx-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{assignErrorMessage}</p>
          </div>
        </div>
      )}

      {/* Compact Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="px-3 py-3">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Grid3x3 className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  Tables
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {occupancyRate}% Occupied
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  showSearch
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium active:scale-95 transition-transform relative"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {getActiveFiltersCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-purple-500 transition-colors flex items-center justify-center"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Moon className="w-4 h-4 text-purple-600" />
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="relative mb-3 animate-in slide-in-from-top duration-200">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search tables..."
                autoFocus
                className="w-full pl-9 pr-9 py-2 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    dispatch(setSearch(""));
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                </button>
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-2 backdrop-blur-sm">
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <Grid3x3 className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  Total
                </span>
                <p className="text-base font-bold text-slate-900 dark:text-white ml-auto leading-none">
                  {pagination.totalItems}
                </p>
              </div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-2 backdrop-blur-sm">
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <CircleDot className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  Free
                </span>
                <p className="text-base font-bold text-emerald-700 dark:text-emerald-300 ml-auto leading-none">
                  {tables.filter((t) => !t.is_occupied).length}
                </p>
              </div>
            </div>
            <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-2 backdrop-blur-sm">
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                  <Users className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
                </div>
                <span className="text-[10px] font-medium text-rose-600 dark:text-rose-400">
                  Busy
                </span>
                <p className="text-base font-bold text-rose-700 dark:text-rose-300 ml-auto leading-none">
                  {tables.filter((t) => t.is_occupied).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 pt-3 pb-6">
        {/* Zone Filter */}
        <div className="mb-3">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 scrollbar-hide">
            <button
              onClick={() => {
                setSelectedZone(null);
                setSelectedZoneName("");
                dispatch(setZone(null));
              }}
              className={`flex-shrink-0 px-3 py-2 rounded-xl font-medium text-xs transition-all ${
                !selectedZone
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              All Zones
            </button>
            {zones.map((zone) => (
              <button
                key={zone.public_id}
                onClick={() => handleZoneSelect(zone)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl font-medium text-xs transition-all ${
                  selectedZone === zone.public_id
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {zone.name}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Modal */}
        {showFilters && (
          <div className="fixed inset-0 z-50 animate-in fade-in duration-200">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-3xl p-5 mb-20 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Filters
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {getActiveFiltersCount()} active
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5 block">
                    Table Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "all", label: "All", icon: Grid3x3 },
                      {
                        value: "available",
                        label: "Available",
                        icon: CircleDot,
                      },
                      { value: "occupied", label: "Occupied", icon: Users },
                    ].map((status) => (
                      <button
                        key={status.value}
                        onClick={() => handleStatusSelect(status.value)}
                        className={`relative p-2.5 rounded-xl font-medium text-xs transition-all ${
                          filters.status === status.value
                            ? status.value === "occupied"
                              ? "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/30"
                              : status.value === "available"
                                ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30"
                                : "bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <status.icon className="w-4 h-4 mx-auto mb-1" />
                        <div>{status.label}</div>
                        {filters.status === status.value && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5 block">
                    Table Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: null, label: "All Types", icon: Grid3x3 },
                      { value: "standard", label: "Standard", icon: Grid3x3 },
                      { value: "booth", label: "Booth", icon: Sofa },
                      { value: "bar", label: "Bar", icon: Armchair },
                    ].map((type) => (
                      <button
                        key={type.value || "all"}
                        onClick={() => handleTableTypeSelect(type.value)}
                        className={`relative p-2.5 rounded-xl font-medium text-xs transition-all ${
                          filters.tableType === type.value
                            ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <type.icon className="w-4 h-4 mx-auto mb-1" />
                        <div>{type.label}</div>
                        {filters.tableType === type.value && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-5 pt-5 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm active:scale-98 transition-transform"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-purple-500/30 active:scale-98 transition-transform"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tables Section Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {selectedZoneName ? selectedZoneName : "All Tables"}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Showing {tables.length} of {pagination.totalItems}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white dark:bg-slate-700 text-purple-600 shadow-sm" : "text-slate-500"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded ${viewMode === "list" ? "bg-white dark:bg-slate-700 text-purple-600 shadow-sm" : "text-slate-500"}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading && !fetched ? (
          <div
            className={
              viewMode === "grid" ? "grid grid-cols-2 gap-2.5" : "space-y-2.5"
            }
          >
            {[...Array(6)].map((_, index) => (
              <TableCardSkeleton key={index} viewMode={viewMode} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-rose-50 dark:bg-rose-950/30 rounded-2xl p-5 border border-rose-200 dark:border-rose-900/50">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-semibold text-rose-900 dark:text-rose-100 mb-0.5 text-sm">
                  Failed to load tables
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  {error.message || "Please try again"}
                </p>
              </div>
            </div>
          </div>
        ) : tables.length === 0 ? (
          showEmpty ? (
            <div className="text-center py-14">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                No tables found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {selectedZone
                  ? `No tables in ${selectedZoneName}`
                  : "Try adjusting your filters"}
              </p>
              {getActiveFiltersCount() > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-purple-500/30 active:scale-95 transition-transform"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === "grid" ? "grid grid-cols-2 gap-2.5" : "space-y-2.5"
              }
            >
              {[...Array(6)].map((_, index) => (
                <TableCardSkeleton key={index} viewMode={viewMode} />
              ))}
            </div>
          )
        ) : (
          <div
            className={
              viewMode === "grid" ? "grid grid-cols-2 gap-2.5" : "space-y-2.5"
            }
          >
            {tables.map((table, index) => {
              const isSelected = table.public_id === selectedTableId;
              const status = getStatusColor(table.is_occupied, isSelected);
              const isLastElement = index === tables.length - 1;
              const isAssigning = assigningTable === table.public_id;

              return viewMode === "grid" ? (
                <div
                  key={table.public_id}
                  ref={isLastElement ? lastTableElementRef : null}
                  className={`bg-white dark:bg-slate-800 rounded-2xl p-3 border-2 transition-all active:scale-98 ${
                    isSelected
                      ? "border-violet-300 dark:border-violet-800 shadow-lg shadow-violet-500/20 ring-2 ring-violet-500/20"
                      : table.is_occupied
                        ? "border-rose-200 dark:border-rose-900/50 shadow-sm shadow-rose-500/10"
                        : "border-emerald-200 dark:border-emerald-900/50 shadow-sm shadow-emerald-500/10"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-7 h-7 rounded-lg bg-gradient-to-br ${status.gradient} flex items-center justify-center shadow-md ${status.glow} text-white`}
                      >
                        {getTableIcon(table.table_type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
                          {table.table_number}
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize leading-tight">
                          {table.table_type}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${status.bg} ${status.text} leading-tight`}
                    >
                      {isSelected
                        ? "SELECTED"
                        : table.is_occupied
                          ? "BUSY"
                          : "FREE"}
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Users className="w-3 h-3" />
                        <span>{table.capacity} seats</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[60px]">
                          {table.zone?.name || "N/A"}
                        </span>
                      </div>
                    </div>
                    {(table.can_book ||
                      table.active_reservation ||
                      isSelected) && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {isSelected && (
                          <span className="px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-[9px] font-bold rounded uppercase flex items-center gap-1">
                            <Check className="w-2 h-2" />
                            Active
                          </span>
                        )}
                        {table.active_reservation && (
                          <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[9px] font-bold rounded uppercase">
                            Reserved
                          </span>
                        )}
                        {table.can_book && (
                          <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[9px] font-bold rounded uppercase">
                            Book
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {isSelected ? (
                    <button
                      onClick={handleRemoveSelection}
                      className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Remove Selection
                    </button>
                  ) : !table.is_occupied ? (
                    <button
                      onClick={() => handleOrderPlacement(table.public_id)}
                      disabled={isAssigning}
                      className={`w-full py-2 bg-gradient-to-r ${status.gradient} text-white rounded-xl text-xs font-bold shadow-md ${status.glow} active:scale-95 transition-transform flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isAssigning ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        <>
                          <Star className="w-3.5 h-3.5" />
                          Assign Guest
                        </>
                      )}
                    </button>
                  ) : (
                    <button   onClick={() =>
                        navigate(`/waiter/tables/${table.public_id}/bill`)
                      } className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold active:scale-95 transition-transform flex items-center justify-center gap-1.5">
                     
                      <DollarSign className="w-3.5 h-3.5" />
                      View Bill
                    </button>
                  )}
                </div>
              ) : (
                <div
                  key={table.public_id}
                  ref={isLastElement ? lastTableElementRef : null}
                  className={`bg-white dark:bg-slate-800 rounded-2xl p-3 border-2 transition-all ${
                    isSelected
                      ? "border-violet-300 dark:border-violet-800 shadow-lg shadow-violet-500/20 ring-2 ring-violet-500/20"
                      : table.is_occupied
                        ? "border-rose-200 dark:border-rose-900/50"
                        : "border-emerald-200 dark:border-emerald-900/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${status.gradient} flex items-center justify-center shadow-md ${status.glow} flex-shrink-0 text-white`}
                    >
                      {getTableIcon(table.table_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          {table.table_number}
                        </h3>
                        <div
                          className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${status.bg} ${status.text}`}
                        >
                          {isSelected
                            ? "SELECTED"
                            : table.is_occupied
                              ? "BUSY"
                              : "FREE"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-0.5">
                          <Users className="w-3 h-3" />
                          {table.capacity}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          {table.zone?.name || "N/A"}
                        </span>
                        <span className="capitalize">{table.table_type}</span>
                      </div>
                    </div>
                    {isSelected ? (
                      <button
                        onClick={handleRemoveSelection}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center gap-1 flex-shrink-0"
                      >
                        <XCircle className="w-3 h-3" />
                        Remove
                      </button>
                    ) : !table.is_occupied ? (
                      <button
                        onClick={() => handleOrderPlacement(table.public_id)}
                        disabled={isAssigning}
                        className={`px-2.5 py-1.5 bg-gradient-to-r ${status.gradient} text-white rounded-lg text-[10px] font-bold shadow-md ${status.glow} flex items-center gap-1 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isAssigning ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Assigning
                          </>
                        ) : (
                          <>
                            <Star className="w-3 h-3" />
                            Assign
                          </>
                        )}
                      </button>
                    ) : (
                      <button className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold flex items-center gap-1 flex-shrink-0">
                        <DollarSign className="w-3 h-3" />
                        Bill
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading More */}
        {isLoadingMore && (
          <div className="flex items-center justify-center py-5 mt-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-lg">
              <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Loading more...
              </span>
            </div>
          </div>
        )}

        {/* End of Results */}
        {!loading &&
          !isLoadingMore &&
          tables.length > 0 &&
          !pagination.hasNext && (
            <div className="text-center py-5 mt-3">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                <Check className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  All tables loaded
                </span>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
