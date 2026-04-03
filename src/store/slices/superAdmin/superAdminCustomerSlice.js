import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";

const getOrderingParam = (sortBy) =>
  ({
    newest: "-created_at",
    oldest: "created_at",
    emailAsc: "email",
    emailDesc: "-email",
    mobileAsc: "mobile_number",
    mobileDesc: "-mobile_number",
  })[sortBy] || "-created_at";

/* ======================================================
   FETCH CUSTOMERS
====================================================== */

export const fetchSuperAdminCustomers = createAsyncThunk(
  "superAdminCustomers/fetch",
  async (filters, { rejectWithValue }) => {
    try {
      const params = {
        page: filters.currentPage,
        page_size: filters.itemsPerPage,
        ordering: getOrderingParam(filters.sortBy),
      };

      if (filters.searchQuery?.trim())
        params.search = filters.searchQuery.trim();

      if (filters.isActive !== null) params.is_active = filters.isActive;

      if (filters.startDate) params.created_at_after = filters.startDate;

      if (filters.endDate) params.created_at_before = filters.endDate;

      const res = await axiosClient.get("/auth/super-admin/customers/", { params });

      return {
        results: res.data.results ?? res.data,
        count: res.data.count ?? 0,
        next: res.data.next ?? null,
      };
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.detail || "Failed to fetch customers",
      });
    }
  },
);

/* ======================================================
   BLOCK / UNBLOCK CUSTOMER
====================================================== */

export const updateCustomerStatus = createAsyncThunk(
  "superAdminCustomers/updateStatus",
  async ({ userId, is_active }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.patch(`/auth/super-admin/customers/${userId}/`, {
        is_active,
      });

      return { userId, is_active };
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data || "Failed to update customer",
      });
    }
  },
);

/* ======================================================
   FILTERS
====================================================== */

export const initialCustomerFilters = {
  searchQuery: "",
  isActive: null,
  startDate: null,
  endDate: null,
  sortBy: "newest",
  currentPage: 1,
  itemsPerPage: 20,
};

/* ======================================================
   SLICE
====================================================== */

const superAdminCustomerSlice = createSlice({
  name: "superAdminCustomers",

  initialState: {
    customers: [],

    loading: false,
    isRefreshing: false,
    loadingMore: false,

    fetched: false,

    error: null,
    successMessage: null,
    errorMessage: null,

    filters: initialCustomerFilters,

    pagination: {
      totalItems: 0,
      hasNext: false,
    },
  },

  reducers: {
    setCustomerSearch(state, { payload }) {
      state.filters.searchQuery = payload;
      state.filters.currentPage = 1;
    },

    setCustomerFilter(state, { payload }) {
      Object.assign(state.filters, payload);
      state.filters.currentPage = 1;
    },

    setCustomerPage(state, { payload }) {
      state.filters.currentPage = payload;
    },

    resetCustomerFilters(state) {
      state.filters = initialCustomerFilters;
    },

    clearCustomerMessages(state) {
      state.successMessage = null;
      state.errorMessage = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* FETCH CUSTOMERS */

      .addCase(fetchSuperAdminCustomers.pending, (s, { meta }) => {
        const page = meta.arg.currentPage;

        if (page > 1) s.loadingMore = true;
        else if (s.fetched) s.isRefreshing = true;
        else s.loading = true;

        s.error = null;
      })

      .addCase(fetchSuperAdminCustomers.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.isRefreshing = false;
        s.loadingMore = false;

        s.fetched = true;

        if (s.filters.currentPage > 1) {
          const seen = new Set(s.customers.map((c) => c.public_id));

          s.customers = [
            ...s.customers,
            ...payload.results.filter((c) => !seen.has(c.public_id)),
          ];
        } else {
          s.customers = payload.results;
        }

        s.pagination = {
          totalItems: payload.count,
          hasNext: !!payload.next,
        };
      })

      .addCase(fetchSuperAdminCustomers.rejected, (s, { payload }) => {
        s.loading = false;
        s.isRefreshing = false;
        s.loadingMore = false;

        s.error = payload?.message;
      })

      /* BLOCK / UNBLOCK CUSTOMER */

      .addCase(updateCustomerStatus.fulfilled, (s, { payload }) => {
        const { userId, is_active } = payload;

        const customer = s.customers.find((c) => c.public_id === userId);

        if (customer) {
          customer.is_active = is_active;
        }

        s.successMessage = "Customer status updated successfully";
      })

      .addCase(updateCustomerStatus.rejected, (s, { payload }) => {
        s.errorMessage = payload?.message;
      });
  },
});

export const {
  setCustomerSearch,
  setCustomerFilter,
  setCustomerPage,
  resetCustomerFilters,
  clearCustomerMessages,
} = superAdminCustomerSlice.actions;

export default superAdminCustomerSlice.reducer;

/* ======================================================
   SELECTORS
====================================================== */

export const selectSuperAdminCustomers = (s) => s.superAdminCustomers.customers;

export const selectSuperAdminCustomersLoading = (s) =>
  s.superAdminCustomers.loading;

export const selectSuperAdminCustomersRefreshing = (s) =>
  s.superAdminCustomers.isRefreshing;

export const selectSuperAdminCustomersLoadingMore = (s) =>
  s.superAdminCustomers.loadingMore;

export const selectSuperAdminCustomersFetched = (s) =>
  s.superAdminCustomers.fetched;

export const selectSuperAdminCustomerFilters = (s) =>
  s.superAdminCustomers.filters;

export const selectSuperAdminCustomerPagination = (s) =>
  s.superAdminCustomers.pagination;

export const selectSuperAdminCustomerSuccess = (s) =>
  s.superAdminCustomers.successMessage;

export const selectSuperAdminCustomerError = (s) =>
  s.superAdminCustomers.errorMessage;
