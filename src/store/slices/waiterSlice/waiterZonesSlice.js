import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";

// Fetch waiter zones
export const fetchWaiterZones = createAsyncThunk(
  "waiter/zones",
  async (_, thunkApi) => {
    try {
      const res = await axiosClient.get("/auth/waiter/zones/");
      return res.data;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to fetch zones" }
      );
    }
  }
);

const waiterZonesSlice = createSlice({
  name: "waiterZones",
  initialState: {
    zones: [],
    loading: false,
    error: null,
    fetched: false,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchWaiterZones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWaiterZones.fulfilled, (state, action) => {
        state.loading = false;
        state.zones = action.payload;
        state.fetched = true;
      })
      .addCase(fetchWaiterZones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.fetched = true;
      });
  },
});

export default waiterZonesSlice.reducer;