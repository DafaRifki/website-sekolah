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

// ==========================================
// 🔓 PUBLIC ROUTES (Bisa diakses Landing Page tanpa Login)
// ==========================================

/**
 * GET /api/guru
 * Get all guru with pagination
 */
router.get("/", validateQuery(paginationValidation), GuruController.getAll);

// ==========================================
// 🔒 PROTECTED ROUTES (Wajib Login / Token)
// ==========================================

// Terapkan autentikasi untuk SEMUA rute di bawah baris ini
router.use(authenticateToken);

/**
 * GET /api/guru/stats
 * Get guru statistics
 */
router.get("/stats", GuruController.getStats);

/**
 * GET /api/guru/available/wali-kelas
 * Get guru available for wali kelas assignment
 */
router.get("/available/wali-kelas", GuruController.getAvailableForWaliKelas);

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
 */
router.post(
  "/", 
  upload.single("fotoProfil"), 
  validate(guruValidation), 
  GuruController.create
);

/**
 * PUT /api/guru/:id
 * Update guru
 */
router.put(
  "/:id", 
  upload.single("fotoProfil"), 
  validate(updateGuruValidation), 
  GuruController.update
);

/**
 * POST /api/guru/:id/upload
 * Upload foto profil guru (Standalone)
 */
router.post(
  "/:id/upload", 
  upload.single("fotoProfil"), 
  GuruController.uploadPhoto
);

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