import { Request, Response } from "express";
import { TahunAjaranService } from "../services/tahun-ajaran.service";
import { sendSuccess, sendError } from "../utils/response.util";
import { PaginationQuery } from "../types/common.types";

export class TahunAjaranController {
  static async getAll(req: Request, res: Response) {
    try {
      const query = req.query as unknown as PaginationQuery;
      const result = await TahunAjaranService.getAll(query);

      sendSuccess(
        res,
        "Tahun ajaran retrieved successfully",
        result.data,
        result.pagination
      );
    } catch (error: any) {
      sendError(res, "Failed to get tahun ajaran", error.message, 400);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid tahun ajaran ID", null, 400);
      }

      const tahunAjaran = await TahunAjaranService.getById(id);
      sendSuccess(res, "Tahun ajaran retrieved successfully", tahunAjaran);
    } catch (error: any) {
      if (error.message === "Tahun ajaran not found") {
        return sendError(res, "Tahun ajaran not found", null, 404);
      }
      sendError(res, "Failed to get tahun ajaran", error.message, 400);
    }
  }

  static async getActive(req: Request, res: Response) {
    try {
      const tahunAjaran = await TahunAjaranService.getActive();
      sendSuccess(
        res,
        "Active tahun ajaran retrieved successfully",
        tahunAjaran
      );
    } catch (error: any) {
      if (error.message === "No active tahun ajaran found") {
        return sendError(res, "No active tahun ajaran found", null, 404);
      }
      sendError(res, "Failed to get active tahun ajaran", error.message, 400);
    }
  }

  static async getCurrent(req: Request, res: Response) {
    try {
      const tahunAjaran = await TahunAjaranService.getCurrent();
      sendSuccess(
        res,
        "Current tahun ajaran retrieved successfully",
        tahunAjaran
      );
    } catch (error: any) {
      if (error.message === "No current tahun ajaran found for this date") {
        return sendError(res, "No current tahun ajaran found", null, 404);
      }
      sendError(res, "Failed to get current tahun ajaran", error.message, 400);
    }
  }

  static async getByYear(req: Request, res: Response) {
    try {
      // Change from req.params.year to req.query.year
      const { year } = req.query;

      if (!year || typeof year !== "string") {
        return sendError(res, "Year parameter is required", null, 400);
      }

      const tahunAjaran = await TahunAjaranService.getByYear(year);
      sendSuccess(res, "Tahun ajaran retrieved successfully", tahunAjaran);
    } catch (error: any) {
      if (error.message === "No tahun ajaran found for this year") {
        return sendError(res, "No tahun ajaran found for this year", null, 404);
      }
      sendError(res, "Failed to get tahun ajaran", error.message, 400);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const tahunAjaran = await TahunAjaranService.create(req.body);
      sendSuccess(res, "Tahun ajaran created successfully", tahunAjaran);
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        return sendError(res, error.message, null, 409);
      }
      sendError(res, "Failed to create tahun ajaran", error.message, 400);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid tahun ajaran ID", null, 400);
      }

      const tahunAjaran = await TahunAjaranService.update(id, req.body);
      sendSuccess(res, "Tahun ajaran updated successfully", tahunAjaran);
    } catch (error: any) {
      if (error.message === "Tahun ajaran not found") {
        return sendError(res, "Tahun ajaran not found", null, 404);
      }
      if (error.message.includes("already exists")) {
        return sendError(res, error.message, null, 409);
      }
      sendError(res, "Failed to update tahun ajaran", error.message, 400);
    }
  }

  static async setActive(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid tahun ajaran ID", null, 400);
      }

      const tahunAjaran = await TahunAjaranService.setActive(id);
      sendSuccess(res, "Tahun ajaran set as active successfully", tahunAjaran);
    } catch (error: any) {
      if (error.message === "Tahun ajaran not found") {
        return sendError(res, "Tahun ajaran not found", null, 404);
      }
      sendError(res, "Failed to set active tahun ajaran", error.message, 400);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid tahun ajaran ID", null, 400);
      }

      const result = await TahunAjaranService.delete(id);
      sendSuccess(res, "Tahun ajaran deleted successfully", result);
    } catch (error: any) {
      if (error.message === "Tahun ajaran not found") {
        return sendError(res, "Tahun ajaran not found", null, 404);
      }
      if (error.message.includes("Cannot delete")) {
        return sendError(res, error.message, null, 400);
      }
      sendError(res, "Failed to delete tahun ajaran", error.message, 400);
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const stats = await TahunAjaranService.getStats();
      sendSuccess(res, "Tahun ajaran statistics retrieved successfully", stats);
    } catch (error: any) {
      sendError(res, "Failed to get statistics", error.message, 400);
    }
  }
}
