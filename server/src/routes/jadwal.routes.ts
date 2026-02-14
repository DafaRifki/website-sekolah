import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import { JadwalController } from "../controllers/jadwal.controller";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/jadwal/stats
 * Get jadwal statistics
 * Must be before /:id route
 * Access: All authenticated users
 */
router.get("/stats", JadwalController.getStats);

/**
 * GET /api/jadwal/kelas/:kelasId
 * Get jadwal for specific kelas
 * Must be before /:id route
 * Access: All authenticated users
 */
router.get("/kelas/:kelasId", JadwalController.getByKelas);

/**
 * GET /api/jadwal/guru/:guruId
 * Get jadwal for specific guru
 * Must be before /:id route
 * Access: All authenticated users
 */
router.get("/guru/:guruId", JadwalController.getByGuru);

/**
 * GET /api/jadwal
 * Get all jadwal (with filters)
 * Query params: kelasId, guruId, hari, tahunAjaranId
 * Access: All authenticated users
 */
router.get("/", JadwalController.getAll);

/**
 * GET /api/jadwal/:id
 * Get specific jadwal by ID
 * Access: All authenticated users
 */
router.get("/:id", JadwalController.getById);

/**
 * POST /api/jadwal
 * Create new jadwal
 * Access: Admin only
 */
router.post("/", requireRole("ADMIN"), JadwalController.create);

/**
 * PUT /api/jadwal/:id
 * Update jadwal
 * Access: Admin only
 */
router.put("/:id", requireRole("ADMIN"), JadwalController.update);

/**
 * DELETE /api/jadwal/:id
 * Delete jadwal
 * Access: Admin only
 */
router.delete("/:id", requireRole("ADMIN"), JadwalController.delete);

export default router;
