// src/controllers/absensi.enhanced.controller.ts

import { Request, Response } from "express";
import { AbsensiEnhancedService } from "../services/absensi.service.enhanced";
import { sendError, sendSuccess } from "../utils/response.util";
// Import prisma for validation
import prisma from "../config/database";

export class AbsensiEnhancedController {
  /**
   * ============================================================================
   * GURU ENDPOINTS
   * ============================================================================
   */

  /**
   * GET /api/absensi/guru/:guruId/jadwal-hari-ini
   * Get jadwal hari ini dengan validasi jam
   */
  static async getJadwalHariIni(req: Request, res: Response) {
    try {
      const guruId = parseInt(req.params.guruId);

      // Validate guru ownership
      if (req.user?.role !== "ADMIN" && req.user?.guruId !== guruId) {
        return sendError(res, "Unauthorized", "Access denied", 403);
      }

      const result = await AbsensiEnhancedService.getJadwalHariIniGuru(guruId);

      return sendSuccess(res, "Jadwal hari ini berhasil dimuat", result);
    } catch (error: any) {
      return sendError(res, "Failed to get jadwal", error.message, 500);
    }
  }

  /**
   * POST /api/absensi/guru/mulai-pertemuan
   * Mulai pertemuan baru dengan validasi jam
   */
  static async mulaiPertemuan(req: Request, res: Response) {
    try {
      const { guruMapelId, jadwalId, pertemuanKe, materi, keteranganGuru } =
        req.body;

      // Validate required fields
      if (!guruMapelId || !jadwalId || !pertemuanKe) {
        return sendError(
          res,
          "Validation error",
          "guruMapelId, jadwalId, dan pertemuanKe required",
          400,
        );
      }

      // Validate guru ownership
      if (req.user?.role !== "ADMIN") {
        const guruMapel = await prisma.guruMapel.findUnique({
          where: { id: guruMapelId },
        });

        if (!guruMapel || guruMapel.id_guru !== req.user?.guruId) {
          return sendError(res, "Unauthorized", "Access denied", 403);
        }
      }

      const result = await AbsensiEnhancedService.mulaiPertemuan({
        guruMapelId,
        jadwalId,
        pertemuanKe,
        materi,
        keteranganGuru,
      });

      return sendSuccess(res, result.message, result);
    } catch (error: any) {
      return sendError(res, "Failed to start pertemuan", error.message, 500);
    }
  }

  /**
   * POST /api/absensi/guru/input-presensi
   * Input presensi per siswa
   */
  static async inputPresensiSiswa(req: Request, res: Response) {
    try {
      const { pertemuanId, siswaId, status, keterangan } = req.body;

      if (!pertemuanId || !siswaId || !status) {
        return sendError(
          res,
          "Validation error",
          "pertemuanId, siswaId, dan status required",
          400,
        );
      }

      const result = await AbsensiEnhancedService.inputPresensiSiswa({
        pertemuanId,
        siswaId,
        status,
        keterangan,
      });

      return sendSuccess(res, "Presensi berhasil disimpan", result);
    } catch (error: any) {
      return sendError(res, "Failed to save presensi", error.message, 500);
    }
  }

  /**
   * POST /api/absensi/guru/input-presensi-bulk
   * Input presensi bulk (semua siswa)
   */
  static async inputPresensiBulk(req: Request, res: Response) {
    try {
      const { pertemuanId, detailAbsensi } = req.body;

      if (!pertemuanId || !Array.isArray(detailAbsensi)) {
        return sendError(
          res,
          "Validation error",
          "pertemuanId dan detailAbsensi[] required",
          400,
        );
      }

      const result = await AbsensiEnhancedService.inputPresensiBulk({
        pertemuanId,
        detailAbsensi,
      });

      return sendSuccess(res, result.message, result);
    } catch (error: any) {
      return sendError(res, "Failed to save presensi", error.message, 500);
    }
  }

  /**
   * POST /api/absensi/guru/selesaikan-pertemuan/:id
   * Set pertemuan ke COMPLETED
   */
  static async selesaikanPertemuan(req: Request, res: Response) {
    try {
      const pertemuanId = parseInt(req.params.id);

      const result =
        await AbsensiEnhancedService.selesaikanPertemuan(pertemuanId);

      return sendSuccess(res, result.message, result);
    } catch (error: any) {
      return sendError(res, "Failed to complete pertemuan", error.message, 500);
    }
  }

  /**
   * GET /api/absensi/guru/pertemuan/:id
   * Get detail pertemuan untuk edit/review
   */
  static async getDetailPertemuan(req: Request, res: Response) {
    try {
      const pertemuanId = parseInt(req.params.id);

      const result =
        await AbsensiEnhancedService.getDetailPertemuan(pertemuanId);

      return sendSuccess(res, "Detail pertemuan berhasil dimuat", result);
    } catch (error: any) {
      return sendError(
        res,
        "Failed to get detail pertemuan",
        error.message,
        500,
      );
    }
  }

  /**
   * GET /api/absensi/guru/:guruId/riwayat
   * Get riwayat mengajar
   */
  static async getRiwayatMengajar(req: Request, res: Response) {
    try {
      const guruId = parseInt(req.params.guruId);

      // Validate ownership
      if (req.user?.role !== "ADMIN" && req.user?.guruId !== guruId) {
        return sendError(res, "Unauthorized", "Access denied", 403);
      }

      const options = {
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
      };

      const result = await AbsensiEnhancedService.getRiwayatMengajar(
        guruId,
        options,
      );

      return sendSuccess(res, "Riwayat berhasil dimuat", result);
    } catch (error: any) {
      return sendError(res, "Failed to get riwayat", error.message, 500);
    }
  }

  /**
   * ============================================================================
   * SISWA ENDPOINTS
   * ============================================================================
   */

  /**
   * GET /api/absensi/siswa/:siswaId/kehadiranku
   * Get kehadiran siswa per mata pelajaran
   */
  static async getKehadiranSiswa(req: Request, res: Response) {
    try {
      const siswaId = parseInt(req.params.siswaId);

      // Validate ownership
      if (req.user?.role !== "ADMIN" && req.user?.siswaId !== siswaId) {
        return sendError(res, "Unauthorized", "Access denied", 403);
      }

      const result = await AbsensiEnhancedService.getKehadiranSiswa(siswaId);

      return sendSuccess(res, "Kehadiran berhasil dimuat", result);
    } catch (error: any) {
      return sendError(res, "Failed to get kehadiran", error.message, 500);
    }
  }

  /**
   * GET /api/absensi/siswa/:siswaId/jadwal
   * Get jadwal pelajaran siswa
   */
  static async getJadwalSiswa(req: Request, res: Response) {
    try {
      const siswaId = parseInt(req.params.siswaId);
      const hari = req.query.hari as string | undefined;

      // Validate ownership
      if (req.user?.role !== "ADMIN" && req.user?.siswaId !== siswaId) {
        return sendError(res, "Unauthorized", "Access denied", 403);
      }

      const result = await AbsensiEnhancedService.getJadwalSiswa(siswaId, hari);

      return sendSuccess(res, "Jadwal berhasil dimuat", result);
    } catch (error: any) {
      return sendError(res, "Failed to get jadwal", error.message, 500);
    }
  }
}
