import { Request, Response } from "express";
import { TagihanService } from "../services/tagihan.service";
import { PaginationQuery } from "../types";
import { sendSuccess, sendError } from "../utils/response.util";
import { StatusTagihan } from "@prisma/client";

export class TagihanController {
  /**
   * GET /api/tagihan
   * Get all tagihan with pagination
   */
  static async getAll(req: Request, res: Response) {
    try {
      const query: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
      };

      const result = await TagihanService.getAll(query);

      return sendSuccess(
        res,
        "Tagihan retrieved successfully",
        result.data,
        result.pagination
      );
    } catch (error: any) {
      return sendError(res, "Failed to get tagihan", error.message, 500);
    }
  }

  /**
   * GET /api/tagihan/:id
   * Get tagihan by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const tagihan = await TagihanService.getById(id);

      return sendSuccess(res, "Tagihan retrieved successfully", tagihan);
    } catch (error: any) {
      return sendError(res, "Failed to get tagihan", error.message, 404);
    }
  }

  /**
   * GET /api/tagihan/siswa/:siswaId
   * Get tagihan by siswa
   */
  static async getBySiswa(req: Request, res: Response) {
    try {
      const siswaId = parseInt(req.params.siswaId);
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;
      const status = req.query.status as StatusTagihan | undefined;

      const tagihan = await TagihanService.getBySiswa(
        siswaId,
        tahunAjaranId,
        status
      );

      return sendSuccess(res, "Tagihan retrieved successfully", tagihan);
    } catch (error: any) {
      return sendError(res, "Failed to get tagihan", error.message, 500);
    }
  }

  /**
   * GET /api/tagihan/outstanding
   * Get outstanding tagihan (belum lunas)
   */
  static async getOutstanding(req: Request, res: Response) {
    try {
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const tagihan = await TagihanService.getOutstanding(tahunAjaranId);

      return sendSuccess(
        res,
        "Outstanding tagihan retrieved successfully",
        tagihan
      );
    } catch (error: any) {
      return sendError(
        res,
        "Failed to get outstanding tagihan",
        error.message,
        500
      );
    }
  }

  /**
   * GET /api/tagihan/bulan/:bulan
   * Get tagihan by bulan (monthly report)
   */
  static async getByBulan(req: Request, res: Response) {
    try {
      const bulan = req.params.bulan;
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const tagihan = await TagihanService.getByBulan(bulan, tahunAjaranId);

      return sendSuccess(res, "Tagihan retrieved successfully", tagihan);
    } catch (error: any) {
      return sendError(
        res,
        "Failed to get tagihan by bulan",
        error.message,
        500
      );
    }
  }

  /**
   * GET /api/tagihan/stats
   * Get statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const stats = await TagihanService.getStats(tahunAjaranId);

      return sendSuccess(res, "Statistics retrieved successfully", stats);
    } catch (error: any) {
      return sendError(res, "Failed to get statistics", error.message, 500);
    }
  }

  /**
   * POST /api/tagihan
   * Create single tagihan
   */
  static async create(req: Request, res: Response) {
    try {
      const tagihan = await TagihanService.create(req.body);

      return sendSuccess(res, "Tagihan created successfully", tagihan);
    } catch (error: any) {
      return sendError(res, "Failed to create tagihan", error.message, 400);
    }
  }

  /**
   * POST /api/tagihan/generate-bulk
   * Generate bulk tagihan
   */
  static async generateBulk(req: Request, res: Response) {
    try {
      const result = await TagihanService.generateBulk(req.body);

      return sendSuccess(res, "Bulk tagihan generated successfully", result);
    } catch (error: any) {
      return sendError(
        res,
        "Failed to generate bulk tagihan",
        error.message,
        400
      );
    }
  }

  /**
   * PUT /api/tagihan/:id/status
   * Update tagihan status
   */
  static async updateStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (!status) {
        return sendError(res, "Status is required", null, 400);
      }

      const tagihan = await TagihanService.updateStatus(id, status);

      return sendSuccess(res, "Tagihan status updated successfully", tagihan);
    } catch (error: any) {
      return sendError(
        res,
        "Failed to update tagihan status",
        error.message,
        400
      );
    }
  }

  /**
   * PUT /api/tagihan/:id/auto-update-status
   * Auto-update status based on pembayaran
   */
  static async autoUpdateStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const newStatus = await TagihanService.autoUpdateStatus(id);

      return sendSuccess(res, "Status updated automatically", {
        status: newStatus,
      });
    } catch (error: any) {
      return sendError(res, "Failed to auto-update status", error.message, 400);
    }
  }

  /**
   * DELETE /api/tagihan/:id
   * Delete tagihan
   */
  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await TagihanService.delete(id);

      return sendSuccess(res, result.message, null);
    } catch (error: any) {
      return sendError(res, "Failed to delete tagihan", error.message, 400);
    }
  }
}
