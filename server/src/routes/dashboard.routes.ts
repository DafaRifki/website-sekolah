import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// All dashboard routes require authentication
router.use(authenticateToken);

/**
 * Dashboard Routes
 * All endpoints return dashboard data
 */

// Get all dashboard data at once (optimized)
router.get("/all", DashboardController.getAll);

// Get individual sections
router.get("/summary", DashboardController.getSummary);
router.get("/financial", DashboardController.getFinancial);
router.get("/academic", DashboardController.getAcademic);
router.get("/pendaftaran", DashboardController.getPendaftaran);
router.get("/alerts", DashboardController.getAlerts);
router.get("/activities", DashboardController.getActivities);
router.get("/charts", DashboardController.getCharts);
router.get("/stats-monthly", DashboardController.getMonthlyStats);

export default router;
