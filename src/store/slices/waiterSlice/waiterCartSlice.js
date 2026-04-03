import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";

/* =========================
   Thunks
========================= */

// Fetch waiter cart
export const fetchWaiterCart = createAsyncThunk(
  "waiterCart/fetch",
  async (_, thunkApi) => {
    try {
      const res = await axiosClient.get("/cart/waiter/");
      return res.data;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to fetch waiter cart" }
      );
    }
  }
);

// Add to waiter cart
export const addToWaiterCart = createAsyncThunk(
  "waiterCart/add",
  async ({ dish_id, quantity = 1 }, thunkApi) => {
    try {
      const res = await axiosClient.post("/cart/waiter/add-items/", {
        dish_id,
        quantity,
      });
      return res.data;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to add item" }
      );
    }
  }
);

// Update quantity
export const updateWaiterCartItem = createAsyncThunk(
  "waiterCart/update",
  async ({ dish_id, quantity }, thunkApi) => {
    try {
      const res = await axiosClient.patch(
        `/cart/waiter/update-item/${dish_id}/`,
        { quantity }
      );
      return res.data;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to update item" }
      );
    }
  }
);

// Remove item
export const removeFromWaiterCart = createAsyncThunk(
  "waiterCart/remove",
  async (dish_id, thunkApi) => {
    try {
      const res = await axiosClient.delete(
        `/cart/waiter/remove-item/${dish_id}/`
      );
      return res.data;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to remove item" }
      );
    }
  }
);

// Clear waiter cart
export const clearWaiterCart = createAsyncThunk(
  "waiterCart/clear",
  async (_, thunkApi) => {
    try {
      const res = await axiosClient.delete("/cart/waiter/");
      return res.data;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to clear cart" }
      );
    }
  }
);

/* =========================
   Slice
========================= */

const waiterCartSlice = createSlice({
  name: "waiterCart",
  initialState: {
    items: [],
    subtotal: "0.00",
    cartCount: 0,
    total_discount: 0,
    original_subtotal: 0,
    loading: false,
    error: null,
    fetched: false,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchWaiterCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWaiterCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.subtotal = action.payload.subtotal;
        state.cartCount = action.payload.items.length;
        state.total_discount = action.payload.total_discount;
        state.original_subtotal = action.payload.original_subtotal;
        state.fetched = true;
      })
      .addCase(fetchWaiterCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.fetched = true;
      })

      // ADD
      .addCase(addToWaiterCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.subtotal = action.payload.subtotal;
        state.cartCount = action.payload.items.length;
        state.total_discount = action.payload.total_discount;
        state.original_subtotal = action.payload.original_subtotal;
      })

      // UPDATE
      .addCase(updateWaiterCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.subtotal = action.payload.subtotal;
        state.cartCount = action.payload.items.length;
        state.total_discount = action.payload.total_discount;
        state.original_subtotal = action.payload.original_subtotal;
      })

      // REMOVE
      .addCase(removeFromWaiterCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.subtotal = action.payload.subtotal;
        state.cartCount = action.payload.items.length;
        state.total_discount = action.payload.total_discount;
        state.original_subtotal = action.payload.original_subtotal;
      })

      // CLEAR
      .addCase(clearWaiterCart.fulfilled, (state) => {
        state.items = [];
        state.subtotal = "0.00";
        state.cartCount = 0;
        state.total_discount = 0;
        state.original_subtotal = 0;
      });
  },
});

export default waiterCartSlice.reducer;