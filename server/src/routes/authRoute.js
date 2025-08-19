import { Router } from "express";
import {
  login,
  logout,
  register,
  whoami,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/whoami", authenticate, whoami);
router.post("/logout", authenticate, logout);

export default router;
