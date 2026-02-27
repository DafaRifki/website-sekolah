import { Router } from "express";
import { AbsensiAdminController } from "../controllers/absensi.admin.controller";
import { authenticateToken, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// Apply authentication and admin role check to all routes
router.use(authenticateToken);
router.use(requireAdmin); // Using your existing middleware!

/**
 * ============================================================================
 * ADMIN DASHBOARD & MONITORING
 * ============================================================================
 */

/**
 * GET /api/absensi/admin/dashboard
 * Get Dashboard Overview (Today's Summary)
 * Query params: tahunAjaranId (optional)
 */
router.get("/dashboard", AbsensiAdminController.getDashboardOverview);

/**
 * GET /api/absensi/admin/kelas-today
 * Get All Classes Attendance Today
 * Query params: tahunAjaranId (optional)
 */
router.get("/kelas-today", AbsensiAdminController.getKelasTodayAttendance);

/**
 * GET /api/absensi/admin/guru-teaching-today
 * Get All Teachers Teaching Today
 * Query params: tahunAjaranId (optional)
 */
router.get("/guru-teaching-today", AbsensiAdminController.getGuruTeachingToday);

/**
 * ============================================================================
 * ANALYTICS & REPORTS
 * ============================================================================
 */

/**
 * GET /api/absensi/admin/trends
 * Get Attendance Trends (Weekly/Monthly)
 * Query params: period (week|month), tahunAjaranId (optional)
 */
router.get("/trends", AbsensiAdminController.getAttendanceTrends);

/**
 * GET /api/absensi/admin/top-absent
 * Get Top Absent Students (Students with low attendance)
 * Query params: limit (default: 10), tahunAjaranId, startDate, endDate (optional)
 */
router.get("/top-absent", AbsensiAdminController.getTopAbsentStudents);

/**
 * GET /api/absensi/admin/class-comparison
 * Get Class Comparison (Compare attendance between classes)
 * Query params: tahunAjaranId, month (optional, default: current month)
 */
router.get("/class-comparison", AbsensiAdminController.getClassComparison);

/**
 * ============================================================================
 * SEARCH & FILTER
 * ============================================================================
 */

/**
 * GET /api/absensi/admin/search
 * Search Absensi (Advanced Search)
 * Query params:
 * - siswaId (optional)
 * - kelasId (optional)
 * - guruMapelId (optional)
 * - status (HADIR|SAKIT|IZIN|TIDAK_HADIR) (optional)
 * - startDate, endDate (optional)
 * - tahunAjaranId (optional)
 * - page (default: 1)
 * - limit (default: 50)
 */
router.get("/search", AbsensiAdminController.searchAbsensi);

/**
 * GET /api/absensi/admin/mapel-excel/:guruMapelId
 * Download Mapel Absensi Excel report
 */
router.get("/mapel-excel/:guruMapelId", AbsensiAdminController.downloadMapelAbsensiExcel);

export default router;
