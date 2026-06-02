import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";

const KITCHEN_API = "/kitchen/kitchen-staff/tickets";
const todayISO = () => new Date().toISOString().slice(0, 10);

/* ═══════════════════════════════════════
   THUNKS
═══════════════════════════════════════ */

export const fetchKitchenTickets = createAsyncThunk(
  "kitchen/fetchTickets",
  async (filtersArg, { getState, rejectWithValue }) => {
    try {
      // 🟢 FIX: Grab current filters directly from state if none passed
      const filters = filtersArg || getState().kitchen.filters;

      const params = {};
      if (filters.restaurant_id) params.restaurant_id = filters.restaurant_id;
      if (filters.status) params.status = filters.status;
      if (filters.order_id) params.order_id = filters.order_id;
      if (filters.search?.trim()) params.search = filters.search.trim();
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;

      const res = await axiosClient.get(`${KITCHEN_API}/`, { params });
      const data = res.data;
      // Handle both plain array and DRF paginated response
      const results = Array.isArray(data) ? data : (data.results ?? []);
      return { results };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail ?? "Failed to fetch tickets",
      );
    }
  },
);

export const fetchKitchenTicketById = createAsyncThunk(
  "kitchen/fetchTicketById",
  async (public_id, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(`${KITCHEN_API}/${public_id}/`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail ?? "Failed to fetch ticket",
      );
    }
  },
);

export const updateKitchenTicketStatus = createAsyncThunk(
  "kitchen/updateTicketStatus",
  async ({ public_id, status }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post(
        `${KITCHEN_API}/${public_id}/status/`,
        { status },
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail ?? "Failed to update ticket",
      );
    }
  },
);

export const cancelKitchenTicket = createAsyncThunk(
  "kitchen/cancelTicket",
  async (public_id, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post(
        `${KITCHEN_API}/${public_id}/status/`,
        { status: "CANCELLED" },
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail ?? "Failed to cancel ticket",
      );
    }
  },
);

export const updateKitchenItemStatus = createAsyncThunk(
  "kitchen/updateItemStatus",
  async ({ item_id, status }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post(
        `/kitchen/kitchen-staff/items/${item_id}/status/`,
        { status },
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail ?? "Failed to update item",
      );
    }
  },
);

/* ═══════════════════════════════════════
   INITIAL STATE
═══════════════════════════════════════ */

export const initialKitchenFilters = {
  restaurant_id: "",
  status: "",
  order_id: "",
  search: "",
  from_date: todayISO(),
  to_date: todayISO(),
};

/* ═══════════════════════════════════════
   PATCH HELPERS
═══════════════════════════════════════ */

const applyTicketPatch = (tickets, updated) => {
  if (!updated) return tickets;
  const idx = tickets.findIndex((x) => x.public_id === updated.public_id);
  if (idx === -1) return tickets;
  const next = [...tickets];
  next[idx] = updated;
  return next;
};

const applyItemPatch = (tickets, item) => {
  if (!item) return tickets;
  return tickets.map((ticket) => {
    const hasItem = (ticket.items ?? []).some((i) => i.id === item.id);
    if (!hasItem) return ticket;
    return {
      ...ticket,
      items: ticket.items.map((i) => (i.id === item.id ? item : i)),
    };
  });
};

/* ═══════════════════════════════════════
   SLICE
═══════════════════════════════════════ */

const kitchenSlice = createSlice({
  name: "kitchen",
  initialState: {
    tickets: [],
    detail: null,
    detailLoading: false,
    detailError: null,
    filters: { ...initialKitchenFilters },
    loading: false,
    isRefreshing: false,
    error: null,
    fetched: false,
    mutating: {}, 
  },

  reducers: {
    setKitchenSearch(state, { payload }) {
      state.filters.search = payload;
    },
    setKitchenStatusFilter(state, { payload }) {
      state.filters.status = payload;
    },
    setKitchenOrderId(state, { payload }) {
      state.filters.order_id = payload;
    },
    setKitchenDateRange(state, { payload }) {
      if (payload.from_date !== undefined)
        state.filters.from_date = payload.from_date;
      if (payload.to_date !== undefined)
        state.filters.to_date = payload.to_date;
    },
    resetKitchenFilters(state) {
      state.filters = { ...initialKitchenFilters };
    },
    clearKitchenError(state) {
      state.error = null;
    },
    clearKitchenDetail(state) {
      state.detail = null;
      state.detailError = null;
    },

    // 🟢 FIX: Added manual cache invalidation
    invalidateKitchenTickets(state) {
      state.fetched = false;
    },

    // WebSocket events
    wsTicketCreated(state, { payload }) {
      if (!state.tickets.some((t) => t.public_id === payload.public_id))
        state.tickets.unshift(payload);
    },
    wsTicketCancelled(state, { payload }) {
      state.tickets = state.tickets.map((t) =>
        t.public_id === payload.public_id ? { ...t, status: "CANCELLED" } : t,
      );
      if (state.detail?.public_id === payload.public_id)
        state.detail = { ...state.detail, status: "CANCELLED" };
    },
    wsTicketUpdated(state, { payload }) {
      state.tickets = applyTicketPatch(state.tickets, payload);
      if (state.detail?.public_id === payload?.public_id)
        state.detail = payload;
    },
  },

  extraReducers: (builder) => {
    /* ── fetchKitchenTickets ── */
    builder
      .addCase(fetchKitchenTickets.pending, (state) => {
        state.error = null;
        if (state.fetched) state.isRefreshing = true;
        else state.loading = true;
      })
      .addCase(fetchKitchenTickets.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.isRefreshing = false;
        state.fetched = true;
        state.error = null;
        state.tickets = payload.results;
      })
      .addCase(fetchKitchenTickets.rejected, (state, { payload }) => {
        state.loading = false;
        state.isRefreshing = false;
        state.error = payload;
      });

    /* ── fetchKitchenTicketById ── */
    builder
      .addCase(fetchKitchenTicketById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchKitchenTicketById.fulfilled, (state, { payload }) => {
        state.detailLoading = false;
        state.detail = payload;
      })
      .addCase(fetchKitchenTicketById.rejected, (state, { payload }) => {
        state.detailLoading = false;
        state.detailError = payload;
      });

    /* ── updateKitchenTicketStatus ── */
    builder
      .addCase(updateKitchenTicketStatus.pending, (state, { meta }) => {
        state.mutating[meta.arg.public_id] = true;
      })
      .addCase(
        updateKitchenTicketStatus.fulfilled,
        (state, { payload, meta }) => {
          delete state.mutating[meta.arg.public_id];
          state.tickets = applyTicketPatch(state.tickets, payload);
          if (state.detail?.public_id === payload?.public_id)
            state.detail = payload;
        },
      )
      .addCase(
        updateKitchenTicketStatus.rejected,
        (state, { payload, meta }) => {
          delete state.mutating[meta.arg.public_id];
          state.error = payload;
        },
      );

    /* ── cancelKitchenTicket ── */
    builder
      .addCase(cancelKitchenTicket.pending, (state, { meta }) => {
        state.mutating[`cancel_${meta.arg}`] = true;
      })
      .addCase(cancelKitchenTicket.fulfilled, (state, { payload, meta }) => {
        delete state.mutating[`cancel_${meta.arg}`];
        state.tickets = applyTicketPatch(state.tickets, payload);
        if (state.detail?.public_id === payload?.public_id)
          state.detail = payload;
      })
      .addCase(cancelKitchenTicket.rejected, (state, { payload, meta }) => {
        delete state.mutating[`cancel_${meta.arg}`];
        state.error = payload;
      });

    /* ── updateKitchenItemStatus ── */
    builder
      .addCase(updateKitchenItemStatus.pending, (state, { meta }) => {
        state.mutating[`item_${meta.arg.item_id}`] = true;
      })
      .addCase(
        updateKitchenItemStatus.fulfilled,
        (state, { payload, meta }) => {
          delete state.mutating[`item_${meta.arg.item_id}`];
          state.tickets = applyItemPatch(state.tickets, payload);
          if (state.detail) {
            state.detail = {
              ...state.detail,
              items: (state.detail.items ?? []).map((i) =>
                i.id === payload?.id ? payload : i,
              ),
            };
          }
        },
      )
      .addCase(updateKitchenItemStatus.rejected, (state, { payload, meta }) => {
        delete state.mutating[`item_${meta.arg.item_id}`];
        state.error = payload;
      })

      /* ── 🟢 CROSS-SLICE INVALIDATION ── */
      // If the admin changes the order status, make this kitchen slice
      // refetch the next time the Kitchen Staff visits the screen.
      .addCase("adminOrders/updateStatus/fulfilled", (state) => {
        state.fetched = false;
      })
      .addCase("adminOrders/updatePayment/fulfilled", (state) => {
        state.fetched = false;
      });
  },
});

export const {
  setKitchenSearch,
  setKitchenStatusFilter,
  setKitchenOrderId,
  setKitchenDateRange,
  resetKitchenFilters,
  clearKitchenError,
  clearKitchenDetail,
  invalidateKitchenTickets, // 🟢 EXPORTED
  wsTicketCreated,
  wsTicketCancelled,
  wsTicketUpdated,
} = kitchenSlice.actions;

export default kitchenSlice.reducer;

/* ═══════════════════════════════════════
   SELECTORS
═══════════════════════════════════════ */
export const selectKitchenTickets = (s) => s.kitchen.tickets;
export const selectKitchenFilters = (s) => s.kitchen.filters;
export const selectKitchenLoading = (s) => s.kitchen.loading;
export const selectKitchenRefreshing = (s) => s.kitchen.isRefreshing;
export const selectKitchenError = (s) => s.kitchen.error;
export const selectKitchenFetched = (s) => s.kitchen.fetched;
export const selectKitchenMutating = (s) => s.kitchen.mutating;
export const selectKitchenDetail = (s) => s.kitchen.detail;
export const selectDetailLoading = (s) => s.kitchen.detailLoading;
export const selectDetailError = (s) => s.kitchen.detailError;