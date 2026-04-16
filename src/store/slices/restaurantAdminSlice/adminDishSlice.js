import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";

/* =========================================================
   HELPERS
========================================================= */

// ⚡ FIX: Added [sortBy] to properly extract the string, returning null if empty
const getOrderingParam = (sortBy) => {
  if (!sortBy) return null;
  return {
    priority:  "-priority",
    priceLow:  "price",
    priceHigh: "-price",
    newest:    "-created_at",
    popular:   "-total_orders",
  }[sortBy] || null;
};

const generateCacheKey = (filters) =>
  JSON.stringify({
    s:     filters.searchQuery,
    c:     filters.category,
    veg:   filters.isVeg,
    spicy: filters.isSpicy,
    avail: filters.isAvailable,
    min:   filters.priceMin,
    max:   filters.priceMax,
    o:     filters.sortBy,
    p:     filters.currentPage,
  });

/* =========================================================
   CATEGORY THUNKS
========================================================= */

export const fetchAdminCategories = createAsyncThunk(
  "adminDishes/fetchCategories",
  async (_, thunkApi) => {
    try {
      const res = await axiosClient.get("/menu/restaurant-admin/categories/");
      return { categories: res.data.results ?? [], count: res.data.count ?? 0 };
    } catch (err) {
      return thunkApi.rejectWithValue({
        message: err.response?.data?.detail || "Failed to fetch categories",
      });
    }
  }
);

export const createAdminCategory = createAsyncThunk(
  "adminDishes/createCategory",
  async (categoryData, thunkApi) => {
    try {
      const res = await axiosClient.post("/menu/restaurant-admin/categories/", categoryData);
      return res.data;
    } catch (err) {
      return thunkApi.rejectWithValue({
        message: err.response?.data?.detail || err.response?.data || "Failed to create category",
      });
    }
  }
);

export const updateAdminCategory = createAsyncThunk(
  "adminDishes/updateCategory",
  async ({ publicId, data }, thunkApi) => {
    try {
      const res = await axiosClient.patch(`/menu/restaurant-admin/categories/${publicId}/`, data);
      return res.data;
    } catch (err) {
      return thunkApi.rejectWithValue({
        message: err.response?.data?.detail || err.response?.data || "Failed to update category",
      });
    }
  }
);

export const deleteAdminCategory = createAsyncThunk(
  "adminDishes/deleteCategory",
  async (publicId, thunkApi) => {
    try {
      await axiosClient.delete(`/menu/restaurant-admin/categories/${publicId}/`);
      return publicId;
    } catch (err) {
      return thunkApi.rejectWithValue({
        message: err.response?.data?.detail || err.response?.data || "Failed to delete category",
      });
    }
  }
);

/* =========================================================
   DISH THUNKS
========================================================= */

export const fetchAdminDishes = createAsyncThunk(
  "adminDishes/fetch",
  async (filters, thunkApi) => {
    try {
      const state      = thunkApi.getState();
      const cacheKey   = generateCacheKey(filters);
      const isLoadMore = filters.currentPage > 1;

      if (state.adminDishes.cache[cacheKey]) {
        return { ...state.adminDishes.cache[cacheKey], cacheKey, fromCache: true, isLoadMore };
      }

      // ⚡ FIX: Base params without ordering
      const params = {
        page:      filters.currentPage,
        page_size: filters.itemsPerPage,
      };

      // ⚡ FIX: Only attach ordering if the user has actively selected a sort option
      const ordering = getOrderingParam(filters.sortBy);
      if (ordering) {
        params.ordering = ordering;
      }

      if (filters.searchQuery?.trim())    params.search                 = filters.searchQuery.trim();
      if (filters.category)               params["category__public_id"] = filters.category;
      if (filters.isVeg !== null)         params.is_veg                 = filters.isVeg;
      if (filters.isSpicy !== null)       params.is_spicy               = filters.isSpicy;
      if (filters.isAvailable !== null)   params.is_available           = filters.isAvailable;
      if (filters.priceMin)               params["price__gte"]          = filters.priceMin;
      if (filters.priceMax)               params["price__lte"]          = filters.priceMax;

      const res = await axiosClient.get("/menu/restaurant-admin/dishes/", { params });
      return {
        results:   res.data.results ?? res.data,
        count:     res.data.count   ?? 0,
        next:      res.data.next    ?? null,
        cacheKey,
        fromCache: false,
        isLoadMore,
      };
    } catch (err) {
      return thunkApi.rejectWithValue({
        message: err.response?.data?.detail || "Failed to fetch dishes",
      });
    }
  }
);

export const createAdminDish = createAsyncThunk(
  "adminDishes/create",
  async (payload, thunkApi) => {
    try {
      const res = await axiosClient.post(
        "/menu/restaurant-admin/dishes/",
        payload,
        payload instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}
      );
      return res.data;
    } catch (err) {
      return thunkApi.rejectWithValue({
        message: err.response?.data?.detail || err.response?.data || "Failed to create dish",
      });
    }
  }
);

export const updateAdminDish = createAsyncThunk(
  "adminDishes/update",
  async ({ publicId, data }, thunkApi) => {
    try {
      const res = await axiosClient.patch(
        `/menu/restaurant-admin/dishes/${publicId}/`,
        data,
        data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}
      );
      return res.data;
    } catch (err) {
      return thunkApi.rejectWithValue({
        message: err.response?.data?.detail || err.response?.data || "Failed to update dish",
      });
    }
  }
);

export const deleteAdminDish = createAsyncThunk(
  "adminDishes/delete",
  async (publicId, thunkApi) => {
    try {
      await axiosClient.delete(`/menu/restaurant-admin/dishes/${publicId}/`);
      return publicId;
    } catch (err) {
      return thunkApi.rejectWithValue({
        message: err.response?.data?.detail || err.response?.data || "Failed to delete dish",
      });
    }
  }
);

/* =========================================================
   INITIAL STATE
========================================================= */

const initialFilters = {
  searchQuery:  "",
  category:     null,
  isVeg:        null,
  isSpicy:      null,
  isAvailable:  null,
  priceMin:     0,
  priceMax:     null,
  sortBy:       "", // ⚡ FIX: Empty default so backend handles it
  currentPage:  1,
  itemsPerPage: 20,
};

/* =========================================================
   HELPERS — shared mutation boilerplate
========================================================= */

const mutationPending = (state) => {
  state.dishSuccess = null;
  state.dishError   = null;
};

const mutationRejected = (fallback) => (state, action) => {
  state.dishError = action.payload?.message || fallback;
};

const catMutationPending = (state) => {
  state.categorySuccess = null;
  state.categoryError   = null;
  state.categoriesLoading = true;
};

const catMutationRejected = (fallback) => (state, action) => {
  state.categoriesLoading = false;
  state.categoryError = action.payload?.message || fallback;
};

/* =========================================================
   SLICE
========================================================= */

const adminDishSlice = createSlice({
  name: "adminDishes",
  initialState: {
    /* dishes */
    dishes:       [],
    loading:      false,      // true only on first load (no data yet)
    isRefreshing: false,      // true on search/filter re-fetch — keeps cards visible
    loadingMore:  false,
    fetched:      false,      // true once first successful fetch completes
    error:        null,
    dishSuccess:  null,
    dishError:    null,

    /* categories */
    categories:        [],
    categoriesCount:   0,
    categoriesLoading: false,
    categoryError:     null,
    categorySuccess:   null,

    /* filters & pagination */
    filters:    initialFilters,
    pagination: { totalItems: 0, hasNext: false },
    cache:      {},
    needsCleanRefetch: false, // For deduplication edge cases
  },

  reducers: {
    setDishSearch(state, { payload }) {
      state.filters.searchQuery = payload;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    setDishCategory(state, { payload }) {
      state.filters.category    = payload;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    setDishSort(state, { payload }) {
      state.filters.sortBy      = payload;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    setDishVegFilter(state, { payload }) {
      state.filters.isVeg       = payload;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    setDishFilter(state, { payload }) {
      Object.assign(state.filters, payload);
      state.filters.currentPage = 1;
      state.cache = {};
    },
    setDishPage(state, { payload }) {
      state.filters.currentPage = payload;
    },
    resetDishFilters(state) {
      state.filters = initialFilters;
      state.cache   = {};
    },
    clearDishError(state) {
      state.error = null;
    },
    clearDishMessages(state) {
      state.dishSuccess = null;
      state.dishError   = null;
    },
    clearCategoryMessages(state) {
      state.categoryError   = null;
      state.categorySuccess = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ── FETCH CATEGORIES ── */
      .addCase(fetchAdminCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoryError     = null;
      })
      .addCase(fetchAdminCategories.fulfilled, (state, { payload }) => {
        state.categoriesLoading = false;
        state.categories        = payload.categories;
        state.categoriesCount   = payload.count;
      })
      .addCase(fetchAdminCategories.rejected, (state, { payload }) => {
        state.categoriesLoading = false;
        state.categoryError     = payload?.message || "Failed to fetch categories";
      })

      /* ── CREATE / UPDATE / DELETE CATEGORY ── */
      .addCase(createAdminCategory.pending,   catMutationPending)
      .addCase(createAdminCategory.fulfilled, (state, { payload }) => {
        state.categoriesLoading = false;
        state.categories.push(payload);
        state.categoriesCount  += 1;
        state.categorySuccess   = "Category created successfully!";
      })
      .addCase(createAdminCategory.rejected,  catMutationRejected("Failed to create category"))

      .addCase(updateAdminCategory.pending,   catMutationPending)
      .addCase(updateAdminCategory.fulfilled, (state, { payload }) => {
        state.categoriesLoading = false;
        const idx = state.categories.findIndex((c) => c.public_id === payload.public_id);
        if (idx !== -1) state.categories[idx] = payload;
        state.categorySuccess = "Category updated successfully!";
      })
      .addCase(updateAdminCategory.rejected,  catMutationRejected("Failed to update category"))

      .addCase(deleteAdminCategory.pending,   catMutationPending)
      .addCase(deleteAdminCategory.fulfilled, (state, { payload }) => {
        state.categoriesLoading = false;
        state.categories        = state.categories.filter((c) => c.public_id !== payload);
        state.categoriesCount  -= 1;
        state.categorySuccess   = "Category deleted successfully!";
      })
      .addCase(deleteAdminCategory.rejected,  catMutationRejected("Failed to delete category"))

      /* ── FETCH DISHES ── */
      .addCase(fetchAdminDishes.pending, (state, { meta }) => {
        const page = meta.arg.currentPage;
        if (page > 1) {
          state.loadingMore = true;
        } else if (state.fetched) {
          state.isRefreshing = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchAdminDishes.fulfilled, (state, { payload }) => {
        const { results, count, next, cacheKey, fromCache, isLoadMore } = payload;

        state.loading      = false;
        state.isRefreshing = false;
        state.loadingMore  = false;
        state.fetched      = true;

        if (isLoadMore) {
          const seen = new Set(state.dishes.map((d) => d.public_id));
          const newDishes = results.filter((d) => !seen.has(d.public_id));
          state.dishes = [...state.dishes, ...newDishes];

          if (state.dishes.length < count && !next) {
            state.needsCleanRefetch = true;
          }
        } else {
          state.dishes = results;
          state.needsCleanRefetch = false;
        }

        state.pagination = { totalItems: count, hasNext: !!next };
        if (!fromCache && cacheKey) state.cache[cacheKey] = { results, count, next };
      })
      .addCase(fetchAdminDishes.rejected, (state, { payload }) => {
        state.loading      = false;
        state.isRefreshing = false;
        state.loadingMore  = false;
        state.error        = payload?.message || "Failed to fetch dishes";
      })

      /* ── CREATE / UPDATE / DELETE DISH ── */
      .addCase(createAdminDish.pending,   mutationPending)
      .addCase(createAdminDish.fulfilled, (state, { payload }) => {
        const created = Array.isArray(payload) ? payload : [payload];
        state.dishes      = [...created, ...state.dishes];
        state.cache       = {};
        state.dishSuccess = "Dish created successfully!";
      })
      .addCase(createAdminDish.rejected,  mutationRejected("Failed to create dish"))

      .addCase(updateAdminDish.pending,   mutationPending)
      .addCase(updateAdminDish.fulfilled, (state, { payload }) => {
        const idx = state.dishes.findIndex((d) => d.public_id === payload.public_id);
        if (idx !== -1) state.dishes[idx] = payload;
        state.cache       = {};
        state.dishSuccess = "Dish updated successfully!";
      })
      .addCase(updateAdminDish.rejected,  mutationRejected("Failed to update dish"))

      .addCase(deleteAdminDish.pending,   mutationPending)
      .addCase(deleteAdminDish.fulfilled, (state, { payload }) => {
        state.dishes      = state.dishes.filter((d) => d.public_id !== payload);
        state.cache       = {};
        state.dishSuccess = "Dish deleted successfully!";
      })
      .addCase(deleteAdminDish.rejected,  mutationRejected("Failed to delete dish"));
  },
});

/* =========================================================
   ACTION EXPORTS
========================================================= */

export const {
  setDishSearch,
  setDishCategory,
  setDishSort,
  setDishVegFilter,
  setDishFilter,
  setDishPage,
  resetDishFilters,
  clearDishError,
  clearDishMessages,
  clearCategoryMessages,
} = adminDishSlice.actions;

export default adminDishSlice.reducer;

/* =========================================================
   SELECTORS
========================================================= */

export const selectAdminDishes             = (s) => s.adminDishes.dishes;
export const selectAdminDishLoading        = (s) => s.adminDishes.loading;
export const selectAdminDishRefreshing     = (s) => s.adminDishes.isRefreshing;
export const selectAdminDishLoadingMore    = (s) => s.adminDishes.loadingMore;
export const selectAdminDishFetched        = (s) => s.adminDishes.fetched;
export const selectAdminDishError          = (s) => s.adminDishes.error;
export const selectAdminDishSuccess        = (s) => s.adminDishes.dishSuccess;
export const selectAdminDishMutationError  = (s) => s.adminDishes.dishError;
export const selectAdminDishFilters        = (s) => s.adminDishes.filters;
export const selectAdminDishPagination     = (s) => s.adminDishes.pagination;

export const selectAdminCategories         = (s) => s.adminDishes.categories;
export const selectAdminCategoriesCount    = (s) => s.adminDishes.categoriesCount;
export const selectAdminCategoriesLoading  = (s) => s.adminDishes.categoriesLoading;
export const selectAdminCategoryError      = (s) => s.adminDishes.categoryError;
export const selectAdminCategorySuccess    = (s) => s.adminDishes.categorySuccess;
export const selectAdminDishNeedsRefetch   = (s) => s.adminDishes.needsCleanRefetch;