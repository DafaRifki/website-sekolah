// src/routes/absensi.enhanced.routes.ts

import { Router } from "express";
import { AbsensiEnhancedController } from "../controllers/absensi.controller.enhanced";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * ============================================================================
 * GURU ROUTES - Operasional Mengajar
 * ============================================================================
 */

/**
 * GET /api/absensi/guru/:guruId/jadwal-hari-ini
 * Get jadwal hari ini dengan status (bisa mulai/tidak)
 * Access: GURU (own data) & ADMIN
 */
router.get(
  "/guru/:guruId/jadwal-hari-ini",
  requireRole("GURU", "ADMIN"),
  AbsensiEnhancedController.getJadwalHariIni,
);

/**
 * POST /api/absensi/guru/mulai-pertemuan
 * Mulai pertemuan baru (Create AbsensiPertemuan)
 * Body: { guruMapelId, jadwalId, pertemuanKe, materi?, keteranganGuru? }
 * Access: GURU only
 */
router.post(
  "/guru/mulai-pertemuan",
  requireRole("GURU", "ADMIN"),
  AbsensiEnhancedController.mulaiPertemuan,
);

/**
 * POST /api/absensi/guru/input-presensi
 * Input presensi per siswa (satu per satu)
 * Body: { pertemuanId, siswaId, status, keterangan? }
 * Access: GURU only
 */
router.post(
  "/guru/input-presensi",
  requireRole("GURU", "ADMIN"),
  AbsensiEnhancedController.inputPresensiSiswa,
);

/**
 * POST /api/absensi/guru/input-presensi-bulk
 * Input presensi bulk (semua siswa sekaligus)
 * Body: { pertemuanId, detailAbsensi: [{ siswaId, status, keterangan? }] }
 * Access: GURU only
 */
router.post(
  "/guru/input-presensi-bulk",
  requireRole("GURU", "ADMIN"),
  AbsensiEnhancedController.inputPresensiBulk,
);

/**
 * POST /api/absensi/guru/selesaikan-pertemuan/:id
 * Set pertemuan ke COMPLETED
 * Access: GURU only
 */
router.post(
  "/guru/selesaikan-pertemuan/:id",
  requireRole("GURU", "ADMIN"),
  AbsensiEnhancedController.selesaikanPertemuan,
);

/**
 * GET /api/absensi/guru/pertemuan/:id
 * Get detail pertemuan (untuk edit/review)
 * Access: GURU & ADMIN
 */
router.get(
  "/guru/pertemuan/:id",
  requireRole("GURU", "ADMIN"),
  AbsensiEnhancedController.getDetailPertemuan,
);

/**
 * GET /api/absensi/guru/:guruId/riwayat
 * Get riwayat mengajar guru
 * Query: startDate, endDate, page, limit
 * Access: GURU (own data) & ADMIN
 */
router.get(
  "/guru/:guruId/riwayat",
  requireRole("GURU", "ADMIN"),
  AbsensiEnhancedController.getRiwayatMengajar,
);

/**
 * ============================================================================
 * SISWA ROUTES - Transparansi Kehadiran
 * ============================================================================
 */

/**
 * GET /api/absensi/siswa/:siswaId/kehadiranku
 * Get statistik kehadiran per mata pelajaran
 * Access: SISWA (own data) & ADMIN
 */
router.get(
  "/siswa/:siswaId/kehadiranku",
  requireRole("SISWA", "ADMIN"),
  AbsensiEnhancedController.getKehadiranSiswa,
);

/**
 * GET /api/absensi/siswa/:siswaId/jadwal
 * Get jadwal pelajaran siswa
 * Query: hari (optional, default: today)
 * Access: SISWA (own data) & ADMIN
 */
router.get(
  "/siswa/:siswaId/jadwal",
  requireRole("SISWA", "ADMIN"),
  AbsensiEnhancedController.getJadwalSiswa,
);

export default router;
