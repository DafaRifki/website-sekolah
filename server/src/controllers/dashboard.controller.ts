import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";
import { sendSuccess, sendError } from "../utils/response.util";

export class DashboardController {
  /**
   * GET /api/dashboard/summary
   * Get dashboard summary (totalSiswa, totalGuru, totalKelas, tahunAjaranAktif)
   */
  static async getSummary(req: Request, res: Response) {
    try {
      const summary = await DashboardService.getSummary();

      return sendSuccess(
        res,
        "Dashboard summary retrieved successfully",
        summary
      );
    } catch (error: any) {
      return sendError(
        res,
        "Failed to get dashboard summary",
        error.message,
        500
      );
    }
  }

  /**
   * GET /api/dashboard/financial
   * Get financial summary
   */
  static async getFinancial(req: Request, res: Response) {
    try {
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const financial = await DashboardService.getFinancial(tahunAjaranId);

      return sendSuccess(
        res,
        "Financial summary retrieved successfully",
        financial
      );
    } catch (error: any) {
      return sendError(
        res,
        "Failed to get financial summary",
        error.message,
        500
      );
    }
  }

  /**
   * GET /api/dashboard/academic
   * Get academic summary
   */
  static async getAcademic(req: Request, res: Response) {
    try {
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const academic = await DashboardService.getAcademic(tahunAjaranId);

      return sendSuccess(
        res,
        "Academic summary retrieved successfully",
        academic
      );
    } catch (error: any) {
      return sendError(
        res,
        "Failed to get academic summary",
        error.message,
        500
      );
    }
  }

  /**
   * GET /api/dashboard/pendaftaran
   * Get pendaftaran summary
   */
  static async getPendaftaran(req: Request, res: Response) {
    try {
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const pendaftaran = await DashboardService.getPendaftaran(tahunAjaranId);

      return sendSuccess(
        res,
        "Pendaftaran summary retrieved successfully",
        pendaftaran
      );
    } catch (error: any) {
      return sendError(
        res,
        "Failed to get pendaftaran summary",
        error.message,
        500
      );
    }
  }

  /**
   * GET /api/dashboard/alerts
   * Get alerts (outstanding bills, low attendance, pending approvals)
   */
  static async getAlerts(req: Request, res: Response) {
    try {
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const alerts = await DashboardService.getAlerts(tahunAjaranId);

      return sendSuccess(res, "Alerts retrieved successfully", alerts);
    } catch (error: any) {
      return sendError(res, "Failed to get alerts", error.message, 500);
    }
  }

  /**
   * GET /api/dashboard/activities
   * Get recent activities
   */
  static async getActivities(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const activities = await DashboardService.getActivities(limit);

      return sendSuccess(res, "Activities retrieved successfully", activities);
    } catch (error: any) {
      return sendError(res, "Failed to get activities", error.message, 500);
    }
  }

  /**
   * GET /api/dashboard/charts
   * Get all charts data
   */
  static async getCharts(req: Request, res: Response) {
    try {
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const charts = await DashboardService.getChartsData(tahunAjaranId);

      return sendSuccess(res, "Charts data retrieved successfully", charts);
    } catch (error: any) {
      return sendError(res, "Failed to get charts data", error.message, 500);
    }
  }

  /**
   * GET /api/dashboard/stats-monthly
   * Get monthly statistics
   */
  static async getMonthlyStats(req: Request, res: Response) {
    try {
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const stats = await DashboardService.getStatsByMonth(tahunAjaranId);

      return sendSuccess(
        res,
        "Monthly statistics retrieved successfully",
        stats
      );
    } catch (error: any) {
      return sendError(res, "Failed to get monthly stats", error.message, 500);
    }
  }

  /**
   * GET /api/dashboard/all
   * Get all dashboard data at once (optimized single call)
   */
  static async getAll(req: Request, res: Response) {
    try {
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const [
        summary,
        financial,
        academic,
        pendaftaran,
        alerts,
        activities,
        charts,
      ] = await Promise.all([
        DashboardService.getSummary(),
        DashboardService.getFinancial(tahunAjaranId),
        DashboardService.getAcademic(tahunAjaranId),
        DashboardService.getPendaftaran(tahunAjaranId),
        DashboardService.getAlerts(tahunAjaranId),
        DashboardService.getActivities(10),
        DashboardService.getChartsData(tahunAjaranId),
      ]);

      const allData = {
        summary,
        financial,
        academic,
        pendaftaran,
        alerts,
        activities,
        charts,
      };

      return sendSuccess(
        res,
        "All dashboard data retrieved successfully",
        allData
      );
    } catch (error: any) {
      return sendError(res, "Failed to get dashboard data", error.message, 500);
    }
  }
}
