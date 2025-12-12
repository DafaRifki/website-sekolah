import { Request, Response } from "express";
import { PendaftaranService } from "../services/pendaftaran.service";
import { sendSuccess, sendError } from "../utils/response.util";
import { PaginationQuery } from "../types/common.types";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import fs from "fs";
import { PendaftaranUploadService } from "../services/pendaftaran-upload.service";

export class PendaftaranController {
  static async getAll(req: Request, res: Response) {
    try {
      const query = req.query as unknown as PaginationQuery;
      const result = await PendaftaranService.getAll(query);

      sendSuccess(
        res,
        "Pendaftaran retrieved successfully",
        result.data,
        result.pagination
      );
    } catch (error: any) {
      sendError(res, "Failed to get pendaftaran", error.message, 400);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid pendaftaran ID", null, 400);
      }

      const pendaftaran = await PendaftaranService.getById(id);
      sendSuccess(res, "Pendaftaran retrieved successfully", pendaftaran);
    } catch (error: any) {
      if (error.message === "Pendaftaran not found") {
        return sendError(res, "Pendaftaran not found", null, 404);
      }
      sendError(res, "Failed to get pendaftaran", error.message, 400);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const pendaftaran = await PendaftaranService.create(req.body);
      sendSuccess(res, "Pendaftaran created successfully", pendaftaran);
    } catch (error: any) {
      if (error.message.includes("already registered")) {
        return sendError(res, error.message, null, 409);
      }
      sendError(res, "Failed to create pendaftaran", error.message, 400);
    }
  }

  static async importCSV(req: Request, res: Response) {
    try {
      if (!req.file) {
        return sendError(res, "No file uploaded", null, 400);
      }

      const { tahunAjaranId } = req.body;

      if (!tahunAjaranId) {
        return sendError(res, "Tahun ajaran ID is required", null, 400);
      }

      const filePath = req.file.path;
      const fileExtension = req.file.originalname
        .split(".")
        .pop()
        ?.toLowerCase();

      let parsedData: Array<Record<string, any>> = [];

      // Parse based on file type
      if (fileExtension === "csv") {
        // Parse CSV
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const parseResult = Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
        });
        parsedData = parseResult.data as Array<Record<string, any>>;
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        // Parse Excel
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        parsedData = XLSX.utils.sheet_to_json(sheet);
      } else {
        // Clean up file
        fs.unlinkSync(filePath);
        return sendError(
          res,
          "Unsupported file format. Please upload CSV or Excel file",
          null,
          400
        );
      }

      // Import data
      const result = await PendaftaranService.importFromCSV(
        parsedData,
        parseInt(tahunAjaranId)
      );

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      sendSuccess(res, "Import completed", result);
    } catch (error: any) {
      // Clean up file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      sendError(res, "Failed to import data", error.message, 400);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid pendaftaran ID", null, 400);
      }

      const pendaftaran = await PendaftaranService.update(id, req.body);

      // Cek apakah auto-approved
      if ((pendaftaran as any).autoApproved) {
        return sendSuccess(
          res,
          `Pendaftaran updated and automatically approved! Siswa created with NIS: ${
            (pendaftaran as any).siswa?.nis
          }`,
          pendaftaran
        );
      }

      // Cek apakah ada error saat auto-approve
      if ((pendaftaran as any).autoApproveError) {
        return sendSuccess(
          res,
          `Pendaftaran updated but auto-approve failed: ${
            (pendaftaran as any).autoApproveError
          }`,
          pendaftaran
        );
      }

      sendSuccess(res, "Pendaftaran updated successfully", pendaftaran);
    } catch (error: any) {
      if (error.message === "Pendaftaran not found") {
        return sendError(res, "Pendaftaran not found", null, 404);
      }
      if (error.message.includes("Cannot update")) {
        return sendError(res, error.message, null, 400);
      }
      sendError(res, "Failed to update pendaftaran", error.message, 400);
    }
  }

  static async approve(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid pendaftaran ID", null, 400);
      }

      const result = await PendaftaranService.approve(id);
      sendSuccess(
        res,
        `Pendaftaran approved and siswa created with NIS: ${result.siswa.nis}`,
        result
      );
    } catch (error: any) {
      if (error.message === "Pendaftaran not found") {
        return sendError(res, "Pendaftaran not found", null, 404);
      }
      if (error.message.includes("Cannot approve")) {
        return sendError(res, error.message, null, 400);
      }
      sendError(res, "Failed to approve pendaftaran", error.message, 400);
    }
  }

  static async reject(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;

      if (isNaN(id)) {
        return sendError(res, "Invalid pendaftaran ID", null, 400);
      }

      const result = await PendaftaranService.reject(id, reason);
      sendSuccess(res, "Pendaftaran rejected successfully", result);
    } catch (error: any) {
      if (error.message === "Pendaftaran not found") {
        return sendError(res, "Pendaftaran not found", null, 404);
      }
      sendError(res, "Failed to reject pendaftaran", error.message, 400);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid pendaftaran ID", null, 400);
      }

      const result = await PendaftaranService.delete(id);
      sendSuccess(res, "Pendaftaran deleted successfully", result);
    } catch (error: any) {
      if (error.message === "Pendaftaran not found") {
        return sendError(res, "Pendaftaran not found", null, 404);
      }
      if (error.message.includes("Cannot delete")) {
        return sendError(res, error.message, null, 400);
      }
      sendError(res, "Failed to delete pendaftaran", error.message, 400);
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const tahunAjaranId = req.query.tahunAjaranId
        ? parseInt(req.query.tahunAjaranId as string)
        : undefined;

      const stats = await PendaftaranService.getStats(tahunAjaranId);
      sendSuccess(res, "Statistics retrieved successfully", stats);
    } catch (error: any) {
      sendError(res, "Failed to get statistics", error.message, 400);
    }
  }

  static async getByTahunAjaran(req: Request, res: Response) {
    try {
      const tahunAjaranId = parseInt(req.params.tahunAjaranId);

      if (isNaN(tahunAjaranId)) {
        return sendError(res, "Invalid tahun ajaran ID", null, 400);
      }

      const pendaftaran = await PendaftaranService.getByTahunAjaran(
        tahunAjaranId
      );
      sendSuccess(res, "Pendaftaran retrieved successfully", pendaftaran);
    } catch (error: any) {
      sendError(res, "Failed to get pendaftaran", error.message, 400);
    }
  }
  /**
   * POST /api/pendaftaran/upload
   * Upload CSV/Excel for bulk insert
   */
  static async uploadBulk(req: Request, res: Response) {
    let filePath = "";
    try {
      if (!req.file) {
        return sendError(res, "No file uploaded", null, 400);
      }

      filePath = req.file.path;
      const tahunAjaranId = req.body.tahunAjaranId
        ? parseInt(req.body.tahunAjaranId)
        : undefined;

      if (!tahunAjaranId) {
        // Clean up file if validation fails
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return sendError(res, "Tahun ajaran ID required", null, 400);
      }

      const fileExt = req.file.originalname.split(".").pop()?.toLowerCase();
      let data: any[] = [];

      // Parse CSV
      if (fileExt === "csv") {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const parsed = Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
        });

        data = parsed.data;
      }
      // Parse Excel
      else if (fileExt === "xlsx" || fileExt === "xls") {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
      } else {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return sendError(
          res,
          "Invalid file format. Only CSV and Excel files are allowed",
          null,
          400
        );
      }

      // Cleanup file after reading
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);

      if (data.length === 0) {
        return sendError(res, "File is empty", null, 400);
      }

      // Process bulk upload
      const results = await PendaftaranUploadService.bulkUpload(
        data,
        tahunAjaranId
      );

      return sendSuccess(
        res,
        `Upload complete. Success: ${results.success}, Failed: ${results.failed}`,
        results
      );
    } catch (error: any) {
      // Cleanup file on error
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error("Failed to delete temp file:", e);
        }
      }

      console.error("Upload error:", error);
      return sendError(res, "Failed to upload file", error.message, 500);
    }
  }

  /**
   * GET /api/pendaftaran/template
   * Download CSV template
   */
  static async downloadTemplate(req: Request, res: Response) {
    try {
      const headers = PendaftaranUploadService.getCSVTemplate();
      const csv = headers.join(",");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="template_pendaftaran.csv"'
      );
      res.send(csv);
    } catch (error: any) {
      return sendError(res, "Failed to download template", error.message, 500);
    }
  }
}
