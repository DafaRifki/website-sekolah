import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
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
router.patch("/:id", authenticate, updateUser);
router.delete("/:id", authenticate, deleteUser);

export default router;
