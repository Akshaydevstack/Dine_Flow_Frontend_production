import axios from "axios";

let isRefreshing = false;
let failedQueue = [];
let logoutHandler = null;

/* ===============================
   Register Logout Handler
================================ */
export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

/* ===============================
   Process queued requests
================================ */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });

  failedQueue = [];
};

/* ===============================
   Axios Instances
================================ */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  withCredentials: true,
});

const axiosRefresh = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: true,
});

/* ===============================
   REQUEST INTERCEPTOR
================================ */
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

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

      /* ===============================
         If refresh already running
      ================================ */
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
        /* ===============================
           Call refresh token API
        ================================ */
        const res = await axiosRefresh.post(
          "/auth/refreshtoken-user/",
          {},
          { withCredentials: true }
        );

        const newToken = res.data.access_token;

        /* Save new access token */
        localStorage.setItem("accessToken", newToken);

        /* Resolve queued requests */
        processQueue(null, newToken);

        /* Retry original request */
        originalRequest.headers.Authorization = "Bearer " + newToken;

        return axiosClient(originalRequest);

      } catch (refreshError) {

        processQueue(refreshError, null);

        /* Clear storage */
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        localStorage.removeItem("session_details");

        /* Logout via handler */
        if (logoutHandler) {
          logoutHandler();
        }

        /* Redirect to login */
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