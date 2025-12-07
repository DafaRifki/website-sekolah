import { Router } from "express";
import { GuruController } from "../controllers/guru.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { validate, validateQuery } from "../middleware/validation.middleware";
import {
  guruValidation,
  updateGuruValidation,
  paginationValidation,
} from "../utils/validation.util";
import { upload } from "../middleware/upload.middleware";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/guru/stats
 * Get guru statistics
 * Must be before /:id route
 */
router.get("/stats", GuruController.getStats);

/**
 * GET /api/guru/available/wali-kelas
 * Get guru available for wali kelas assignment
 */
router.get("/available/wali-kelas", GuruController.getAvailableForWaliKelas);

/**
 * GET /api/guru
 * Get all guru with pagination
 */
router.get("/", validateQuery(paginationValidation), GuruController.getAll);

/**
 * GET /api/guru/nip/:nip
 * Get guru by NIP
 */
router.get("/nip/:nip", GuruController.getByNIP);

/**
 * GET /api/guru/:id
 * Get guru by ID
 */
router.get("/:id", GuruController.getById);

/**
 * POST /api/guru
 * Create new guru
 * PERBAIKAN: Tambahkan upload.single("fotoProfil") SEBELUM validasi
 * Agar req.body terisi dan req.file terdeteksi
 */
router.post(
  "/", 
  upload.single("fotoProfil"), // <--- TAMBAHKAN INI
  validate(guruValidation), 
  GuruController.create
);

/**
 * PUT /api/guru/:id
 * Update guru
 */
router.put("/:id", validate(updateGuruValidation), GuruController.update);

/**
 * POST /api/guru/:id/upload
 * Upload foto profil guru
 */
router.post("/:id/upload", upload.single("photo"), GuruController.uploadPhoto);

/**
 * DELETE /api/guru/:id
 * Delete guru
 */
router.delete("/:id", GuruController.delete);

/**
 * POST /api/guru/:id/link-user
 * Link guru to user account
 */
router.post("/:id/link-user", GuruController.linkToUser);

/**
 * DELETE /api/guru/:id/unlink-user
 * Unlink guru from user account
 */
router.delete("/:id/unlink-user", GuruController.unlinkFromUser);

export default router;
