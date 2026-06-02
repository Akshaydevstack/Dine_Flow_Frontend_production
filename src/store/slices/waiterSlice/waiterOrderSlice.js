// store/slices/waiterSlice/waiterOrderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";
import { v4 as uuidv4 } from "uuid";

/* =========================================================
   CACHE HELPERS
========================================================= */

const buildQueryParams = (filters, page) => ({
  page,
  ...(filters.status && { status: filters.status }),
  ...(filters.payment_status && { payment_status: filters.payment_status }),
  ...(filters.zone && { zone: filters.zone }),
  ...(filters.table && { table: filters.table }),
  ...(filters.search?.trim() && { search: filters.search.trim() }),
});

const generateCacheKey = (filters, page) =>
  JSON.stringify({
    status: filters.status,
    payment_status: filters.payment_status,
    zone: filters.zone,
    table: filters.table,
    search: filters.search,
    page,
  });

/* =========================================================
   FETCH ALL ORDERS
========================================================= */

export const fetchWaiterOrders = createAsyncThunk(
  "waiterOrder/fetchAll",
  async (page = 1, thunkApi) => {
    try {
      const state = thunkApi.getState().waiterOrder;
      const filters = state.filters;

      const cacheKey = generateCacheKey(filters, page);
      const isLoadingMore = page > 1;

      if (state.cache[cacheKey]) {
        return {
          ...state.cache[cacheKey],
          cacheKey,
          fromCache: true,
          requestedPage: page,
          isLoadingMore,
        };
      }

      const res = await axiosClient.get("/order/waiter/all-orders/", {
        params: buildQueryParams(filters, page),
      });

      return {
        results: res.data.results || [],
        count: res.data.count || 0,
        next: res.data.next || null,
        previous: res.data.previous || null,
        cacheKey,
        fromCache: false,
        requestedPage: page,
        isLoadingMore,
      };
    } catch (err) {
      return thunkApi.rejectWithValue({
        message: err.response?.data?.message || "Failed to fetch orders",
        status: err.response?.status,
      });
    }
  }
);

/* =========================================================
   FETCH ORDERS TO ACCEPT
========================================================= */

export const fetchOrdersToAccept = createAsyncThunk(
  "waiterOrder/fetchToAccept",
  async (_, thunkApi) => {
    try {
      const res = await axiosClient.get("/order/waiter/to-accept/");
      return res.data.results || res.data || [];
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to fetch pending orders" }
      );
    }
  }
);

/* =========================================================
   🟢 NEW: FETCH READY ORDERS
========================================================= */

export const fetchReadyOrders = createAsyncThunk(
  "waiterOrder/fetchReady",
  async (_, thunkApi) => {
    try {
      const res = await axiosClient.get("/order/waiter/ready-order/");
      return res.data.results || res.data || [];
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to fetch ready orders" }
      );
    }
  }
);

/* =========================================================
   ACCEPT ORDER
========================================================= */

export const acceptWaiterOrder = createAsyncThunk(
  "waiterOrder/accept",
  async (order_id, thunkApi) => {
    try {
      const res = await axiosClient.post(`/order/waiter/accept/${order_id}/`);
      return res.data;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to accept order" }
      );
    }
  }
);

/* =========================================================
   CREATE ORDER
========================================================= */

export const createWaiterOrder = createAsyncThunk(
  "waiterOrder/create",
  async ({ table_public_id, special_request, items }, thunkApi) => {
    try {
      const res = await axiosClient.post(
        "/order/waiter/create/",
        { table_public_id, special_request, items },
        { headers: { "X-Idempotency-Key": uuidv4() } }
      );
      return res.data;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to create order" }
      );
    }
  }
);

/* =========================================================
   CANCEL ORDER
========================================================= */

export const cancelWaiterOrder = createAsyncThunk(
  "waiterOrder/cancel",
  async (order_id, thunkApi) => {
    try {
      const res = await axiosClient.post(`/order/waiter/${order_id}/cancel/`);
      return res.data;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Cancel failed" }
      );
    }
  }
);

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  // All Orders
  orders: [],
  count: 0,
  next: null,
  previous: null,
  page: 1,
  hasMore: true,
  
  // To Accept
  toAcceptOrders: [],
  loadingToAccept: false,

  // 🟢 Ready Orders
  readyOrders: [],
  loadingReady: false,

  currentOrder: null,
  loading: false,
  loadingMore: false,
  error: null,
  fetched: false,

  filters: {
    status: null,
    payment_status: null,
    zone: null,
    table: null,
    search: "",
  },

  cache: {},
};

/* =========================================================
   SLICE
========================================================= */

const waiterOrderSlice = createSlice({
  name: "waiterOrder",
  initialState,

  reducers: {
    clearWaiterCurrentOrder(state) {
      state.currentOrder = null;
    },
    resetWaiterOrders() {
      return initialState;
    },
    setWaiterFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.orders = [];
      state.page = 1;
      state.hasMore = true;
      state.fetched = false;
    },
    invalidateCache(state) {
      state.cache = {};
      state.fetched = false;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ───────── FETCH ALL ORDERS ───────── */
      .addCase(fetchWaiterOrders.pending, (state, action) => {
        const isLoadingMore = action.meta.arg > 1;
        if (isLoadingMore) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchWaiterOrders.fulfilled, (state, action) => {
        const {
          results, count, next, previous, cacheKey, fromCache, requestedPage, isLoadingMore,
        } = action.payload;

        state.loading = false;
        state.loadingMore = false;
        state.fetched = true;

        if (isLoadingMore) {
          state.orders = [...state.orders, ...results];
        } else {
          state.orders = results;
        }

        state.count = count;
        state.next = next;
        state.previous = previous;
        state.hasMore = !!next;
        state.page = requestedPage;

        if (!fromCache && cacheKey) {
          state.cache[cacheKey] = { results, count, next, previous };
        }
      })
      .addCase(fetchWaiterOrders.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
        state.fetched = true;
      })

      /* ───────── FETCH TO ACCEPT ───────── */
      .addCase(fetchOrdersToAccept.pending, (state) => {
        state.loadingToAccept = true;
      })
      .addCase(fetchOrdersToAccept.fulfilled, (state, action) => {
        state.loadingToAccept = false;
        state.toAcceptOrders = action.payload;
      })
      .addCase(fetchOrdersToAccept.rejected, (state, action) => {
        state.loadingToAccept = false;
        state.error = action.payload;
      })

      /* ───────── 🟢 FETCH READY ORDERS ───────── */
      .addCase(fetchReadyOrders.pending, (state) => {
        state.loadingReady = true;
      })
      .addCase(fetchReadyOrders.fulfilled, (state, action) => {
        state.loadingReady = false;
        state.readyOrders = action.payload;
      })
      .addCase(fetchReadyOrders.rejected, (state, action) => {
        state.loadingReady = false;
        state.error = action.payload;
      })

      /* ───────── ACCEPT ORDER ───────── */
      .addCase(acceptWaiterOrder.fulfilled, (state, action) => {
        const acceptedOrderId = action.meta.arg;
        const newStatus = action.payload.status || "ACCEPTED";
        
        state.toAcceptOrders = state.toAcceptOrders.filter(
          (o) => o.order_id !== acceptedOrderId
        );
        state.orders = state.orders.map((o) =>
          o.order_id === acceptedOrderId ? { ...o, status: newStatus } : o
        );
        state.cache = {}; 
      })

      /* ───────── CREATE ───────── */
      .addCase(createWaiterOrder.fulfilled, (state, action) => {
        const newOrder = action.payload.order;
        state.currentOrder = newOrder;

        if (!state.orders.find((o) => o.order_id === newOrder.order_id)) {
          state.orders.unshift(newOrder);
          state.count += 1;
        }
        state.cache = {}; 
      })

      /* ───────── CANCEL ───────── */
      .addCase(cancelWaiterOrder.fulfilled, (state, action) => {
        const canceledOrderId = action.meta.arg;
        const updated = action.payload.order; 

        if (updated) {
          state.orders = state.orders.map((o) =>
            o.order_id === updated.order_id ? updated : o
          );
          if (state.currentOrder?.order_id === updated.order_id) {
            state.currentOrder = updated;
          }
        } else {
          state.orders = state.orders.map((o) =>
            o.order_id === canceledOrderId ? { ...o, status: "CANCELLED" } : o
          );
        }

        state.toAcceptOrders = state.toAcceptOrders.filter(
          (o) => o.order_id !== canceledOrderId
        );
        state.readyOrders = state.readyOrders.filter(
          (o) => o.order_id !== canceledOrderId
        );

        state.cache = {}; 
      });
  },
});

export const {
  clearWaiterCurrentOrder,
  resetWaiterOrders,
  setWaiterFilters,
  invalidateCache,
} = waiterOrderSlice.actions;

export default waiterOrderSlice.reducer;