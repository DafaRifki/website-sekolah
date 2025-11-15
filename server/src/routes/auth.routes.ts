import { Router } from "express";
import { validate } from "../middleware/validation.middleware";
import { loginValidation, registerValidation } from "../utils/validation.util";
import { AuthController } from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// public routes
router.post("/register", validate(registerValidation), AuthController.register);
router.post("/login", validate(loginValidation), AuthController.login);
router.post("/refresh", AuthController.refreshToken);

// protected routes
router.get("/profile", authenticateToken, AuthController.getProfile);
router.post(
  "/change-password",
  authenticateToken,
  AuthController.changePassword
);
router.post("/logout", authenticateToken, AuthController.logout);

export default router;
