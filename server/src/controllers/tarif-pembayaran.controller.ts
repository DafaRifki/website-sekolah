import { Request, Response } from "express";
import { TarifPembayaranService } from "../services/tarif-pembayaran.service";
import { PaginationQuery } from "../types";
import { sendSuccess, sendError } from "../utils/response.util";

export class TarifPembayaranController {
  /**
   * GET /api/tarif-pembayaran
   * Get all tarif with pagination
   */
  static async getAll(req: Request, res: Response) {
    try {
      const query: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
      };

      const result = await TarifPembayaranService.getAll(query);

      return sendSuccess(
        res,
        "Tarif pembayaran retrieved successfully",
        result.data,
        result.pagination
      );
    } catch (error: any) {
      return sendError(
        res,
        "Failed to get tarif pembayaran",
        error.message,
        500
      );
    }
  }

  /**
   * GET /api/tarif-pembayaran/:id
   * Get tarif by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const tarif = await TarifPembayaranService.getById(id);

      return sendSuccess(res, "Tarif pembayaran retrieved successfully", tarif);
    } catch (error: any) {
      return sendError(
        res,
        "Failed to get tarif pembayaran",
        error.message,
        404
      );
    }
  }

  /**
   * GET /api/tarif-pembayaran/tahun-ajaran/:tahunAjaranId
   * Get tarif by tahun ajaran
   */
  static async getByTahunAjaran(req: Request, res: Response) {
    try {
      const tahunAjaranId = parseInt(req.params.tahunAjaranId);
      const tarif = await TarifPembayaranService.getByTahunAjaran(
        tahunAjaranId
      );

      return sendSuccess(res, "Tarif pembayaran retrieved successfully", tarif);
    } catch (error: any) {
      return sendError(
        res,
        "Failed to get tarif pembayaran",
        error.message,
        500
      );
    }
  }

  /**
   * GET /api/tarif-pembayaran/jenis/:jenis
   * Get tarif by jenis pembayaran
   */
  static async getByJenis(req: Request, res: Response) {
    try {
      const jenis = req.params.jenis;
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const tarif = await TarifPembayaranService.getByJenis(
        jenis,
        tahunAjaranId
      );

      return sendSuccess(res, "Tarif pembayaran retrieved successfully", tarif);
    } catch (error: any) {
      return sendError(
        res,
        "Failed to get tarif pembayaran",
        error.message,
        500
      );
    }
  }

  /**
   * POST /api/tarif-pembayaran
   * Create new tarif
   */
  static async create(req: Request, res: Response) {
    try {
      const tarif = await TarifPembayaranService.create(req.body);

      return sendSuccess(res, "Tarif pembayaran created successfully", tarif);
    } catch (error: any) {
      return sendError(
        res,
        "Failed to create tarif pembayaran",
        error.message,
        400
      );
    }
  }

  /**
   * PUT /api/tarif-pembayaran/:id
   * Update tarif
   */
  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const tarif = await TarifPembayaranService.update(id, req.body);

      return sendSuccess(res, "Tarif pembayaran updated successfully", tarif);
    } catch (error: any) {
      return sendError(
        res,
        "Failed to update tarif pembayaran",
        error.message,
        400
      );
    }
  }

  /**
   * DELETE /api/tarif-pembayaran/:id
   * Delete tarif
   */
  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await TarifPembayaranService.delete(id);

      return sendSuccess(res, result.message, null);
    } catch (error: any) {
      return sendError(
        res,
        "Failed to delete tarif pembayaran",
        error.message,
        400
      );
    }
  }

  /**
   * GET /api/tarif-pembayaran/stats
   * Get statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const stats = await TarifPembayaranService.getStats();

      return sendSuccess(res, "Statistics retrieved successfully", stats);
    } catch (error: any) {
      return sendError(res, "Failed to get statistics", error.message, 500);
    }
  }

  /**
   * GET /api/tarif-pembayaran/jenis-list
   * Get list of jenis pembayaran
   */
  static async getJenisList(req: Request, res: Response) {
    try {
      const jenisList = await TarifPembayaranService.getJenisList();

      return sendSuccess(
        res,
        "Jenis pembayaran list retrieved successfully",
        jenisList
      );
    } catch (error: any) {
      return sendError(res, "Failed to get jenis list", error.message, 500);
    }
  }
}
