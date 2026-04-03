import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";

const getOrderingParam = (sortBy) =>
  ({
    newest:   "-created_at",
    oldest:   "created_at",
    nameAsc:  "name",
    nameDesc: "-name",
  })[sortBy] || "-created_at";

/* ======================================================
   FETCH RESTAURANT STAFF
====================================================== */
export const fetchRestaurantStaff = createAsyncThunk(
  "superAdminStaff/fetch",
  async (filters, { rejectWithValue }) => {
    try {
      const params = {
        page:      filters.currentPage,
        page_size: filters.itemsPerPage,
        ordering:  getOrderingParam(filters.sortBy),
      };

      if (filters.searchQuery?.trim())
        params.search = filters.searchQuery.trim();

      if (filters.role)
        params.role = filters.role;

      if (filters.isActive !== null && filters.isActive !== undefined)
        params.is_active = filters.isActive;

      const res = await axiosClient.get(
        "/auth/super-admin/restaurants/staff/",
        { params }
      );

      return {
        results: res.data.results ?? res.data,
        count:   res.data.count   ?? 0,
        next:    res.data.next    ?? null,
      };
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.detail || "Failed to fetch restaurant staff",
      });
    }
  }
);

/* ======================================================
   BLOCK ALL STAFF IN A RESTAURANT
   ⚠ FIX: removed accidental double-slash in URL
====================================================== */
export const blockRestaurantStaff = createAsyncThunk(
  "superAdminStaff/blockRestaurantStaff",
  async ({ restaurantId, is_active }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.patch(
        `/auth/super-admin/restaurants/${restaurantId}/block-staff/`, // ← FIXED (was /auth//super-admin/...)
        { is_active }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.detail || err.response?.data || "Failed to update restaurant staff",
      });
    }
  }
);

/* ======================================================
   BLOCK SINGLE STAFF MEMBER
   ⚠ FIX: removed accidental double-slash in URL
====================================================== */
export const blockSingleStaff = createAsyncThunk(
  "superAdminStaff/blockSingleStaff",
  async ({ publicId, is_active }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.patch(
        `/auth/super-admin/staff/${publicId}/block/`, // ← FIXED (was /auth//super-admin/...)
        { is_active }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.detail || err.response?.data || "Failed to update staff",
      });
    }
  }
);

/* ======================================================
   INITIAL FILTERS
====================================================== */
export const initialStaffFilters = {
  searchQuery:  "",
  role:         null,
  isActive:     null,
  sortBy:       "newest",
  currentPage:  1,
  itemsPerPage: 20,
};

/* ======================================================
   SLICE
====================================================== */
const superAdminStaffSlice = createSlice({
  name: "superAdminStaff",

  initialState: {
    restaurants:    [],
    loading:        false,
    isRefreshing:   false,
    loadingMore:    false,
    fetched:        false,
    error:          null,
    successMessage: null,
    errorMessage:   null,
    filters:        initialStaffFilters,
    pagination: {
      totalItems: 0,
      hasNext:    false,
    },
  },

  reducers: {
    setStaffSearch(state, { payload }) {
      state.filters.searchQuery  = payload;
      state.filters.currentPage  = 1;
    },
    setStaffFilter(state, { payload }) {
      Object.assign(state.filters, payload);
      state.filters.currentPage = 1;
    },
    setStaffPage(state, { payload }) {
      state.filters.currentPage = payload;
    },
    resetStaffFilters(state) {
      state.filters = initialStaffFilters;
    },
    clearStaffMessages(state) {
      state.successMessage = null;
      state.errorMessage   = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ── FETCH ── */
      .addCase(fetchRestaurantStaff.pending, (s, { meta }) => {
        const page = meta.arg.currentPage;
        if (page > 1)   s.loadingMore  = true;
        else if (s.fetched) s.isRefreshing = true;
        else            s.loading      = true;
        s.error = null;
      })
      .addCase(fetchRestaurantStaff.fulfilled, (s, { payload }) => {
        s.loading      = false;
        s.isRefreshing = false;
        s.loadingMore  = false;
        s.fetched      = true;

        if (s.filters.currentPage > 1) {
          const seen = new Set(s.restaurants.map(r => r.restaurant_id));
          s.restaurants = [
            ...s.restaurants,
            ...payload.results.filter(r => !seen.has(r.restaurant_id)),
          ];
        } else {
          s.restaurants = payload.results;
        }

        s.pagination = {
          totalItems: payload.count,
          hasNext:    !!payload.next,
        };
      })
      .addCase(fetchRestaurantStaff.rejected, (s, { payload }) => {
        s.loading      = false;
        s.isRefreshing = false;
        s.loadingMore  = false;
        s.error        = payload?.message;
      })

      /* ── BLOCK ALL IN RESTAURANT ── */
      .addCase(blockRestaurantStaff.fulfilled, (s, { meta }) => {
        const { restaurantId, is_active } = meta.arg;
        const restaurant = s.restaurants.find(r => r.restaurant_id === restaurantId);
        if (!restaurant) return;
        const updateList = list => list.map(u => ({ ...u, is_active }));
        restaurant.admins        = updateList(restaurant.admins);
        restaurant.waiters       = updateList(restaurant.waiters);
        restaurant.kitchen_staff = updateList(restaurant.kitchen_staff);
        s.successMessage = "Restaurant staff updated successfully";
      })
      .addCase(blockRestaurantStaff.rejected, (s, { payload }) => {
        s.errorMessage = payload?.message;
      })

      /* ── BLOCK SINGLE STAFF ── */
      .addCase(blockSingleStaff.fulfilled, (s, { meta }) => {
        const { publicId, is_active } = meta.arg;
        s.restaurants.forEach(restaurant => {
          const update = list =>
            list.map(u => u.public_id === publicId ? { ...u, is_active } : u);
          restaurant.admins        = update(restaurant.admins);
          restaurant.waiters       = update(restaurant.waiters);
          restaurant.kitchen_staff = update(restaurant.kitchen_staff);
        });
        s.successMessage = "Staff updated successfully";
      })
      .addCase(blockSingleStaff.rejected, (s, { payload }) => {
        s.errorMessage = payload?.message;
      });
  },
});

export const {
  setStaffSearch,
  setStaffFilter,
  setStaffPage,
  resetStaffFilters,
  clearStaffMessages,
} = superAdminStaffSlice.actions;

export default superAdminStaffSlice.reducer;

/* ======================================================
   SELECTORS
====================================================== */
export const selectSuperAdminStaffRestaurants  = s => s.superAdminStaff.restaurants;
export const selectSuperAdminStaffLoading      = s => s.superAdminStaff.loading;
export const selectSuperAdminStaffRefreshing   = s => s.superAdminStaff.isRefreshing;
export const selectSuperAdminStaffLoadingMore  = s => s.superAdminStaff.loadingMore;
export const selectSuperAdminStaffFetched      = s => s.superAdminStaff.fetched;
export const selectSuperAdminStaffFilters      = s => s.superAdminStaff.filters;
export const selectSuperAdminStaffPagination   = s => s.superAdminStaff.pagination;
export const selectSuperAdminStaffSuccess      = s => s.superAdminStaff.successMessage;
export const selectSuperAdminStaffError        = s => s.superAdminStaff.errorMessage;