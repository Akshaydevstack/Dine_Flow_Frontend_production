import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

/* =========================================================
   QUERY HELPERS
========================================================= */

// ⚡ FIX 1: Return null if no sorting is explicitly requested
const getSortingParam = (sortBy) => {
  if (!sortBy) return null;
  
  const sortMap = {
    priority: "-priority",
    "price-low": "price",
    "price-high": "-price",
    popular: "-total_orders",
    newest: "-created_at",
  };

  return sortMap[sortBy] || null;
};

const buildQueryParams = (filters) => {
  const params = {
    page: filters.currentPage,
    page_size: filters.itemsPerPage,
    is_available: true,
  };

  if (filters.searchQuery?.trim()) {
    params.search = filters.searchQuery.trim();
  }

  if (filters.selectedCategory !== "all") {
    params.category__public_id = filters.selectedCategory;
  }

  if (filters.priceRange.min > 0) {
    params.price__gte = filters.priceRange.min;
  }

  if (filters.priceRange.max < 10000) {
    params.price__lte = filters.priceRange.max;
  }

  if (filters.isVeg !== null) {
    params.is_veg = filters.isVeg;
  }

  if (filters.isSpicy !== null) {
    params.is_spicy = filters.isSpicy;
  }

  // ⚡ FIX 2: Only attach the ordering param if a valid sort option exists
  const ordering = getSortingParam(filters.sortBy);
  if (ordering) {
    params.ordering = ordering;
  }

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
   ASYNC THUNKS
========================================================= */

export const fetchMenuDishes = createAsyncThunk(
  "menu/fetchMenuDishes",
  async (filters, thunkApi) => {
    try {
      const state = thunkApi.getState();
      const cacheKey = generateCacheKey(filters);

      if (state.menuDishes.cache[cacheKey]) {
        return {
          ...state.menuDishes.cache[cacheKey],
          cacheKey,
          fromCache: true,
        };
      }

      const params = buildQueryParams(filters);
      const res = await axiosClient.get("/menu/customer/dishes/", { params });

      return {
        results: res.data.results || [],
        count: res.data.count || 0,
        next: res.data.next || null,
        previous: res.data.previous || null,
        cacheKey,
        fromCache: false,
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

export const fetchQuickSections = createAsyncThunk(
  "menu/fetchQuickSections",
  async (_, thunkApi) => {
    try {
      const state = thunkApi.getState();

      if (state.menuDishes.sectionsFetched) {
        return thunkApi.rejectWithValue({ skipError: true });
      }

      const [popularRes, trendingRes, quickRes] = await Promise.all([
        axiosClient.get("/menu/customer/dishes/", {
          params: { is_popular: true, page_size: 8 },
        }),
        axiosClient.get("/menu/customer/dishes/", {
          params: { is_trending: true, page_size: 8 },
        }),
        axiosClient.get("/menu/customer/dishes/", {
          params: { is_quick_bites: true, page_size: 8 },
        }),
      ]);

      return {
        popular: popularRes.data.results || [],
        trending: trendingRes.data.results || [],
        quickBites: quickRes.data.results || [],
      };
    } catch (err) {
      return thunkApi.rejectWithValue({
        message: "Failed to fetch sections",
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
  sortBy: "", // ⚡ FIX 3: Start with an empty string so no ordering is forced
  currentPage: 1,
  itemsPerPage: 12,
};

const initialState = {
  dishes: [],
  popular: [],
  trending: [],
  quickBites: [],
  filters: initialFilters,
  pagination: {
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  },
  cache: {},
  loading: false,
  sectionsLoading: false,
  error: null,
  sectionsError: null,
  fetched: true,
  sectionsFetched: false,
};

/* =========================================================
   SLICE
========================================================= */

const menuDishesSlice = createSlice({
  name: "menuDishes",
  initialState,
  reducers: {
    setSearchQuery(state, action) {
      state.filters.searchQuery = action.payload;
      state.filters.currentPage = 1;
    },

    setSelectedCategory(state, action) {
      state.filters.selectedCategory = action.payload;
      state.filters.currentPage = 1;
    },

    setPriceRange(state, action) {
      state.filters.priceRange = action.payload;
      state.filters.currentPage = 1;
    },

    // 🔥 FIXED to match your Menu.jsx
    setIsVeg(state, action) {
      state.filters.isVeg = action.payload;
      state.filters.currentPage = 1;
    },

    setIsSpicy(state, action) {
      state.filters.isSpicy = action.payload;
      state.filters.currentPage = 1;
    },

    setSortBy(state, action) {
      state.filters.sortBy = action.payload;
      state.filters.currentPage = 1;
    },

    setCurrentPage(state, action) {
      state.filters.currentPage = action.payload;
    },

    resetMenu(state) {
      return {
        ...initialState,
        cache: state.cache,
        popular: state.popular,
        trending: state.trending,
        quickBites: state.quickBites,
        sectionsFetched: state.sectionsFetched,
      };
    },

    clearError(state) {
      state.error = null;
      state.sectionsError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuDishes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMenuDishes.fulfilled, (state, action) => {
        const { results, count, next, previous, cacheKey, fromCache } =
          action.payload;

        state.loading = false;
        state.fetched = true;
        state.dishes = results;

        state.pagination.totalItems = count;
        state.pagination.totalPages = Math.ceil(
          count / state.filters.itemsPerPage
        );
        state.pagination.hasNext = !!next;
        state.pagination.hasPrevious = !!previous;

        if (!fromCache && cacheKey) {
          state.cache[cacheKey] = {
            results,
            count,
            next,
            previous,
          };
        }
      })

      .addCase(fetchMenuDishes.rejected, (state, action) => {
        state.loading = false;
        state.error = {
          message: action.payload?.message || "Fetch failed",
        };
      })

      .addCase(fetchQuickSections.pending, (state) => {
        state.sectionsLoading = true;
      })

      .addCase(fetchQuickSections.fulfilled, (state, action) => {
        state.sectionsLoading = false;
        state.sectionsFetched = true;
        state.popular = action.payload.popular;
        state.trending = action.payload.trending;
        state.quickBites = action.payload.quickBites;
      })

      .addCase(fetchQuickSections.rejected, (state, action) => {
        state.sectionsLoading = false;
        if (!action.payload?.skipError) {
          state.sectionsError = { message: "Section fetch failed" };
        }
      });
  },
});

export const {
  setSearchQuery,
  setSelectedCategory,
  setPriceRange,
  setIsVeg,
  setIsSpicy,
  setSortBy,
  setCurrentPage,
  resetMenu,
  clearError,
} = menuDishesSlice.actions;

export default menuDishesSlice.reducer;

/* =========================================================
   SELECTORS
========================================================= */

export const selectDishes = (state) => state.menuDishes.dishes;
export const selectPopular = (state) => state.menuDishes.popular;
export const selectTrending = (state) => state.menuDishes.trending;
export const selectQuickBites = (state) => state.menuDishes.quickBites;
export const selectFilters = (state) => state.menuDishes.filters;
export const selectPagination = (state) => state.menuDishes.pagination;
export const selectLoading = (state) => state.menuDishes.loading;
export const selectSectionsLoading = (state) =>
  state.menuDishes.sectionsLoading;
export const selectError = (state) => state.menuDishes.error;
export const selectSectionsFetched = (state) =>
  state.menuDishes.sectionsFetched;
export const selectFetched = (state) => state.menuDishes.fetched;