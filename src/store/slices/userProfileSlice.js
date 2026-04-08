import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

/* =========================
   Thunks
========================= */

export const fetchUserProfile = createAsyncThunk(
  "userProfile/fetchProfile",
  async (_, thunkApi) => {
    try {
      const res = await axiosClient.get("/auth/customer/profile/");
      return res.data;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to fetch user profile" }
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "userProfile/updateProfile",
  async (profileData, thunkApi) => {
    try {
      const res = await axiosClient.patch("/auth/customer/profile/", profileData);
      return res.data.data;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to update profile" }
      );
    }
  }
);

// ✅ NEW: Thunk for updating mobile number via Firebase
export const updateMobileWithFirebase = createAsyncThunk(
  "userProfile/updateMobile",
  async (payload, thunkApi) => {
    try {
      const res = await axiosClient.post("/auth/customer/profile/change-mobile/", payload);
      return res.data.data; 
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to verify and update mobile" }
      );
    }
  }
);

export const createAddress = createAsyncThunk(
  "userProfile/createAddress",
  async (addressData, thunkApi) => {
    try {
      const res = await axiosClient.post("/auth/customer/addresses/", addressData);
      return res.data.data;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Failed to create address" }
      );
    }
  }
);

/* =========================
   Slice
========================= */

const userProfileSlice = createSlice({
  name: "userProfile",
  initialState: {
    profile: null,
    loading: false,
    error: null,
    fetched: false,
    isUpdatingProfile: false,
    isAddingAddress: false,
  },
  reducers: {
    clearUserProfile: (state) => {
      state.profile = null;
      state.fetched = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // FETCH PROFILE
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.fetched = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.fetched = true;
      })

      // UPDATE PROFILE
      .addCase(updateUserProfile.pending, (state) => {
        state.isUpdatingProfile = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isUpdatingProfile = false;
        if (state.profile) {
          state.profile = { ...state.profile, ...action.payload };
        } else {
          state.profile = action.payload;
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isUpdatingProfile = false;
        state.error = action.payload;
      })

      // ✅ UPDATE MOBILE
      .addCase(updateMobileWithFirebase.pending, (state) => {
        state.isUpdatingProfile = true;
        state.error = null;
      })
      .addCase(updateMobileWithFirebase.fulfilled, (state, action) => {
        state.isUpdatingProfile = false;
        if (state.profile) {
          state.profile = { ...state.profile, ...action.payload };
        }
      })
      .addCase(updateMobileWithFirebase.rejected, (state, action) => {
        state.isUpdatingProfile = false;
        state.error = action.payload;
      })

      // CREATE ADDRESS
      .addCase(createAddress.pending, (state) => {
        state.isAddingAddress = true;
        state.error = null;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.isAddingAddress = false;
        const newAddress = action.payload;
        if (state.profile) {
          if (newAddress.is_default) {
            state.profile.addresses = state.profile.addresses.map(addr => ({
              ...addr,
              is_default: false
            }));
          }
          state.profile.addresses.push(newAddress);
        }
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.isAddingAddress = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserProfile } = userProfileSlice.actions;
export default userProfileSlice.reducer;