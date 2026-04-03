import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";

/* =========================================================
   THUNKS
========================================================= */

/* Fetch Restaurant Details */

export const fetchRestaurantDetails = createAsyncThunk(
  "restaurantDetails/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/auth/restaurant-admin/restaurant/");

      return res.data;
    } catch (err) {
      return rejectWithValue({
        message:
          err.response?.data?.detail || "Failed to fetch restaurant details",
      });
    }
  },
);

/* Update Restaurant */

export const updateRestaurantDetails = createAsyncThunk(
  "restaurantDetails/update",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosClient.patch(
        "/auth/restaurant-admin/restaurant/",
        payload,
      );

      return res.data;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data || "Failed to update restaurant",
      });
    }
  },
);

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  restaurant: null,

  loading: true, // ← start true so skeleton shows immediately on mount
  isRefreshing: false,
  fetched: false,

  error: null,

  successMessage: null,
  errorMessage: null,
};

/* =========================================================
   SLICE
========================================================= */

const restaurantDetailsSlice = createSlice({
  name: "restaurantDetails",

  initialState,

  reducers: {
    clearRestaurantMessages(state) {
      state.successMessage = null;
      state.errorMessage = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* FETCH */

      .addCase(fetchRestaurantDetails.pending, (state) => {
        if (state.fetched) {
          state.isRefreshing = true;
        } else {
          state.loading = true;
        }

        state.error = null;
      })

      .addCase(fetchRestaurantDetails.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.isRefreshing = false;

        state.restaurant = payload;

        state.fetched = true;
      })

      .addCase(fetchRestaurantDetails.rejected, (state, { payload }) => {
        state.loading = false;
        state.isRefreshing = false;

        state.error = payload?.message;
      })

      /* UPDATE */

      .addCase(updateRestaurantDetails.pending, (state) => {
        state.successMessage = null;
        state.errorMessage = null;
      })

      .addCase(updateRestaurantDetails.fulfilled, (state, { payload }) => {
        state.restaurant = payload;

        state.successMessage = "Restaurant updated successfully";
      })

      .addCase(updateRestaurantDetails.rejected, (state, { payload }) => {
        state.errorMessage = payload?.message;
      });
  },
});

/* =========================================================
   EXPORTS
========================================================= */

export const { clearRestaurantMessages } = restaurantDetailsSlice.actions;

export default restaurantDetailsSlice.reducer;

/* =========================================================
   SELECTORS
========================================================= */


export const selectRestaurantDetails = (state) =>
  state.adminRestaurantDetails.restaurant;

export const selectRestaurantLoading = (state) =>
  state.adminRestaurantDetails.loading;

export const selectRestaurantRefreshing = (state) =>
  state.adminRestaurantDetails.isRefreshing;

export const selectRestaurantFetched = (state) =>
  state.adminRestaurantDetails.fetched;

export const selectRestaurantSuccess = (state) =>
  state.adminRestaurantDetails.successMessage;

export const selectRestaurantError = (state) =>
  state.adminRestaurantDetails.errorMessage;
