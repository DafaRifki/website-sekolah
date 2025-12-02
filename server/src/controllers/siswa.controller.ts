import { Request, Response } from "express";
import { SiswaService } from "../services/siswa.service";
import { sendSuccess, sendError } from "../utils/response.util";
import { PaginationQuery } from "../types/common.types";
import fs from "fs";
import path from "path";

export class SiswaController {
  static async getAll(req: Request, res: Response) {
    try {
      const query = req.query as unknown as PaginationQuery;
      const result = await SiswaService.getAll(query);

      sendSuccess(
        res,
        "Siswa retrieved successfully",
        result.data,
        result.pagination
      );
    } catch (error: any) {
      sendError(res, "Failed to get siswa", error.message, 400);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid siswa ID", null, 400);
      }

      const siswa = await SiswaService.getById(id);
      sendSuccess(res, "Siswa retrieved successfully", siswa);
    } catch (error: any) {
      if (error.message === "Siswa not found") {
        return sendError(res, "Siswa not found", null, 404);
      }
      sendError(res, "Failed to get siswa", error.message, 400);
    }
  }

  static async getByNIS(req: Request, res: Response) {
    try {
      const { nis } = req.params;

      const siswa = await SiswaService.getByNIS(nis);
      sendSuccess(res, "Siswa retrieved successfully", siswa);
    } catch (error: any) {
      if (error.message === "Siswa not found") {
        return sendError(res, "Siswa not found", null, 404);
      }
      sendError(res, "Failed to get siswa", error.message, 400);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const data = { ...req.body };

      if (req.file) {
        data.fotoProfil = `/uploads/profiles/${req.file.filename}`;
      }

      const siswa = await SiswaService.create(data);
      sendSuccess(
        res,
        "Siswa created successfully with NIS: " + siswa.nis,
        siswa
      );
    } catch (error: any) {
      if (error.message === "Kelas not found") {
        return sendError(res, "Kelas not found", null, 404);
      }
      if (error.message.includes("Email already exists")) {
        return sendError(res, "Email already exists", null, 400);
      }
      sendError(res, "Failed to create siswa", error.message, 400);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid siswa ID", null, 400);
      }

      const siswa = await SiswaService.update(id, req.body);
      sendSuccess(res, "Siswa updated successfully", siswa);
    } catch (error: any) {
      if (error.message === "Siswa not found") {
        return sendError(res, "Siswa not found", null, 404);
      }
      if (error.message === "Kelas not found") {
        return sendError(res, "Kelas not found", null, 404);
      }
      sendError(res, "Failed to update siswa", error.message, 400);
    }
  }

  static async uploadFoto(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid siswa ID", null, 400);
      }

      if (!req.file) {
        return sendError(res, "No file uploaded", null, 400);
      }

      // Build relative path for database storage
      const relativePath = `/uploads/profiles/${req.file.filename}`;

      const siswa = await SiswaService.uploadFoto(id, relativePath);
      sendSuccess(res, "Photo uploaded successfully", siswa);
    } catch (error: any) {
      // Delete uploaded file if error occurs
      if (req.file) {
        const filePath = path.join(
          process.cwd(),
          "uploads",
          "profiles",
          req.file.filename
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      if (error.message === "Siswa not found") {
        return sendError(res, "Siswa not found", null, 404);
      }
      sendError(res, "Failed to upload photo", error.message, 400);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid siswa ID", null, 400);
      }

      const result = await SiswaService.delete(id);
      sendSuccess(res, "Siswa deleted successfully", result);
    } catch (error: any) {
      if (error.message === "Siswa not found") {
        return sendError(res, "Siswa not found", null, 404);
      }
      if (error.message.includes("Cannot delete")) {
        return sendError(res, error.message, null, 400);
      }
      sendError(res, "Failed to delete siswa", error.message, 400);
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const stats = await SiswaService.getStats();
      sendSuccess(res, "Siswa statistics retrieved successfully", stats);
    } catch (error: any) {
      sendError(res, "Failed to get statistics", error.message, 400);
    }
  }

  static async getByKelas(req: Request, res: Response) {
    try {
      const kelasId = parseInt(req.params.kelasId);

      if (isNaN(kelasId)) {
        return sendError(res, "Invalid kelas ID", null, 400);
      }

      const siswa = await SiswaService.getByKelas(kelasId);
      sendSuccess(res, "Siswa retrieved successfully", siswa);
    } catch (error: any) {
      sendError(res, "Failed to get siswa", error.message, 400);
    }
  }

  static async searchByName(req: Request, res: Response) {
    try {
      const { name } = req.query;

      if (!name || typeof name !== "string") {
        return sendError(res, "Name parameter is required", null, 400);
      }

      const siswa = await SiswaService.searchByName(name);
      sendSuccess(res, "Search results retrieved successfully", siswa);
    } catch (error: any) {
      sendError(res, "Failed to search siswa", error.message, 400);
    }
  }
}
