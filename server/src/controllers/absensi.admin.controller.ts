// src/controllers/absensi.admin.controller.ts
// ADMIN CONTROLLER - Comprehensive Absensi Monitoring

import { Request, Response } from "express";
import { AbsensiAdminService } from "../services/absensi.admin.service";
import { sendSuccess, sendError } from "../utils/response.util";

/**
 * Admin Absensi Controller
 * Endpoints for Admin role to monitor all absensi activities
 */
export class AbsensiAdminController {
  /**
   * GET /api/absensi/admin/dashboard
   * Get Dashboard Overview
   */
  static async getDashboardOverview(req: Request, res: Response) {
    try {
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const dashboard =
        await AbsensiAdminService.getDashboardOverview(tahunAjaranId);

      return sendSuccess(res, "Dashboard retrieved successfully", dashboard);
    } catch (error: any) {
      return sendError(res, "Failed to get dashboard", error.message, 500);
    }
  }

  /**
   * GET /api/absensi/admin/kelas-today
   * Get All Classes Attendance Today
   */
  static async getKelasTodayAttendance(req: Request, res: Response) {
    try {
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const result =
        await AbsensiAdminService.getKelasTodayAttendance(tahunAjaranId);

      return sendSuccess(
        res,
        "Class attendance retrieved successfully",
        result,
      );
    } catch (error: any) {
      return sendError(
        res,
        "Failed to get class attendance",
        error.message,
        500,
      );
    }
  }

  /**
   * GET /api/absensi/admin/guru-teaching-today
   * Get All Teachers Teaching Today
   */
  static async getGuruTeachingToday(req: Request, res: Response) {
    try {
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const result =
        await AbsensiAdminService.getGuruTeachingToday(tahunAjaranId);

      return sendSuccess(res, "Guru teaching retrieved successfully", result);
    } catch (error: any) {
      return sendError(res, "Failed to get guru teaching", error.message, 500);
    }
  }

  /**
   * GET /api/absensi/admin/trends
   * Get Attendance Trends (Weekly/Monthly)
   */
  static async getAttendanceTrends(req: Request, res: Response) {
    try {
      const period = (req.query.period as "week" | "month") || "week";
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      if (!["week", "month"].includes(period)) {
        return sendError(
          res,
          "Invalid period. Use 'week' or 'month'",
          null,
          400,
        );
      }

      const trends = await AbsensiAdminService.getAttendanceTrends(
        period,
        tahunAjaranId,
      );

      return sendSuccess(
        res,
        "Attendance trends retrieved successfully",
        trends,
      );
    } catch (error: any) {
      return sendError(res, "Failed to get trends", error.message, 500);
    }
  }

  /**
   * GET /api/absensi/admin/top-absent
   * Get Top Absent Students
   */
  static async getTopAbsentStudents(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const students = await AbsensiAdminService.getTopAbsentStudents(
        limit,
        tahunAjaranId,
        startDate,
        endDate,
      );

      return sendSuccess(
        res,
        "Top absent students retrieved successfully",
        students,
      );
    } catch (error: any) {
      return sendError(
        res,
        "Failed to get top absent students",
        error.message,
        500,
      );
    }
  }

  /**
   * GET /api/absensi/admin/class-comparison
   * Get Class Comparison
   */
  static async getClassComparison(req: Request, res: Response) {
    try {
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;
      const month = req.query.month
        ? parseInt(req.query.month as string)
        : undefined;

      const comparison = await AbsensiAdminService.getClassComparison(
        tahunAjaranId,
        month,
      );

      return sendSuccess(
        res,
        "Class comparison retrieved successfully",
        comparison,
      );
    } catch (error: any) {
      return sendError(
        res,
        "Failed to get class comparison",
        error.message,
        500,
      );
    }
  }

  /**
   * GET /api/absensi/admin/search
   * Search Absensi (Advanced)
   */
  static async searchAbsensi(req: Request, res: Response) {
    try {
      const params = {
        siswaId: req.query.siswaId
          ? parseInt(req.query.siswaId as string)
          : undefined,
        kelasId: req.query.kelasId
          ? parseInt(req.query.kelasId as string)
          : undefined,
        guruMapelId: req.query.guruMapelId
          ? parseInt(req.query.guruMapelId as string)
          : undefined,
        status: req.query.status as any,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        tahunAjaranId: req.query.tahunAjaranId
          ? parseInt(req.query.tahunAjaranId as string)
          : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      };

      const result = await AbsensiAdminService.searchAbsensi(params);

      return sendSuccess(res, "Search results retrieved successfully", result);
    } catch (error: any) {
      return sendError(res, "Failed to search absensi", error.message, 500);
    }
  }

  /**
   * GET /api/absensi/admin/mapel-excel/:guruMapelId
   * Download Mapel Absensi Excel
   */
  static async downloadMapelAbsensiExcel(req: Request, res: Response) {
    try {
      const guruMapelId = parseInt(req.params.guruMapelId);

      if (isNaN(guruMapelId)) {
        return sendError(res, "Invalid GuruMapel ID", null, 400);
      }

      const { buffer, filename } =
        await AbsensiAdminService.generateMapelAbsensiExcel(guruMapelId);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${filename}`,
      );

      return res.send(buffer);
    } catch (error: any) {
      return sendError(
        res,
        "Failed to download absensi excel",
        error.message,
        500,
      );
    }
  }
}
