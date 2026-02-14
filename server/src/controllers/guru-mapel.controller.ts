import { Request, Response } from "express";
import { GuruMapelService } from "../services/guru-mapel.service";
import { sendSuccess, sendError } from "../utils/response.util";
import { PaginationQuery } from "../types";

export class GuruMapelController {
  /**
   * GET /api/guru-mapel
   * Get all guru mapel assignments with filters
   */
  static async getAll(req: Request, res: Response) {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
        tahunAjaranId: req.query.tahunAjaranId as string,
        kelasId: req.query.kelasId as string,
        guruId: req.query.guruId as string,
        mapelId: req.query.mapelId as string,
      };

      const result = await GuruMapelService.getAll(query);

      return sendSuccess(
        res,
        "Guru mapel assignments retrieved successfully",
        result.data,
        result.pagination,
      );
    } catch (error: any) {
      return sendError(
        res,
        "Failed to get guru mapel assignments",
        error.message,
        500,
      );
    }
  }

  /**
   * GET /api/guru-mapel/:id
   * Get specific guru mapel assignment
   */
  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid ID", null, 400);
      }

      const guruMapel = await GuruMapelService.getById(id);

      return sendSuccess(
        res,
        "Guru mapel assignment retrieved successfully",
        guruMapel,
      );
    } catch (error: any) {
      if (error.message === "Guru mapel assignment not found") {
        return sendError(res, error.message, null, 404);
      }
      return sendError(
        res,
        "Failed to get guru mapel assignment",
        error.message,
        500,
      );
    }
  }

  /**
   * GET /api/guru-mapel/guru/:guruId
   * Get all assignments for specific guru
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

      const assignments = await GuruMapelService.getByGuru(
        guruId,
        tahunAjaranId,
      );

      return sendSuccess(
        res,
        "Guru assignments retrieved successfully",
        assignments,
      );
    } catch (error: any) {
      return sendError(
        res,
        "Failed to get guru assignments",
        error.message,
        500,
      );
    }
  }

  /**
   * GET /api/guru-mapel/kelas/:kelasId
   * Get all assignments for specific kelas
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

      const assignments = await GuruMapelService.getByKelas(
        kelasId,
        tahunAjaranId,
      );

      return sendSuccess(
        res,
        "Kelas assignments retrieved successfully",
        assignments,
      );
    } catch (error: any) {
      return sendError(
        res,
        "Failed to get kelas assignments",
        error.message,
        500,
      );
    }
  }

  /**
   * POST /api/guru-mapel
   * Create new guru mapel assignment
   */
  static async create(req: Request, res: Response) {
    try {
      const { id_guru, id_mapel, id_kelas, tahunAjaranId } = req.body;

      // Validation
      if (!id_guru || !id_mapel || !id_kelas || !tahunAjaranId) {
        return sendError(
          res,
          "Missing required fields: id_guru, id_mapel, id_kelas, tahunAjaranId",
          null,
          400,
        );
      }

      const guruMapel = await GuruMapelService.create({
        id_guru: parseInt(id_guru),
        id_mapel: parseInt(id_mapel),
        id_kelas: parseInt(id_kelas),
        tahunAjaranId: parseInt(tahunAjaranId),
      });

      return sendSuccess(
        res,
        "Guru mapel assignment created successfully",
        guruMapel,
      );
    } catch (error: any) {
      if (
        error.message.includes("not found") ||
        error.message.includes("sudah ditugaskan")
      ) {
        return sendError(res, error.message, null, 400);
      }
      return sendError(
        res,
        "Failed to create guru mapel assignment",
        error.message,
        500,
      );
    }
  }

  /**
   * PUT /api/guru-mapel/:id
   * Update guru mapel assignment
   */
  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid ID", null, 400);
      }

      const guruMapel = await GuruMapelService.update(id, req.body);

      return sendSuccess(
        res,
        "Guru mapel assignment updated successfully",
        guruMapel,
      );
    } catch (error: any) {
      if (error.message === "Guru mapel assignment not found") {
        return sendError(res, error.message, null, 404);
      }
      if (error.message.includes("Duplicate assignment")) {
        return sendError(res, error.message, null, 400);
      }
      return sendError(
        res,
        "Failed to update guru mapel assignment",
        error.message,
        500,
      );
    }
  }

  /**
   * DELETE /api/guru-mapel/:id
   * Delete guru mapel assignment
   */
  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid ID", null, 400);
      }

      const result = await GuruMapelService.delete(id);

      return sendSuccess(res, result.message);
    } catch (error: any) {
      if (error.message === "Guru mapel assignment not found") {
        return sendError(res, error.message, null, 404);
      }
      if (error.message.includes("Cannot delete")) {
        return sendError(res, error.message, null, 400);
      }
      return sendError(
        res,
        "Failed to delete guru mapel assignment",
        error.message,
        500,
      );
    }
  }

  /**
   * GET /api/guru-mapel/stats
   * Get statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const stats = await GuruMapelService.getStats(tahunAjaranId);

      return sendSuccess(res, "Statistics retrieved successfully", stats);
    } catch (error: any) {
      return sendError(res, "Failed to get statistics", error.message, 500);
    }
  }
}
