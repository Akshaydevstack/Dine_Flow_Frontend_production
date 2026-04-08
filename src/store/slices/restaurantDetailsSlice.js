import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

// Fetch restaurant details
export const fetchRestaurantDetails = createAsyncThunk(
  "customer/restaurantDetails",
  async (_, thunkApi) => {
    try {
      const res = await axiosClient.get("auth/customer/restaurant-details/");
      return res.data;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to fetch restaurant details" }
      );
    }
  }
);

const restaurantDetailsSlice = createSlice({
  name: "restaurantDetails",
  initialState: {
    restaurant: null,
    loading: false,
    error: null,
    fetched: false,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurantDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurant = action.payload;
        state.fetched = true;
      })
      .addCase(fetchRestaurantDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.fetched = true;
      });
  },
});

export default restaurantDetailsSlice.reducer;