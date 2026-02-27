// src/controllers/berita.controller.ts
import { Request, Response } from "express";
import { BeritaService } from "../services/berita.service";
import { sendSuccess, sendError } from "../utils/response.util";
import fs from "fs/promises";
import path from "path";

export class BeritaController {
  static async getAll(req: Request, res: Response) {
    try {
      const berita = await BeritaService.getAll();
      return sendSuccess(res, "Berita berhasil diambil", berita);
    } catch (error: any) {
      return sendError(res, "Gagal mengambil berita", error.message, 500);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const berita = await BeritaService.getById(id);
      if (!berita) {
        return sendError(res, "Berita tidak ditemukan", "Not Found", 404);
      }
      return sendSuccess(res, "Berita berhasil diambil", berita);
    } catch (error: any) {
      return sendError(res, "Gagal mengambil berita", error.message, 500);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { judul, isi, kategori, penulis, tanggal } = req.body;
      const gambar = req.file ? `/uploads/berita/${req.file.filename}` : null;

      const berita = await BeritaService.create({
        judul,
        isi,
        kategori,
        penulis: penulis || "Admin",
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        gambar,
      });

      return sendSuccess(res, "Berita berhasil dibuat", berita);
    } catch (error: any) {
      return sendError(res, "Gagal membuat berita", error.message, 500);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { judul, isi, kategori, penulis, tanggal } = req.body;
      
      const existing = await BeritaService.getById(id);
      if (!existing) {
        return sendError(res, "Berita tidak ditemukan", "Not Found", 404);
      }

      let gambar = existing.gambar;
      if (req.file) {
        // Hapus gambar lama jika ada
        if (existing.gambar) {
          const oldPath = path.join(process.cwd(), existing.gambar);
          await fs.unlink(oldPath).catch(() => {});
        }
        gambar = `/uploads/berita/${req.file.filename}`;
      }

      const berita = await BeritaService.update(id, {
        judul,
        isi,
        kategori,
        penulis,
        tanggal: tanggal ? new Date(tanggal) : undefined,
        gambar,
      });

      return sendSuccess(res, "Berita berhasil diperbarui", berita);
    } catch (error: any) {
      return sendError(res, "Gagal memperbarui berita", error.message, 500);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const existing = await BeritaService.getById(id);
      
      if (!existing) {
        return sendError(res, "Berita tidak ditemukan", "Not Found", 404);
      }

      // Hapus gambar dari storage
      if (existing.gambar) {
        const filePath = path.join(process.cwd(), existing.gambar);
        await fs.unlink(filePath).catch(() => {});
      }

      await BeritaService.delete(id);
      return sendSuccess(res, "Berita berhasil dihapus");
    } catch (error: any) {
      return sendError(res, "Gagal menghapus berita", error.message, 500);
    }
  }
}
