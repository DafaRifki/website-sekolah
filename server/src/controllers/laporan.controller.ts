// src/controllers/laporan.controller.ts
import { Request, Response } from "express";
import { LaporanService } from "../services/laporan.service";
import { sendSuccess, sendError } from "../utils/response.util";
import { prisma } from "../config/database";

export class LaporanController {
  /**
   * GET /api/laporan/stats/:tahunAjaranId
   * Get statistics for a tahun ajaran
   */
  static async getStats(req: Request, res: Response) {
    try {
      const tahunAjaranId = parseInt(req.params.tahunAjaranId);

      if (isNaN(tahunAjaranId)) {
        return sendError(
          res,
          "Invalid tahun ajaran ID",
          "ID must be a number",
          400,
        );
      }

      const stats = await LaporanService.getStats(tahunAjaranId);
      return sendSuccess(res, "Stats retrieved successfully", stats);
    } catch (error: any) {
      return sendError(res, "Failed to get stats", error.message, 500);
    }
  }

  /**
   * GET /api/laporan/tagihan/excel/:tahunAjaranId
   * Download Tagihan Excel report
   */
  static async downloadTagihanExcel(req: Request, res: Response) {
    try {
      const tahunAjaranId = parseInt(req.params.tahunAjaranId);

      if (isNaN(tahunAjaranId)) {
        return sendError(
          res,
          "Invalid tahun ajaran ID",
          "ID must be a number",
          400,
        );
      }

      const buffer = await LaporanService.generateTagihanExcel(tahunAjaranId);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Laporan_Tagihan_${tahunAjaranId}.xlsx`,
      );

      return res.send(buffer);
    } catch (error: any) {
      return sendError(res, "Failed to generate Excel", error.message, 500);
    }
  }

  /**
   * GET /api/laporan/pembayaran/excel/:tahunAjaranId
   * Download Pembayaran Excel report
   */
  static async downloadPembayaranExcel(req: Request, res: Response) {
    try {
      const tahunAjaranId = parseInt(req.params.tahunAjaranId);

      if (isNaN(tahunAjaranId)) {
        return sendError(
          res,
          "Invalid tahun ajaran ID",
          "ID must be a number",
          400,
        );
      }

      const buffer =
        await LaporanService.generatePembayaranExcel(tahunAjaranId);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Laporan_Pembayaran_${tahunAjaranId}.xlsx`,
      );

      return res.send(buffer);
    } catch (error: any) {
      return sendError(res, "Failed to generate Excel", error.message, 500);
    }
  }

  /**
   * GET /api/laporan/tagihan/csv/:tahunAjaranId
   * Download Tagihan CSV report
   */
  static async downloadTagihanCSV(req: Request, res: Response) {
    try {
      const tahunAjaranId = parseInt(req.params.tahunAjaranId);

      if (isNaN(tahunAjaranId)) {
        return sendError(
          res,
          "Invalid tahun ajaran ID",
          "ID must be a number",
          400,
        );
      }

      const csv = await LaporanService.generateTagihanCSV(tahunAjaranId);

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Laporan_Tagihan_${tahunAjaranId}.csv`,
      );

      return res.send("\uFEFF" + csv); // Add BOM for Excel UTF-8 support
    } catch (error: any) {
      return sendError(res, "Failed to generate CSV", error.message, 500);
    }
  }

  /**
   * GET /api/laporan/pembayaran/csv/:tahunAjaranId
   * Download Pembayaran CSV report
   */
  static async downloadPembayaranCSV(req: Request, res: Response) {
    try {
      const tahunAjaranId = parseInt(req.params.tahunAjaranId);

      if (isNaN(tahunAjaranId)) {
        return sendError(
          res,
          "Invalid tahun ajaran ID",
          "ID must be a number",
          400,
        );
      }

      const csv = await LaporanService.generatePembayaranCSV(tahunAjaranId);

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Laporan_Pembayaran_${tahunAjaranId}.csv`,
      );

      return res.send("\uFEFF" + csv); // Add BOM for Excel UTF-8 support
    } catch (error: any) {
      return sendError(res, "Failed to generate CSV", error.message, 500);
    }
  }

  /**
   * POST /api/laporan/arsip/:tahunAjaranId
   * Archive data for a tahun ajaran
   */
  static async arsipData(req: Request, res: Response) {
    try {
      const tahunAjaranId = parseInt(req.params.tahunAjaranId);

      if (isNaN(tahunAjaranId)) {
        return sendError(
          res,
          "Invalid tahun ajaran ID",
          "ID must be a number",
          400,
        );
      }

      const shouldDelete = req.query.delete === "true";
      const result = await LaporanService.arsipData(tahunAjaranId, shouldDelete);

      // In production, you would save the backup to file storage here
      // For example: save to AWS S3, Google Cloud Storage, or local filesystem

      return sendSuccess(res, result.message, {
        success: result.success,
        arsipDate: result.arsipDate,
        totalTagihan: result.totalTagihan,
        totalPembayaran: result.totalPembayaran,
        filename: result.filename,
        deletedFromDB: result.deletedFromDB,
      });
    } catch (error: any) {
      return sendError(res, "Failed to archive data", error.message, 500);
    }
  }

  /**
   * DELETE /api/laporan/arsip/:tahunAjaranId/delete
   * Delete archived data from database
   */
  static async deleteArchivedData(req: Request, res: Response) {
    try {
      const tahunAjaranId = parseInt(req.params.tahunAjaranId);

      if (isNaN(tahunAjaranId)) {
        return sendError(
          res,
          "Invalid tahun ajaran ID",
          "ID must be a number",
          400,
        );
      }

      const result = await LaporanService.deleteArchivedData(tahunAjaranId);

      return sendSuccess(res, result.message, {
        success: result.success,
      });
    } catch (error: any) {
      return sendError(
        res,
        "Failed to delete archived data",
        error.message,
        500,
      );
    }
  }

  /**
   * GET /api/laporan/arsip/csv/:tahunAjaranId
   * Download archived data as CSV
   */
  static async downloadArchivedCSV(req: Request, res: Response) {
    try {
      const tahunAjaranId = parseInt(req.params.tahunAjaranId);

      if (isNaN(tahunAjaranId)) {
        return sendError(
          res,
          "Invalid tahun ajaran ID",
          "ID must be a number",
          400,
        );
      }

      const csv = await LaporanService.generateArchivedCSV(tahunAjaranId);

      // Get tahun ajaran name for filename
      const tahunAjaran = await prisma.tahunAjaran.findUnique({
        where: { id_tahun: tahunAjaranId },
      });

      const filename = tahunAjaran
        ? `Arsip_${tahunAjaran.namaTahun}_Sem${tahunAjaran.semester}.csv`
        : `Arsip_${tahunAjaranId}.csv`;

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

      return res.send("\uFEFF" + csv); // Add BOM for Excel UTF-8 support
    } catch (error: any) {
      return sendError(res, "Failed to download arsip", error.message, 500);
    }
  }

  /**
   * POST /api/laporan/arsip/:tahunAjaranId/restore
   * Restore archived data back to database
   */
  static async restoreData(req: Request, res: Response) {
    try {
      const tahunAjaranId = parseInt(req.params.tahunAjaranId);

      if (isNaN(tahunAjaranId)) {
        return sendError(
          res,
          "Invalid tahun ajaran ID",
          "ID must be a number",
          400,
        );
      }

      const result = await LaporanService.restoreData(tahunAjaranId);

      return sendSuccess(res, result.message, {
        success: result.success,
        backupFile: result.backupFile,
        tagihanRestored: result.tagihanRestored,
        tagihanSkipped: result.tagihanSkipped,
        pembayaranRestored: result.pembayaranRestored,
        pembayaranSkipped: result.pembayaranSkipped,
      });
    } catch (error: any) {
      return sendError(res, "Failed to restore data", error.message, 500);
    }
  }
}
