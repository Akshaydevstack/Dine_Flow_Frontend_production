import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";

/* =========================================================
   API
========================================================= */

const ORDER_STATUS_API = "/order/restaurant-admin/orders/order-status/";

const KITCHEN_STATUS_API = "/kitchen/restaurant-admin/tickets/tickest-stats/";

const HOURLY_SALES_API = "/order/restaurant-admin/orders/hourly-sales/";

const CATEGORY_STATS_API = "/menu/restaurant-admin/category-stats/";

const TOP_DISHES_API = "/order/restaurant-admin/orders/top-dishes/";

const CUSTOMER_STATUS_API = "/auth/restaurant-admin/customers-status/";

const DISH_STATS_API = "/menu/restaurant-admin/dish-stats/";

/* =========================================================
   THUNK
========================================================= */

export const fetchAdminDashboard = createAsyncThunk(
  "adminDashboard/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(ORDER_STATUS_API);

      // Store raw backend response directly
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail ?? "Failed to fetch dashboard data",
      );
    }
  },
);

export const fetchKitchenDashboard = createAsyncThunk(
  "adminDashboard/fetchKitchen",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(KITCHEN_STATUS_API);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail ?? "Failed to fetch kitchen stats",
      );
    }
  },
);

export const fetchHourlySales = createAsyncThunk(
  "adminDashboard/fetchHourlySales",
  async (date, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(HOURLY_SALES_API, {
        params: { date },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail ?? "Failed to fetch hourly sales",
      );
    }
  },
);

export const fetchCategoryStats = createAsyncThunk(
  "adminDashboard/fetchCategoryStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(CATEGORY_STATS_API);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail ?? "Failed to fetch category stats",
      );
    }
  },
);

export const fetchTopDishes = createAsyncThunk(
  "adminDashboard/fetchTopDishes",
  async (date = null, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(TOP_DISHES_API, {
        params: date ? { date } : {},
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail ?? "Failed to fetch top dishes",
      );
    }
  },
);

export const fetchCustomerStatus = createAsyncThunk(
  "adminDashboard/fetchCustomerStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(CUSTOMER_STATUS_API);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail ?? "Failed to fetch customer stats",
      );
    }
  },
);

export const fetchDishStats = createAsyncThunk(
  "adminDashboard/fetchDishStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(DISH_STATS_API);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail ?? "Failed to fetch dish stats",
      );
    }
  },
);
/* =========================================================
   INITIAL STATE
========================================================= */
const initialState = {
  orderStats: {},
  kitchenStats: {},
  hourlySales: null,
  categoryStats: [],
  topDishes: null,
  customerStats: null,
  dishStats: null, // ✅ added
  loading: false,
  error: null,
  fetched: false,
  lastUpdated: null,
  hourlySalesLoading: false,
  categoryStatsLoading: false,
  topDishesLoading: false,
  customerStatsLoading: false,
  dishStatsLoading: false, // ✅ added
};
/* =========================================================
   SLICE
========================================================= */

const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {
    invalidateDashboard(state) {
      state.fetched = false;
    },
    clearDashboardError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // Order status reducer

    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        if (!state.fetched) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.orderStats = payload; // 🔥 direct assignment
        state.fetched = true;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchAdminDashboard.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // Kitchen status

      .addCase(fetchKitchenDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKitchenDashboard.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.kitchenStats = payload; // 🔥 store kitchen stats
        state.lastUpdated = Date.now();
      })
      .addCase(fetchKitchenDashboard.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      //  hourly sales data

      .addCase(fetchHourlySales.pending, (state) => {
        state.hourlySalesLoading = true;
      })
      .addCase(fetchHourlySales.fulfilled, (state, { payload }) => {
        state.hourlySalesLoading = false;
        state.hourlySales = payload;
      })
      .addCase(fetchHourlySales.rejected, (state, { payload }) => {
        state.hourlySalesLoading = false;
        state.error = payload;
      })

      // Category stats

      .addCase(fetchCategoryStats.pending, (state) => {
        state.categoryStatsLoading = true;
      })
      .addCase(fetchCategoryStats.fulfilled, (state, { payload }) => {
        state.categoryStatsLoading = false;
        state.categoryStats = payload;
      })
      .addCase(fetchCategoryStats.rejected, (state, { payload }) => {
        state.categoryStatsLoading = false;
        state.error = payload;
      })

      // Top Dishes

      .addCase(fetchTopDishes.pending, (state) => {
        state.topDishesLoading = true;
      })
      .addCase(fetchTopDishes.fulfilled, (state, { payload }) => {
        state.topDishesLoading = false;
        state.topDishes = payload;
      })
      .addCase(fetchTopDishes.rejected, (state, { payload }) => {
        state.topDishesLoading = false;
        state.error = payload;
      })

      // Customer Status

      .addCase(fetchCustomerStatus.pending, (state) => {
        state.customerStatsLoading = true;
      })
      .addCase(fetchCustomerStatus.fulfilled, (state, { payload }) => {
        state.customerStatsLoading = false;
        state.customerStats = payload;
      })
      .addCase(fetchCustomerStatus.rejected, (state, { payload }) => {
        state.customerStatsLoading = false;
        state.error = payload;
      })

      // Dish Stats

      .addCase(fetchDishStats.pending, (state) => {
        state.dishStatsLoading = true;
      })
      .addCase(fetchDishStats.fulfilled, (state, { payload }) => {
        state.dishStatsLoading = false;
        state.dishStats = payload;
      })
      .addCase(fetchDishStats.rejected, (state, { payload }) => {
        state.dishStatsLoading = false;
        state.error = payload;
      });
  },
});

/* =========================================================
   EXPORTS
========================================================= */

export const { invalidateDashboard, clearDashboardError } =
  adminDashboardSlice.actions;

export default adminDashboardSlice.reducer;

/* =========================================================
   SELECTORS
========================================================= */

export const selectDashboardOrderStats = (s) => s.adminDashboard.orderStats;
export const selectDashboardKitchenStats = (s) => s.adminDashboard.kitchenStats;

export const selectDashboardLoading = (s) => s.adminDashboard.loading;
export const selectDashboardFetched = (s) => s.adminDashboard.fetched;
export const selectDashboardError = (s) => s.adminDashboard.error;

export const selectHourlySales = (s) => s.adminDashboard.hourlySales;
export const selectHourlySalesLoading = (s) =>
  s.adminDashboard.hourlySalesLoading;

export const selectCategoryStats = (s) => s.adminDashboard.categoryStats;
export const selectCategoryStatsLoading = (s) =>
  s.adminDashboard.categoryStatsLoading;

export const selectTopDishes = (s) => s.adminDashboard.topDishes;
export const selectTopDishesLoading = (s) => s.adminDashboard.topDishesLoading;

export const selectCustomerStats = (s) => s.adminDashboard.customerStats;
export const selectCustomerStatsLoading = (s) =>
  s.adminDashboard.customerStatsLoading;


export const selectDishStats = (s) =>
  s.adminDashboard.dishStats;
export const selectDishStatsLoading = (s) =>
  s.adminDashboard.dishStatsLoading;