import { Router } from "express";
import { SiswaController } from "../controllers/siswa.controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { uploadSingle } from "../middleware/upload.middleware";
import {
  siswaValidation,
  updateSiswaValidation,
} from "../utils/validation.util";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Public/authenticated routes
router.get("/", SiswaController.getAll);
router.get("/stats", requireRole("ADMIN", "GURU"), SiswaController.getStats);
router.get("/search", SiswaController.searchByName);
router.get("/kelas/:kelasId", SiswaController.getByKelas);
router.get("/nis/:nis", SiswaController.getByNIS);
router.get("/:id", SiswaController.getById);

// Admin & Guru routes
router.post(
  "/",
  requireRole("ADMIN", "GURU"),
  validate(siswaValidation),
  SiswaController.create
);

router.put(
  "/:id",
  requireRole("ADMIN", "GURU"),
  validate(updateSiswaValidation),
  SiswaController.update
);

router.post(
  "/:id/foto",
  requireRole("ADMIN", "GURU"),
  uploadSingle("fotoProfil"),
  SiswaController.uploadFoto
);

// Admin only
router.delete("/:id", requireRole("ADMIN"), SiswaController.delete);

export default router;
