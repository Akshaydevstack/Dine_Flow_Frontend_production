import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";

/* =========================================================
   HELPERS
========================================================= */

const getOrderingParam = (sortBy) =>
  ({
    newest: "-created_at",
    oldest: "created_at",
    ratingHigh: "-rating",
    ratingLow: "rating",
  })[sortBy] || "-created_at";

const generateCacheKey = (filters) =>
  JSON.stringify({
    s: filters.searchQuery,
    r: filters.rating,
    v: filters.showReview,
    o: filters.sortBy,
    p: filters.currentPage,
    df: filters.dateFrom, // ← new
    dt: filters.dateTo, // ← new
  });

/* =========================================================
   THUNKS
========================================================= */

export const fetchAdminReviews = createAsyncThunk(
  "adminReviews/fetch",
  async (filters, thunkApi) => {
    try {
      const state = thunkApi.getState();
      const cacheKey = generateCacheKey(filters);
      const isLoadMore = filters.currentPage > 1;

      if (state.adminReviews.cache[cacheKey]) {
        return {
          ...state.adminReviews.cache[cacheKey],
          cacheKey,
          fromCache: true,
          isLoadMore,
        };
      }

      const params = {
        page: filters.currentPage,
        page_size: filters.itemsPerPage,
        ordering: getOrderingParam(filters.sortBy),
      };

      if (filters.searchQuery?.trim())
        params.search = filters.searchQuery.trim();

      if (filters.rating !== null) params.rating = filters.rating;

      if (filters.showReview !== null) params.show_review = filters.showReview;

      // ── Date range ──────────────────────────────────────
      if (filters.dateFrom) params.created_at_from = filters.dateFrom; // "YYYY-MM-DD"

      if (filters.dateTo) params.created_at_to = filters.dateTo; // "YYYY-MM-DD"
      // ────────────────────────────────────────────────────

      const res = await axiosClient.get("/menu/restaurant-admin/reviews/", {
        params,
      });

      return {
        results: res.data.results ?? [],
        count: res.data.count ?? 0,
        next: res.data.next ?? null,
        cacheKey,
        fromCache: false,
        isLoadMore,
      };
    } catch (err) {
      return thunkApi.rejectWithValue({
        message: err.response?.data?.detail || "Failed to fetch reviews",
      });
    }
  },
);

export const updateAdminReview = createAsyncThunk(
  "adminReviews/update",
  async ({ publicId, data }, thunkApi) => {
    try {
      const res = await axiosClient.patch(
        `/menu/restaurant-admin/reviews/${publicId}/`,
        data,
      );
      return res.data;
    } catch (err) {
      return thunkApi.rejectWithValue({
        message: err.response?.data?.detail || "Failed to update review",
      });
    }
  },
);

export const deleteAdminReview = createAsyncThunk(
  "adminReviews/delete",
  async (publicId, thunkApi) => {
    try {
      await axiosClient.delete(`/menu/restaurant-admin/reviews/${publicId}/`);
      return publicId;
    } catch (err) {
      return thunkApi.rejectWithValue({
        message: err.response?.data?.detail || "Failed to delete review",
      });
    }
  },
);

/* =========================================================
   INITIAL FILTERS
========================================================= */

const initialFilters = {
  searchQuery: "",
  rating: null,
  showReview: null,
  sortBy: "newest",
  currentPage: 1,
  itemsPerPage: 20,
  dateFrom: null, // ← new  "YYYY-MM-DD" or null
  dateTo: null, // ← new  "YYYY-MM-DD" or null
};

/* =========================================================
   SLICE
========================================================= */

const adminReviewSlice = createSlice({
  name: "adminReviews",
  initialState: {
    reviews: [],
    loading: false,
    isRefreshing: false,
    loadingMore: false,
    fetched: false,
    error: null,
    success: null,

    filters: initialFilters,
    pagination: { totalItems: 0, hasNext: false },
    cache: {},
  },

  reducers: {
    setReviewSearch(state, { payload }) {
      state.filters.searchQuery = payload;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    setReviewFilter(state, { payload }) {
      Object.assign(state.filters, payload);
      state.filters.currentPage = 1;
      state.cache = {};
    },
    // ── Date range helpers ───────────────────────────────
    setReviewDateRange(state, { payload: { dateFrom, dateTo } }) {
      state.filters.dateFrom = dateFrom ?? null;
      state.filters.dateTo = dateTo ?? null;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    clearReviewDateRange(state) {
      state.filters.dateFrom = null;
      state.filters.dateTo = null;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    // ────────────────────────────────────────────────────
    setReviewPage(state, { payload }) {
      state.filters.currentPage = payload;
    },
    resetReviewFilters(state) {
      state.filters = initialFilters;
      state.cache = {};
    },
    clearReviewMessages(state) {
      state.success = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /* FETCH */
      .addCase(fetchAdminReviews.pending, (state, { meta }) => {
        const page = meta.arg.currentPage;
        if (page > 1) state.loadingMore = true;
        else if (state.fetched) state.isRefreshing = true;
        else state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminReviews.fulfilled, (state, { payload }) => {
        const { results, count, next, cacheKey, fromCache, isLoadMore } =
          payload;

        state.loading = false;
        state.isRefreshing = false;
        state.loadingMore = false;
        state.fetched = true;

        if (isLoadMore) {
          const seen = new Set(state.reviews.map((r) => r.public_id));
          state.reviews = [
            ...state.reviews,
            ...results.filter((r) => !seen.has(r.public_id)),
          ];
        } else {
          state.reviews = results;
        }

        state.pagination = { totalItems: count, hasNext: !!next };

        if (!fromCache && cacheKey)
          state.cache[cacheKey] = { results, count, next };
      })
      .addCase(fetchAdminReviews.rejected, (state, { payload }) => {
        state.loading = false;
        state.isRefreshing = false;
        state.loadingMore = false;
        state.error = payload?.message || "Failed to fetch reviews";
      })

      /* UPDATE */
      .addCase(updateAdminReview.fulfilled, (state, { payload }) => {
        const idx = state.reviews.findIndex(
          (r) => r.public_id === payload.public_id,
        );
        if (idx !== -1) state.reviews[idx] = payload;
        state.success = "Review updated successfully!";
        state.cache = {};
      })

      /* DELETE */
      .addCase(deleteAdminReview.fulfilled, (state, { payload }) => {
        state.reviews = state.reviews.filter((r) => r.public_id !== payload);
        state.success = "Review deleted successfully!";
        state.cache = {};
      });
  },
});

/* =========================================================
   EXPORTS
========================================================= */

export const {
  setReviewSearch,
  setReviewFilter,
  setReviewDateRange, // ← new
  clearReviewDateRange, // ← new
  setReviewPage,
  resetReviewFilters,
  clearReviewMessages,
} = adminReviewSlice.actions;

export default adminReviewSlice.reducer;

/* =========================================================
   SELECTORS
========================================================= */

export const selectAdminReviews = (s) => s.adminReviews.reviews;
export const selectFeched = (s) => s.adminReviews.fetched;
export const selectAdminReviewLoading = (s) => s.adminReviews.loading;
export const selectAdminReviewRefresh = (s) => s.adminReviews.isRefreshing;
export const selectAdminReviewError = (s) => s.adminReviews.error;
export const selectAdminReviewSuccess = (s) => s.adminReviews.success;
export const selectAdminReviewFilters = (s) => s.adminReviews.filters;
export const selectAdminReviewPageInfo = (s) => s.adminReviews.pagination;
