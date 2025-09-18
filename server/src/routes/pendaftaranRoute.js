import { Router } from "express";
import {
  cekStatusPendaftaran,
  createPendaftaran,
  getAllPendaftaran,
  terimaSiswa,
  tolakSiswa,
  updatePendaftaran,
} from "../controllers/pendaftaranController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

// calon siswa daftar -> tidak perlu login
router.post("/", createPendaftaran);
router.get("/cek-status", cekStatusPendaftaran);

// semua route dibawah harus login
router.use(authenticate);

// hanya diakses oleh ADMIN
router.get("/", authorizeRoles("ADMIN"), getAllPendaftaran);
router.post("/admin", authorizeRoles("ADMIN"), createPendaftaran);
router.patch("/:id", authorizeRoles("ADMIN"), updatePendaftaran);

// aksi verifikasi
router.put("/:id/terima", terimaSiswa);
router.put("/:id/tolak", tolakSiswa);

export default router;
