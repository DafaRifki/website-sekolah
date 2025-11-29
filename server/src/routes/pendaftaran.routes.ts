import { Router } from "express";
import { PendaftaranController } from "../controllers/pendaftaran.controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { uploadSingle } from "../middleware/upload.middleware";
import {
  pendaftaranValidation,
  updatePendaftaranValidation,
} from "../utils/validation.util";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Admin & Guru access
router.get("/", requireRole("ADMIN", "GURU"), PendaftaranController.getAll);
router.get(
  "/stats",
  requireRole("ADMIN", "GURU"),
  PendaftaranController.getStats
);
router.get(
  "/tahun-ajaran/:tahunAjaranId",
  requireRole("ADMIN", "GURU"),
  PendaftaranController.getByTahunAjaran
);
router.get("/:id", requireRole("ADMIN", "GURU"), PendaftaranController.getById);

router.post(
  "/",
  requireRole("ADMIN", "GURU"),
  validate(pendaftaranValidation),
  PendaftaranController.create
);

router.post(
  "/import",
  requireRole("ADMIN", "GURU"),
  uploadSingle("file"),
  PendaftaranController.importCSV
);

router.put(
  "/:id",
  requireRole("ADMIN", "GURU"),
  validate(updatePendaftaranValidation),
  PendaftaranController.update
);

router.post(
  "/:id/approve",
  requireRole("ADMIN", "GURU"),
  PendaftaranController.approve
);
router.post(
  "/:id/convert",
  requireRole("ADMIN", "GURU"),
  PendaftaranController.convertToSiswa
);

router.post("/:id/reject", requireRole("ADMIN"), PendaftaranController.reject);

router.delete("/:id", requireRole("ADMIN"), PendaftaranController.delete);

export default router;
