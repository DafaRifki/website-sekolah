import { Router } from "express";
import { NilaiController } from "../controllers/nilai.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import {
  bulkNilaiValidation,
  nilaiValidation,
  updateNilaiValidation,
} from "../utils/validation.util";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/nilai/stats
 * Get nilai statistics
 * Must be before other routes
 */
router.get("/stats", NilaiController.getStats);

/**
 * GET /api/nilai/siswa/:siswaId
 * Get nilai by siswa
 */
router.get("/siswa/:siswaId", NilaiController.getBySiswa);

/**
 * GET /api/nilai/rapor/:siswaId
 * Generate rapor siswa
 */
router.get("/rapor/:siswaId", NilaiController.generateRapor);

/**
 * GET /api/nilai/kelas/:kelasId/mapel/:mapelId
 * Get nilai by kelas & mata pelajaran
 */
router.get("/kelas/:kelasId/mapel/:mapelId", NilaiController.getByKelasMapel);

/**
 * POST /api/nilai
 * Create nilai (single)
 */
router.post("/", validate(nilaiValidation), NilaiController.create);

/**
 * POST /api/nilai/bulk
 * Bulk create nilai (per kelas)
 */
router.post("/bulk", validate(bulkNilaiValidation), NilaiController.bulkCreate);

/**
 * PUT /api/nilai/:id
 * Update nilai
 */
router.put("/:id", validate(updateNilaiValidation), NilaiController.update);

/**
 * DELETE /api/nilai/:id
 * Delete nilai
 */
router.delete("/:id", NilaiController.delete);

export default router;
