import { Request, Response } from "express";
import { PembayaranService } from "../services/pembayaran.service";
import { PaginationQuery } from "../types";
import { sendSuccess, sendError } from "../utils/response.util";

export class PembayaranController {
  /**
   * GET /api/pembayaran
   * Get all pembayaran with pagination
   */
  static async getAll(req: Request, res: Response) {
    try {
      const query: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
      };

      const result = await PembayaranService.getAll(query);

      return sendSuccess(
        res,
        "Pembayaran retrieved successfully",
        result.data,
        result.pagination
      );
    } catch (error: any) {
      return sendError(res, "Failed to get pembayaran", error.message, 500);
    }
  }

  /**
   * GET /api/pembayaran/:id
   * Get pembayaran by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const pembayaran = await PembayaranService.getById(id);

      return sendSuccess(res, "Pembayaran retrieved successfully", pembayaran);
    } catch (error: any) {
      return sendError(res, "Failed to get pembayaran", error.message, 404);
    }
  }

  /**
   * GET /api/pembayaran/siswa/:siswaId
   * Get pembayaran by siswa
   */
  static async getBySiswa(req: Request, res: Response) {
    try {
      const siswaId = parseInt(req.params.siswaId);
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const pembayaran = await PembayaranService.getBySiswa(
        siswaId,
        tahunAjaranId
      );

      return sendSuccess(res, "Pembayaran retrieved successfully", pembayaran);
    } catch (error: any) {
      return sendError(res, "Failed to get pembayaran", error.message, 500);
    }
  }

  /**
   * GET /api/pembayaran/tagihan/:tagihanId
   * Get payment history for a tagihan
   */
  static async getByTagihan(req: Request, res: Response) {
    try {
      const tagihanId = parseInt(req.params.tagihanId);
      const data = await PembayaranService.getByTagihan(tagihanId);

      return sendSuccess(res, "Payment history retrieved successfully", data);
    } catch (error: any) {
      return sendError(
        res,
        "Failed to get payment history",
        error.message,
        404
      );
    }
  }

  /**
   * GET /api/pembayaran/date-range
   * Get pembayaran by date range
   */
  static async getByDateRange(req: Request, res: Response) {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return sendError(
          res,
          "Invalid date format",
          "Use YYYY-MM-DD format",
          400
        );
      }

      const data = await PembayaranService.getByDateRange(
        startDate,
        endDate,
        tahunAjaranId
      );

      return sendSuccess(res, "Data retrieved successfully", data);
    } catch (error: any) {
      return sendError(res, "Failed to get data", error.message, 500);
    }
  }

  /**
   * GET /api/pembayaran/stats
   * Get statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const stats = await PembayaranService.getStats(tahunAjaranId);

      return sendSuccess(res, "Statistics retrieved successfully", stats);
    } catch (error: any) {
      return sendError(res, "Failed to get statistics", error.message, 500);
    }
  }

  /**
   * GET /api/pembayaran/:id/receipt
   * Get payment receipt
   */
  static async getReceipt(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const receipt = await PembayaranService.getReceipt(id);

      return sendSuccess(res, "Receipt retrieved successfully", receipt);
    } catch (error: any) {
      return sendError(res, "Failed to get receipt", error.message, 404);
    }
  }

  /**
   * POST /api/pembayaran
   * Create pembayaran
   */
  static async create(req: Request, res: Response) {
    try {
      const pembayaran = await PembayaranService.create(req.body);

      return sendSuccess(res, "Pembayaran created successfully", pembayaran);
    } catch (error: any) {
      return sendError(res, "Failed to create pembayaran", error.message, 400);
    }
  }

  /**
   * POST /api/pembayaran/bulk
   * Bulk create pembayaran
   */
  static async createBulk(req: Request, res: Response) {
    try {
      const { pembayaranData } = req.body;

      if (!Array.isArray(pembayaranData)) {
        return sendError(res, "pembayaranData must be an array", null, 400);
      }

      const result = await PembayaranService.createBulk(pembayaranData);

      return sendSuccess(res, "Bulk pembayaran created", result);
    } catch (error: any) {
      return sendError(
        res,
        "Failed to create bulk pembayaran",
        error.message,
        400
      );
    }
  }

  /**
   * PUT /api/pembayaran/:id
   * Update pembayaran
   */
  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const pembayaran = await PembayaranService.update(id, req.body);

      return sendSuccess(res, "Pembayaran updated successfully", pembayaran);
    } catch (error: any) {
      return sendError(res, "Failed to update pembayaran", error.message, 400);
    }
  }

  /**
   * DELETE /api/pembayaran/:id
   * Delete pembayaran
   */
  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await PembayaranService.delete(id);

      return sendSuccess(res, result.message, null);
    } catch (error: any) {
      return sendError(res, "Failed to delete pembayaran", error.message, 400);
    }
  }
}
