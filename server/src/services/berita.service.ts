// src/services/berita.service.ts
import { prisma } from "../config/database";

export class BeritaService {
  static async getAll() {
    return await prisma.berita.findMany({
      orderBy: { tanggal: "desc" },
    });
  }

  static async getById(id: number) {
    return await prisma.berita.findUnique({
      where: { id },
    });
  }

  static async create(data: any) {
    return await prisma.berita.create({
      data,
    });
  }

  static async update(id: number, data: any) {
    return await prisma.berita.update({
      where: { id },
      data,
    });
  }

  static async delete(id: number) {
    return await prisma.berita.delete({
      where: { id },
    });
  }
}
