import { Request, Response } from "express";
import { NilaiService } from "../services/nilai.service";
import { sendSuccess, sendError } from "../utils/response.util";

export class NilaiController {
  /**
   * POST /api/nilai
   * Create nilai (single)
   */
  static async create(req: Request, res: Response) {
    try {
      const nilai = await NilaiService.create(req.body);

      return sendSuccess(res, "Nilai created successfully", nilai);
    } catch (error: any) {
      if (
        error.message.includes("not found") ||
        error.message.includes("already exists") ||
        error.message.includes("must be between")
      ) {
        return sendError(res, error.message, null, 400);
      }

      return sendError(res, "Failed to create nilai", error.message, 500);
    }
  }

  /**
   * POST /api/nilai/bulk
   * Bulk create nilai (per kelas)
   */
  static async bulkCreate(req: Request, res: Response) {
    try {
      const result = await NilaiService.bulkCreate(req.body);

      return sendSuccess(res, "Bulk nilai created successfully", result);
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, null, 404);
      }

      return sendError(res, "Failed to bulk create nilai", error.message, 500);
    }
  }

  /**
   * PUT /api/nilai/:id
   * Update nilai
   */
  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const nilai = await NilaiService.update(id, req.body);

      return sendSuccess(res, "Nilai updated successfully", nilai);
    } catch (error: any) {
      if (error.message === "Nilai not found") {
        return sendError(res, error.message, null, 404);
      }

      if (error.message.includes("must be between")) {
        return sendError(res, error.message, null, 400);
      }

      return sendError(res, "Failed to update nilai", error.message, 500);
    }
  }

  /**
   * DELETE /api/nilai/:id
   * Delete nilai
   */
  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await NilaiService.delete(id);

      return sendSuccess(res, result.message);
    } catch (error: any) {
      if (error.message === "Nilai not found") {
        return sendError(res, error.message, null, 404);
      }

      return sendError(res, "Failed to delete nilai", error.message, 500);
    }
  }

  /**
   * GET /api/nilai/siswa/:siswaId
   * Get nilai by siswa
   */
  static async getBySiswa(req: Request, res: Response) {
    try {
      const siswaId = parseInt(req.params.siswaId);
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;
      const semester = req.query.semester as string;

      const result = await NilaiService.getBySiswa(
        siswaId,
        tahunAjaranId,
        semester
      );

      return sendSuccess(res, "Nilai retrieved successfully", result);
    } catch (error: any) {
      if (error.message === "Siswa not found") {
        return sendError(res, error.message, null, 404);
      }

      return sendError(res, "Failed to get nilai", error.message, 500);
    }
  }

  /**
   * GET /api/nilai/kelas/:kelasId/mapel/:mapelId
   * Get nilai by kelas & mata pelajaran
   */
  static async getByKelasMapel(req: Request, res: Response) {
    try {
      const kelasId = parseInt(req.params.kelasId);
      const mapelId = parseInt(req.params.mapelId);
      const tahunAjaranId = parseInt(req.query.tahunAjaranId as string);
      const semester = req.query.semester as string;

      if (!tahunAjaranId || !semester) {
        return sendError(
          res,
          "tahunAjaranId and semester are required",
          null,
          400
        );
      }

      const result = await NilaiService.getByKelasMapel(
        kelasId,
        mapelId,
        tahunAjaranId,
        semester
      );

      return sendSuccess(res, "Nilai retrieved successfully", result);
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, null, 404);
      }

      return sendError(res, "Failed to get nilai", error.message, 500);
    }
  }

  /**
   * GET /api/nilai/rapor/:siswaId
   * Generate rapor siswa
   */
  static async generateRapor(req: Request, res: Response) {
    try {
      const siswaId = parseInt(req.params.siswaId);
      const tahunAjaranId = parseInt(req.query.tahunAjaranId as string);
      const semester = req.query.semester as string;

      if (!tahunAjaranId || !semester) {
        return sendError(
          res,
          "tahunAjaranId and semester are required",
          null,
          400
        );
      }

      const rapor = await NilaiService.generateRapor(
        siswaId,
        tahunAjaranId,
        semester
      );

      return sendSuccess(res, "Rapor generated successfully", rapor);
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, null, 404);
      }

      return sendError(res, "Failed to generate rapor", error.message, 500);
    }
  }

  /**
   * GET /api/nilai/stats
   * Get nilai statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const stats = await NilaiService.getStats(tahunAjaranId);

      return sendSuccess(res, "Statistics retrieved successfully", stats);
    } catch (error: any) {
      return sendError(res, "Failed to get statistics", error.message, 500);
    }
  }
}
