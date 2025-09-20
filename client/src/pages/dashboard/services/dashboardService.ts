import apiClient from "@/config/axios";
import type { DashboardSiswa, DashboardSummary } from "../types";

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

// ADMIN
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    const res = await apiClient.get("/dashboard/summary");
    return res.data;
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    throw error;
  }
};

// SISWA
export const getDashboardSiswa = async (): Promise<DashboardSiswa> => {
  try {
    const res = await apiClient.get("/dashboard/siswa");
    return res.data;
  } catch (error) {
    console.error("Error fetching dashboard siswa:", error);
    throw error;
  }
};
