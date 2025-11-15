import { Request, Response } from "express";
import { PaginationQuery } from "../types";
import { MataPelajaranService } from "../services/mata-pelajaran.service";
import { sendError, sendSuccess } from "../utils/response.util";

export class MataPelajaranController {
  /**
   * Get /api/mata-pelajaran
   * Get all mata pelajaran with pagination
   */
  static async getAll(req: Request, res: Response) {
    try {
      const query: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as "asc") || "desc",
      };

      const result = await MataPelajaranService.getAll(query);

      return sendSuccess(
        res,
        "Mata pelajaran retrieved successfully",
        result.data,
        result.pagination
      );
    } catch (error: any) {
      return sendError(res, "Failed to get mata pelajaran", error.message, 500);
    }
  }

  /**
   * GET /api/mata-pelajaran/:id
   * Get mata pelajaran by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const mataPelajaran = await MataPelajaranService.getById(id);

      return sendSuccess(
        res,
        "Mata pelajaran retrieved successfully",
        mataPelajaran
      );
    } catch (error: any) {
      if (error.message === "Mata pelajaran not found") {
        return sendError(res, error.message, null, 404);
      }
      return sendError(res, "Failed to get mata pelajaran", error.message, 500);
    }
  }

  /**
   * POST /api/mata-pelajaran
   * Create new mata pelajaran
   */
  static async create(req: Request, res: Response) {
    try {
      const mataPelajaran = await MataPelajaranService.create(req.body);

      return sendSuccess(
        res,
        "Mata pelajaran created successfully",
        mataPelajaran
      );
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        return sendError(res, error.message, null, 400);
      }

      return sendError(
        res,
        "Failed to create mata pelajaran",
        error.message,
        500
      );
    }
  }

  /**
   * PUT /api/mata-pelajaran/:id
   * Update mata pelajaran
   */
  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const mataPelajaran = await MataPelajaranService.update(id, req.body);

      return sendSuccess(
        res,
        "Mata pelajaran updated successfully",
        mataPelajaran
      );
    } catch (error: any) {
      if (error.message === "Mata pelajaran not found") {
        return sendError(res, error.message, null, 404);
      }

      if (error.message.includes("already exists")) {
        return sendError(res, error.message, null, 400);
      }

      return sendError(
        res,
        "Failed to update mata pelajaran",
        error.message,
        500
      );
    }
  }

  /**
   * DELETE /api/mata-pelajaran/:id
   * Delete mata pelajaran
   */
  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await MataPelajaranService.delete(id);

      return sendSuccess(res, result.message);
    } catch (error: any) {
      if (error.message === "Mata pelajaran not found") {
        return sendError(res, error.message, null, 404);
      }

      if (error.message.includes("Cannot delete")) {
        return sendError(res, error.message, null, 400);
      }

      return sendError(
        res,
        "Failed to delete mata pelajaran",
        error.message,
        500
      );
    }
  }

  /**
   * GET /api/mata-pelajaran/stats
   * Get mata pelajaran statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const stats = await MataPelajaranService.getStats();

      return sendSuccess(res, "Statistics retrieved successfully", stats);
    } catch (error: any) {
      return sendError(res, "Failed to get statistics", error.message, 500);
    }
  }

  /**
   * GET /api/mata-pelajaran/kelompok/:kelompok
   * Get mata pelajaran by kelompok
   */
  static async getByKelompok(req: Request, res: Response) {
    try {
      const { kelompok } = req.params;
      const mataPelajaran = await MataPelajaranService.getByKelompok(kelompok);

      return sendSuccess(
        res,
        "Mata pelajaran retrieved successfully",
        mataPelajaran
      );
    } catch (error: any) {
      return sendError(res, "Failed to get mata pelajaran", error.message, 500);
    }
  }

  /**
   * GET /api/mata-pelajaran/kelompok-list
   * Get list of all kelompok mapel
   */
  static async getKelompokList(req: Request, res: Response) {
    try {
      const kelompoks = await MataPelajaranService.getKelompokList();

      return sendSuccess(
        res,
        "Kelompok list retrieved successfully",
        kelompoks
      );
    } catch (error: any) {
      return sendError(res, "Failed to get kelompok list", error.message, 500);
    }
  }
}
