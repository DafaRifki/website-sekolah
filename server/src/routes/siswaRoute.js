import { Router } from "express";
import multer from "multer";
import {
  createSiswa,
  deleteSiswa,
  getAllSiswa,
  getLaporanSiswa,
  getSiswaById,
  updateSiswa,
} from "../controllers/siswaController.js";
import { isWaliKelas } from "../middleware/isWaliKelas.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadFile.js";

const router = Router();

router.get("/", authenticate, getAllSiswa);
router.get("/:id", authenticate, getSiswaById);
router.get("/laporan/:id", getLaporanSiswa);
router.post(
  "/",
  authorizeRoles("ADMIN", "GURU"),
  upload.single("foto"),
  createSiswa
);
router.patch(
  "/:id",
  authorizeRoles("ADMIN", "GURU"),
  upload.single("foto"),
  updateSiswa
);
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN", "GURU"),
  deleteSiswa
);

export default router;
