import { Router } from "express";
import {
  createGuru,
  getAllGuru,
  getGuruById,
} from "../controllers/guruController.js";
import { authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getAllGuru);
router.get("/:id", getGuruById);
router.post("/", authorizeRoles("ADMIN"), createGuru);

export default router;
