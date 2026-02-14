import { Router } from "express";
import * as raporController from "../controllers/rapor.controller";
import {
  authenticateToken,
  requireGuru,
  requireKelasAccess,
  requireNilaiAccess,
  requireRaporAccess,
  requireRole,
  requireWaliKelas,
  requireWaliKelasAccess,
} from "../middleware/auth.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation.middleware";
import * as raporValidation from "../validations/rapor.validation";

const router = Router();

// GET /api/rapor?tahunId=1&kelasId=1&semester=1
router.get(
  "/",
  authenticateToken,
  requireRole("ADMIN", "GURU"),
  requireKelasAccess("kelasId"),
  validateQuery(raporValidation.getRaporListSchema),
  raporController.getRaporList,
);

// POST /api/rapor/generate-bulk
router.post(
  "/generate-bulk",
  authenticateToken,
  requireRole("ADMIN", "GURU"),
  requireKelasAccess("kelasId"),
  raporController.generateBulk,
);

// PATCH /api/rapor/:id/publish
router.patch(
  "/:id/publish",
  authenticateToken,
  requireRole("ADMIN", "GURU"),
  requireRaporAccess,
  requireWaliKelas,
  raporController.updateStatusPublish,
);

// PATCH /api/rapor/bulk-publish
router.patch(
  "/bulk-publish",
  authenticateToken,
  requireRole("ADMIN"),
  raporController.bulkPublish,
);

// POST /api/rapor/generate-single
router.post(
  "/generate-single",
  authenticateToken,
  requireRole("ADMIN", "GURU"),
  // Note: generateSingle body usually doesn't have kelasId, rely on controller/service logic or add middleware to check student's class
  raporController.generateSingle,
);

// GET /api/rapor/:id
// Public authenticated routes
router.get(
  "/:id",
  authenticateToken,
  validateParams(raporValidation.idParamSchema),
  requireRaporAccess,
  raporController.getRaporDetail,
);

router.put(
  "/:id/catatan",
  authenticateToken,
  requireWaliKelasAccess,
  raporController.updateCatatan,
);

router.delete(
  "/:id",
  authenticateToken,
  requireWaliKelas,
  raporController.deleteRapor,
);

router.get(
  "/statistics",
  authenticateToken,
  requireWaliKelas,
  raporController.getRaporStatistics,
);

router.get(
  "/siswa/me",
  authenticateToken,
  requireRole("SISWA"),
  raporController.getMyRapor,
);

// ============================================================================
// GURU MAPEL ROUTES
// ============================================================================

router.get(
  "/guru/mapel",
  authenticateToken,
  requireGuru,
  raporController.getMapelByGuru,
);

router.get(
  "/guru/siswa",
  authenticateToken,
  requireGuru,
  raporController.getSiswaForNilai,
);

router.post(
  "/guru/nilai",
  authenticateToken,
  requireGuru,
  raporController.inputNilai,
);

router.post(
  "/guru/nilai-bulk",
  authenticateToken,
  requireGuru,
  raporController.inputNilaiBulk,
);

router.get(
  "/guru/statistics",
  authenticateToken,
  requireGuru,
  raporController.getNilaiStatistics,
);

// ============================================================================
// NILAI CRUD ROUTES (NEW)
// ============================================================================

/**
 * GET /api/rapor/guru/nilai/:id
 * Get nilai detail
 */
router.get(
  "/guru/nilai/:id",
  authenticateToken,
  requireGuru,
  validateParams(raporValidation.idParamSchema),
  raporController.getNilaiDetail,
);

/**
 * PUT /api/rapor/guru/nilai/:id
 * Update nilai
 */
router.put(
  "/guru/nilai/:id",
  authenticateToken,
  requireGuru,
  requireNilaiAccess,
  validateParams(raporValidation.idParamSchema),
  validateBody(raporValidation.updateNilaiSchema),
  raporController.updateNilaiController,
);

/**
 * DELETE /api/rapor/guru/nilai/:id
 * Delete nilai (Wali Kelas & Admin only)
 */
router.delete(
  "/guru/nilai/:id",
  authenticateToken,
  requireWaliKelas,
  requireNilaiAccess,
  validateParams(raporValidation.deleteNilaiParamSchema),
  raporController.deleteNilaiController,
);

/**
 * Export Rapor Routes
 */
router.get(
  "/:id/export-pdf",
  authenticateToken,
  validateParams(raporValidation.idParamSchema),
  requireRaporAccess,
  raporController.exportPDF,
);

router.get(
  "/:id/export-excel",
  authenticateToken,
  requireRole("ADMIN", "GURU"),
  validateParams(raporValidation.idParamSchema),
  requireRaporAccess,
  raporController.exportExcel,
);

export default router;
