import apiClient from "@/config/axios";
import type { NilaiBulkInput, NilaiInput } from "@/types/nilai.types";

// ============================================================================
// RESPONSE STRUCTURE dari Backend:
// {
//   success: true,
//   message: "...",
//   data: <actual data>
// }
// ============================================================================

export const getMapelByGuru = async (tahunId: number) => {
  const response = await apiClient.get("/rapor/guru/mapel", {
    params: { tahunId },
  });

  // ✅ FIX: Return response.data (sudah include success, message, data)
  // Frontend akan ambil response.data.data
  return response.data;
};

export const getSiswaForNilai = async (
  kelasId: number,
  mapelId: number,
  tahunId: number,
) => {
  const response = await apiClient.get("/rapor/guru/siswa", {
    params: { kelasId, mapelId, tahunId },
  });

  // ✅ FIX: Return response.data (sudah include success, message, data)
  return response.data;
};

export const inputNilai = async (data: NilaiInput) => {
  const response = await apiClient.post("/rapor/guru/nilai", data);

  // ✅ FIX: Return response.data
  return response.data;
};

export const inputNilaiBulk = async (data: NilaiBulkInput) => {
  const response = await apiClient.post("/rapor/guru/nilai-bulk", data);

  // ✅ FIX: Return response.data
  return response.data;
};

export const updateNilai = async (
  nilaiId: number,
  data: Partial<NilaiInput>,
) => {
  const response = await apiClient.put(`/rapor/guru/nilai/${nilaiId}`, data);

  // ✅ FIX: Return response.data
  return response.data;
};

export const deleteNilai = async (nilaiId: number) => {
  const response = await apiClient.delete(`/rapor/guru/nilai/${nilaiId}`);

  // ✅ FIX: Return response.data
  return response.data;
};

export const getNilaiDetail = async (nilaiId: number) => {
  const response = await apiClient.get(`/rapor/guru/nilai/${nilaiId}`);

  // ✅ FIX: Return response.data
  return response.data;
};

export const getNilaiStatistics = async (tahunId: number, semester: string) => {
  const response = await apiClient.get("/rapor/guru/statistics", {
    params: { tahunId, semester },
  });

  // ✅ FIX: Return response.data
  return response.data;
};

/**
 * Get active tahun ajaran
 */
export const getTahunAjaranAktif = async () => {
  const response = await apiClient.get("/tahun-ajaran/active");
  return response.data;
};

/**
 * Get all tahun ajaran (without pagination for dropdown)
 */
export const getAllTahunAjaran = async () => {
  // Use large limit to get all without pagination for dropdown
  const response = await apiClient.get("/tahun-ajaran", {
    params: { limit: 100 }, // Get all
  });
  return response.data;
};

/**
 * Get tahun ajaran by year
 */
export const getTahunAjaranByYear = async (year: string) => {
  const response = await apiClient.get("/tahun-ajaran/by-year", {
    params: { year },
  });
  return response.data;
};
