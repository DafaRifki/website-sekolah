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

// User Verification Routes
router.get("/pending", requireRole("ADMIN"), UserController.getPendingStudents);
router.post("/verify/:id", requireRole("ADMIN"), UserController.verifyStudent);
router.post("/reject/:id", requireRole("ADMIN"), UserController.rejectStudent);
router.get("/unlinked-data", requireRole("ADMIN"), UserController.getUnlinkedData);
router.post("/verify-link/:id", requireRole("ADMIN"), UserController.verifyAndLinkUser);

// Admin and self-access routes
router.get("/:id", UserController.getUserById); // Will implement ownership check in controller

export default router;
