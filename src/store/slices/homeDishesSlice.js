import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

/* =========================================================
   ASYNC THUNKS
========================================================= */

// 🔥 Popular
export const fetchHomePopular = createAsyncThunk(
  "home/fetchPopular",
  async (_, thunkApi) => {
    try {
      const res = await axiosClient.get("/menu/customer/dishes/", {
        params: {
          is_popular: true,
          is_available: true,
          page_size: 6,
        },
      });
      return res.data.results;
    } catch {
      return thunkApi.rejectWithValue("Failed to fetch popular dishes");
    }
  }
);

// 🚀 Trending
export const fetchHomeTrending = createAsyncThunk(
  "home/fetchTrending",
  async (_, thunkApi) => {
    try {
      const res = await axiosClient.get("/menu/customer/dishes/", {
        params: {
          is_trending: true,
          is_available: true,
          ordering: "-priority",
          page_size: 6,
        },
      });
      return res.data.results;
    } catch {
      return thunkApi.rejectWithValue("Failed to fetch trending dishes");
    }
  }
);

// 🥬 Veg
export const fetchHomeVeg = createAsyncThunk(
  "home/fetchVeg",
  async (_, thunkApi) => {
    try {
      const res = await axiosClient.get("/menu/customer/dishes/", {
        params: {
          is_veg: true,
          is_available: true,
          ordering: "-priority",
          page_size: 6,
        },
      });
      return res.data.results;
    } catch {
      return thunkApi.rejectWithValue("Failed to fetch veg dishes");
    }
  }
);

// ⚡ Quick Bites
export const fetchHomeQuickBites = createAsyncThunk(
  "home/fetchQuickBites",
  async (_, thunkApi) => {
    try {
      const res = await axiosClient.get("/menu/customer/dishes/", {
        params: {
          is_quick_bites: true,
          is_available: true,
          ordering: "-priority",
          page_size: 6,
        },
      });
      return res.data.results;
    } catch {
      return thunkApi.rejectWithValue("Failed to fetch quick bites");
    }
  }
);

// 🤖 AI Recommendations
export const fetchAiRecommendations = createAsyncThunk(
  "home/fetchAiRecommendations",
  async (_, thunkApi) => {
    try {
      const res = await axiosClient.get("/ai/recommendations/");
      return res.data;
    } catch {
      return thunkApi.rejectWithValue("Failed to fetch AI recommendations");
    }
  }
);

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  popular: [],
  trending: [],
  veg: [],
  quickBites: [],
  recommendations: [],
  recommendationsLoading: false,
  recommendationsError: null,
  recommendationsFetched: false,

  loading: false,
  error: null,
  fetched: false,
};

/* =========================================================
   SLICE
========================================================= */

const homeDishesSlice = createSlice({
  name: "homeDishes",
  initialState,

  reducers: {
    resetHomeDishes() {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchHomePopular.fulfilled, (state, action) => {
        state.popular = action.payload;
      })

      .addCase(fetchHomeTrending.fulfilled, (state, action) => {
        state.trending = action.payload;
      })

      .addCase(fetchHomeVeg.fulfilled, (state, action) => {
        state.veg = action.payload;
      })

      .addCase(fetchHomeQuickBites.fulfilled, (state, action) => {
        state.quickBites = action.payload;
      })

      // 🤖 AI Recommendations — separate loading state
      .addCase(fetchAiRecommendations.pending, (state) => {
        state.recommendationsLoading = true;
        state.recommendationsError = null;
      })
      .addCase(fetchAiRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload;
        state.recommendationsLoading = false;
        state.recommendationsFetched = true;
      })
      .addCase(fetchAiRecommendations.rejected, (state, action) => {
        state.recommendationsLoading = false;
        state.recommendationsError = action.payload;
      })

      .addMatcher(
        (action) => action.type.startsWith("home/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addMatcher(
        (action) => action.type.startsWith("home/") && action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
          state.fetched = true;
        }
      )

      .addMatcher(
        (action) => action.type.startsWith("home/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
  },
});

/* =========================================================
   EXPORTS
========================================================= */

export const { resetHomeDishes } = homeDishesSlice.actions;
export default homeDishesSlice.reducer;

/* ================= SELECTORS ================= */

export const selectHomePopular = (state) => state.homeDishes.popular;
export const selectHomeTrending = (state) => state.homeDishes.trending;
export const selectHomeVeg = (state) => state.homeDishes.veg;
export const selectHomeQuickBites = (state) => state.homeDishes.quickBites;
export const selectHomeLoading = (state) => state.homeDishes.loading;
export const selectHomeFetched = (state) => state.homeDishes.fetched;
export const selectHomeError = (state) => state.homeDishes.error;

export const selectRecommendations = (state) => state.homeDishes.recommendations;
export const selectRecommendationsLoading = (state) => state.homeDishes.recommendationsLoading;
export const selectRecommendationsFetched = (state) => state.homeDishes.recommendationsFetched;
export const selectRecommendationsError = (state) => state.homeDishes.recommendationsError;