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
  }
);

/* Update Restaurant */
export const updateRestaurantDetails = createAsyncThunk(
  "restaurantDetails/update",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosClient.patch(
        "/auth/restaurant-admin/restaurant/",
        payload
      );
      return res.data;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data || "Failed to update restaurant",
      });
    }
  }
);

/* Update Admin Profile (Requires Current Password) */
export const updateAdminProfile = createAsyncThunk(
  "restaurantDetails/updateAdmin",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosClient.patch(
        "/auth/restaurant-admin/profile/",
        payload
      );
      return res.data;
    } catch (err) {
      // Backend might return validation errors as an array or object, or a generic 'error' key
      const errMsg = err.response?.data?.error 
        || (err.response?.data?.current_password && err.response?.data?.current_password[0])
        || (err.response?.data?.email && err.response?.data?.email[0])
        || "Failed to update admin profile";
      return rejectWithValue({ message: errMsg });
    }
  }
);

/* 🔐 Request Password Reset OTP */
export const requestPasswordResetOTP = createAsyncThunk(
  "restaurantDetails/requestOTP",
  async (email, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post(
        "/auth/restaurant-admin/password-reset/request-otp/",
        { email }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.error || "Failed to send OTP",
      });
    }
  }
);

/* 🔐 Confirm Password Reset */
export const confirmPasswordReset = createAsyncThunk(
  "restaurantDetails/confirmPasswordReset",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post(
        "/auth/restaurant-admin/password-reset/confirm/",
        payload
      );
      return res.data;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.error || "Failed to reset password",
      });
    }
  }
);

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  restaurant: null,
  loading: true,
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
        if (state.fetched) state.isRefreshing = true;
        else state.loading = true;
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

      /* UPDATE RESTAURANT */
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
      })

      /* UPDATE ADMIN PROFILE */
      .addCase(updateAdminProfile.fulfilled, (state, { payload }) => {
        if (state.restaurant && payload.admin_details) {
          // Merge the updated admin details into the current state
          state.restaurant.admin_details = {
            ...state.restaurant.admin_details,
            ...payload.admin_details
          };
        }
        state.successMessage = payload.message || "Admin profile updated successfully";
      })
      .addCase(updateAdminProfile.rejected, (state, { payload }) => {
        state.errorMessage = payload?.message;
      })

      /* PASSWORD RESET (Just handling toasts) */
      .addCase(requestPasswordResetOTP.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message || "OTP sent to your email";
      })
      .addCase(requestPasswordResetOTP.rejected, (state, { payload }) => {
        state.errorMessage = payload?.message;
      })
      .addCase(confirmPasswordReset.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message || "Password changed successfully";
      })
      .addCase(confirmPasswordReset.rejected, (state, { payload }) => {
        state.errorMessage = payload?.message;
      });
  },
});

/* =========================================================
   EXPORTS & SELECTORS
========================================================= */

export const { clearRestaurantMessages } = restaurantDetailsSlice.actions;
export default restaurantDetailsSlice.reducer;

export const selectRestaurantDetails = (state) => state.adminRestaurantDetails.restaurant;
export const selectRestaurantLoading = (state) => state.adminRestaurantDetails.loading;
export const selectRestaurantRefreshing = (state) => state.adminRestaurantDetails.isRefreshing;
export const selectRestaurantFetched = (state) => state.adminRestaurantDetails.fetched;
export const selectRestaurantSuccess = (state) => state.adminRestaurantDetails.successMessage;
export const selectRestaurantError = (state) => state.adminRestaurantDetails.errorMessage;