import { Request, Response } from "express";
import { DashboardGuruService } from "../services/dashboard-guru.service";
import { sendSuccess, sendError } from "../utils/response.util";
import { prisma } from "../config/database";

export class DashboardGuruController {
  /**
   * GET /api/dashboard-guru
   * Get complete dashboard for GURU role
   */
  static async getDashboard(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, "Not authenticated", null, 401);
      }

      if (req.user.role !== "GURU") {
        return sendError(res, "Access denied. GURU role required", null, 403);
      }

      // Get guruId from user
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { guruId: true },
      });

      if (!user || !user.guruId) {
        return sendError(res, "Guru profile not found", null, 404);
      }

      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const data = await DashboardGuruService.getDashboard(
        user.guruId,
        tahunAjaranId
      );

      return sendSuccess(res, "Guru dashboard retrieved successfully", data);
    } catch (error: any) {
      console.error("Dashboard guru error:", error);
      return sendError(res, "Failed to get guru dashboard", error.message, 500);
    }
  }

  /**
   * GET /api/dashboard-guru/attendance-quick
   * Get quick attendance input for today
   */
  static async getAttendanceQuick(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== "GURU") {
        return sendError(res, "Access denied", null, 403);
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { guruId: true },
      });

      if (!user || !user.guruId) {
        return sendError(res, "Guru profile not found", null, 404);
      }

      const kelasId = req.query.kelasId
        ? parseInt(req.query.kelasId as string)
        : undefined;

      const data = await DashboardGuruService.getAttendanceQuickInput(
        user.guruId,
        kelasId
      );

      return sendSuccess(
        res,
        "Quick attendance data retrieved successfully",
        data
      );
    } catch (error: any) {
      return sendError(
        res,
        "Failed to get quick attendance",
        error.message,
        500
      );
    }
  }

  /**
   * GET /api/dashboard-guru/statistics
   * Get statistics summary
   */
  static async getStatistics(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== "GURU") {
        return sendError(res, "Access denied", null, 403);
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { guruId: true },
      });

      if (!user || !user.guruId) {
        return sendError(res, "Guru profile not found", null, 404);
      }

      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const data = await DashboardGuruService.getStatistics(
        user.guruId,
        tahunAjaranId
      );

      return sendSuccess(res, "Statistics retrieved successfully", data);
    } catch (error: any) {
      return sendError(res, "Failed to get statistics", error.message, 500);
    }
  }

  /**
   * GET /api/dashboard-guru/students-problems
   * Get list of students with problems
   */
  static async getStudentsWithProblems(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== "GURU") {
        return sendError(res, "Access denied", null, 403);
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { guruId: true },
      });

      if (!user || !user.guruId) {
        return sendError(res, "Guru profile not found", null, 404);
      }

      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const data = await DashboardGuruService.getStudentsWithProblems(
        user.guruId,
        tahunAjaranId
      );

      return sendSuccess(
        res,
        "Students with problems retrieved successfully",
        data
      );
    } catch (error: any) {
      return sendError(
        res,
        "Failed to get students with problems",
        error.message,
        500
      );
    }
  }
}
