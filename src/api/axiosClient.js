// axiosClient.js — FULL REWRITE
import axios from "axios";
import store from "../store"; // adjust path to your 
import { setAccessToken, clearAuth } from "../store/slices/authSlices/authSlice";

let isRefreshing = false;
let failedQueue = [];
let logoutHandler = null;

export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  withCredentials: true, // ✅ sends HttpOnly cookie automatically
});

const axiosRefresh = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: true,
});

/* ===============================
   REQUEST INTERCEPTOR
   Read token from Redux, NOT localStorage
================================ */
axiosClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken; // ✅ from Redux RAM

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ===============================
   RESPONSE INTERCEPTOR
================================ */
axiosClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refreshtoken-user/")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const res = await axiosRefresh.post(
          "/auth/refreshtoken-user/",
          {},
          { withCredentials: true } // ✅ sends HttpOnly cookie
        );

        const newToken = res.data.access_token;

        // ✅ Save to Redux only — NOT localStorage
        store.dispatch(setAccessToken(newToken));

        processQueue(null, newToken);

        originalRequest.headers.Authorization = "Bearer " + newToken;
        return axiosClient(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);

        // ✅ Clear Redux only — NOT localStorage
        store.dispatch(clearAuth());

        if (logoutHandler) logoutHandler();

        window.location.href = "/";
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;