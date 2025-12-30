import { prisma } from "../config/database";
import { PaginationQuery, PaginationResult } from "../types/common.types";
import {
  buildPaginationQuery,
  buildPaginationResult,
  buildSearchFilter,
} from "../utils/database.util";
// [PERBAIKAN 1] Import Role dari @prisma/client
import { Prisma, Role } from "@prisma/client"; 
import bcrypt from "bcrypt";

interface CreateGuruData {
  nip: string;
  nama: string;
  jenisKelamin?: "L" | "P";
  alamat?: string;
  noHP: string;
  email?: string;
  password?: string;
  // [PERBAIKAN 2] Pastikan tipe role fleksibel (bisa string atau Role)
  role?: Role | string; 
  jabatan?: string;
  fotoProfil?: string;
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
    const { password, role, ...guruData } = data;

    return await prisma.$transaction(async (tx) => {
      // 1. Cek NIP
      const existingGuru = await tx.guru.findUnique({
        where: { nip: guruData.nip },
      });

      if (existingGuru) {
        throw new Error("NIP already exists");
      }

      let userId: number | null = null;

      // 2. Logika User
      if (guruData.email) {
        const existingUser = await tx.user.findUnique({
          where: { email: guruData.email },
        });

        if (existingUser) {
          userId = existingUser.id;
          
          // Cek apakah user sudah terpakai (opsional, tergantung relasi)
          // const linkedGuru = await tx.guru.findFirst({ where: { userId: userId } });
          // if (linkedGuru) throw new Error("Email account already linked to another guru");

        } else {
          // Buat User Baru
          const hashedPassword = await bcrypt.hash(password || "123456", 10);

          // [PERBAIKAN 3] Gunakan Casting ke Role Enum
          // Jika 'role' dikirim string "GURU", ubah jadi Role.GURU
          // Jika tidak ada, default ke Role.GURU
          const userRole = role ? (role as Role) : Role.GURU;

          const newUser = await tx.user.create({
            data: {
              email: guruData.email,
              password: hashedPassword,
              role: userRole, 
            },
          });
          userId = newUser.id;
        }
      }

      // 3. Buat Guru
      // Jika error "Unknown arg user", ganti logika di bawah sesuai schema Anda
      const newGuru = await tx.guru.create({
        data: {
          nip: guruData.nip,
          nama: guruData.nama,
          jenisKelamin: guruData.jenisKelamin,
          alamat: guruData.alamat,
          noHP: guruData.noHP,
          email: guruData.email,
          jabatan: guruData.jabatan,
          fotoProfil: guruData.fotoProfil,
          // Sambungkan user (pastikan relasi di schema.prisma mendukung connect ini)
          user: userId ? { connect: { id: userId } } : undefined,
        },
        include: {
          user: true,
        },
      });

      return newGuru;
    });
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

    if (data.nip && data.nip !== existing.nip) {
      const existingNIP = await prisma.guru.findUnique({
        where: { nip: data.nip },
      });
      if (existingNIP) throw new Error("NIP already exists");
    }

    if (data.email && data.email !== existing.email) {
      const existingEmail = await prisma.guru.findFirst({
        where: { email: data.email },
      });
      if (existingEmail) throw new Error("Email already exists");
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
   * Upload Photo
   */
  static async uploadPhoto(id: number, photoPath: string) {
    const guru = await prisma.guru.findUnique({ where: { id_guru: id } });
    if (!guru) throw new Error("Guru not found");

    return await prisma.guru.update({
      where: { id_guru: id },
      data: { fotoProfil: photoPath },
    });
  }

  /**
   * Delete guru
   */
  static async delete(id: number) {
    const guru = await prisma.guru.findUnique({
      where: { id_guru: id },
      include: { waliKelas: true, user: true },
    });

    if (!guru) throw new Error("Guru not found");

    if (guru.waliKelas && guru.waliKelas.length > 0) {
      throw new Error("Cannot delete guru who is assigned as wali kelas.");
    }

    const userIdToDelete = guru.user?.id;

    await prisma.guru.delete({ where: { id_guru: id } });

    // Hapus user jika role GURU
    if (userIdToDelete && guru.user?.role === Role.GURU) {
      try {
        await prisma.user.delete({ where: { id: userIdToDelete } });
      } catch (e) {
      }
    }

    return { message: "Guru deleted successfully" };
  }

  /**
   * Get Stats
   */
  static async getStats() {
    const [total, totalLaki, totalPerempuan, totalWaliKelas, withUserAccount] =
      await Promise.all([
        prisma.guru.count(),
        prisma.guru.count({ where: { jenisKelamin: "L" } }),
        prisma.guru.count({ where: { jenisKelamin: "P" } }),
        prisma.guru.count({ where: { waliKelas: { some: {} } } }),
        prisma.guru.count({ where: { user: { isNot: null } } }),
      ]);

    const jabatanStats = await prisma.guru.groupBy({
      by: ["jabatan"],
      _count: { jabatan: true },
    });

    return {
      total,
      byGender: { laki: totalLaki, perempuan: totalPerempuan },
      totalWaliKelas,
      withUserAccount,
      byJabatan: jabatanStats.map((item) => ({
        jabatan: item.jabatan || "Tidak ada jabatan",
        count: item._count.jabatan,
      })),
    };
  }

  /**
   * Available for Wali Kelas
   */
  static async getAvailableForWaliKelas() {
    return await prisma.guru.findMany({
      where: { waliKelas: { none: {} } },
      select: { id_guru: true, nip: true, nama: true, jabatan: true },
      orderBy: { nama: "asc" },
    });
  }

  /**
   * Link User
   */
  static async linkToUser(guruId: number, userId: number) {
    const guru = await prisma.guru.findUnique({
      where: { id_guru: guruId },
      include: { user: true },
    });
    if (!guru) throw new Error("Guru not found");
    if (guru.user) throw new Error("Guru already has a user account");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    // Asumsi update dilakukan di sisi User
    // Pastikan schema.prisma Anda memiliki relasi guruId di tabel User
    // Jika relasi ada di tabel Guru, gunakan prisma.guru.update
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { guruId: guruId }, 
      include: { guru: true },
    });

    return updated;
  }

  /**
   * Unlink User
   */
  static async unlinkFromUser(guruId: number) {
    const guru = await prisma.guru.findUnique({
      where: { id_guru: guruId },
      include: { user: true },
    });
    if (!guru) throw new Error("Guru not found");
    if (!guru.user) throw new Error("Guru does not have a user account");

    await prisma.user.update({
      where: { id: guru.user.id },
      data: { guruId: null },
    });

    return { message: "User unlinked successfully" };
  }
}