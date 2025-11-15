import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { validate, validateQuery } from "../middleware/validation.middleware";
import {
  assignSiswaValidation,
  kelasValidation,
  paginationValidation,
  updateKelasValidation,
} from "../utils/validation.util";
import { KelasController } from "../controllers/kelas.controller";

const router = Router();

// Apply authenticate to all routes
router.use(authenticateToken);

/**
 * GET /api/kelas/stats
 * Get kelas statistics
 * Must be before /:id route
 */
router.get("/stats", KelasController.getStats);

/**
 * GET /api/kelas
 * Get all kelas with pagination
 */
router.get("/", validateQuery(paginationValidation), KelasController.getAll);

/**
 * GET /api/kelas/:id
 * Get kelas by ID
 */
router.get("/:id", KelasController.getById);

/**
 * POST /api/kelas
 * Create new kelas
 */
router.post("/", validate(kelasValidation), KelasController.create);

/**
 * PUT /api/kelas/:id
 * Update kelas
 */
router.put("/:id", validate(updateKelasValidation), KelasController.update);

/**
 * DELETE /api/kelas/:id
 * Delete kelas
 */
router.delete("/:id", KelasController.delete);

/**
 * POST /api/kelas/:id/assign-wali
 * Assign wali kelas (guru)
 */
router.post("/:id/assign-wali", KelasController.assignWaliKelas);

/**
 * DELETE /api/kelas/:id/remove-wali
 * Remove wali kelas
 */
router.delete("/:id/remove-wali", KelasController.removeWaliKelas);

/**
 * POST /api/kelas/:id/assign-siswa
 * Assign siswa to kelas (bulk)
 */
router.post(
  "/:id/assign-siswa",
  validate(assignSiswaValidation),
  KelasController.assignSiswa
);

/**
 * DELETE /api/kelas/:id/remove-siswa/:siswaId
 * Remove siswa from kelas
 */
router.delete("/:id/remove-siswa/:siswaId", KelasController.removeSiswa);

/**
 * GET /api/kelas/:id/siswa
 * Get all siswa in kelas
 */
router.get("/:id/siswa", KelasController.getSiswaInKelas);

/**
 * POST /api/kelas/:id/move-siswa
 * Move siswa to another kelas
 */
router.post("/:id/move-siswa", KelasController.moveSiswa);

/**
 * POST /api/kelas/:id/link-tahun-ajaran
 * Link kelas to tahun ajaran
 */
router.post("/:id/link-tahun-ajaran", KelasController.linkTahunAjaran);

export default router;
