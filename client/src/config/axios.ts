import axios from "axios";

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_URL_API}/api`,
  // headers: {                         <-- HAPUS BAGIAN INI
  //   "Content-Type": "application/json",
  // },                                 <-- SAMPAI SINI
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // Add better error information for connection issues
    if (!error.response) {
      // Network error or server not responding
      error.code = error.code || "ERR_NETWORK";
      error.message =
        error.message || "Network Error: Cannot connect to server";
    }

    return Promise.reject(error);
  },
);

export default apiClient;
