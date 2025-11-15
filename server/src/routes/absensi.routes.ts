import { Router } from "express";
import { AbsensiController } from "../controllers/absensi.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import {
  absensiValidation,
  bulkAbsensiValidation,
  updateAbsensiValidation,
} from "../utils/validation.util";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/absensi/stats
 * Get absensi statistics
 */
router.get("/stats", AbsensiController.getStats);

/**
 * GET /api/absensi/rekap
 * Get rekap absensi (bulanan/per periode)
 */
router.get("/rekap", AbsensiController.getRekap);

/**
 * GET /api/absensi/siswa/:siswaId
 * Get absensi by siswa
 */
router.get("/siswa/:siswaId", AbsensiController.getBySiswa);

/**
 * GET /api/absensi/kelas/:kelasId
 * Get absensi by kelas (per hari)
 */
router.get("/kelas/:kelasId", AbsensiController.getByKelas);

/**
 * POST /api/absensi
 * Create absensi (single)
 */
router.post("/", validate(absensiValidation), AbsensiController.create);

/**
 * POST /api/absensi/bulk
 * Bulk create absensi (per kelas)
 */
router.post(
  "/bulk",
  validate(bulkAbsensiValidation),
  AbsensiController.bulkCreate
);

/**
 * PUT /api/absensi/:id
 * Update absensi
 */
router.put("/:id", validate(updateAbsensiValidation), AbsensiController.update);

/**
 * DELETE /api/absensi/:id
 * Delete absensi
 */
router.delete("/:id", AbsensiController.delete);

export default router;
