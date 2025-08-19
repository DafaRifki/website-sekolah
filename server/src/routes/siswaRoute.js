import { Router } from "express";
import multer from "multer";
import {
  createSiswa,
  deleteSiswa,
  getAllSiswa,
  getSiswaById,
  updateSiswa,
} from "../controllers/siswaController.js";
import { isWaliKelas } from "../middleware/isWaliKelas.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadFile.js";

const router = Router();

router.get("/", authenticate, getAllSiswa);
router.get("/:id", authenticate, getSiswaById);
router.post("/", upload.single("fotoProfil"), isWaliKelas, createSiswa);
router.patch(
  "/:id",
  upload.fields([{ name: "fotoProfil", maxCount: 1 }]),
  updateSiswa
);
router.delete("/:id", authenticate, isWaliKelas, deleteSiswa);

export default router;
