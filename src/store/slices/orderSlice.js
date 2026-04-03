import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";
import { v4 as uuidv4 } from "uuid";
/* =========================
   Thunks
========================= */

// Create Order
export const createOrder = createAsyncThunk(
  "order/create",
  async ({ table_public_id,special_request,items }, thunkApi) => {
    try {
      const idempotencyKey = uuidv4();

      const res = await axiosClient.post(
        "/order/customer/create/",
        { table_public_id,special_request,items },
        {
          headers: {
            "X-Idempotency-Key": idempotencyKey,
          },
        }
      );

      return res.data; // unified order response
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to create order" }
      );
    }
  }
);

// Fetch All Orders
export const fetchOrders = createAsyncThunk(
  "order/fetchAll",
  async (_, thunkApi) => {
    try {
      const res = await axiosClient.get("/order/customer/all-orders/");
      return res.data; // { orders }
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to fetch orders" }
      );
    }
  }
);

// Cancel Order
export const cancelOrder = createAsyncThunk(
  "order/cancel",
  async (order_id, thunkApi) => {
    try {
      const res = await axiosClient.post(
        `/order/customer/${order_id}/cancel/`
      );
      return res.data; // { order }
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to cancel order" }
      );
    }
  }
);

/* =========================
   Slice
========================= */

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
    fetched: false,
  },
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ---------- CREATE ----------
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
        state.orders.unshift(action.payload.order); // add to history
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ---------- FETCH ALL ----------
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.fetched = true;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.fetched = true
      })

      // ---------- CANCEL ----------
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const updatedOrder = action.payload.order;

        state.orders = state.orders.map((order) =>
          order.order_id === updatedOrder.order_id
            ? updatedOrder
            : order
        );

        if (
          state.currentOrder &&
          state.currentOrder.order_id === updatedOrder.order_id
        ) {
          state.currentOrder = updatedOrder;
        }
      });
  },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;