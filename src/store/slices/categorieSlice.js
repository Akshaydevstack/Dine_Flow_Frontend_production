import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

// Fetch categories
export const fetchCategories = createAsyncThunk(
  "customer/categories",
  async (_, thunkApi) => {
    try {
      const res = await axiosClient.get("/menu/customer/categories/");
      return res.data.results;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to fetch categories" },
      );
    }
  },
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState: {
    categories: [],
    loading: false,
    error: null,
    fetched: false,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.fetched = true;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.fetched = true;
      });
  },
});

export default categoriesSlice.reducer;
