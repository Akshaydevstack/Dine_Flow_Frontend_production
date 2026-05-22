import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// Make sure you are exporting axiosRefresh from axiosClient.js!
import axiosClient, { axiosRefresh } from "../../../api/axiosClient";
import { jwtDecode } from "jwt-decode";

/* =========================
   Helpers
========================= */

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

/* =========================
   Initial State
========================= */

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  sessionChecked: false,
};

/* =========================
   Thunks
========================= */

// Promise lock to prevent duplicate refresh requests on fast reload / React Strict Mode
let refreshPromise = null;

// Called on page load — restores session from HttpOnly cookie
export const refreshSession = createAsyncThunk(
  "auth/refreshSession",
  async (_, thunkApi) => {
    // If a request is already in flight, return the existing promise
    if (refreshPromise) return refreshPromise;

    // Use axiosRefresh here to bypass the standard interceptors and avoid infinite loops
    refreshPromise = axiosRefresh.post("/auth/refreshtoken-user/")
      .then((res) => {
        refreshPromise = null;
        const accessToken = res.data.access_token;
        const user = mapUserFromToken(accessToken);
        return { accessToken, user };
      })
      .catch((error) => {
        refreshPromise = null;
        
        // Check if the server explicitly rejected the token
        const status = error.response?.status;
        if (status === 401 || status === 403 || status === 400) {
          return thunkApi.rejectWithValue("unauthorized");
        }
        
        // If it's a canceled request from fast-refreshing, label it as a network error
        return thunkApi.rejectWithValue("network_error");
      });

    return refreshPromise;
  }
);

// Customer login (Firebase / OTP)
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

// Staff login (Username + Password)
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

// Super admin login
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

// Customer registration
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

// Logout
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
   Helpers for fulfilled cases
========================= */

const setAuthState = (state, action) => {
  state.loading = false;
  state.user = action.payload.user;
  state.accessToken = action.payload.accessToken;
  state.isAuthenticated = true;
  state.sessionChecked = true;
  state.error = null;
  // Only a flag — no sensitive data in sessionStorage
  localStorage.setItem("hasSession", "1");
};

/* =========================
   Slice
========================= */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Used by axiosClient interceptor to silently update token after auto-refresh
    setAccessToken(state, action) {
      state.accessToken = action.payload;
    },
    // Used by axiosClient interceptor when refresh fails (force logout)
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.sessionChecked = true;
      state.error = null;
      localStorage.removeItem("hasSession");
    },
  },

  extraReducers: (builder) => {
    builder

      // ---------- REFRESH SESSION ----------
      .addCase(refreshSession.pending, (state) => {
        state.sessionChecked = false;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        setAuthState(state, action);
      })
      .addCase(refreshSession.rejected, (state, action) => {
        // Clear Redux state
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.sessionChecked = true;
        
        // ONLY wipe localStorage if the backend explicitly said the token is invalid.
        // If it was a network error from fast-refreshing, hasSession stays intact for the next load.
        if (action.payload === "unauthorized") {
          localStorage.removeItem("hasSession");
        }
      })

      // ---------- CUSTOMER LOGIN ----------
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        setAuthState(state, action);
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
        setAuthState(state, action);
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
        setAuthState(state, action);
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
        setAuthState(state, action);
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
        localStorage.removeItem("hasSession");
      })
      .addCase(logoutUser.rejected, (state, action) => {
        // Even if logout API fails, clear local state anyway
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload;
        state.sessionChecked = true;
        localStorage.removeItem("hasSession");
      });
  },
});

export const { setAccessToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;