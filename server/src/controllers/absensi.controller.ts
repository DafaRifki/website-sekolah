import { Request, Response } from "express";
import { AbsensiService } from "../services/absensi.service";
import { sendSuccess, sendError } from "../utils/response.util";

export class AbsensiController {
  /**
   * POST /api/absensi
   * Create absensi (single)
   */
  static async create(req: Request, res: Response) {
    try {
      const absensi = await AbsensiService.create(req.body);

      return sendSuccess(res, "Absensi created successfully", absensi);
    } catch (error: any) {
      if (
        error.message.includes("not found") ||
        error.message.includes("already exists")
      ) {
        return sendError(res, error.message, null, 400);
      }

      return sendError(res, "Failed to create absensi", error.message, 500);
    }
  }

  /**
   * POST /api/absensi/bulk
   * Bulk create absensi (per kelas)
   */
  static async bulkCreate(req: Request, res: Response) {
    try {
      const result = await AbsensiService.bulkCreate(req.body);

      return sendSuccess(res, "Bulk absensi created successfully", result);
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, null, 404);
      }

      return sendError(
        res,
        "Failed to bulk create absensi",
        error.message,
        500
      );
    }
  }

  /**
   * PUT /api/absensi/:id
   * Update absensi
   */
  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const absensi = await AbsensiService.update(id, req.body);

      return sendSuccess(res, "Absensi updated successfully", absensi);
    } catch (error: any) {
      if (error.message === "Absensi not found") {
        return sendError(res, error.message, null, 404);
      }

      return sendError(res, "Failed to update absensi", error.message, 500);
    }
  }

  /**
   * DELETE /api/absensi/:id
   * Delete absensi
   */
  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await AbsensiService.delete(id);

      return sendSuccess(res, result.message);
    } catch (error: any) {
      if (error.message === "Absensi not found") {
        return sendError(res, error.message, null, 404);
      }

      return sendError(res, "Failed to delete absensi", error.message, 500);
    }
  }

  /**
   * GET /api/absensi/siswa/:siswaId
   * Get absensi by siswa
   */
  static async getBySiswa(req: Request, res: Response) {
    try {
      const siswaId = parseInt(req.params.siswaId);
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const result = await AbsensiService.getBySiswa(
        siswaId,
        startDate,
        endDate,
        tahunAjaranId
      );

      return sendSuccess(res, "Absensi retrieved successfully", result);
    } catch (error: any) {
      if (error.message === "Siswa not found") {
        return sendError(res, error.message, null, 404);
      }

      return sendError(res, "Failed to get absensi", error.message, 500);
    }
  }

  /**
   * GET /api/absensi/kelas/:kelasId
   * Get absensi by kelas (per hari)
   */
  static async getByKelas(req: Request, res: Response) {
    try {
      const kelasId = parseInt(req.params.kelasId);
      const tanggal = req.query.tanggal as string;
      const tahunAjaranId = parseInt(req.query.tahunAjaranId as string);

      if (!tanggal || !tahunAjaranId) {
        return sendError(
          res,
          "tanggal and tahunAjaranId are required",
          null,
          400
        );
      }

      const result = await AbsensiService.getByKelas(
        kelasId,
        tanggal,
        tahunAjaranId
      );

      return sendSuccess(res, "Absensi retrieved successfully", result);
    } catch (error: any) {
      if (error.message === "Kelas not found") {
        return sendError(res, error.message, null, 404);
      }

      return sendError(res, "Failed to get absensi", error.message, 500);
    }
  }

  /**
   * GET /api/absensi/rekap
   * Get rekap absensi
   */
  static async getRekap(req: Request, res: Response) {
    try {
      const kelasId = req.query.kelasId
        ? parseInt(req.query.kelasId as string)
        : undefined;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const result = await AbsensiService.getRekap(
        kelasId,
        startDate,
        endDate,
        tahunAjaranId
      );

      return sendSuccess(res, "Rekap absensi retrieved successfully", result);
    } catch (error: any) {
      if (error.message === "Kelas not found") {
        return sendError(res, error.message, null, 404);
      }

      return sendError(res, "Failed to get rekap absensi", error.message, 500);
    }
  }

  /**
   * GET /api/absensi/stats
   * Get absensi statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const stats = await AbsensiService.getStats(tahunAjaranId);

      return sendSuccess(res, "Statistics retrieved successfully", stats);
    } catch (error: any) {
      return sendError(res, "Failed to get statistics", error.message, 500);
    }
  }
}
