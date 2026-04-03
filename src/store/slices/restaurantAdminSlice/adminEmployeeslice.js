import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";

/* =========================================================
   HELPERS
========================================================= */

const EMPLOYEE_API = "/auth/restaurant-admin/employee-management";

const getOrderingParam = (sortBy) =>
  ({
    newest:  "-created_at",
    oldest:  "created_at",
    nameAZ:  "username",
    nameZA:  "-username",
    emailAZ: "email",
    emailZA: "-email",
  })[sortBy] ?? "-created_at";

const generateCacheKey = (f) =>
  JSON.stringify({
    s: f.searchQuery?.trim() ?? "",
    r: f.role,
    a: f.activeStatus,
    o: f.sortBy,
    p: f.currentPage,
  });

/* =========================================================
   THUNKS
========================================================= */

export const fetchAdminEmployees = createAsyncThunk(
  "adminEmployees/fetch",
  async (filters, { getState, rejectWithValue }) => {
    try {
      const cacheKey   = generateCacheKey(filters);
      const isLoadMore = filters.currentPage > 1;
      const cached     = getState().adminEmployees.cache[cacheKey];

      if (cached) return { ...cached, cacheKey, fromCache: true, isLoadMore };

      const params = {
        page:      filters.currentPage,
        page_size: filters.itemsPerPage,
        ordering:  getOrderingParam(filters.sortBy),
      };

      if (filters.searchQuery?.trim())    params.search    = filters.searchQuery.trim();
      if (filters.role !== "all")         params.role      = filters.role;
      if (filters.activeStatus !== "all") params.is_active = filters.activeStatus;

      const res = await axiosClient.get(`${EMPLOYEE_API}/`, { params });

      const filteredResults = (res.data.results ?? []).filter(
        (emp) => emp.role !== "super-admin"
      );

      return {
        results:   filteredResults,
        count:     res.data.count ?? 0,
        next:      res.data.next  ?? null,
        cacheKey,
        fromCache: false,
        isLoadMore,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail ?? "Failed to fetch employees"
      );
    }
  }
);

export const createAdminEmployee = createAsyncThunk(
  "adminEmployees/create",
  async (data, { rejectWithValue }) => {
    try {
      const backendData = {
        first_name:      data.first_name,
        email:         data.email,
        mobile_number: data.phone_number,
        role:          data.role,
        is_active:     data.is_active,
        password:      data.password,
      };
      if (!backendData.password) delete backendData.password;

      const res = await axiosClient.post(`${EMPLOYEE_API}/`, backendData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data ?? "Failed to create employee");
    }
  }
);

export const updateAdminEmployee = createAsyncThunk(
  "adminEmployees/update",
  async ({ publicId, data }, { rejectWithValue }) => {
    try {
      const backendData = { ...data };

      // Map phone_number → mobile_number only when phone_number is present
      if ("phone_number" in backendData) {
        backendData.mobile_number = backendData.phone_number;
        delete backendData.phone_number;
      }

      // Don't send empty password on update
      if (backendData.password === "" || backendData.password === undefined) {
        delete backendData.password;
      }

      const res = await axiosClient.patch(
        `${EMPLOYEE_API}/${publicId}/`,
        backendData
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data ?? "Failed to update employee");
    }
  }
);

export const deleteAdminEmployee = createAsyncThunk(
  "adminEmployees/delete",
  async (publicId, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`${EMPLOYEE_API}/${publicId}/`);
      return publicId;
    } catch (err) {
      return rejectWithValue(err.response?.data ?? "Failed to delete employee");
    }
  }
);

/* =========================================================
   INITIAL STATE
========================================================= */

export const initialEmployeeFilters = {
  searchQuery:  "",
  role:         "all",
  activeStatus: "all",
  sortBy:       "newest",
  currentPage:  1,
  itemsPerPage: 20,
};

/* =========================================================
   HELPERS — shared mutation boilerplate
========================================================= */

const mutationPending = (s, { meta }) => {
  s.success = null;
  s.error   = null;
  if (meta?.arg?.publicId) s.mutating[meta.arg.publicId] = true;
};

const mutationRejected = (s, { payload, meta }) => {
  const msg =
    typeof payload === "string"
      ? payload
      : payload?.detail ||
        payload?.message ||
        Object.values(payload ?? {})[0] ||
        "Something went wrong";
  s.error = msg;
  if (meta?.arg?.publicId) delete s.mutating[meta.arg.publicId];
};

/* =========================================================
   SLICE
========================================================= */

const adminEmployeeSlice = createSlice({
  name: "adminEmployees",
  initialState: {
    employees:    [],
    filters:      initialEmployeeFilters,
    pagination:   { totalItems: 0, hasNext: false },
    cache:        {},
    loading:      false,   // true only on FIRST load (no employees yet)
    isRefreshing: false,   // true on search/filter change — keeps existing cards visible
    loadingMore:  false,
    error:        null,
    success:      null,
    fetched:      false,
    mutating:     {},
  },

  reducers: {
    setEmployeeSearch(state, { payload }) {
      state.filters.searchQuery = payload;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    setEmployeeRoleFilter(state, { payload }) {
      state.filters.role        = payload;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    setEmployeeActiveFilter(state, { payload }) {
      state.filters.activeStatus = payload;
      state.filters.currentPage  = 1;
      state.cache = {};
    },
    setEmployeeSortBy(state, { payload }) {
      state.filters.sortBy      = payload;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    setEmployeeCurrentPage(state, { payload }) {
      state.filters.currentPage = payload;
    },
    resetEmployeeFilters(state) {
      state.filters = initialEmployeeFilters;
      state.cache   = {};
    },
    invalidateEmployees(state) {
      state.fetched = false;
      state.cache   = {};
    },
    clearEmployeeMessages(state) {
      state.success = null;
      state.error   = null;
    },
    clearEmployeeError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ── FETCH ── */
      .addCase(fetchAdminEmployees.pending, (state, { meta }) => {
        const page = meta.arg.currentPage;
        if (page > 1) {
          state.loadingMore = true;
        } else if (state.fetched) {
          // Already have data — show subtle refresh indicator, don't wipe grid
          state.isRefreshing = true;
        } else {
          // First ever load — show full spinner
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchAdminEmployees.fulfilled, (state, { payload }) => {
        const { results, count, next, cacheKey, fromCache, isLoadMore } = payload;

        state.loading      = false;
        state.isRefreshing = false;
        state.loadingMore  = false;
        state.fetched      = true;

        if (isLoadMore) {
          const seen = new Set(state.employees.map((e) => e.public_id));
          state.employees = [
            ...state.employees,
            ...results.filter((e) => !seen.has(e.public_id)),
          ];
        } else {
          state.employees = results;
        }

        state.pagination = { totalItems: count, hasNext: !!next };
        if (!fromCache && cacheKey) {
          state.cache[cacheKey] = { results, count, next };
        }
      })
      .addCase(fetchAdminEmployees.rejected, (state, { payload }) => {
        state.loading      = false;
        state.isRefreshing = false;
        state.loadingMore  = false;
        state.error        = payload;
      })

      /* ── CREATE ── */
      .addCase(createAdminEmployee.pending, (state) => {
        state.success = null;
        state.error   = null;
      })
      .addCase(createAdminEmployee.fulfilled, (state, { payload }) => {
        state.employees.unshift(payload);
        state.cache   = {};
        state.success = `Employee ${payload.username} added successfully!`;
      })
      .addCase(createAdminEmployee.rejected, (state, { payload }) => {
        const msg =
          typeof payload === "string"
            ? payload
            : payload?.detail ||
              payload?.message ||
              Object.values(payload ?? {})[0] ||
              "Failed to create employee";
        state.error = msg;
      })

      /* ── UPDATE ── */
      .addCase(updateAdminEmployee.pending,   mutationPending)
      .addCase(updateAdminEmployee.fulfilled, (state, { payload, meta }) => {
        const idx = state.employees.findIndex(
          (e) => e.public_id === payload.public_id
        );
        if (idx !== -1) state.employees[idx] = payload;
        state.cache   = {};
        state.success = "Employee updated successfully!";
        if (meta?.arg?.publicId) delete state.mutating[meta.arg.publicId];
      })
      .addCase(updateAdminEmployee.rejected, mutationRejected)

      /* ── DELETE ── */
      .addCase(deleteAdminEmployee.pending, (state, { meta }) => {
        state.success = null;
        state.error   = null;
        if (meta?.arg) state.mutating[meta.arg] = true;
      })
      .addCase(deleteAdminEmployee.fulfilled, (state, { payload }) => {
        state.employees = state.employees.filter((e) => e.public_id !== payload);
        state.cache     = {};
        state.success   = "Employee removed successfully!";
        delete state.mutating[payload];
      })
      .addCase(deleteAdminEmployee.rejected, (state, { payload, meta }) => {
        const msg =
          typeof payload === "string"
            ? payload
            : payload?.detail ||
              payload?.message ||
              Object.values(payload ?? {})[0] ||
              "Failed to delete employee";
        state.error = msg;
        if (meta?.arg) delete state.mutating[meta.arg];
      });
  },
});

/* =========================================================
   EXPORTS
========================================================= */

export const {
  setEmployeeSearch,
  setEmployeeRoleFilter,
  setEmployeeActiveFilter,
  setEmployeeSortBy,
  setEmployeeCurrentPage,
  resetEmployeeFilters,
  invalidateEmployees,
  clearEmployeeMessages,
  clearEmployeeError,
} = adminEmployeeSlice.actions;

export default adminEmployeeSlice.reducer;

/* =========================================================
   SELECTORS
========================================================= */

export const selectAdminEmployees       = (s) => s.adminEmployees.employees;
export const selectEmployeeFilters      = (s) => s.adminEmployees.filters;
export const selectEmployeePagination   = (s) => s.adminEmployees.pagination;
export const selectEmployeeLoading      = (s) => s.adminEmployees.loading;
export const selectEmployeeRefreshing   = (s) => s.adminEmployees.isRefreshing;
export const selectEmployeeLoadingMore  = (s) => s.adminEmployees.loadingMore;
export const selectEmployeeError        = (s) => s.adminEmployees.error;
export const selectEmployeeSuccess      = (s) => s.adminEmployees.success;
export const selectEmployeeFetched      = (s) => s.adminEmployees.fetched;
export const selectEmployeeMutating     = (s) => s.adminEmployees.mutating;