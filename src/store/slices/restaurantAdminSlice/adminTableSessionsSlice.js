import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";

/* =========================================================
   HELPERS
========================================================= */

const generateCacheKey = (filters) =>
  JSON.stringify({
    r: filters.restaurantId,
    s: filters.status,
    z: filters.zoneId,
    t: filters.tableId,
    q: filters.searchQuery,
    p: filters.currentPage,
    df: filters.dateFrom,
    dt: filters.dateTo,
  });

/* =========================================================
   THUNKS
========================================================= */

/* FETCH TABLE SESSIONS */

export const fetchAdminTableSessions = createAsyncThunk(
  "adminTableSessions/fetch",
  async (filters, thunkApi) => {
    try {
      const state = thunkApi.getState();
      const cacheKey = generateCacheKey(filters);
      const isLoadMore = filters.currentPage > 1;

      if (state.adminTableSessions.cache[cacheKey]) {
        return {
          ...state.adminTableSessions.cache[cacheKey],
          cacheKey,
          fromCache: true,
          isLoadMore,
        };
      }

      const params = {
        page: filters.currentPage,
        page_size: filters.itemsPerPage,
      };

      if (filters.restaurantId) params.restaurant_id = filters.restaurantId;
      if (filters.status) params.status = filters.status;
      if (filters.zoneId) params.zone_public_id = filters.zoneId;
      if (filters.tableId) params.table_public_id = filters.tableId;

      if (filters.searchQuery?.trim())
        params.search = filters.searchQuery.trim();

      if (filters.dateFrom) params.from_date = filters.dateFrom;
      if (filters.dateTo) params.to_date = filters.dateTo;

      const res = await axiosClient.get(
        "/order/restaurant-admin/table-sessions/",
        { params },
      );

      return {
        results: res.data.results ?? [],
        count: res.data.count ?? 0,
        next: res.data.next ?? null,
        cacheKey,
        fromCache: false,
        isLoadMore,
      };
    } catch (err) {
      return thunkApi.rejectWithValue({
        message: err.response?.data?.detail || "Failed to fetch table sessions",
      });
    }
  },
);

/* CLOSE TABLE SESSION */

export const closeAdminTableSession = createAsyncThunk(
  "adminTableSessions/close",
  async (sessionId, thunkApi) => {
    try {
      await axiosClient.post(
        `/order/restaurant-admin/table-sessions/${sessionId}/close/`,
      );

      return sessionId;
    } catch (err) {
      return thunkApi.rejectWithValue({
        message: err.response?.data?.detail || "Failed to close table session",
      });
    }
  },
);

/* =========================================================
   INITIAL FILTERS
========================================================= */

const initialFilters = {
  restaurantId: null,
  status: null,
  zoneId: null,
  tableId: null,
  searchQuery: "",
  currentPage: 1,
  itemsPerPage: 20,
  dateFrom: null,
  dateTo: null,
};

/* =========================================================
   SLICE
========================================================= */

const adminTableSessionSlice = createSlice({
  name: "adminTableSessions",

  initialState: {
    sessions: [],

    loading: false,
    isRefreshing: false,
    loadingMore: false,
    fetched: false,

    closingIds: [],

    error: null,
    success: null,

    filters: initialFilters,

    pagination: {
      totalItems: 0,
      hasNext: false,
    },

    cache: {},
  },

  reducers: {
    setSessionSearch(state, { payload }) {
      state.filters.searchQuery = payload;
      state.filters.currentPage = 1;
      state.cache = {};
    },

    setSessionFilter(state, { payload }) {
      Object.assign(state.filters, payload);
      state.filters.currentPage = 1;
      state.cache = {};
    },

    setSessionDateRange(state, { payload: { dateFrom, dateTo } }) {
      state.filters.dateFrom = dateFrom ?? null;
      state.filters.dateTo = dateTo ?? null;
      state.filters.currentPage = 1;
      state.cache = {};
    },

    clearSessionDateRange(state) {
      state.filters.dateFrom = null;
      state.filters.dateTo = null;
      state.filters.currentPage = 1;
      state.cache = {};
    },

    setSessionPage(state, { payload }) {
      state.filters.currentPage = payload;
    },

    resetSessionFilters(state) {
      state.filters = initialFilters;
      state.cache = {};
    },

    clearSessionMessages(state) {
      state.error = null;
      state.success = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* FETCH */

      .addCase(fetchAdminTableSessions.pending, (state, { meta }) => {
        const page = meta.arg.currentPage;

        if (page > 1) state.loadingMore = true;
        else if (state.fetched) state.isRefreshing = true;
        else state.loading = true;

        state.error = null;
      })

      .addCase(fetchAdminTableSessions.fulfilled, (state, { payload }) => {
        const { results, count, next, cacheKey, fromCache, isLoadMore } =
          payload;

        state.loading = false;
        state.isRefreshing = false;
        state.loadingMore = false;
        state.fetched = true;

        if (isLoadMore) {
          const seen = new Set(state.sessions.map((s) => s.public_id));

          state.sessions = [
            ...state.sessions,
            ...results.filter((s) => !seen.has(s.public_id)),
          ];
        } else {
          state.sessions = results;
        }

        state.pagination = {
          totalItems: count,
          hasNext: !!next,
        };

        if (!fromCache && cacheKey) {
          state.cache[cacheKey] = { results, count, next };
        }
      })

      .addCase(fetchAdminTableSessions.rejected, (state, { payload }) => {
        state.loading = false;
        state.isRefreshing = false;
        state.loadingMore = false;
        state.error = payload?.message || "Failed to fetch table sessions";
      })

      /* CLOSE SESSION */

      .addCase(closeAdminTableSession.pending, (state, { meta }) => {
        state.closingIds.push(meta.arg);
      })

      .addCase(closeAdminTableSession.fulfilled, (state, { payload }) => {
        state.closingIds = state.closingIds.filter((id) => id !== payload);

        const session = state.sessions.find((s) => s.public_id === payload);

        if (session) {
          session.status = "CLOSED";
          session.closed_at = new Date().toISOString();
        }

        state.success = "Session closed successfully";
        state.cache = {};
      })

      .addCase(closeAdminTableSession.rejected, (state, { payload, meta }) => {
        state.closingIds = state.closingIds.filter((id) => id !== meta.arg);

        state.error = payload?.message || "Failed to close table session";
      });
  },
});

/* =========================================================
   EXPORTS
========================================================= */

export const {
  setSessionSearch,
  setSessionFilter,
  setSessionDateRange,
  clearSessionDateRange,
  setSessionPage,
  resetSessionFilters,
  clearSessionMessages,
} = adminTableSessionSlice.actions;

export default adminTableSessionSlice.reducer;

/* =========================================================
   SELECTORS
========================================================= */

export const selectAdminTableSessions = (s) => s.adminTableSessions.sessions;

export const selectAdminTableSessionLoading = (s) =>
  s.adminTableSessions.loading;

export const selectAdminTableSessionRefreshing = (s) =>
  s.adminTableSessions.isRefreshing;

export const selectAdminTableSessionLoadingMore = (s) =>
  s.adminTableSessions.loadingMore;

export const selectAdminTableSessionClosingIds = (s) =>
  s.adminTableSessions.closingIds;

export const selectAdminTableSessionError = (s) => s.adminTableSessions.error;

export const selectAdminTableSessionSuccess = (s) =>
  s.adminTableSessions.success;

export const selectAdminTableSessionFilters = (s) =>
  s.adminTableSessions.filters;

export const selectAdminTableSessionPageInfo = (s) =>
  s.adminTableSessions.pagination;

export const selectAdminTableSessionFeched = (s) =>
  s.adminTableSessions.fetched;
