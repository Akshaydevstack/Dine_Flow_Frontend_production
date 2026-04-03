import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";


export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/notification/customer/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Fetch failed");
    }
  },
);


export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.patch(`/notification/customer/${id}/read/`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Mark read failed");
    }
  },
);


export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async () => true,
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
    loading: false,
    hasNewNotification: false,
    needsRefresh: true,
    lastFetchedAt: null,
  },
  reducers: {
    notificationArrived(state) {
      state.hasNewNotification = true;
      state.needsRefresh = true;
    },

    notificationAcknowledged(state) {
      state.hasNewNotification = false;
    },

    resetNotifications(state) {
      state.list = [];
      state.loading = false;
      state.needsRefresh = true;
      state.lastFetchedAt = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
        state.hasNewNotification = action.payload.some(
          (n) => n.is_read === false,
        );
        state.needsRefresh = false;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
        state.needsRefresh = false;
      })

      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = action.payload;
        const n = state.list.find((n) => n.id === id);
        if (n) n.is_read = true;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.list = state.list.map((n) => ({
          ...n,
          is_read: true,
        }));
      });
  },
});

export const {
  notificationArrived,
  notificationAcknowledged,
  resetNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
