import { Request, Response } from "express";
import { OrangTuaService } from "../services/orangtua.service";
import { PaginationQuery } from "../types/common.types";
import { sendSuccess, sendError } from "../utils/response.util";

export class OrangTuaController {
  /**
   * GET /api/orangtua
   * Get all orang tua with pagination
   */
  static async getAll(req: Request, res: Response) {
    try {
      const query: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc",
      };

      const result = await OrangTuaService.getAll(query);

      return sendSuccess(
        res,
        "Orang tua retrieved successfully",
        result.data,
        result.pagination
      );
    } catch (error: any) {
      return sendError(res, "Failed to get orang tua", error.message, 500);
    }
  }

  /**
   * GET /api/orangtua/:id
   * Get orang tua by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const orangTua = await OrangTuaService.getById(id);

      return sendSuccess(res, "Orang tua retrieved successfully", orangTua);
    } catch (error: any) {
      if (error.message === "Orang tua not found") {
        return sendError(res, error.message, null, 404);
      }
      return sendError(res, "Failed to get orang tua", error.message, 500);
    }
  }

  /**
   * POST /api/orangtua
   * Create new orang tua
   */
  static async create(req: Request, res: Response) {
    try {
      const orangTua = await OrangTuaService.create(req.body);

      return sendSuccess(res, "Orang tua created successfully", orangTua);
    } catch (error: any) {
      return sendError(res, "Failed to create orang tua", error.message, 500);
    }
  }

  /**
   * PUT /api/orangtua/:id
   * Update orang tua
   */
  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const orangTua = await OrangTuaService.update(id, req.body);

      return sendSuccess(res, "Orang tua updated successfully", orangTua);
    } catch (error: any) {
      if (error.message === "Orang tua not found") {
        return sendError(res, error.message, null, 404);
      }
      return sendError(res, "Failed to update orang tua", error.message, 500);
    }
  }

  /**
   * DELETE /api/orangtua/:id
   * Delete orang tua
   */
  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await OrangTuaService.delete(id);

      return sendSuccess(res, result.message);
    } catch (error: any) {
      if (error.message === "Orang tua not found") {
        return sendError(res, error.message, null, 404);
      }

      if (error.message.includes("Cannot delete")) {
        return sendError(res, error.message, null, 400);
      }

      return sendError(res, "Failed to delete orang tua", error.message, 500);
    }
  }

  /**
   * POST /api/orangtua/:id/link-siswa
   * Link orang tua to siswa
   */
  static async linkToSiswa(req: Request, res: Response) {
    try {
      const orangTuaId = parseInt(req.params.id);
      const link = await OrangTuaService.linkToSiswa(orangTuaId, req.body);

      return sendSuccess(res, "Siswa linked successfully", link);
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, null, 404);
      }

      if (error.message.includes("already linked")) {
        return sendError(res, error.message, null, 400);
      }

      return sendError(res, "Failed to link siswa", error.message, 500);
    }
  }

  /**
   * DELETE /api/orangtua/:id/unlink-siswa/:siswaId
   * Unlink orang tua from siswa
   */
  static async unlinkFromSiswa(req: Request, res: Response) {
    try {
      const orangTuaId = parseInt(req.params.id);
      const siswaId = parseInt(req.params.siswaId);

      const result = await OrangTuaService.unlinkFromSiswa(orangTuaId, siswaId);

      return sendSuccess(res, result.message);
    } catch (error: any) {
      if (error.message === "Link not found") {
        return sendError(res, error.message, null, 404);
      }

      return sendError(res, "Failed to unlink siswa", error.message, 500);
    }
  }

  /**
   * GET /api/orangtua/by-siswa/:siswaId
   * Get orang tua by siswa
   */
  static async getBySiswa(req: Request, res: Response) {
    try {
      const siswaId = parseInt(req.params.siswaId);
      const orangTua = await OrangTuaService.getBySiswa(siswaId);

      return sendSuccess(res, "Orang tua retrieved successfully", orangTua);
    } catch (error: any) {
      if (error.message === "Siswa not found") {
        return sendError(res, error.message, null, 404);
      }

      return sendError(res, "Failed to get orang tua", error.message, 500);
    }
  }

  /**
   * GET /api/orangtua/:id/siswa
   * Get siswa by orang tua
   */
  static async getSiswaByOrangTua(req: Request, res: Response) {
    try {
      const orangTuaId = parseInt(req.params.id);
      const siswa = await OrangTuaService.getSiswaByOrangTua(orangTuaId);

      return sendSuccess(res, "Siswa retrieved successfully", siswa);
    } catch (error: any) {
      if (error.message === "Orang tua not found") {
        return sendError(res, error.message, null, 404);
      }

      return sendError(res, "Failed to get siswa", error.message, 500);
    }
  }

  /**
   * GET /api/orangtua/stats
   * Get orang tua statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const stats = await OrangTuaService.getStats();

      return sendSuccess(res, "Statistics retrieved successfully", stats);
    } catch (error: any) {
      return sendError(res, "Failed to get statistics", error.message, 500);
    }
  }
}
