import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import { GuruMapelController } from "../controllers/guru-mapel.controller";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/guru-mapel/stats
 * Get guru mapel statistics
 * Must be before /:id route
 * Access: All authenticated users
 */
router.get("/stats", GuruMapelController.getStats);

/**
 * GET /api/guru-mapel/guru/:guruId
 * Get all assignments for specific guru
 * Must be before /:id route
 * Access: All authenticated users
 */
router.get("/guru/:guruId", GuruMapelController.getByGuru);

/**
 * GET /api/guru-mapel/kelas/:kelasId
 * Get all assignments for specific kelas
 * Must be before /:id route
 * Access: All authenticated users
 */
router.get("/kelas/:kelasId", GuruMapelController.getByKelas);

/**
 * GET /api/guru-mapel
 * Get all guru mapel assignments (with filters)
 * Query params: tahunAjaranId, kelasId, guruId, mapelId
 * Access: All authenticated users
 */
router.get("/", GuruMapelController.getAll);

/**
 * GET /api/guru-mapel/:id
 * Get specific guru mapel assignment
 * Access: All authenticated users
 */
router.get("/:id", GuruMapelController.getById);

/**
 * POST /api/guru-mapel
 * Create new guru mapel assignment
 * Access: Admin only
 */
router.post("/", requireRole("ADMIN"), GuruMapelController.create);

/**
 * PUT /api/guru-mapel/:id
 * Update guru mapel assignment
 * Access: Admin only
 */
router.put("/:id", requireRole("ADMIN"), GuruMapelController.update);

/**
 * DELETE /api/guru-mapel/:id
 * Delete guru mapel assignment
 * Access: Admin only
 */
router.delete("/:id", requireRole("ADMIN"), GuruMapelController.delete);

export default router;
