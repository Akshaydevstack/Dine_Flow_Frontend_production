import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";

const buildQueryParams = (filters) => {
  const params = {
    page: filters.currentPage,
    page_size: filters.itemsPerPage,
  };
  if (filters.zone) params.zone = filters.zone;
  if (filters.status && filters.status !== "all") params.status = filters.status;
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.tableType) params.table_type = filters.tableType;
  return params;
};

export const fetchWaiterTables = createAsyncThunk(
  "waiterTables/fetch",
  async (filters, thunkApi) => {
    try {
      const params = buildQueryParams(filters);
      const res = await axiosClient.get("/auth/waiter/table/", { params });
      return {
        results: res.data.results || res.data || [],
        count: res.data.count || res.data.length || 0,
        next: res.data.next || null,
        previous: res.data.previous || null,
        isLoadMore: filters.currentPage > 1,
      };
    } catch (err) {
      return thunkApi.rejectWithValue({
        message: err.response?.data?.message || "Failed to fetch tables",
        status: err.response?.status,
      });
    }
  },
);

const initialFilters = {
  zone: null,
  status: "all",
  search: "",
  tableType: null,
  currentPage: 1,
  itemsPerPage: 20,
};

const initialState = {
  tables: [],
  filters: initialFilters,
  pagination: {
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  },
  loading: false,
  error: null,
  fetched: false,
};

const waiterTablesSlice = createSlice({
  name: "waiterTables",
  initialState,

  reducers: {
    setZone(state, action) {
      state.filters.zone = action.payload;
      state.filters.currentPage = 1;
      state.tables = [];
    },
    setStatus(state, action) {
      state.filters.status = action.payload;
      state.filters.currentPage = 1;
      state.tables = [];
    },
    setSearch(state, action) {
      state.filters.search = action.payload;
      state.filters.currentPage = 1;
      state.tables = [];
    },
    setTableType(state, action) {
      state.filters.tableType = action.payload;
      state.filters.currentPage = 1;
      state.tables = [];
    },
    setCurrentPage(state, action) {
      state.filters.currentPage = action.payload;
    },
    resetWaiterTables() {
      return { ...initialState };
    },
    clearError(state) {
      state.error = null;
    },
    updateTableSession(state, action) {
      const event = action.payload;
      const index = state.tables.findIndex(
        (t) => t.public_id === event.table_public_id,
      );
      if (index === -1) return;

      if (event.event_type === "TABLE_SESSION_STARTED") {
        state.tables[index].is_occupied = true;
        state.tables[index].occupied_by_user_id = event.user_id;
        state.tables[index].can_book = false;
      }
      if (event.event_type === "TABLE_SESSION_CLOSED") {
        state.tables[index].is_occupied = false;
        state.tables[index].occupied_by_user_id = null;
        state.tables[index].can_book = true;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchWaiterTables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWaiterTables.fulfilled, (state, action) => {
        const { results, count, next, previous, isLoadMore } = action.payload;

        state.loading = false;
        state.fetched = true;

        if (isLoadMore) {
          const existingIds = new Set(state.tables.map((t) => t.public_id));
          const newTables = results.filter((t) => !existingIds.has(t.public_id));
          state.tables = [...state.tables, ...newTables];
        } else {
          state.tables = results;
        }

        state.pagination.totalItems = count;
        state.pagination.totalPages = Math.ceil(count / state.filters.itemsPerPage);
        state.pagination.hasNext = !!next;
        state.pagination.hasPrevious = !!previous;
      })
      .addCase(fetchWaiterTables.rejected, (state, action) => {
        state.loading = false;
        state.error = { message: action.payload?.message || "Fetch failed" };
        state.fetched = true;
      });
  },
});

export const {
  setZone,
  setStatus,
  setSearch,
  setTableType,
  setCurrentPage,
  resetWaiterTables,
  clearError,
  updateTableSession,
} = waiterTablesSlice.actions;

export default waiterTablesSlice.reducer;

export const selectTables = (state) => state.waiterTables.tables;
export const selectWaiterFilters = (state) => state.waiterTables.filters;
export const selectWaiterPagination = (state) => state.waiterTables.pagination;
export const selectWaiterLoading = (state) => state.waiterTables.loading;
export const selectWaiterError = (state) => state.waiterTables.error;
export const selectWaiterFetched = (state) => state.waiterTables.fetched;