import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";
import { jwtDecode } from "jwt-decode";

const mapUserFromToken = (token) => {
  const decoded = jwtDecode(token);
  return {
    name: decoded.name,
    internal_id: decoded.public_id,
    email: decoded.email,
    role: decoded.role,
    phone_number: decoded.mobile_number,
    is_active: decoded.is_active,
    restaurant_id: decoded.restaurant_id,
    is_superadmin: decoded.is_superadmin,
  };
};

// ✅ No more localStorage reads
const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  sessionChecked: false, // ✅ new — prevents redirect before refresh check
};

/* =========================
   Thunks
========================= */

// ✅ NEW — called on every page load to restore session from HttpOnly cookie
export const refreshSession = createAsyncThunk(
  "auth/refreshSession",
  async (_, thunkApi) => {
    try {
      const res = await axiosClient.post("/auth/refreshtoken-user/");
      const accessToken = res.data.access_token;
      const user = mapUserFromToken(accessToken);
      return { accessToken, user };
    } catch {
      return thunkApi.rejectWithValue(null); // silently fail = not logged in
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, thunkApi) => {
    try {
      const res = await axiosClient.post("/auth/login-firebase-user/", credentials);
      const accessToken = res.data.access_token;
      const user = mapUserFromToken(accessToken);
      return { accessToken, user };
    } catch (err) {
      return thunkApi.rejectWithValue(err.response?.data || { message: "Login failed" });
    }
  }
);

export const loginStaff = createAsyncThunk(
  "auth/loginStaff",
  async (credentials, thunkApi) => {
    try {
      const res = await axiosClient.post("/auth/restaurant-user-login/", credentials);
      const accessToken = res.data.access_token;
      const user = mapUserFromToken(accessToken);
      return { accessToken, user };
    } catch (err) {
      return thunkApi.rejectWithValue(err.response?.data || { message: "Login failed" });
    }
  }
);

export const loginSuperAdmin = createAsyncThunk(
  "auth/loginSuperAdmin",
  async (credentials, thunkApi) => {
    try {
      const res = await axiosClient.post("/auth/superadmin/login/", credentials);
      const accessToken = res.data.access_token;
      const user = mapUserFromToken(accessToken);
      return { accessToken, user };
    } catch (err) {
      return thunkApi.rejectWithValue(err.response?.data || { message: "Login failed" });
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (credentials, thunkApi) => {
    try {
      const res = await axiosClient.post("/auth/register-user/", credentials);
      const accessToken = res.data.access_token;
      const user = mapUserFromToken(accessToken);
      return { accessToken, user };
    } catch (err) {
      return thunkApi.rejectWithValue(err.response?.data || { message: "Registration failed" });
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkApi) => {
    try {
      await axiosClient.post("/auth/logout-user/");
      return true;
    } catch (err) {
      return thunkApi.rejectWithValue(err.response?.data || { message: "Logout failed" });
    }
  }
);

/* =========================
   Slice
========================= */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ✅ Used by axiosClient interceptor to update token after silent refresh
    setAccessToken(state, action) {
      state.accessToken = action.payload;
    },
    // ✅ Used by axiosClient interceptor on refresh failure
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.sessionChecked = true;
    },
  },

  extraReducers: (builder) => {
    builder

      // ---------- REFRESH SESSION (page reload) ----------
      .addCase(refreshSession.pending, (state) => {
        state.sessionChecked = false;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.sessionChecked = true;
        // ✅ Nothing written to localStorage
      })
      .addCase(refreshSession.rejected, (state) => {
        state.isAuthenticated = false;
        state.sessionChecked = true; // done checking, just not logged in
      })

      // ---------- CUSTOMER LOGIN ----------
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.sessionChecked = true;
        // ✅ No localStorage
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ---------- STAFF LOGIN ----------
      .addCase(loginStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.sessionChecked = true;
        // ✅ No localStorage
      })
      .addCase(loginStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ---------- SUPER ADMIN LOGIN ----------
      .addCase(loginSuperAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginSuperAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.sessionChecked = true;
      })
      .addCase(loginSuperAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ---------- REGISTRATION ----------
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.sessionChecked = true;
        // ✅ No localStorage
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ---------- LOGOUT ----------
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.sessionChecked = true;
        // ✅ No localStorage to clear
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setAccessToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;