// src/services/absensi.service.ts
// COMPLETE VERSION with all methods

import apiClient from "@/config/axios";

export class AbsensiService {
  /**
   * ============================================================================
   * ADMIN SERVICES
   * ============================================================================
   */

  /**
   * Get Admin Dashboard
   */
  static async getAdminDashboard(tahunAjaranId?: number) {
    try {
      const params = tahunAjaranId ? { tahunAjaranId } : {};
      console.log("🔍 Calling /absensi/admin/dashboard");

      const response = await apiClient.get("/absensi/admin/dashboard", {
        params,
      });

      console.log("🔍 Service response:", response.data);

      return response.data;
    } catch (error: any) {
      console.error("❌ Error in getAdminDashboard:", error);
      throw error;
    }
  }

  /**
   * Get Classes Today
   */
  static async getClassesToday(tahunAjaranId?: number) {
    try {
      const params = tahunAjaranId ? { tahunAjaranId } : {};
      console.log("🔍 Calling /absensi/admin/kelas-today");

      const response = await apiClient.get("/absensi/admin/kelas-today", {
        params,
      });

      console.log("🔍 Classes response:", response.data);

      return response.data;
    } catch (error: any) {
      console.error("❌ Error in getClassesToday:", error);
      throw error;
    }
  }

  /**
   * Get Teachers Today
   */
  static async getTeachersToday(tahunAjaranId?: number) {
    try {
      const params = tahunAjaranId ? { tahunAjaranId } : {};
      console.log("🔍 Calling /absensi/admin/guru-teaching-today");

      const response = await apiClient.get(
        "/absensi/admin/guru-teaching-today",
        { params },
      );

      console.log("🔍 Teachers response:", response.data);

      return response.data;
    } catch (error: any) {
      console.error("❌ Error in getTeachersToday:", error);
      throw error;
    }
  }

  /**
   * Get Attendance Trends
   */
  static async getAttendanceTrends(
    period: "week" | "month",
    tahunAjaranId?: number,
  ) {
    try {
      const params = { period, ...(tahunAjaranId && { tahunAjaranId }) };
      const response = await apiClient.get("/absensi/admin/trends", { params });
      return response.data;
    } catch (error: any) {
      console.error("❌ Error in getAttendanceTrends:", error);
      throw error;
    }
  }

  /**
   * Get Top Absent Students
   */
  static async getTopAbsentStudents(
    limit: number = 10,
    tahunAjaranId?: number,
    startDate?: string,
    endDate?: string,
  ) {
    try {
      const params = { limit, tahunAjaranId, startDate, endDate };
      const response = await apiClient.get("/absensi/admin/top-absent", {
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Error in getTopAbsentStudents:", error);
      throw error;
    }
  }

  /**
   * Get Class Comparison
   */
  static async getClassComparison(tahunAjaranId?: number, month?: number) {
    try {
      const params = { tahunAjaranId, month };
      const response = await apiClient.get("/absensi/admin/class-comparison", {
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Error in getClassComparison:", error);
      throw error;
    }
  }

  /**
   * Search Absensi
   */
  static async searchAbsensi(params: {
    siswaId?: number;
    kelasId?: number;
    guruMapelId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    tahunAjaranId?: number;
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await apiClient.get("/absensi/admin/search", { params });
      return response.data;
    } catch (error: any) {
      console.error("❌ Error in searchAbsensi:", error);
      throw error;
    }
  }

  /**
   * Download Mapel Absensi Excel
   */
  static async downloadMapelAbsensiExcel(guruMapelId: number) {
    try {
      const response = await apiClient.get(
        `/absensi/admin/mapel-excel/${guruMapelId}`,
        {
          responseType: "blob",
        },
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from header if possible
      const contentDisposition = response.headers["content-disposition"];
      let filename = `Absensi_Mapel_${guruMapelId}.xlsx`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.+)/);
        if (filenameMatch.length === 2) filename = filenameMatch[1];
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      return true;
    } catch (error: any) {
      console.error("❌ Error in downloadMapelAbsensiExcel:", error);
      throw error;
    }
  }

  /**
   * ============================================================================
   * GURU SERVICES
   * ============================================================================
   */

  /**
   * Get Jadwal Hari Ini untuk Guru
   */
  static async getJadwalHariIni(guruId: number, date?: string) {
    try {
      const params = date ? { date } : {};
      const response = await apiClient.get(
        `/absensi/guru/${guruId}/jadwal-hari-ini`,
        { params },
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error in getJadwalHariIni:", error);
      throw error;
    }
  }

  /**
   * Mulai Pertemuan
   */
  static async mulaiPertemuan(data: {
    guruMapelId: number;
    jadwalId: number;
    pertemuanKe: number;
    materi?: string;
    keteranganGuru?: string;
  }) {
    try {
      const response = await apiClient.post(
        "/absensi/guru/mulai-pertemuan",
        data,
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error in mulaiPertemuan:", error);
      throw error;
    }
  }

  /**
   * Input Presensi Siswa
   */
  static async inputPresensiSiswa(data: {
    pertemuanId: number;
    siswaId: number;
    status: string;
    keterangan?: string;
  }) {
    try {
      const response = await apiClient.post(
        "/absensi/guru/input-presensi",
        data,
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error in inputPresensiSiswa:", error);
      throw error;
    }
  }

  /**
   * Input Presensi Bulk
   */
  static async inputPresensiBulk(data: {
    pertemuanId: number;
    detailAbsensi: Array<{
      siswaId: number;
      status: string;
      keterangan?: string;
    }>;
  }) {
    try {
      const response = await apiClient.post(
        "/absensi/guru/input-presensi-bulk",
        data,
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error in inputPresensiBulk:", error);
      throw error;
    }
  }

  /**
   * Selesaikan Pertemuan
   */
  static async selesaikanPertemuan(pertemuanId: number) {
    try {
      const response = await apiClient.post(
        `/absensi/guru/selesaikan-pertemuan/${pertemuanId}`,
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error in selesaikanPertemuan:", error);
      throw error;
    }
  }

  /**
   * Get Detail Pertemuan
   */
  static async getDetailPertemuan(pertemuanId: number) {
    try {
      const response = await apiClient.get(
        `/absensi/guru/pertemuan/${pertemuanId}`,
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error in getDetailPertemuan:", error);
      throw error;
    }
  }

  /**
   * Get Riwayat Mengajar
   */
  static async getRiwayatMengajar(
    guruId: number,
    params?: {
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
  ) {
    try {
      const response = await apiClient.get(`/absensi/guru/${guruId}/riwayat`, {
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Error in getRiwayatMengajar:", error);
      throw error;
    }
  }

  /**
   * ============================================================================
   * SISWA SERVICES
   * ============================================================================
   */

  /**
   * Get Kehadiran Siswa
   */
  static async getKehadiranSiswa(siswaId: number) {
    try {
      const response = await apiClient.get(
        `/absensi/siswa/${siswaId}/kehadiranku`,
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error in getKehadiranSiswa:", error);
      throw error;
    }
  }

  /**
   * Get Jadwal Siswa
   */
  static async getJadwalSiswa(siswaId: number, hari?: string) {
    try {
      const params = hari ? { hari } : {};
      const response = await apiClient.get(`/absensi/siswa/${siswaId}/jadwal`, {
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Error in getJadwalSiswa:", error);
      throw error;
    }
  }

  /**
   * Get Rekap Siswa Per Mapel
   */
  static async getRekapSiswaPerMapel(
    siswaId: number,
    guruMapelId: number,
    startDate?: string,
    endDate?: string,
  ) {
    try {
      const params = { startDate, endDate };
      const response = await apiClient.get(
        `/absensi/pertemuan/siswa/${siswaId}/mapel/${guruMapelId}`,
        { params },
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error in getRekapSiswaPerMapel:", error);
      throw error;
    }
  }

  /**
   * ============================================================================
   * COMMON SERVICES
   * ============================================================================
   */

  /**
   * Get Stats
   */
  static async getStats(tahunAjaranId?: number) {
    try {
      const params = tahunAjaranId ? { tahunAjaranId } : {};
      const response = await apiClient.get("/absensi/stats", { params });
      return response.data;
    } catch (error: any) {
      console.error("❌ Error in getStats:", error);
      throw error;
    }
  }

  /**
   * Get Rekap
   */
  static async getRekap(
    kelasId?: number,
    startDate?: string,
    endDate?: string,
    tahunAjaranId?: number,
  ) {
    try {
      const params = { kelasId, startDate, endDate, tahunAjaranId };
      const response = await apiClient.get("/absensi/rekap", { params });
      return response.data;
    } catch (error: any) {
      console.error("❌ Error in getRekap:", error);
      throw error;
    }
  }

  /**
   * Get By Kelas
   */
  static async getByKelas(
    kelasId: number,
    tanggal: string,
    tahunAjaranId?: number,
  ) {
    try {
      const params = { tahunAjaranId };
      const response = await apiClient.get(
        `/absensi/kelas/${kelasId}/${tanggal}`,
        { params },
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error in getByKelas:", error);
      throw error;
    }
  }
}
