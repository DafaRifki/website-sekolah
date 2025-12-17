// src/routes/dashboard-guru.routes.ts
import { Router } from "express";
import { DashboardGuruController } from "../controllers/dashboard-guru.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/dashboard-guru
 * Get complete dashboard for GURU
 */
router.get("/", DashboardGuruController.getDashboard);

/**
 * GET /api/dashboard-guru/attendance-quick
 * Get quick attendance input for today
 */
router.get("/attendance-quick", DashboardGuruController.getAttendanceQuick);

/**
 * GET /api/dashboard-guru/statistics
 * Get statistics summary
 */
router.get("/statistics", DashboardGuruController.getStatistics);

/**
 * GET /api/dashboard-guru/students-problems
 * Get students with problems
 */
router.get(
  "/students-problems",
  DashboardGuruController.getStudentsWithProblems
);

export default router;
