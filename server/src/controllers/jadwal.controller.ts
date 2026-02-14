import { Request, Response } from "express";
import { JadwalService } from "../services/jadwal.service";
import { sendSuccess, sendError } from "../utils/response.util";

export class JadwalController {
  /**
   * GET /api/jadwal
   * Get all jadwal with filters
   */
  static async getAll(req: Request, res: Response) {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "asc",
        kelasId: req.query.kelasId as string,
        guruId: req.query.guruId as string,
        hari: req.query.hari as string,
        tahunAjaranId: req.query.tahunAjaranId as string,
      };

      const result = await JadwalService.getAll(query);

      return sendSuccess(
        res,
        "Jadwal retrieved successfully",
        result.data,
        result.pagination,
      );
    } catch (error: any) {
      return sendError(res, "Failed to get jadwal", error.message, 500);
    }
  }

  /**
   * GET /api/jadwal/:id
   * Get specific jadwal by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid ID", null, 400);
      }

      const jadwal = await JadwalService.getById(id);

      return sendSuccess(res, "Jadwal retrieved successfully", jadwal);
    } catch (error: any) {
      if (error.message === "Jadwal not found") {
        return sendError(res, error.message, null, 404);
      }
      return sendError(res, "Failed to get jadwal", error.message, 500);
    }
  }

  /**
   * GET /api/jadwal/kelas/:kelasId
   * Get jadwal for specific kelas
   */
  static async getByKelas(req: Request, res: Response) {
    try {
      const kelasId = parseInt(req.params.kelasId);
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      if (isNaN(kelasId)) {
        return sendError(res, "Invalid kelas ID", null, 400);
      }

      const jadwal = await JadwalService.getByKelas(kelasId, tahunAjaranId);

      return sendSuccess(res, "Jadwal kelas retrieved successfully", jadwal);
    } catch (error: any) {
      return sendError(res, "Failed to get jadwal kelas", error.message, 500);
    }
  }

  /**
   * GET /api/jadwal/guru/:guruId
   * Get jadwal for specific guru
   */
  static async getByGuru(req: Request, res: Response) {
    try {
      const guruId = parseInt(req.params.guruId);
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      if (isNaN(guruId)) {
        return sendError(res, "Invalid guru ID", null, 400);
      }

      const jadwal = await JadwalService.getByGuru(guruId, tahunAjaranId);

      return sendSuccess(res, "Jadwal guru retrieved successfully", jadwal);
    } catch (error: any) {
      return sendError(res, "Failed to get jadwal guru", error.message, 500);
    }
  }

  /**
   * POST /api/jadwal
   * Create new jadwal
   */
  static async create(req: Request, res: Response) {
    try {
      const { guruMapelId, hari, jamMulai, jamSelesai, ruangan, keterangan } =
        req.body;

      // Validation
      if (!guruMapelId || !hari || !jamMulai || !jamSelesai) {
        return sendError(
          res,
          "Missing required fields: guruMapelId, hari, jamMulai, jamSelesai",
          null,
          400,
        );
      }

      const jadwal = await JadwalService.create({
        guruMapelId: parseInt(guruMapelId),
        hari,
        jamMulai,
        jamSelesai,
        ruangan,
        keterangan,
      });

      return sendSuccess(res, "Jadwal created successfully", jadwal);
    } catch (error: any) {
      if (
        error.message.includes("Invalid") ||
        error.message.includes("Konflik") ||
        error.message.includes("not found") ||
        error.message.includes("harus lebih besar")
      ) {
        return sendError(res, error.message, null, 400);
      }
      return sendError(res, "Failed to create jadwal", error.message, 500);
    }
  }

  /**
   * PUT /api/jadwal/:id
   * Update jadwal
   */
  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid ID", null, 400);
      }

      const jadwal = await JadwalService.update(id, req.body);

      return sendSuccess(res, "Jadwal updated successfully", jadwal);
    } catch (error: any) {
      if (error.message === "Jadwal not found") {
        return sendError(res, error.message, null, 404);
      }
      if (
        error.message.includes("Invalid") ||
        error.message.includes("Konflik") ||
        error.message.includes("harus lebih besar")
      ) {
        return sendError(res, error.message, null, 400);
      }
      return sendError(res, "Failed to update jadwal", error.message, 500);
    }
  }

  /**
   * DELETE /api/jadwal/:id
   * Delete jadwal
   */
  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid ID", null, 400);
      }

      const result = await JadwalService.delete(id);

      return sendSuccess(res, result.message);
    } catch (error: any) {
      if (error.message === "Jadwal not found") {
        return sendError(res, error.message, null, 404);
      }
      return sendError(res, "Failed to delete jadwal", error.message, 500);
    }
  }

  /**
   * GET /api/jadwal/stats
   * Get statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const stats = await JadwalService.getStats(tahunAjaranId);

      return sendSuccess(res, "Statistics retrieved successfully", stats);
    } catch (error: any) {
      return sendError(res, "Failed to get statistics", error.message, 500);
    }
  }
}
