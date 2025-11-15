import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { validate, validateQuery } from "../middleware/validation.middleware";
import {
  linkSiswaValidation,
  orangTuaValidation,
  paginationValidation,
  updateOrangTuaValidation,
} from "../utils/validation.util";
import { OrangTuaController } from "../controllers/orangtua.controller";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/orangtua/stats
 * Get orang tua statistics
 * Must be before /:id route
 */
router.get("/stats", OrangTuaController.getStats);

/**
 * GET /api/orangtua/by-siswa/:siswaId
 * Get orang tua by siswa
 * Must be before /:id route
 */
router.get("/by-siswa/:siswaId", OrangTuaController.getBySiswa);

/**
 * GET /api/orangtua
 * Get all orang tua with pagination
 */
router.get("/", validateQuery(paginationValidation), OrangTuaController.getAll);

/**
 * GET /api/orangtua/:id
 * Get orang tua by ID
 */
router.get("/:id", OrangTuaController.getById);

/**
 * POST /api/orangtua
 * Create new orang tua
 */
router.post("/", validate(orangTuaValidation), OrangTuaController.create);

/**
 * PUT /api/orangtua/:id
 * Update orang tua
 */
router.put(
  "/:id",
  validate(updateOrangTuaValidation),
  OrangTuaController.update
);

/**
 * DELETE /api/orangtua/:id
 * Delete orang tua
 */
router.delete("/:id", OrangTuaController.delete);

/**
 * POST /api/orangtua/:id/link-siswa
 * Link orang tua to siswa
 */
router.post(
  "/:id/link-siswa",
  validate(linkSiswaValidation),
  OrangTuaController.linkToSiswa
);

/**
 * DELETE /api/orangtua/:id/unlink-siswa/:siswaId
 * Unlink orang tua from siswa
 */
router.delete("/:id/unlink-siswa/:siswaId", OrangTuaController.unlinkFromSiswa);

/**
 * GET /api/orangtua/:id/siswa
 * Get siswa by orang tua
 */
router.get("/:id/siswa", OrangTuaController.getSiswaByOrangTua);

export default router;
