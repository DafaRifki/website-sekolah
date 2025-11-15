import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import { TahunAjaranController } from "../controllers/tahun-ajaran.controller";
import { validate } from "../middleware/validation.middleware";
import {
  tahunAjaranValidation,
  updateTahunAjaranValidation,
} from "../utils/validation.util";

const router = Router();

// Public routes (or authenticated users can view)
router.get("/", authenticateToken, TahunAjaranController.getAll);
router.get("/active", authenticateToken, TahunAjaranController.getActive);
router.get("/current", authenticateToken, TahunAjaranController.getCurrent);
router.get(
  "/stats",
  authenticateToken,
  requireRole("ADMIN"),
  TahunAjaranController.getStats
);
router.get("/by-year", authenticateToken, TahunAjaranController.getByYear);
router.get("/:id", authenticateToken, TahunAjaranController.getById);

// Admin only routes
router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN"),
  validate(tahunAjaranValidation),
  TahunAjaranController.create
);

router.put(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  validate(updateTahunAjaranValidation),
  TahunAjaranController.update
);

router.put(
  "/:id/set-active",
  authenticateToken,
  requireRole("ADMIN"),
  TahunAjaranController.setActive
);

router.delete(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  TahunAjaranController.delete
);

export default router;
