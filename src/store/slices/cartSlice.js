import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

/* =========================
   Thunks
========================= */

// Fetch cart
export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, thunkApi) => {
    try {
      const res = await axiosClient.get("/cart/customer/");
      return res.data; // ✅ { items, subtotal }
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to fetch cart" }
      );
    }
  }
);

// Add to cart
export const addToCart = createAsyncThunk(
  "cart/add",
  async ({ dish_id, quantity = 1 }, thunkApi) => {
    try {
      const res = await axiosClient.post("/cart/customer/add-items/", {
        dish_id,
        quantity,
      });
      return res.data; // ✅ full cart
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to add item to cart" }
      );
    }
  }
);

// Update quantity
export const updateCartItem = createAsyncThunk(
  "cart/update",
  async ({ dish_id, quantity }, thunkApi) => {
    try {
      const res = await axiosClient.patch(
        `/cart/customer/update-item/${dish_id}/`,
        { quantity }
      );
      return res.data; // ✅ full cart
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to update cart item" }
      );
    }
  }
);

// Remove from cart
export const removeFromCart = createAsyncThunk(
  "cart/remove",
  async (dish_id, thunkApi) => {
    try {
      const res = await axiosClient.delete(`/cart/customer/remove-item/${dish_id}/`);
      return res.data; // ✅ full cart
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to remove item from cart" }
      );
    }
  }
);

// Clear cart
export const clearCart = createAsyncThunk(
  "cart/clear",
  async (_, thunkApi) => {
    try {
      const res = await axiosClient.delete("/cart/customer/");
      return res.data; // ✅ empty cart response
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

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    subtotal: "0.00",
    cartCount: 0,
    total_discount:0,
    original_subtotal:0,
    loading: false,
    error: null,
    fetched: false,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder

      // ---------- FETCH ----------
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.subtotal = action.payload.subtotal;
        state.cartCount = action.payload.items.length;
        state.fetched = true;
        state.total_discount = action.payload.total_discount;
        state.original_subtotal = action.payload.original_subtotal
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.fetched = true;
      })

      // ---------- ADD ----------
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.subtotal = action.payload.subtotal;
        state.cartCount = action.payload.items.length;
        state.total_discount = action.payload.total_discount
        state.original_subtotal = action.payload.original_subtotal
      })

      // ---------- UPDATE ----------
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.subtotal = action.payload.subtotal;
        state.cartCount = action.payload.items.length;
        state.total_discount = action.payload.total_discount
        state.original_subtotal = action.payload.original_subtotal
      })

      // ---------- REMOVE ----------
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.subtotal = action.payload.subtotal;
        state.cartCount = action.payload.items.length;
        state.total_discount = action.payload.total_discount
        state.original_subtotal = action.payload.original_subtotal
      })

      // ---------- CLEAR ----------
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.subtotal = "0.00";
        state.cartCount = 0;
      });
  },
});

export default cartSlice.reducer;