import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";

/* =========================================================
   QUERY HELPERS
========================================================= */

const getSortingParam = (sortBy) => {
  const sortMap = {
    priority: "-priority",
    "price-low": "price",
    "price-high": "-price",
    popular: "-total_orders",
    newest: "-created_at",
  };
  return sortMap[sortBy] || "-priority";
};

const buildQueryParams = (filters) => {
  const params = {
    page: filters.currentPage,
    page_size: filters.itemsPerPage,
    is_available: true,
  };
  if (filters.searchQuery?.trim()) params.search = filters.searchQuery.trim();
  if (filters.selectedCategory !== "all") params.category__public_id = filters.selectedCategory;
  if (filters.priceRange.min > 0) params.price__gte = filters.priceRange.min;
  if (filters.priceRange.max < 10000) params.price__lte = filters.priceRange.max;
  if (filters.isVeg !== null) params.is_veg = filters.isVeg;
  if (filters.isSpicy !== null) params.is_spicy = filters.isSpicy;
  if (filters.sortBy) params.ordering = getSortingParam(filters.sortBy);
  return params;
};

const generateCacheKey = (filters) =>
  JSON.stringify({
    search: filters.searchQuery,
    category: filters.selectedCategory,
    priceMin: filters.priceRange.min,
    priceMax: filters.priceRange.max,
    veg: filters.isVeg,
    spicy: filters.isSpicy,
    sort: filters.sortBy,
    page: filters.currentPage,
  });

/* =========================================================
   ASYNC THUNK
========================================================= */

export const fetchWaiterMenuDishes = createAsyncThunk(
  "waiterMenu/fetchWaiterMenuDishes",
  async (filters, thunkApi) => {
    try {
      const state = thunkApi.getState();
      const cacheKey = generateCacheKey(filters);
      const isLoadingMore = filters.currentPage > 1;

      if (state.waiterMenuDishes.cache[cacheKey]) {
        return {
          ...state.waiterMenuDishes.cache[cacheKey],
          cacheKey,
          fromCache: true,
          isLoadingMore,
        };
      }

      const params = buildQueryParams(filters);
      const res = await axiosClient.get("/menu/waiter/dishes/", { params });

      return {
        results: res.data.results || [],
        count: res.data.count || 0,
        next: res.data.next || null,
        previous: res.data.previous || null,
        cacheKey,
        fromCache: false,
        isLoadingMore,
      };
    } catch (err) {
      return thunkApi.rejectWithValue({
        message: err.response?.data?.message || "Failed to fetch dishes",
        status: err.response?.status,
        details: err.response?.data,
      });
    }
  }
);

/* =========================================================
   INITIAL STATE
========================================================= */

const initialFilters = {
  searchQuery: "",
  selectedCategory: "all",
  priceRange: { min: 0, max: 10000 },
  isVeg: null,
  isSpicy: null,
  sortBy: "priority",
  currentPage: 1,
  itemsPerPage: 12,
};

const initialState = {
  dishes: [],
  filters: initialFilters,
  pagination: {
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  },
  cache: {},
  loading: false,
  loadingMore: false,
  error: null,
  fetched: false,
};

/* =========================================================
   SLICE
========================================================= */

const waiterMenuDishesSlice = createSlice({
  name: "waiterMenuDishes",
  initialState,
  reducers: {
    setWaiterSearchQuery(state, action) {
      // ✅ Skip if same value — prevents unnecessary re-fetch
      if (state.filters.searchQuery === action.payload) return;
      state.filters.searchQuery = action.payload;
      state.filters.currentPage = 1;
      state.fetched = false;
    },

    setWaiterSelectedCategory(state, action) {
      // ✅ Skip if same category clicked again
      if (state.filters.selectedCategory === action.payload) return;
      state.filters.selectedCategory = action.payload;
      state.filters.currentPage = 1;
      state.fetched = false;
    },

    setWaiterPriceRange(state, action) {
      const isSame =
        state.filters.priceRange.min === action.payload.min &&
        state.filters.priceRange.max === action.payload.max;
      if (isSame) return;
      state.filters.priceRange = action.payload;
      state.filters.currentPage = 1;
      state.fetched = false;
    },

    setWaiterIsVeg(state, action) {
      if (state.filters.isVeg === action.payload) return;
      state.filters.isVeg = action.payload;
      state.filters.currentPage = 1;
      state.fetched = false;
    },

    setWaiterIsSpicy(state, action) {
      if (state.filters.isSpicy === action.payload) return;
      state.filters.isSpicy = action.payload;
      state.filters.currentPage = 1;
      state.fetched = false;
    },

    setWaiterSortBy(state, action) {
      if (state.filters.sortBy === action.payload) return;
      state.filters.sortBy = action.payload;
      state.filters.currentPage = 1;
      state.fetched = false;
    },

    // Only used for pagination — appends in extraReducers
    setWaiterCurrentPage(state, action) {
      state.filters.currentPage = action.payload;
    },

    resetWaiterMenu(state) {
      return {
        ...initialState,
        cache: state.cache,
      };
    },

    clearWaiterError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchWaiterMenuDishes.pending, (state, action) => {
        const isLoadingMore = action.meta.arg.currentPage > 1;
        if (isLoadingMore) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })

      .addCase(fetchWaiterMenuDishes.fulfilled, (state, action) => {
        const { results, count, next, previous, cacheKey, fromCache, isLoadingMore } =
          action.payload;

        state.loading = false;
        state.loadingMore = false;
        state.fetched = true;

        // APPEND on next pages, REPLACE on fresh/filtered fetch
        if (isLoadingMore) {
          state.dishes = [...state.dishes, ...results];
        } else {
          state.dishes = results;
        }

        state.pagination.totalItems = count;
        state.pagination.totalPages = Math.ceil(count / state.filters.itemsPerPage);
        state.pagination.hasNext = !!next;
        state.pagination.hasPrevious = !!previous;

        if (!fromCache && cacheKey) {
          state.cache[cacheKey] = { results, count, next, previous };
        }
      })

      .addCase(fetchWaiterMenuDishes.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = {
          message: action.payload?.message || "Fetch failed",
        };
      });
  },
});

export const {
  setWaiterSearchQuery,
  setWaiterSelectedCategory,
  setWaiterPriceRange,
  setWaiterIsVeg,
  setWaiterIsSpicy,
  setWaiterSortBy,
  setWaiterCurrentPage,
  resetWaiterMenu,
  clearWaiterError,
} = waiterMenuDishesSlice.actions;

export default waiterMenuDishesSlice.reducer;

/* =========================================================
   SELECTORS
========================================================= */

export const selectWaiterDishes = (state) => state.waiterMenuDishes.dishes;
export const selectWaiterMenuFilters = (state) => state.waiterMenuDishes.filters;
export const selectWaiterMenuPagination = (state) => state.waiterMenuDishes.pagination;
export const selectWaiterMenuLoading = (state) => state.waiterMenuDishes.loading;
export const selectWaiterMenuLoadingMore = (state) => state.waiterMenuDishes.loadingMore;
export const selectWaiterMenuError = (state) => state.waiterMenuDishes.error;
export const selectWaiterMenuFetched = (state) => state.waiterMenuDishes.fetched;