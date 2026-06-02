import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";

/* =========================================================
   HELPERS
========================================================= */

const getOrderingParam = (sortBy) =>
  ({
    numberAsc: "table_number",
    numberDesc: "-table_number",
    newest: "-created_at",
    capacityLow: "capacity",
    capacityHigh: "-capacity",
  })[sortBy] || "table_number";

const generateCacheKey = (f) =>
  JSON.stringify({
    s: f.searchQuery,
    occ: f.isOccupied,
    act: f.isActive,
    res: f.isReserved,
    zone: f.zone,
    type: f.tableType,
    minCap: f.capacityMin,
    maxCap: f.capacityMax,
    o: f.sortBy,
    p: f.currentPage,
  });

/* =========================================================
   ZONE THUNKS
========================================================= */

export const fetchAdminZones = createAsyncThunk(
  "adminTables/fetchZones",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/auth/restaurant-admin/zones/");
      return res.data.results ?? res.data;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.detail || "Failed to fetch zones",
      });
    }
  },
);

export const createAdminZone = createAsyncThunk(
  "adminTables/createZone",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post(
        "/auth/restaurant-admin/zones/",
        payload,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue({
        message:
          err.response?.data?.detail ||
          err.response?.data ||
          "Failed to create zone",
      });
    }
  },
);

export const updateAdminZone = createAsyncThunk(
  "adminTables/updateZone",
  async ({ publicId, data }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.patch(
        `/auth/restaurant-admin/zones/${publicId}/`,
        data,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue({
        message:
          err.response?.data?.detail ||
          err.response?.data ||
          "Failed to update zone",
      });
    }
  },
);

export const deleteAdminZone = createAsyncThunk(
  "adminTables/deleteZone",
  async (publicId, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/auth/restaurant-admin/zones/${publicId}/`);
      return publicId;
    } catch (err) {
      return rejectWithValue({
        message:
          err.response?.data?.detail ||
          err.response?.data ||
          "Failed to delete zone",
      });
    }
  },
);

/* =========================================================
   TABLE THUNKS
========================================================= */

export const fetchAdminTables = createAsyncThunk(
  "adminTables/fetch",
  async (filtersArg, { getState, rejectWithValue }) => {
    try {
      // 🟢 FIX 1: Safely grab filters from state if none are passed
      const filters = filtersArg || getState().adminTables.filters;

      const cacheKey = generateCacheKey(filters);
      const isLoadMore = filters.currentPage > 1;

      // Only use cache for load-more pages, NOT for page 1 refreshes
      if (isLoadMore) {
        const cached = getState().adminTables.cache[cacheKey];
        if (cached) return { ...cached, cacheKey, fromCache: true, isLoadMore };
      }

      const params = {
        page: filters.currentPage,
        page_size: filters.itemsPerPage,
        ordering: getOrderingParam(filters.sortBy),
      };

      if (filters.searchQuery?.trim())
        params.search = filters.searchQuery.trim();
      if (filters.isOccupied !== null) params.is_occupied = filters.isOccupied;
      if (filters.isActive !== null) params.is_active = filters.isActive;
      if (filters.isReserved !== null)
        params.is_reserved_manual = filters.isReserved;
      if (filters.zone) params["zone__public_id"] = filters.zone;
      if (filters.tableType) params.table_type = filters.tableType;
      if (filters.capacityMin) params["capacity__gte"] = filters.capacityMin;
      if (filters.capacityMax) params["capacity__lte"] = filters.capacityMax;

      const res = await axiosClient.get("/auth/restaurant-admin/tables/", {
        params,
      });
      return {
        results: res.data.results ?? res.data,
        count: res.data.count ?? 0,
        next: res.data.next ?? null,
        cacheKey,
        fromCache: false,
        isLoadMore,
      };
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.detail || "Failed to fetch tables",
      });
    }
  },
);

export const fetchAdminTableStats = createAsyncThunk(
  "adminTables/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/auth/restaurant-admin/tables/stats/");
      return res.data;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.detail || "Failed to fetch table stats",
      });
    }
  },
);

export const createAdminTable = createAsyncThunk(
  "adminTables/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post(
        "/auth/restaurant-admin/tables/",
        payload,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue({
        message:
          err.response?.data?.detail ||
          err.response?.data ||
          "Failed to create table",
      });
    }
  },
);

export const updateAdminTable = createAsyncThunk(
  "adminTables/update",
  async ({ publicId, data }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.patch(
        `/auth/restaurant-admin/tables/${publicId}/`,
        data,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue({
        message:
          err.response?.data?.detail ||
          err.response?.data ||
          "Failed to update table",
      });
    }
  },
);

export const deleteAdminTable = createAsyncThunk(
  "adminTables/delete",
  async (publicId, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/auth/restaurant-admin/tables/${publicId}/`);
      return publicId;
    } catch (err) {
      return rejectWithValue({
        message:
          err.response?.data?.detail ||
          err.response?.data ||
          "Failed to delete table",
      });
    }
  },
);

/* =========================================================
   INITIAL STATE
========================================================= */

export const initialTableFilters = {
  searchQuery: "",
  isOccupied: null,
  isActive: null,
  isReserved: null,
  zone: null,
  tableType: null,
  capacityMin: null,
  capacityMax: null,
  sortBy: "numberAsc",
  currentPage: 1,
  itemsPerPage: 50,
};

export const initialTableStats = {
  total: 0,
  active: 0,
  inactive: 0,
  occupied: 0,
  available: 0,
  reserved: 0,
  standard_tables: 0,
  counter_tables: 0,
  delivery_tables: 0,
};

/* =========================================================
   HELPERS — shared mutation boilerplate
========================================================= */

const mutationPending = (successKey, errorKey) => (state) => {
  state[successKey] = null;
  state[errorKey] = null;
};

const mutationRejected = (errorKey, fallback) => (state, action) => {
  state[errorKey] = action.payload?.message || fallback;
};

/* =========================================================
   SLICE
========================================================= */

const adminTableSlice = createSlice({
  name: "adminTables",
  initialState: {
    /* tables */
    tables: [],
    loading: false, // true only on first-ever fetch (no data yet)
    isRefreshing: false, // true on search/filter re-fetch — keeps cards visible
    loadingMore: false,
    fetched: false, // true once the first successful fetch completes
    zoneFeched :false,
    error: null,
    tableSuccess: null,
    tableError: null,

    /* stats */
    stats: initialTableStats,
    statsLoading: false,
    statsError: null,

    /* zones */
    zones: [],
    zonesLoading: false,
    zoneError: null,
    zoneSuccess: null,

    filters: initialTableFilters,
    pagination: { totalItems: 0, hasNext: false },
    cache: {},
  },

  reducers: {
    setTableSearch(state, { payload }) {
      state.filters.searchQuery = payload;
      state.filters.currentPage = 1;
      state.cache = {};
    },
    setTableFilter(state, { payload }) {
      Object.assign(state.filters, payload);
      state.filters.currentPage = 1;
      state.cache = {};
    },
    setTablePage(state, { payload }) {
      state.filters.currentPage = payload;
    },
    resetTableFilters(state) {
      state.filters = initialTableFilters;
      state.cache = {};
    },
    clearTableMessages(state) {
      state.tableSuccess = null;
      state.tableError = null;
    },
    clearZoneMessages(state) {
      state.zoneSuccess = null;
      state.zoneError = null;
    },
    // 🟢 FIX 2: Added invalidate cache action
    invalidateAdminTables(state) {
      state.fetched = false;
      state.cache = {};
    },
  },

  extraReducers: (builder) => {
    builder
      /* ── ZONES ── */
      .addCase(fetchAdminZones.pending, (s) => {
        s.zonesLoading = true;
      })
      .addCase(fetchAdminZones.fulfilled, (s, { payload }) => {
        s.zonesLoading = false;
        s.zones = payload;
        s.zoneFeched = true
      })
      .addCase(fetchAdminZones.rejected, (s, { payload }) => {
        s.zonesLoading = false;
        s.zoneError = payload?.message;
      })

      .addCase(
        createAdminZone.pending,
        mutationPending("zoneSuccess", "zoneError"),
      )
      .addCase(createAdminZone.fulfilled, (s, { payload }) => {
        s.zones.push(payload);
        s.zoneSuccess = "Zone created successfully!";
      })
      .addCase(
        createAdminZone.rejected,
        mutationRejected("zoneError", "Failed to create zone"),
      )

      .addCase(
        updateAdminZone.pending,
        mutationPending("zoneSuccess", "zoneError"),
      )
      .addCase(updateAdminZone.fulfilled, (s, { payload }) => {
        const idx = s.zones.findIndex((z) => z.public_id === payload.public_id);
        if (idx !== -1) s.zones[idx] = payload;
        s.zoneSuccess = "Zone updated successfully!";
      })
      .addCase(
        updateAdminZone.rejected,
        mutationRejected("zoneError", "Failed to update zone"),
      )

      .addCase(
        deleteAdminZone.pending,
        mutationPending("zoneSuccess", "zoneError"),
      )
      .addCase(deleteAdminZone.fulfilled, (s, { payload }) => {
        s.zones = s.zones.filter((z) => z.public_id !== payload);
        s.zoneSuccess = "Zone deleted successfully!";
      })
      .addCase(
        deleteAdminZone.rejected,
        mutationRejected("zoneError", "Failed to delete zone"),
      )

      /* ── STATS ── */
      .addCase(fetchAdminTableStats.pending, (s) => {
        s.statsLoading = true;
        s.statsError = null;
      })
      .addCase(fetchAdminTableStats.fulfilled, (s, { payload }) => {
        s.statsLoading = false;
        s.stats = payload;
        s.fetched = true
      })
      .addCase(fetchAdminTableStats.rejected, (s, { payload }) => {
        s.statsLoading = false;
        s.statsError = payload?.message;
      })

      /* ── TABLES FETCH ── */
      .addCase(fetchAdminTables.pending, (s, { meta }) => {
        // 🟢 FIX 3: Optional chaining here prevents the crash!
        const page = meta.arg?.currentPage || 1;
        
        if (page > 1) {
          s.loadingMore = true;
        } else if (s.fetched) {
          // Already have data — dim grid, don't wipe it
          s.isRefreshing = true;
        } else {
          // Very first load
          s.loading = true;
        }
        s.error = null;
      })
      .addCase(
        fetchAdminTables.fulfilled,
        (
          s,
          {
            payload: { results, count, next, cacheKey, fromCache, isLoadMore },
          },
        ) => {
          s.loading = false;
          s.isRefreshing = false;
          s.loadingMore = false;
          s.fetched = true;

          if (isLoadMore) {
            const seen = new Set(s.tables.map((t) => t.public_id));
            s.tables = [
              ...s.tables,
              ...results.filter((t) => !seen.has(t.public_id)),
            ];
            // Cache load-more pages
            if (!fromCache && cacheKey)
              s.cache[cacheKey] = { results, count, next };
          } else {
            s.tables = results;
            // Don't cache page-1 results — always re-fetch for freshness
          }

          s.pagination = { totalItems: count, hasNext: !!next };
        },
      )
      .addCase(fetchAdminTables.rejected, (s, { payload }) => {
        s.loading = false;
        s.isRefreshing = false;
        s.loadingMore = false;
        s.error = payload?.message;
      })

      /* ── TABLE MUTATIONS ── */
      .addCase(
        createAdminTable.pending,
        mutationPending("tableSuccess", "tableError"),
      )
      .addCase(createAdminTable.fulfilled, (s, { payload }) => {
        s.tables.unshift(payload);
        s.cache = {};
        s.tableSuccess = "Table created successfully!";
      })
      .addCase(
        createAdminTable.rejected,
        mutationRejected("tableError", "Failed to create table"),
      )

      .addCase(
        updateAdminTable.pending,
        mutationPending("tableSuccess", "tableError"),
      )
      .addCase(updateAdminTable.fulfilled, (s, { payload }) => {
        const idx = s.tables.findIndex(
          (t) => t.public_id === payload.public_id,
        );
        if (idx !== -1) s.tables[idx] = payload;
        s.cache = {};
        s.tableSuccess = "Table updated successfully!";
      })
      .addCase(
        updateAdminTable.rejected,
        mutationRejected("tableError", "Failed to update table"),
      )

      .addCase(
        deleteAdminTable.pending,
        mutationPending("tableSuccess", "tableError"),
      )
      .addCase(deleteAdminTable.fulfilled, (s, { payload }) => {
        s.tables = s.tables.filter((t) => t.public_id !== payload);
        s.cache = {};
        s.tableSuccess = "Table deleted successfully!";
      })
      .addCase(
        deleteAdminTable.rejected,
        mutationRejected("tableError", "Failed to delete table"),
      );
  },
});

/* =========================================================
   EXPORTS
========================================================= */

export const {
  setTableSearch,
  setTableFilter,
  setTablePage,
  resetTableFilters,
  clearTableMessages,
  clearZoneMessages,
  invalidateAdminTables, // 🟢 FIX 2: Exported!
} = adminTableSlice.actions;

export default adminTableSlice.reducer;

/* =========================================================
   SELECTORS
========================================================= */

export const selectAdminTables = (s) => s.adminTables.tables;
export const selectAdminZones = (s) => s.adminTables.zones;
export const selectAdminTableLoading = (s) => s.adminTables.loading;
export const selectAdminTableRefreshing = (s) => s.adminTables.isRefreshing;
export const selectAdminTableLoadingMore = (s) => s.adminTables.loadingMore;
export const selectAdminTableFetched = (s) => s.adminTables.fetched;
export const selectAdminZonesLoading = (s) => s.adminTables.zonesLoading;
export const selectAdminTableFilters = (s) => s.adminTables.filters;
export const selectAdminTablePagination = (s) => s.adminTables.pagination;
export const selectAdminTableSuccess = (s) => s.adminTables.tableSuccess;
export const selectAdminTableError = (s) => s.adminTables.tableError;
export const selectAdminZoneSuccess = (s) => s.adminTables.zoneSuccess;
export const selectAdminZoneError = (s) => s.adminTables.zoneError;
export const selectAdminZoneFetched = (s) => s.adminTables.zoneFeched;

/* stats */
export const selectAdminTableStats = (s) => s.adminTables.stats;
export const selectAdminTableStatsLoading = (s) => s.adminTables.statsLoading;
export const selectAdminTableStatsError = (s) => s.adminTables.statsError;