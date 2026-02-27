// src/routes/berita.routes.ts
import { Router } from "express";
import { BeritaController } from "../controllers/berita.controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import { uploadSingle } from "../middleware/upload.middleware";

const router = Router();

// Public routes
router.get("/", BeritaController.getAll);
router.get("/:id", BeritaController.getById);

// Protected routes (Admin only)
router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN"),
  uploadSingle("gambar"),
  BeritaController.create
);

router.put(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  uploadSingle("gambar"),
  BeritaController.update
);

router.delete(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  BeritaController.delete
);

export default router;
