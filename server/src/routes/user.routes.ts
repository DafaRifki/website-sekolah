import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import { validate, validateQuery } from "../middleware/validation.middleware";
import {
  createUserValidation,
  updateUserValidation,
  resetPasswordValidation,
  paginationValidation,
} from "../utils/validation.util";

const router = Router();

// All user management routes require authentication
router.use(authenticateToken);

// Admin only routes
router.get(
  "/",
  requireRole("ADMIN"),
  validateQuery(paginationValidation),
  UserController.getAllUsers
);
router.get("/stats", requireRole("ADMIN"), UserController.getUserStats);
router.get("/role/:role", requireRole("ADMIN"), UserController.getUsersByRole);
router.post(
  "/",
  requireRole("ADMIN"),
  validate(createUserValidation),
  UserController.createUser
);
router.put(
  "/:id",
  requireRole("ADMIN"),
  validate(updateUserValidation),
  UserController.updateUser
);
router.delete("/:id", requireRole("ADMIN"), UserController.deleteUser);
router.post(
  "/:id/reset-password",
  requireRole("ADMIN"),
  validate(resetPasswordValidation),
  UserController.resetUserPassword
);

// Admin and self-access routes
router.get("/:id", UserController.getUserById); // Will implement ownership check in controller

export default router;
