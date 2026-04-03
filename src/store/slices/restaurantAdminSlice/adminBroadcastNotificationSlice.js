import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";

/* =========================================================
   THUNKS
========================================================= */

// FETCH BROADCAST LIST
export const fetchBroadcastNotifications = createAsyncThunk(
  "adminBroadcast/fetch",
  async (_, { getState, rejectWithValue }) => {
    try {

      const { search } =
        getState().adminBroadcastNotifications.filters;

      const params = {};

      if (search?.trim()) {
        params.search = search.trim();
      }

      const res = await axiosClient.get(
        "/notification/restaurant-admin/notifications/broadcast/",
        { params }
      );

      return res.data;

    } catch (err) {
      return rejectWithValue({
        message:
          err.response?.data?.detail ||
          "Failed to fetch broadcast notifications",
      });
    }
  }
);


// CREATE BROADCAST
export const createBroadcastNotification = createAsyncThunk(
  "adminBroadcast/create",
  async (payload, { rejectWithValue }) => {
    try {

      const res = await axiosClient.post(
        "/notification/restaurant-admin/notifications/broadcast/",
        payload
      );

      return res.data;

    } catch (err) {
      return rejectWithValue({
        message:
          err.response?.data ||
          "Failed to create broadcast notification",
      });
    }
  }
);


// UPDATE BROADCAST
export const updateBroadcastNotification = createAsyncThunk(
  "adminBroadcast/update",
  async ({ referenceId, data }, { rejectWithValue }) => {
    try {

      await axiosClient.patch(
        `/notification/restaurant-admin/notifications/broadcast/${referenceId}/`,
        data
      );

      return { referenceId, data };

    } catch (err) {
      return rejectWithValue({
        message:
          err.response?.data ||
          "Failed to update broadcast notification",
      });
    }
  }
);


// DELETE BROADCAST
export const deleteBroadcastNotification = createAsyncThunk(
  "adminBroadcast/delete",
  async (referenceId, { rejectWithValue }) => {
    try {

      await axiosClient.delete(
        `/notification/restaurant-admin/notifications/broadcast/${referenceId}/`
      );

      return referenceId;

    } catch (err) {
      return rejectWithValue({
        message:
          err.response?.data ||
          "Failed to delete broadcast notification",
      });
    }
  }
);


/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  broadcasts: [],

  filters: {
    search: "",
  },

  loading: false,
  isRefreshing: false,
  fetched: false,

  error: null,

  successMessage: null,
  errorMessage: null,
};


/* =========================================================
   SLICE
========================================================= */

const adminBroadcastNotificationSlice = createSlice({
  name: "adminBroadcastNotifications",

  initialState,

  reducers: {

    setBroadcastSearch(state, { payload }) {
      state.filters.search = payload;
      state.fetched = false;
    },

    clearBroadcastMessages(state) {
      state.successMessage = null;
      state.errorMessage = null;
    },
  },

  extraReducers: (builder) => {

    builder

      /* FETCH */

      .addCase(fetchBroadcastNotifications.pending, (state) => {

        if (state.fetched) {
          state.isRefreshing = true;
        } else {
          state.loading = true;
        }

        state.error = null;
      })

      .addCase(fetchBroadcastNotifications.fulfilled, (state, { payload }) => {

        state.loading = false;
        state.isRefreshing = false;

        state.broadcasts = payload;

        state.fetched = true;
      })

      .addCase(fetchBroadcastNotifications.rejected, (state, { payload }) => {

        state.loading = false;
        state.isRefreshing = false;

        state.error = payload?.message;
      })


      /* CREATE */

      .addCase(createBroadcastNotification.pending, (state) => {
        state.successMessage = null;
        state.errorMessage = null;
      })

      .addCase(createBroadcastNotification.fulfilled, (state) => {

        state.successMessage = "Broadcast notification created";

        state.fetched = false;
      })

      .addCase(createBroadcastNotification.rejected, (state, { payload }) => {
        state.errorMessage = payload?.message;
      })


      /* UPDATE */

      .addCase(updateBroadcastNotification.pending, (state) => {
        state.successMessage = null;
        state.errorMessage = null;
      })

      .addCase(updateBroadcastNotification.fulfilled, (state, { payload }) => {

        const { referenceId, data } = payload;

        const index = state.broadcasts.findIndex(
          (b) => b.reference_id === referenceId
        );

        if (index !== -1) {
          state.broadcasts[index] = {
            ...state.broadcasts[index],
            ...data,
          };
        }

        state.successMessage = "Broadcast updated successfully";
      })

      .addCase(updateBroadcastNotification.rejected, (state, { payload }) => {
        state.errorMessage = payload?.message;
      })


      /* DELETE */

      .addCase(deleteBroadcastNotification.pending, (state) => {
        state.successMessage = null;
        state.errorMessage = null;
      })

      .addCase(deleteBroadcastNotification.fulfilled, (state, { payload }) => {

        state.broadcasts = state.broadcasts.filter(
          (b) => b.reference_id !== payload
        );

        state.successMessage = "Broadcast deleted successfully";
      })

      .addCase(deleteBroadcastNotification.rejected, (state, { payload }) => {
        state.errorMessage = payload?.message;
      });

  },
});


/* =========================================================
   EXPORTS
========================================================= */

export const {
  setBroadcastSearch,
  clearBroadcastMessages
} = adminBroadcastNotificationSlice.actions;

export default adminBroadcastNotificationSlice.reducer;


/* =========================================================
   SELECTORS
========================================================= */

export const selectBroadcastNotifications =
  (state) => state.adminBroadcastNotifications.broadcasts;

export const selectBroadcastLoading =
  (state) => state.adminBroadcastNotifications.loading;

export const selectBroadcastRefreshing =
  (state) => state.adminBroadcastNotifications.isRefreshing;

export const selectBroadcastFetched =
  (state) => state.adminBroadcastNotifications.fetched;

export const selectBroadcastSearch =
  (state) => state.adminBroadcastNotifications.filters.search;

export const selectBroadcastSuccess =
  (state) => state.adminBroadcastNotifications.successMessage;

export const selectBroadcastError =
  (state) => state.adminBroadcastNotifications.errorMessage;