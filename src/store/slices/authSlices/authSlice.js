import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/axiosClient";
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
    is_superadmin: decoded.is_superadmin
  };
};

/* =========================
   Initial State
========================= */

const savedUser = JSON.parse(localStorage.getItem("user"));
const savedToken = localStorage.getItem("accessToken");

const initialState = {
  user: savedUser || null,
  accessToken: savedToken || null,
  isAuthenticated: !!savedUser && !!savedToken,
  loading: false,
  error: null,
};

/* =========================
   Thunks
========================= */

// CUSTOMER LOGIN (Firebase / OTP)
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, thunkApi) => {
    try {
      const res = await axiosClient.post(
        "/auth/login-firebase-user/",
        credentials
      );

      const accessToken = res.data.access_token;
      const user = mapUserFromToken(accessToken);

      return { accessToken, user };
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Login failed" }
      );
    }
  }
);

// STAFF LOGIN (Username + Password)
export const loginStaff = createAsyncThunk(
  "auth/loginStaff",
  async (credentials, thunkApi) => {
    try {
      const res = await axiosClient.post(
        "/auth/restaurant-user-login/",
        credentials
      );

      const accessToken = res.data.access_token;
      const user = mapUserFromToken(accessToken);

      return { accessToken, user };
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Login failed" }
      );
    }
  }
);


// STAFF LOGIN (Username + Password)
export const loginSuperAdmin = createAsyncThunk(
  "auth/loginStaff",
  async (credentials, thunkApi) => {
    try {
      const res = await axiosClient.post(
        "/auth/superadmin/login/",
        credentials
      );

      const accessToken = res.data.access_token;
      const user = mapUserFromToken(accessToken);

      return { accessToken, user };
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Login failed" }
      );
    }
  }
);

// CUSTOMER REGISTRATION
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (credentials, thunkApi) => {
    try {
      const res = await axiosClient.post(
        "/auth/register-user/",
        credentials
      );

      const accessToken = res.data.access_token;
      const user = mapUserFromToken(accessToken);

      return { accessToken, user };
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Registration failed" }
      );
    }
  }
);

// LOGOUT
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkApi) => {
    try {
      await axiosClient.post("/auth/logout-user/");
      return true;
    } catch (err) {
      return thunkApi.rejectWithValue(
        err.response?.data || { message: "Logout failed" }
      );
    }
  }
);

/* =========================
   Slice
========================= */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

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

        localStorage.setItem(
          "user",
          JSON.stringify(action.payload.user)
        );
        localStorage.setItem(
          "accessToken",
          action.payload.accessToken
        );
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

        localStorage.setItem(
          "user",
          JSON.stringify(action.payload.user)
        );
        localStorage.setItem(
          "accessToken",
          action.payload.accessToken
        );
      })
      .addCase(loginStaff.rejected, (state, action) => {
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

        localStorage.setItem(
          "user",
          JSON.stringify(action.payload.user)
        );
        localStorage.setItem(
          "accessToken",
          action.payload.accessToken
        );
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

        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("session_details");
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;

