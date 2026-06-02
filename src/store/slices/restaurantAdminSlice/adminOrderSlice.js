import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";

/* =========================================================
   HELPERS
========================================================= */

const ORDER_API = "/order/restaurant-admin/orders";

const getOrderingParam = (sortBy) =>
  ({
    newest:    "-created_at",
    oldest:    "created_at",
    totalHigh: "-total",
    totalLow:  "total",
    status:    "status",
    payment:   "payment_status",
  })[sortBy] ?? "-created_at";

const generateCacheKey = (f) =>
  JSON.stringify({
    s:    f.searchQuery?.trim() ?? "",
    st:   f.status,
    ps:   f.paymentStatus,
    o:    f.sortBy,
    p:    f.currentPage,
    df:   f.dateFrom ?? "",
    dt:   f.dateTo   ?? "",
  });

/* =========================================================
   THUNKS
========================================================= */

export const fetchAdminOrders = createAsyncThunk(
  "adminOrders/fetch",
  async (filtersArg, { getState, rejectWithValue }) => {
    try {
      const filters = filtersArg || getState().adminOrders.filters;

      const cacheKey   = generateCacheKey(filters);
      const isLoadMore = filters.currentPage > 1;
      const cached     = getState().adminOrders.cache[cacheKey];

      if (cached) return { ...cached, cacheKey, fromCache: true, isLoadMore };

      const params = {
        page:      filters.currentPage,
        page_size: filters.itemsPerPage,
        ordering:  getOrderingParam(filters.sortBy),
      };

      if (filters.searchQuery?.trim())      params.search         = filters.searchQuery.trim();
      if (filters.status !== "all")         params.status         = filters.status;
      if (filters.paymentStatus !== "all")  params.payment_status = filters.paymentStatus;

      if (filters.dateFrom)  params.created_at_after  = filters.dateFrom;
      if (filters.dateTo)    params.created_at_before = filters.dateTo;

      const res = await axiosClient.get(`${ORDER_API}/`, { params });
      return {
        results:   res.data.results ?? [],
        count:     res.data.count   ?? 0,
        next:      res.data.next    ?? null,
        cacheKey,
        fromCache: false,
        isLoadMore,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to fetch orders");
    }
  }
);

export const updateAdminOrderStatus = createAsyncThunk(
  "adminOrders/updateStatus",
  async ({ publicId, statusValue }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.patch(
        `${ORDER_API}/${publicId}/status/`,
        { status: statusValue }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? "Status update failed");
    }
  }
);

export const updateAdminPaymentStatus = createAsyncThunk(
  "adminOrders/updatePayment",
  async ({ publicId, paymentStatus }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.patch(
        `${ORDER_API}/${publicId}/payment/`,
        { payment_status: paymentStatus }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail ?? "Payment update failed");
    }
  }
);

/* =========================================================
   INITIAL STATE
========================================================= */

export const initialOrderFilters = {
  searchQuery:   "",
  status:        "all",
  paymentStatus: "all",
  sortBy:        "newest",
  currentPage:   1,
  itemsPerPage:  20,
  dateFrom:      "", 
  dateTo:        "", 
};

/* =========================================================
   SLICE HELPERS
========================================================= */

const patchOrderInState = (state, updatedOrder) => {
  if (!updatedOrder) return;
  const idx = state.orders.findIndex((o) => o.order_id === updatedOrder.order_id);
  if (idx !== -1) state.orders[idx] = updatedOrder;
  state.cache = {};
};

const MUTATION_ACTIONS = [
  updateAdminOrderStatus.pending.type,
  updateAdminPaymentStatus.pending.type,
];
const MUTATION_FULFILLED = [
  updateAdminOrderStatus.fulfilled.type,
  updateAdminPaymentStatus.fulfilled.type,
];
const MUTATION_REJECTED = [
  updateAdminOrderStatus.rejected.type,
  updateAdminPaymentStatus.rejected.type,
];

/* =========================================================
   SLICE
========================================================= */

const adminOrderSlice = createSlice({
  name: "adminOrders",
  initialState: {
    orders:       [],
    filters:      initialOrderFilters,
    pagination:   { totalItems: 0, hasNext: false },
    cache:        {},
    loading:      false,
    isRefreshing: false,
    loadingMore:  false,
    error:        null,
    fetched:      false,
    mutating:     {},
  },

  reducers: {
    setAdminOrderSearch(state, { payload }) {
      state.filters.searchQuery = payload;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    setAdminOrderStatusFilter(state, { payload }) {
      state.filters.status      = payload;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    setAdminOrderPaymentFilter(state, { payload }) {
      state.filters.paymentStatus = payload;
      state.filters.currentPage   = 1;
      state.cache = {};
    },
    setAdminOrderSortBy(state, { payload }) {
      state.filters.sortBy      = payload;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    setAdminOrderCurrentPage(state, { payload }) {
      state.filters.currentPage = payload;
    },
    setAdminOrderDateRange(state, { payload }) {
      if (payload.dateFrom !== undefined) state.filters.dateFrom = payload.dateFrom;
      if (payload.dateTo   !== undefined) state.filters.dateTo   = payload.dateTo;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    clearAdminOrderDateRange(state) {
      state.filters.dateFrom    = "";
      state.filters.dateTo      = "";
      state.filters.currentPage = 1;
      state.cache = {};
    },
    resetAdminOrderFilters(state) {
      state.filters = initialOrderFilters;
      state.cache   = {};
    },
    invalidateAdminOrders(state) {
      state.fetched = false;
      state.cache   = {};
    },
    clearAdminOrderError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ── FETCH ── */
      .addCase(fetchAdminOrders.pending, (state, { meta }) => {
        const page = meta.arg?.currentPage || 1;
        
        if (page > 1) {
          state.loadingMore = true;
        } else if (state.fetched) {
          state.isRefreshing = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, { payload }) => {
        const { results, count, next, cacheKey, fromCache, isLoadMore } = payload;

        state.loading      = false;
        state.isRefreshing = false;
        state.loadingMore  = false;
        state.fetched      = true;

        if (isLoadMore) {
          const seen = new Set(state.orders.map((o) => o.order_id));
          state.orders = [
            ...state.orders,
            ...results.filter((o) => !seen.has(o.order_id)),
          ];
        } else {
          state.orders = results;
        }

        state.pagination = { totalItems: count, hasNext: !!next };
        if (!fromCache && cacheKey) state.cache[cacheKey] = { results, count, next };
      })
      .addCase(fetchAdminOrders.rejected, (state, { payload }) => {
        state.loading      = false;
        state.isRefreshing = false;
        state.loadingMore  = false;
        state.error        = payload;
      })

      /* ── MUTATIONS via addMatcher ── */
      .addMatcher(
        ({ type }) => MUTATION_ACTIONS.includes(type),
        (state, { meta }) => { state.mutating[meta.arg.publicId] = true; }
      )
      .addMatcher(
        ({ type }) => MUTATION_FULFILLED.includes(type),
        (state, { payload }) => {
          const order = payload?.order ?? payload;
          patchOrderInState(state, order);
          if (order?.order_id) delete state.mutating[order.order_id];
          
        }
      )
      .addMatcher(
        ({ type }) => MUTATION_REJECTED.includes(type),
        (state, { meta }) => { delete state.mutating[meta.arg.publicId]; }
      )
      
      /* ── CROSS-SLICE INVALIDATION ── */
      .addCase("adminKitchenTickets/updateStatus/fulfilled", (state) => {
        state.fetched = false;
        state.cache = {};
      })
      .addCase("adminKitchenTickets/updateItemStatus/fulfilled", (state) => {
        state.fetched = false;
        state.cache = {};
      });
  },
});

export const {
  setAdminOrderSearch,
  setAdminOrderStatusFilter,
  setAdminOrderPaymentFilter,
  setAdminOrderSortBy,
  setAdminOrderCurrentPage,
  setAdminOrderDateRange,
  clearAdminOrderDateRange,
  resetAdminOrderFilters,
  invalidateAdminOrders,
  clearAdminOrderError,
} = adminOrderSlice.actions;

export default adminOrderSlice.reducer;

export const selectAdminOrders            = (s) => s.adminOrders.orders;
export const selectAdminOrderFilters      = (s) => s.adminOrders.filters;
export const selectAdminOrderPagination   = (s) => s.adminOrders.pagination;
export const selectAdminOrderLoading      = (s) => s.adminOrders.loading;
export const selectAdminOrderRefreshing   = (s) => s.adminOrders.isRefreshing;
export const selectAdminOrderLoadingMore  = (s) => s.adminOrders.loadingMore;
export const selectAdminOrderError        = (s) => s.adminOrders.error;
export const selectAdminOrderFetched      = (s) => s.adminOrders.fetched;
export const selectAdminOrderMutating     = (s) => s.adminOrders.mutating;
export const selectAdminOrderDateRange    = (s) => ({
  dateFrom: s.adminOrders.filters.dateFrom,
  dateTo:   s.adminOrders.filters.dateTo,
});