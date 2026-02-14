import apiClient from "@/config/axios";
import type { CreateJadwalData, JadwalFilters } from "@/types/jadwal.types";

// ============================================================================
// JADWAL SERVICE
// ============================================================================

export const jadwalService = {
  /**
   * Get all jadwal with filters
   */
  getAll: async (filters?: JadwalFilters) => {
    const response = await apiClient.get("/jadwal", {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get jadwal by ID
   */
  getById: async (id: number) => {
    const response = await apiClient.get(`/jadwal/${id}`);
    return response.data;
  },

  /**
   * Get jadwal for specific kelas
   */
  getByKelas: async (kelasId: number, tahunAjaranId?: number) => {
    const response = await apiClient.get(`/jadwal/kelas/${kelasId}`, {
      params: { tahunAjaranId },
    });
    return response.data;
  },

  /**
   * Get jadwal for specific guru
   */
  getByGuru: async (guruId: number, tahunAjaranId?: number) => {
    const response = await apiClient.get(`/jadwal/guru/${guruId}`, {
      params: { tahunAjaranId },
    });
    return response.data;
  },

  /**
   * Create new jadwal
   */
  create: async (data: CreateJadwalData) => {
    const response = await apiClient.post("/jadwal", data);
    return response.data;
  },

  /**
   * Update jadwal
   */
  update: async (id: number, data: Partial<CreateJadwalData>) => {
    const response = await apiClient.put(`/jadwal/${id}`, data);
    return response.data;
  },

  /**
   * Delete jadwal
   */
  delete: async (id: number) => {
    const response = await apiClient.delete(`/jadwal/${id}`);
    return response.data;
  },

  /**
   * Get statistics
   */
  getStats: async (tahunAjaranId?: number) => {
    const response = await apiClient.get("/jadwal/stats", {
      params: { tahunAjaranId },
    });
    return response.data;
  },
};
