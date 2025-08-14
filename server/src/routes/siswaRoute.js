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
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getAllSiswa);
router.get("/:id", authenticate, getSiswaById);
router.post("/", upload.single("fotoProfil"), isWaliKelas, createSiswa);
router.patch(
  "/:id",
  upload.fields([{ name: "fotoProfil", maxCount: 1 }]),
  updateSiswa
);
router.delete("/:id", isWaliKelas, deleteSiswa);

export default router;
