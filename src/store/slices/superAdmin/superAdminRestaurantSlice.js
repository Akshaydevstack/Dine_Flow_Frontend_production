import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";

const getOrderingParam = (sortBy) =>
  ({
    newest: "-created_at",
    oldest: "created_at",
    nameAsc: "name",
    nameDesc: "-name",
  })[sortBy] || "-created_at";

export const fetchSuperAdminRestaurants = createAsyncThunk(
  "superAdminRestaurants/fetch",
  async (filters, { rejectWithValue }) => {
    try {
      const params = {
        page: filters.currentPage,
        page_size: filters.itemsPerPage,
        ordering: getOrderingParam(filters.sortBy),
      };

      if (filters.searchQuery?.trim())
        params.search = filters.searchQuery.trim();
      if (filters.isActive !== null) params.is_active = filters.isActive;

      if (filters.dateMode === "exact" && filters.exactDate) {
        params.created_date = filters.exactDate;
      } else {
        if (filters.startDate) params.created_date_gte = filters.startDate;
        if (filters.endDate) params.created_date_lte = filters.endDate;
      }

      const res = await axiosClient.get("/auth/super-admin/restaurants/", {
        params,
      });
      return {
        results: res.data.results ?? res.data,
        count: res.data.count ?? 0,
        next: res.data.next ?? null,
      };
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.detail || "Failed to fetch restaurants",
      });
    }
  },
);

export const createSuperAdminRestaurant = createAsyncThunk(
  "superAdminRestaurants/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post(
        "/auth/super-admin/restaurants/",
        payload,
      );
      return res.data.restaurant;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data || "Failed to create restaurant",
      });
    }
  },
);

export const updateSuperAdminRestaurant = createAsyncThunk(
  "superAdminRestaurants/update",
  async ({ publicId, data }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.patch(
        `/auth/super-admin/restaurants/${publicId}/`,
        data,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data || "Failed to update restaurant",
      });
    }
  },
);

export const deleteSuperAdminRestaurant = createAsyncThunk(
  "superAdminRestaurants/delete",
  async (publicId, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/auth/super-admin/restaurants/${publicId}/`);
      return publicId;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data || "Failed to delete restaurant",
      });
    }
  },
);

export const initialRestaurantFilters = {
  searchQuery: "",
  isActive: null,
  dateMode: null,
  exactDate: null,
  startDate: null,
  endDate: null,
  sortBy: "newest",
  currentPage: 1,
  itemsPerPage: 20,
};

const superAdminRestaurantSlice = createSlice({
  name: "superAdminRestaurants",
  initialState: {
    restaurants: [],
    loading: false,
    isRefreshing: false,
    loadingMore: false,
    fetched: false,
    error: null,
    successMessage: null,
    errorMessage: null,
    filters: initialRestaurantFilters,
    pagination: { totalItems: 0, hasNext: false },
  },

  reducers: {
    setRestaurantSearch(state, { payload }) {
      state.filters.searchQuery = payload;
      state.filters.currentPage = 1;
    },
    setRestaurantFilter(state, { payload }) {
      Object.assign(state.filters, payload);
      state.filters.currentPage = 1;
    },
    setRestaurantPage(state, { payload }) {
      state.filters.currentPage = payload;
    },
    resetRestaurantFilters(state) {
      state.filters = initialRestaurantFilters;
    },
    clearRestaurantMessages(state) {
      state.successMessage = null;
      state.errorMessage = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchSuperAdminRestaurants.pending, (s, { meta }) => {
        const page = meta.arg.currentPage;
        if (page > 1) s.loadingMore = true;
        else if (s.fetched) s.isRefreshing = true;
        else s.loading = true;
        s.error = null;
      })
      .addCase(fetchSuperAdminRestaurants.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.isRefreshing = false;
        s.loadingMore = false;
        s.fetched = true;
        if (s.filters.currentPage > 1) {
          const seen = new Set(s.restaurants.map((r) => r.public_id));
          s.restaurants = [
            ...s.restaurants,
            ...payload.results.filter((r) => !seen.has(r.public_id)),
          ];
        } else {
          s.restaurants = payload.results;
        }
        s.pagination = { totalItems: payload.count, hasNext: !!payload.next };
      })
      .addCase(fetchSuperAdminRestaurants.rejected, (s, { payload }) => {
        s.loading = false;
        s.isRefreshing = false;
        s.loadingMore = false;
        s.error = payload?.message;
      })
      .addCase(createSuperAdminRestaurant.pending, (s) => {
        s.successMessage = null;
        s.errorMessage = null;
      })
      .addCase(createSuperAdminRestaurant.fulfilled, (s, { payload }) => {
        s.restaurants.unshift(payload);
        s.successMessage = "Restaurant created successfully";
      })
      .addCase(createSuperAdminRestaurant.rejected, (s, { payload }) => {
        s.errorMessage = payload?.message;
      })
      .addCase(updateSuperAdminRestaurant.pending, (s) => {
        s.successMessage = null;
        s.errorMessage = null;
      })
      .addCase(updateSuperAdminRestaurant.fulfilled, (s, { payload }) => {
        const idx = s.restaurants.findIndex(
          (r) => r.public_id === payload.public_id,
        );
        if (idx !== -1) s.restaurants[idx] = payload;
        s.successMessage = "Restaurant updated successfully";
      })
      .addCase(updateSuperAdminRestaurant.rejected, (s, { payload }) => {
        s.errorMessage = payload?.message;
      })
      .addCase(deleteSuperAdminRestaurant.pending, (s) => {
        s.successMessage = null;
        s.errorMessage = null;
      })
      .addCase(deleteSuperAdminRestaurant.fulfilled, (s, { payload }) => {
        s.restaurants = s.restaurants.filter((r) => r.public_id !== payload);
        s.successMessage = "Restaurant deleted successfully";
      })
      .addCase(deleteSuperAdminRestaurant.rejected, (s, { payload }) => {
        s.errorMessage = payload?.message;
      });
  },
});

export const {
  setRestaurantSearch,
  setRestaurantFilter,
  setRestaurantPage,
  resetRestaurantFilters,
  clearRestaurantMessages,
} = superAdminRestaurantSlice.actions;

export default superAdminRestaurantSlice.reducer;

export const selectSuperAdminRestaurants = (s) =>
  s.superAdminRestaurants.restaurants;
export const selectSuperAdminRestaurantLoading = (s) =>
  s.superAdminRestaurants.loading;
export const selectSuperAdminRestaurantRefreshing = (s) =>
  s.superAdminRestaurants.isRefreshing;
export const selectSuperAdminRestaurantLoadingMore = (s) =>
  s.superAdminRestaurants.loadingMore;
export const selectSuperAdminRestaurantFetched = (s) =>
  s.superAdminRestaurants.fetched;
export const selectSuperAdminRestaurantFilters = (s) =>
  s.superAdminRestaurants.filters;
export const selectSuperAdminRestaurantPagination = (s) =>
  s.superAdminRestaurants.pagination;
export const selectSuperAdminRestaurantSuccess = (s) =>
  s.superAdminRestaurants.successMessage;
export const selectSuperAdminRestaurantError = (s) =>
  s.superAdminRestaurants.errorMessage;
