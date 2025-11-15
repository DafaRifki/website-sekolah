import { Request, Response } from "express";
import { PaginationQuery } from "../types/common.types";
import { KelasService } from "../services/kelas.service";
import { sendError, sendSuccess } from "../utils/response.util";

export class KelasController {
  /**
   * GET /api/kelas
   * Get all kelas with pagination
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

      const result = await KelasService.getAll(query);

      res.status(200).json({
        success: true,
        message: "Kelas retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to get kelas",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/kelas/:id
   * Get kelas by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const kelas = await KelasService.getById(id);

      res.status(200).json({
        success: true,
        message: "Kelas retrieved successfully",
        data: kelas,
      });
    } catch (error: any) {
      if (error.message === "Kelas not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to get kelas",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/kelas
   * Create new kelas
   */
  static async create(req: Request, res: Response) {
    try {
      const kelas = await KelasService.create(req.body);

      res.status(201).json({
        success: true,
        message: "Kelas created successfully",
        data: kelas,
      });
    } catch (error: any) {
      if (
        error.message.includes("not found") ||
        error.message.includes("already assigned")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create kelas",
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/kelas/:id
   * Update kelas
   */
  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const kelas = await KelasService.update(id, req.body);

      res.status(200).json({
        success: true,
        message: "Kelas updated successfully",
        data: kelas,
      });
    } catch (error: any) {
      if (error.message === "Kelas not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message.includes("not found") ||
        error.message.includes("already assigned")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update kelas",
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/kelas/:id
   * Delete kelas
   */
  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const result = await KelasService.delete(id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      if (error.message === "Kelas not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes("Cannot delete")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to delete kelas",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/kelas/:id/assign-wali
   * Assign wali kelas
   */
  static async assignWaliKelas(req: Request, res: Response) {
    try {
      const kelasId = parseInt(req.params.id);
      const { guruId } = req.body;

      if (!guruId) {
        return res.status(400).json({
          success: false,
          message: "guruId is required",
        });
      }

      const kelas = await KelasService.assignWaliKelas(kelasId, guruId);

      res.status(200).json({
        success: true,
        message: "Wali kelas assigned successfully",
        data: kelas,
      });
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes("already assigned")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to assign wali kelas",
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/kelas/:id/remove-wali
   * Remove wali kelas
   */
  static async removeWaliKelas(req: Request, res: Response) {
    try {
      const kelasId = parseInt(req.params.id);
      const result = await KelasService.removeWaliKelas(kelasId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      if (
        error.message.includes("not found") ||
        error.message.includes("does not have")
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to remove wali kelas",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/kelas/:id/assign-siswa
   * Assign siswa to kelas (bulk)
   */
  static async assignSiswa(req: Request, res: Response) {
    try {
      const kelasId = parseInt(req.params.id);
      const result = await KelasService.assignSiswa(kelasId, req.body);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to assign siswa",
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/kelas/:id/remove-siswa/:siswaId
   * Remove siswa from kelas
   */
  static async removeSiswa(req: Request, res: Response) {
    try {
      const kelasId = parseInt(req.params.id);
      const siswaId = parseInt(req.params.siswaId);

      const result = await KelasService.removeSiswa(kelasId, siswaId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      if (
        error.message.includes("not found") ||
        error.message.includes("is not in")
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to remove siswa",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/kelas/:id/siswa
   * Get siswa in kelas
   */
  static async getSiswaInKelas(req: Request, res: Response) {
    try {
      const kelasId = parseInt(req.params.id);
      const siswa = await KelasService.getSiswaInKelas(kelasId);

      res.status(200).json({
        success: true,
        message: "Siswa retrieved successfully",
        data: siswa,
      });
    } catch (error: any) {
      if (error.message === "Kelas not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to get siswa",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/kelas/:id/move-siswa
   * Move siswa to another kelas
   */
  static async moveSiswa(req: Request, res: Response) {
    try {
      const fromKelasId = parseInt(req.params.id);
      const { siswaId, toKelasId } = req.body;

      if (!siswaId || !toKelasId) {
        return res.status(400).json({
          success: false,
          message: "siswaId and toKelasId are required",
        });
      }

      const result = await KelasService.moveSiswa(
        siswaId,
        fromKelasId,
        toKelasId
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      if (
        error.message.includes("not found") ||
        error.message.includes("is not in")
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to move siswa",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/kelas/:id/link-tahun-ajaran
   * Link kelas to tahun ajaran
   */
  static async linkTahunAjaran(req: Request, res: Response) {
    try {
      const kelasId = parseInt(req.params.id);
      const { tahunAjaranId } = req.body;

      if (!tahunAjaranId) {
        return res.status(400).json({
          success: false,
          message: "tahunAjaranId is required",
        });
      }

      const relation = await KelasService.linkTahunAjaran(
        kelasId,
        tahunAjaranId
      );

      res.status(200).json({
        success: true,
        message: "Kelas linked to tahun ajaran successfully",
        data: relation,
      });
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes("already linked")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to link tahun ajaran",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/kelas/stats
   * Get kelas statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const stats = await KelasService.getStats();

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
}
