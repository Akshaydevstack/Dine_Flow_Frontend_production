import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";

/* =========================================================
   HELPERS
========================================================= */
const getOrderingParam = (sortBy) =>
  ({
    newest:  "-created_at",
    oldest:  "created_at",
    updated: "-updated_at",
    status:  "status",
  })[sortBy] || "-created_at";

const generateCacheKey = (filters) =>
  JSON.stringify({
    s:  filters.searchQuery,
    st: filters.statusFilter,
    o:  filters.sortBy,
    p:  filters.currentPage,
    df: filters.dateFrom ?? "",
    dt: filters.dateTo   ?? "",
  });

/* =========================================================
   THUNKS
========================================================= */

export const fetchAdminKitchenTickets = createAsyncThunk(
  "adminKitchenTickets/fetch",
  async (filters, thunkApi) => {
    try {
      const state      = thunkApi.getState();
      const cacheKey   = generateCacheKey(filters);
      const isLoadMore = filters.currentPage > 1;

      if (state.adminKitchenTickets.cache[cacheKey]) {
        return {
          ...state.adminKitchenTickets.cache[cacheKey],
          cacheKey,
          fromCache: true,
          isLoadMore,
        };
      }

      const params = {
        page:      filters.currentPage,
        page_size: filters.itemsPerPage,
        ordering:  getOrderingParam(filters.sortBy),
      };
      if (filters.searchQuery?.trim())    params.search = filters.searchQuery.trim();
      if (filters.statusFilter !== "all") params.status = filters.statusFilter;

      if (filters.dateFrom) params.created_at_after  = filters.dateFrom;
      if (filters.dateTo)   params.created_at_before = filters.dateTo;

      const res = await axiosClient.get("/kitchen/restaurant-admin/tickets/", { params });

      return {
        results:   res.data.results || [],
        count:     res.data.count   || 0,
        next:      res.data.next    || null,
        cacheKey,
        fromCache: false,
        isLoadMore,
      };
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data?.error || "Failed to fetch kitchen tickets"
      );
    }
  }
);

export const updateTicketStatus = createAsyncThunk(
  "adminKitchenTickets/updateStatus",
  async ({ publicId, status }, thunkApi) => {
    try {
      const res = await axiosClient.post(
        `/kitchen/restaurant-admin/tickets/${publicId}/status/`,
        { status }
      );
      return res.data;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to update ticket status"
      );
    }
  }
);

export const updateItemStatus = createAsyncThunk(
  "adminKitchenTickets/updateItemStatus",
  async ({ itemId, status, ticketPublicId }, thunkApi) => {
    try {
      const res = await axiosClient.post(
        `/kitchen/restaurant-admin/items/${itemId}/status/`,
        { status }
      );
      return { item: res.data, ticketPublicId };
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to update item status"
      );
    }
  }
);

/* =========================================================
   HELPERS — patch updated ticket/item back into state
========================================================= */
const patchTicketInState = (state, updatedTicket) => {
  if (!updatedTicket?.public_id) return;
  const idx = state.tickets.findIndex((t) => t.public_id === updatedTicket.public_id);
  if (idx !== -1) state.tickets[idx] = { ...state.tickets[idx], ...updatedTicket };
  state.cache = {};
};

const patchItemInTicket = (state, ticketPublicId, updatedItem) => {
  if (!updatedItem?.id || !ticketPublicId) return;
  const tIdx = state.tickets.findIndex((t) => t.public_id === ticketPublicId);
  if (tIdx === -1) return;
  const iIdx = state.tickets[tIdx].items?.findIndex((i) => i.id === updatedItem.id);
  if (iIdx !== -1) state.tickets[tIdx].items[iIdx] = updatedItem;
  state.cache = {};
};

/* =========================================================
   SLICE
========================================================= */
const initialFilters = {
  searchQuery:  "",
  statusFilter: "all",
  sortBy:       "newest",
  currentPage:  1,
  itemsPerPage: 15,
  dateFrom:     "",
  dateTo:       "",
};

const adminKitchenTicketSlice = createSlice({
  name: "adminKitchenTickets",
  initialState: {
    tickets:      [],
    loading:      false,
    isRefreshing: false,
    loadingMore:  false,
    fetched:      false,
    error:        null,
    mutating:     {},
    itemMutating: {},
    filters:      initialFilters,
    pagination:   { totalItems: 0, hasNext: false },
    cache:        {},
  },
  reducers: {
    setTicketSearch(state, { payload }) {
      state.filters.searchQuery = payload;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    setTicketStatusFilter(state, { payload }) {
      state.filters.statusFilter = payload;
      state.filters.currentPage  = 1;
      state.cache = {};
    },
    setTicketSortBy(state, { payload }) {
      state.filters.sortBy      = payload;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    setTicketPage(state, { payload }) {
      state.filters.currentPage = payload;
    },
    setTicketDateRange(state, { payload }) {
      if (payload.dateFrom !== undefined) state.filters.dateFrom = payload.dateFrom;
      if (payload.dateTo   !== undefined) state.filters.dateTo   = payload.dateTo;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    clearTicketDateRange(state) {
      state.filters.dateFrom    = "";
      state.filters.dateTo      = "";
      state.filters.currentPage = 1;
      state.cache = {};
    },
    resetTicketFilters(state) {
      state.filters = initialFilters;
      state.cache   = {};
    },
    clearTicketError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ── FETCH ── */
      .addCase(fetchAdminKitchenTickets.pending, (state, { meta }) => {
        const page = meta.arg.currentPage;
        if (page > 1)           state.loadingMore  = true;
        else if (state.fetched) state.isRefreshing = true;
        else                    state.loading      = true;
        state.error = null;
      })
      .addCase(fetchAdminKitchenTickets.fulfilled, (state, { payload }) => {
        const { results, count, next, cacheKey, fromCache, isLoadMore } = payload;
        state.loading      = false;
        state.isRefreshing = false;
        state.loadingMore  = false;
        state.fetched      = true;

        if (isLoadMore) {
          const seen = new Set(state.tickets.map((t) => t.public_id));
          state.tickets = [...state.tickets, ...results.filter((t) => !seen.has(t.public_id))];
        } else {
          state.tickets = results;
        }

        state.pagination = { totalItems: count, hasNext: !!next };
        if (!fromCache && cacheKey) state.cache[cacheKey] = { results, count, next };
      })
      .addCase(fetchAdminKitchenTickets.rejected, (state, { payload }) => {
        state.loading      = false;
        state.isRefreshing = false;
        state.loadingMore  = false;
        state.error        = payload || "Failed to fetch kitchen tickets";
      })

      /* ── TICKET STATUS UPDATE ── */
      .addCase(updateTicketStatus.pending, (state, { meta }) => {
        state.mutating[meta.arg.publicId] = true;
        state.error = null;
      })
      .addCase(updateTicketStatus.fulfilled, (state, { payload, meta }) => {
        delete state.mutating[meta.arg.publicId];
        patchTicketInState(state, payload);
        
      })
      .addCase(updateTicketStatus.rejected, (state, { payload, meta }) => {
        delete state.mutating[meta.arg.publicId];
        state.error = payload || "Failed to update ticket status";
      })

      /* ── ITEM STATUS UPDATE ── */
      .addCase(updateItemStatus.pending, (state, { meta }) => {
        state.itemMutating[meta.arg.itemId] = true;
        state.error = null;
      })
      .addCase(updateItemStatus.fulfilled, (state, { payload, meta }) => {
        delete state.itemMutating[meta.arg.itemId];
        patchItemInTicket(state, payload.ticketPublicId, payload.item);
        
      })
      .addCase(updateItemStatus.rejected, (state, { payload, meta }) => {
        delete state.itemMutating[meta.arg.itemId];
        state.error = payload || "Failed to update item status";
      })

      /* ── CROSS-SLICE INVALIDATION ── */
      .addCase("adminOrders/updateStatus/fulfilled", (state) => {
        state.fetched = false;
        state.cache = {};
      })
      .addCase("adminOrders/updatePayment/fulfilled", (state) => {
        state.fetched = false;
        state.cache = {};
      })
      .addCase("kitchen/updateTicketStatus/fulfilled", (state) => {
        state.fetched = false;
        state.cache = {};
      })
      .addCase("kitchen/cancelTicket/fulfilled", (state) => {
        state.fetched = false;
        state.cache = {};
      })
      .addCase("kitchen/updateItemStatus/fulfilled", (state) => {
        state.fetched = false;
        state.cache = {};
      });
  },
});

export const {
  setTicketSearch,
  setTicketStatusFilter,
  setTicketSortBy,
  setTicketPage,
  setTicketDateRange,
  clearTicketDateRange,
  resetTicketFilters,
  clearTicketError,
} = adminKitchenTicketSlice.actions;

export default adminKitchenTicketSlice.reducer;

export const selectKitchenTickets           = (s) => s.adminKitchenTickets.tickets;
export const selectKitchenTicketFilters     = (s) => s.adminKitchenTickets.filters;
export const selectKitchenTicketPagination  = (s) => s.adminKitchenTickets.pagination;
export const selectKitchenTicketLoading     = (s) => s.adminKitchenTickets.loading;
export const selectKitchenTicketRefreshing  = (s) => s.adminKitchenTickets.isRefreshing;
export const selectKitchenTicketLoadingMore = (s) => s.adminKitchenTickets.loadingMore;
export const selectKitchenTicketFetched     = (s) => s.adminKitchenTickets.fetched;
export const selectKitchenTicketError       = (s) => s.adminKitchenTickets.error;
export const selectKitchenTicketMutating    = (s) => s.adminKitchenTickets.mutating;
export const selectKitchenItemMutating      = (s) => s.adminKitchenTickets.itemMutating;
export const selectKitchenTicketDateRange   = (s) => ({
  dateFrom: s.adminKitchenTickets.filters.dateFrom,
  dateTo:   s.adminKitchenTickets.filters.dateTo,
});