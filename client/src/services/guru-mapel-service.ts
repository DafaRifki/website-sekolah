import apiClient from "@/config/axios";
import type {
  CreateGuruMapelData,
  GuruMapelFilters,
} from "@/types/guru-mapel.types";

// ============================================================================
// GURU MAPEL SERVICE
// ============================================================================

export const guruMapelService = {
  /**
   * Get all guru mapel with filters
   */
  getAll: async (filters?: GuruMapelFilters) => {
    const response = await apiClient.get("/guru-mapel", {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get guru mapel by ID
   */
  getById: async (id: number) => {
    const response = await apiClient.get(`/guru-mapel/${id}`);
    return response.data;
  },

  /**
   * Get assignments for specific guru
   */
  getByGuru: async (guruId: number, tahunAjaranId?: number) => {
    const response = await apiClient.get(`/guru-mapel/guru/${guruId}`, {
      params: { tahunAjaranId },
    });
    return response.data;
  },

  /**
   * Get assignments for specific kelas
   */
  getByKelas: async (kelasId: number, tahunAjaranId?: number) => {
    const response = await apiClient.get(`/guru-mapel/kelas/${kelasId}`, {
      params: { tahunAjaranId },
    });
    return response.data;
  },

  /**
   * Create new guru mapel assignment
   */
  create: async (data: CreateGuruMapelData) => {
    const response = await apiClient.post("/guru-mapel", data);
    return response.data;
  },

  /**
   * Update guru mapel assignment
   */
  update: async (id: number, data: Partial<CreateGuruMapelData>) => {
    const response = await apiClient.put(`/guru-mapel/${id}`, data);
    return response.data;
  },

  /**
   * Delete guru mapel assignment
   */
  delete: async (id: number) => {
    const response = await apiClient.delete(`/guru-mapel/${id}`);
    return response.data;
  },

  /**
   * Get statistics
   */
  getStats: async (tahunAjaranId?: number) => {
    const response = await apiClient.get("/guru-mapel/stats", {
      params: { tahunAjaranId },
    });
    return response.data;
  },
};
