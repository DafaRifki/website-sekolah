import { Router } from "express";
import {
  createGuru,
  deleteGuru,
  getAllGuru,
  getGuruById,
  updateGuru,
} from "../controllers/guruController.js";
import { upload } from "../middleware/uploadFile.js";
import { authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getAllGuru);
router.get("/:id", getGuruById);
router.post("/", authorizeRoles("ADMIN"), createGuru);
router.patch("/:id", upload.single("fotoProfil"), updateGuru);
router.delete("/:id", authorizeRoles("ADMIN"), deleteGuru);

export default router;
