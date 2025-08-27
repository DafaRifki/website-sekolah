import { Router } from "express";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createUser,
  deleteUser,
  getAllUser,
  getUserById,
  updateUser,
} from "../controllers/userController.js";

const router = Router();

router.get("/", authenticate, getAllUser);
router.get("/:id", authenticate, getUserById);
router.post("/", authenticate, createUser);
router.patch("/:id", authorizeRoles("ADMIN", "SISWA", "GURU"), updateUser);
router.delete("/:id", authenticate, deleteUser);

export default router;
