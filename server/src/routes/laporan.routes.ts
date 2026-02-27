// src/routes/laporan.routes.ts
import { Router } from "express";
import { LaporanController } from "../controllers/laporan.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/laporan/stats/:tahunAjaranId
 * Get statistics for a tahun ajaran
 */
router.get("/stats/:tahunAjaranId", LaporanController.getStats);

/**
 * GET /api/laporan/tagihan/excel/:tahunAjaranId
 * Download Tagihan Excel report
 */
router.get(
  "/tagihan/excel/:tahunAjaranId",
  LaporanController.downloadTagihanExcel,
);

/**
 * GET /api/laporan/pembayaran/excel/:tahunAjaranId
 * Download Pembayaran Excel report
 */
router.get(
  "/pembayaran/excel/:tahunAjaranId",
  LaporanController.downloadPembayaranExcel,
);

/**
 * GET /api/laporan/tagihan/csv/:tahunAjaranId
 * Download Tagihan CSV report
 */
router.get("/tagihan/csv/:tahunAjaranId", LaporanController.downloadTagihanCSV);

/**
 * GET /api/laporan/pembayaran/csv/:tahunAjaranId
 * Download Pembayaran CSV report
 */
router.get(
  "/pembayaran/csv/:tahunAjaranId",
  LaporanController.downloadPembayaranCSV,
);

/**
 * POST /api/laporan/arsip/:tahunAjaranId
 * Archive data for a tahun ajaran
 */
router.post("/arsip/:tahunAjaranId", LaporanController.arsipData);

/**
 * DELETE /api/laporan/arsip/:tahunAjaranId/delete
 * Delete archived data from database
 */
router.delete(
  "/arsip/:tahunAjaranId/delete",
  LaporanController.deleteArchivedData,
);

/**
 * GET /api/laporan/arsip/csv/:tahunAjaranId
 * Download archived data as CSV
 */
router.get("/arsip/csv/:tahunAjaranId", LaporanController.downloadArchivedCSV);

/**
 * POST /api/laporan/arsip/:tahunAjaranId/restore
 * Restore archived data back to database
 */
router.post("/arsip/:tahunAjaranId/restore", LaporanController.restoreData);

export default router;
