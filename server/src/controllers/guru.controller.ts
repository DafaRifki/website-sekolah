import { Request, Response } from "express";
import { GuruService } from "../services/guru.service";
import { PaginationQuery } from "../types/common.types";

export class GuruController {
  /**
   * GET /api/guru
   * Get all guru with pagination and search
   */
  static async getAll(req: Request, res: Response) {
    try {
      const query: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc",
      };

      const result = await GuruService.getAll(query);

      res.status(200).json({
        success: true,
        message: "Guru retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to get guru",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/guru/:id
   * Get guru by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const guru = await GuruService.getById(id);

      res.status(200).json({
        success: true,
        message: "Guru retrieved successfully",
        data: guru,
      });
    } catch (error: any) {
      if (error.message === "Guru not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to get guru",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/guru/nip/:nip
   * Get guru by NIP
   */
  static async getByNIP(req: Request, res: Response) {
    try {
      const { nip } = req.params;
      const guru = await GuruService.getByNIP(nip);

      res.status(200).json({
        success: true,
        message: "Guru retrieved successfully",
        data: guru,
      });
    } catch (error: any) {
      if (error.message === "Guru not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to get guru",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/guru
   * Create new guru
   */
  static async create(req: Request, res: Response) {
    try {
      const guru = await GuruService.create(req.body);

      res.status(201).json({
        success: true,
        message: "Guru created successfully",
        data: guru,
      });
    } catch (error: any) {
      if (
        error.message === "NIP already exists" ||
        error.message === "Email already exists"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create guru",
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/guru/:id
   * Update guru
   */
  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const guru = await GuruService.update(id, req.body);

      res.status(200).json({
        success: true,
        message: "Guru updated successfully",
        data: guru,
      });
    } catch (error: any) {
      if (error.message === "Guru not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message === "NIP already exists" ||
        error.message === "Email already exists"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update guru",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/guru/:id/upload
   * Upload foto profil
   */
  static async uploadPhoto(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // File path relative to uploads folder
      const photoPath = `/uploads/guru/${req.file.filename}`;

      const guru = await GuruService.uploadPhoto(id, photoPath);

      res.status(200).json({
        success: true,
        message: "Photo uploaded successfully",
        data: guru,
      });
    } catch (error: any) {
      if (error.message === "Guru not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to upload photo",
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/guru/:id
   * Delete guru
   */
  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await GuruService.delete(id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      if (error.message === "Guru not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message.includes("wali kelas") ||
        error.message.includes("user account")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to delete guru",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/guru/stats
   * Get guru statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const stats = await GuruService.getStats();

      res.status(200).json({
        success: true,
        message: "Statistics retrieved successfully",
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to get statistics",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/guru/available/wali-kelas
   * Get guru available for wali kelas assignment
   */
  static async getAvailableForWaliKelas(req: Request, res: Response) {
    try {
      const guru = await GuruService.getAvailableForWaliKelas();

      res.status(200).json({
        success: true,
        message: "Available guru retrieved successfully",
        data: guru,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to get available guru",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/guru/:id/link-user
   * Link guru to user account
   */
  static async linkToUser(req: Request, res: Response) {
    try {
      const guruId = parseInt(req.params.id);
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId is required",
        });
      }

      const result = await GuruService.linkToUser(guruId, userId);

      res.status(200).json({
        success: true,
        message: "User linked successfully",
        data: result,
      });
    } catch (error: any) {
      if (
        error.message === "Guru not found" ||
        error.message === "User not found"
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message.includes("already") ||
        error.message.includes("linked")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to link user",
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/guru/:id/unlink-user
   * Unlink guru from user account
   */
  static async unlinkFromUser(req: Request, res: Response) {
    try {
      const guruId = parseInt(req.params.id);
      const result = await GuruService.unlinkFromUser(guruId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      if (error.message === "Guru not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes("does not have")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to unlink user",
        error: error.message,
      });
    }
  }
}
