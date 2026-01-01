import apiClient from "@/config/axios";
import type { DashboardGuru, DashboardSiswa, DashboardSummary } from "../types";

// ==================== ADMIN DASHBOARD ====================
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    // ✅ Call backend dashboard API yang sudah kita buat
    const res = await apiClient.get("/dashboard/all");

    // ✅ Transform backend response to match frontend types
    const backendData = res.data.data;

    return {
      totalSiswa: backendData.summary.totalSiswa,
      totalGuru: backendData.summary.totalGuru,
      totalKelas: backendData.summary.totalKelas,
      totalPendaftarBaru: backendData.pendaftaran.pendingAction || 0,
      totalPendaftarDiterima: backendData.pendaftaran.total || 0,
      tahunAjaran: backendData.summary.tahunAjaranAktif?.namaTahun || "-",
      tarifTahunan: backendData.financial.totalTagihan || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    throw error;
  }
};

// ==================== SISWA DASHBOARD ====================
export const getDashboardSiswa = async (): Promise<DashboardSiswa> => {
  try {
    const res = await apiClient.get("/dashboard/siswa");
    return res.data.data;
  } catch (error) {
    console.error("Error fetching dashboard siswa:", error);
    throw error;
  }
};

export const getTagihanSummarySiswa = async () => {
  try {
    const res = await apiClient.get("/tagihan/siswa-summary");
    return res.data.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      // Endpoint belum ada → fallback aman
      return {
        totalSisaPembayaran: 0,
        jumlahTagihanBelumLunas: 0,
        tagihanTerbaru: null,
      };
    }
    throw error;
  }
};

export const getMyTagihan = async () => {
  try {
    const res = await apiClient.get("/tagihan/my-bills");
    return res.data.data;
  } catch (error) {
    console.error("Error fetching my tagihan:", error);
    throw error;
  }
};

// ==================== GURU DASHBOARD ====================
export const getDashboardGuru = async (): Promise<DashboardGuru> => {
  try {
    const res = await apiClient.get("/dashboard-guru");
    return res.data.data;
  } catch (error) {
    console.error("Error fetching dashboard guru:", error);
    throw error;
  }
};

// export const getDashboardSummary = async () => {
//   try {
//     const res = await apiClient.get("/dashboard/summary");
//     return res.data;
//   } catch (error) {
//     console.error("Error fetching dashboard summary:", error);
//     throw error;
//   }
// };

// export const getDashboardSiswa = async () => {
//   try {
//     const res = await apiClient.get("/dashboard/siswa");
//     return res.data;
//   } catch (error) {
//     console.error("Error fetching dashboard siswa:", error);
//     throw error;
//   }
// };

// // ADMIN
// export const getDashboardSummary = async (): Promise<DashboardSummary> => {
//   try {
//     const res = await apiClient.get("/dashboard/summary");
//     return res.data;
//   } catch (error) {
//     console.error("Error fetching dashboard summary:", error);
//     throw error;
//   }
// };

// // SISWA
// export const getDashboardSiswa = async (): Promise<DashboardSiswa> => {
//   try {
//     const res = await apiClient.get("/dashboard/siswa");
//     return res.data;
//   } catch (error) {
//     console.error("Error fetching dashboard siswa:", error);
//     throw error;
//   }
// };
