import axios from "axios";

const apiClient = axios.create({
  // Pastikan VITE_URL_API di file .env sudah benar (contoh: http://localhost:3000)
  baseURL: `${import.meta.env.VITE_URL_API || "http://localhost:3000"}/api`,
  withCredentials: true,
  timeout: 30000,
});

// INTERCEPTOR REQUEST: Mengambil token terbaru sebelum mengirim permintaan
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
    const originalRequest = error.config;
 
    if (error.response?.status === 401) {
      // DEBUG: Membantu kamu melihat alasan ditolak oleh server di Console
      console.error("🔒 Akses Ditolak (401):", error.response.data?.message || "Token tidak valid atau expired");

      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        
      }
    }

    // Handle error koneksi atau server mati
    if (!error.response) {
      console.error("🌐 Masalah Jaringan:", error.message);
      error.code = error.code || "ERR_NETWORK";
      error.message = error.message || "Gagal terhubung ke server. Pastikan Backend menyala.";
    }

    if (error.response?.status === 403) {
      console.error("🚫 Terlarang (403): Kamu tidak memiliki izin (Role bukan Admin)");
    }

    return Promise.reject(error);
  },
);

export default apiClient;