import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";

/* =========================================================
   HELPERS
========================================================= */
const getOrderingParam = (sortBy) =>
  ({
    newest: "-created_at",
    oldest:  "created_at",
    mobile:  "mobile_number",
    email:   "email",
  })[sortBy] || "-created_at";

const generateCacheKey = (filters) =>
  JSON.stringify({
    s:  filters.searchQuery,
    f:  filters.statusFilter,
    o:  filters.sortBy,
    p:  filters.currentPage,
    df: filters.dateFrom ?? "",
    dt: filters.dateTo   ?? "",
  });

/* =========================================================
   THUNKS
========================================================= */

export const fetchAdminCustomers = createAsyncThunk(
  "adminCustomers/fetch",
  async (filters, thunkApi) => {
    try {
      const state      = thunkApi.getState();
      const cacheKey   = generateCacheKey(filters);
      const isLoadMore = filters.currentPage > 1;

      if (state.adminCustomers.cache[cacheKey]) {
        return { ...state.adminCustomers.cache[cacheKey], cacheKey, fromCache: true, isLoadMore };
      }

      const params = {
        page:      filters.currentPage,
        page_size: filters.itemsPerPage,
        ordering:  getOrderingParam(filters.sortBy),
      };
      if (filters.searchQuery?.trim())    params.search    = filters.searchQuery.trim();
      if (filters.statusFilter !== "all") params.is_active = filters.statusFilter === "active";

      // Date range filters
      if (filters.dateFrom) params.created_at_after  = filters.dateFrom;
      if (filters.dateTo)   params.created_at_before = filters.dateTo;

      const res = await axiosClient.get("/auth/restaurant-admin/customers/", { params });
      return {
        results:   res.data.results || [],
        count:     res.data.count   || 0,
        next:      res.data.next    || null,
        cacheKey,
        fromCache: false,
        isLoadMore,
      };
    } catch (err) {
      return thunkApi.rejectWithValue({
        message: err.response?.data?.error || "Failed to fetch customers",
      });
    }
  }
);

export const updateCustomerStatus = createAsyncThunk(
  "adminCustomers/updateStatus",
  async ({ publicId, isActive }, thunkApi) => {
    try {
      await axiosClient.patch(`/auth/restaurant-admin/customers/${publicId}/`, { is_active: isActive });
      return { publicId, isActive };
    } catch (err) {
      return thunkApi.rejectWithValue({ message: "Failed to update status" });
    }
  }
);

/* =========================================================
   SLICE
========================================================= */
const initialFilters = {
  searchQuery:  "",
  statusFilter: "all",
  sortBy:       "newest",
  currentPage:  1,
  itemsPerPage: 15,
  dateFrom:     "",   // "YYYY-MM-DD" or ""
  dateTo:       "",   // "YYYY-MM-DD" or ""
};

const adminCustomerSlice = createSlice({
  name: "adminCustomers",
  initialState: {
    customers:    [],
    loading:      false,
    isRefreshing: false,
    loadingMore:  false,
    fetched:      false,
    error:        null,
    filters:      initialFilters,
    pagination:   { totalItems: 0, hasNext: false },
    cache:        {},
  },
  reducers: {
    setAdminSearchQuery(state, { payload }) {
      state.filters.searchQuery = payload;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    setAdminStatusFilter(state, { payload }) {
      state.filters.statusFilter = payload;
      state.filters.currentPage  = 1;
      state.cache = {};
    },
    setAdminSortBy(state, { payload }) {
      state.filters.sortBy      = payload;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    setAdminCurrentPage(state, { payload }) {
      state.filters.currentPage = payload;
    },
    // Date range — payload: { dateFrom?: string, dateTo?: string }
    setAdminCustomerDateRange(state, { payload }) {
      if (payload.dateFrom !== undefined) state.filters.dateFrom = payload.dateFrom;
      if (payload.dateTo   !== undefined) state.filters.dateTo   = payload.dateTo;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    clearAdminCustomerDateRange(state) {
      state.filters.dateFrom    = "";
      state.filters.dateTo      = "";
      state.filters.currentPage = 1;
      state.cache = {};
    },
    resetAdminCustomerFilters(state) {
      state.filters = initialFilters;
      state.cache   = {};
    },
    clearAdminCustomerError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ── FETCH ── */
      .addCase(fetchAdminCustomers.pending, (state, { meta }) => {
        const page = meta.arg.currentPage;
        if (page > 1) {
          state.loadingMore = true;
        } else if (state.fetched) {
          state.isRefreshing = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchAdminCustomers.fulfilled, (state, { payload }) => {
        const { results, count, next, cacheKey, fromCache, isLoadMore } = payload;

        state.loading      = false;
        state.isRefreshing = false;
        state.loadingMore  = false;
        state.fetched      = true;

        if (isLoadMore) {
          const seen = new Set(state.customers.map((c) => c.public_id));
          state.customers = [...state.customers, ...results.filter((c) => !seen.has(c.public_id))];
        } else {
          state.customers = results;
        }

        state.pagination = { totalItems: count, hasNext: !!next };
        if (!fromCache && cacheKey) state.cache[cacheKey] = { results, count, next };
      })
      .addCase(fetchAdminCustomers.rejected, (state, { payload }) => {
        state.loading      = false;
        state.isRefreshing = false;
        state.loadingMore  = false;
        state.error        = payload?.message || "Failed to fetch customers";
      })

      /* ── UPDATE STATUS (optimistic) ── */
      .addCase(updateCustomerStatus.fulfilled, (state, { payload }) => {
        const { publicId, isActive } = payload;
        const idx = state.customers.findIndex((c) => c.public_id === publicId);
        if (idx !== -1) state.customers[idx].is_active = isActive;
        state.cache = {};
      });
  },
});

/* =========================================================
   EXPORTS
========================================================= */
export const {
  setAdminSearchQuery,
  setAdminStatusFilter,
  setAdminSortBy,
  setAdminCurrentPage,
  setAdminCustomerDateRange,
  clearAdminCustomerDateRange,
  resetAdminCustomerFilters,
  clearAdminCustomerError,
} = adminCustomerSlice.actions;

export default adminCustomerSlice.reducer;

/* =========================================================
   SELECTORS
========================================================= */
export const selectAdminCustomers          = (s) => s.adminCustomers.customers;
export const selectAdminCustomerFilters    = (s) => s.adminCustomers.filters;
export const selectAdminCustomerPagination = (s) => s.adminCustomers.pagination;
export const selectAdminCustomerLoading    = (s) => s.adminCustomers.loading;
export const selectAdminCustomerRefreshing = (s) => s.adminCustomers.isRefreshing;
export const selectAdminCustomerLoadingMore= (s) => s.adminCustomers.loadingMore;
export const selectAdminCustomerFetched    = (s) => s.adminCustomers.fetched;
export const selectAdminCustomerError      = (s) => s.adminCustomers.error;
export const selectAdminCustomerDateRange  = (s) => ({
  dateFrom: s.adminCustomers.filters.dateFrom,
  dateTo:   s.adminCustomers.filters.dateTo,
});