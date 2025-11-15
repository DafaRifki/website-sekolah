import { prisma } from "../config/database";
import { PaginationQuery, PaginationResult } from "../types/common.types";
import {
  buildPaginationQuery,
  buildPaginationResult,
  buildSearchFilter,
} from "../utils/database.util";
import { Prisma } from "@prisma/client";

interface CreateGuruData {
  nip: string;
  nama: string;
  jenisKelamin?: "L" | "P";
  alamat?: string;
  noHP: string;
  email?: string;
  jabatan?: string;
}

interface UpdateGuruData {
  nip?: string;
  nama?: string;
  jenisKelamin?: "L" | "P";
  alamat?: string;
  noHP?: string;
  email?: string;
  jabatan?: string;
  fotoProfil?: string;
}

export class GuruService {
  /**
   * Get all guru with pagination and search
   */
  static async getAll(query: PaginationQuery): Promise<PaginationResult<any>> {
    const { skip, take, page, limit } = buildPaginationQuery(query);

    const searchFilter = buildSearchFilter(query.search, [
      "nama",
      "nip",
      "email",
      "jabatan",
    ]);

    const where: Prisma.GuruWhereInput = {
      ...searchFilter,
    };

    const [guru, total] = await Promise.all([
      prisma.guru.findMany({
        where,
        skip,
        take,
        orderBy: { id_guru: "desc" },
        select: {
          id_guru: true,
          nip: true,
          nama: true,
          jenisKelamin: true,
          alamat: true,
          noHP: true,
          email: true,
          jabatan: true,
          fotoProfil: true,
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          waliKelas: {
            select: {
              id_kelas: true,
              namaKelas: true,
              tingkat: true,
            },
          },
        },
      }),
      prisma.guru.count({ where }),
    ]);

    return buildPaginationResult(guru, total, page, limit);
  }

  /**
   * Get guru by ID
   */
  static async getById(id: number) {
    const guru = await prisma.guru.findUnique({
      where: { id_guru: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        waliKelas: {
          select: {
            id_kelas: true,
            namaKelas: true,
            tingkat: true,
            siswa: {
              select: {
                id_siswa: true,
                nis: true,
                nama: true,
              },
            },
          },
        },
      },
    });

    if (!guru) {
      throw new Error("Guru not found");
    }

    return guru;
  }

  /**
   * Get guru by NIP
   */
  static async getByNIP(nip: string) {
    const guru = await prisma.guru.findUnique({
      where: { nip },
      include: {
        user: true,
        waliKelas: true,
      },
    });

    if (!guru) {
      throw new Error("Guru not found");
    }

    return guru;
  }

  /**
   * Create new guru
   */
  static async create(data: CreateGuruData) {
    // Check if NIP already exists
    const existingGuru = await prisma.guru.findUnique({
      where: { nip: data.nip },
    });

    if (existingGuru) {
      throw new Error("NIP already exists");
    }

    // Check if email already exists (if provided)
    if (data.email) {
      const existingEmail = await prisma.guru.findFirst({
        where: { email: data.email },
      });

      if (existingEmail) {
        throw new Error("Email already exists");
      }
    }

    const guru = await prisma.guru.create({
      data: {
        nip: data.nip,
        nama: data.nama,
        jenisKelamin: data.jenisKelamin,
        alamat: data.alamat,
        noHP: data.noHP,
        email: data.email,
        jabatan: data.jabatan,
      },
      include: {
        user: true,
      },
    });

    return guru;
  }

  /**
   * Update guru
   */
  static async update(id: number, data: UpdateGuruData) {
    const existing = await prisma.guru.findUnique({
      where: { id_guru: id },
    });

    if (!existing) {
      throw new Error("Guru not found");
    }

    // Check if new NIP already exists (if changing NIP)
    if (data.nip && data.nip !== existing.nip) {
      const existingNIP = await prisma.guru.findUnique({
        where: { nip: data.nip },
      });

      if (existingNIP) {
        throw new Error("NIP already exists");
      }
    }

    // Check if new email already exists (if changing email)
    if (data.email && data.email !== existing.email) {
      const existingEmail = await prisma.guru.findFirst({
        where: { email: data.email },
      });

      if (existingEmail) {
        throw new Error("Email already exists");
      }
    }

    const updated = await prisma.guru.update({
      where: { id_guru: id },
      data,
      include: {
        user: true,
        waliKelas: true,
      },
    });

    return updated;
  }

  /**
   * Upload/update foto profil
   */
  static async uploadPhoto(id: number, photoPath: string) {
    const guru = await prisma.guru.findUnique({
      where: { id_guru: id },
    });

    if (!guru) {
      throw new Error("Guru not found");
    }

    const updated = await prisma.guru.update({
      where: { id_guru: id },
      data: { fotoProfil: photoPath },
    });

    return updated;
  }

  /**
   * Delete guru
   */
  static async delete(id: number) {
    const guru = await prisma.guru.findUnique({
      where: { id_guru: id },
      include: {
        waliKelas: true,
        user: true,
      },
    });

    if (!guru) {
      throw new Error("Guru not found");
    }

    // Check if guru is wali kelas
    if (guru.waliKelas && guru.waliKelas.length > 0) {
      throw new Error(
        "Cannot delete guru who is assigned as wali kelas. Remove wali kelas assignment first."
      );
    }

    // Check if guru has user account
    if (guru.user) {
      throw new Error(
        "Cannot delete guru with user account. Delete user account first."
      );
    }

    await prisma.guru.delete({
      where: { id_guru: id },
    });

    return { message: "Guru deleted successfully" };
  }

  /**
   * Get statistics
   */
  static async getStats() {
    const [total, totalLaki, totalPerempuan, totalWaliKelas, withUserAccount] =
      await Promise.all([
        prisma.guru.count(),
        prisma.guru.count({ where: { jenisKelamin: "L" } }),
        prisma.guru.count({ where: { jenisKelamin: "P" } }),
        prisma.guru.count({
          where: {
            waliKelas: {
              some: {},
            },
          },
        }),
        prisma.guru.count({
          where: {
            user: {
              isNot: null,
            },
          },
        }),
      ]);

    // Get jabatan distribution
    const jabatanStats = await prisma.guru.groupBy({
      by: ["jabatan"],
      _count: {
        jabatan: true,
      },
    });

    return {
      total,
      byGender: {
        laki: totalLaki,
        perempuan: totalPerempuan,
      },
      totalWaliKelas,
      withUserAccount,
      byJabatan: jabatanStats.map((item) => ({
        jabatan: item.jabatan || "Tidak ada jabatan",
        count: item._count.jabatan,
      })),
    };
  }

  /**
   * Get guru who are not wali kelas (available for assignment)
   */
  static async getAvailableForWaliKelas() {
    const guru = await prisma.guru.findMany({
      where: {
        waliKelas: {
          none: {},
        },
      },
      select: {
        id_guru: true,
        nip: true,
        nama: true,
        jabatan: true,
      },
      orderBy: { nama: "asc" },
    });

    return guru;
  }

  /**
   * Link guru to user account
   */
  static async linkToUser(guruId: number, userId: number) {
    const guru = await prisma.guru.findUnique({
      where: { id_guru: guruId },
      include: { user: true },
    });

    if (!guru) {
      throw new Error("Guru not found");
    }

    if (guru.user) {
      throw new Error("Guru already has a user account");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.guruId || user.siswaId) {
      throw new Error("User already linked to another guru or siswa");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { guruId },
      include: {
        guru: true,
      },
    });

    return updated;
  }

  /**
   * Unlink guru from user account
   */
  static async unlinkFromUser(guruId: number) {
    const guru = await prisma.guru.findUnique({
      where: { id_guru: guruId },
      include: { user: true },
    });

    if (!guru) {
      throw new Error("Guru not found");
    }

    if (!guru.user) {
      throw new Error("Guru does not have a user account");
    }

    await prisma.user.update({
      where: { id: guru.user.id },
      data: { guruId: null },
    });

    return { message: "User unlinked successfully" };
  }
}
