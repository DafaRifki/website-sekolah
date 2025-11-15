import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { validate, validateQuery } from "../middleware/validation.middleware";
import {
  mataPelajaranValidation,
  paginationValidation,
  updateMataPelajaranValidation,
} from "../utils/validation.util";
import { MataPelajaranController } from "../controllers/mata-pelajaran.controller";

const router = Router();

// apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/mata-pelajaran/stats
 * Get mata pelajaran statistics
 * Must be before /:id route
 */
router.get("/stats", MataPelajaranController.getStats);

/**
 * GET /api/mata-pelajaran/kelompok-list
 * Get list of all kelompok mapel
 * Must be before /:id and /kelompok/:kelompok routes
 */
router.get("/kelompok-list", MataPelajaranController.getKelompokList);

/**
 * GET /api/mata-pelajaran/kelompok/:kelompok
 * Get mata pelajaran by kelompok
 * Must be before /:id route
 */
router.get("/kelompok/:kelompok", MataPelajaranController.getByKelompok);

/**
 * Get /api/mata-pelajaran
 * Get all mata pelajaran with pagination
 */
router.get(
  "/",
  validateQuery(paginationValidation),
  MataPelajaranController.getAll
);

/**
 * GET /api/mata-pelajaran/:id
 * Get mata pelajaran by ID
 */
router.get("/:id", MataPelajaranController.getById);

/**
 * POST /api/mata-pelajaran
 * Create new mata pelajaran
 */
router.post(
  "/",
  validate(mataPelajaranValidation),
  MataPelajaranController.create
);

/**
 * PUT /api/mata-pelajaran/:id
 * Update mata pelajaran
 */
router.put(
  "/:id",
  validate(updateMataPelajaranValidation),
  MataPelajaranController.update
);

/**
 * DELETE /api/mata-pelajaran/:id
 * Delete mata pelajaran
 */
router.delete("/:id", MataPelajaranController.delete);

export default router;
