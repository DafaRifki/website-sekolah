import { prisma } from "../config/database";
import { hashPassword } from "../utils/hash.util";
import { PaginationQuery, PaginationResult } from "../types/common.types";
import {
  buildPaginationQuery,
  buildPaginationResult,
  buildSearchFilter,
} from "../utils/database.util";
import { Prisma } from "@prisma/client";

interface CreateSiswaData {
  nama: string;
  nis?: string;
  email: string;
  password?: string;
  alamat?: string;
  tanggalLahir?: Date | string;
  jenisKelamin?: "L" | "P";
  kelasId?: number;
  fotoProfil?: string;

  // Orang Tua
  orangtuaNama?: string;
  orangtuaHubungan?: string;
  orangtuaPekerjaan?: string;
  orangtuaAlamat?: string;
  orangtuaNoHp?: string;
}

interface UpdateSiswaData {
  nama?: string;
  alamat?: string;
  tanggalLahir?: Date | string;
  jenisKelamin?: "L" | "P";
  kelasId?: number;
  fotoProfil?: string;
}

export class SiswaService {
  // Generate NIS automatically (format: YYYY + sequential number)
  static async generateNIS(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = currentYear.toString();

    // Get the last NIS for current year
    const lastSiswa = await prisma.siswa.findFirst({
      where: {
        nis: {
          startsWith: prefix,
        },
      },
      orderBy: {
        nis: "desc",
      },
    });

    let sequentialNumber = 1;

    if (lastSiswa && lastSiswa.nis) {
      // Extract number part and increment
      const lastNumber = parseInt(lastSiswa.nis.slice(4)); // Get last 3 digits
      sequentialNumber = lastNumber + 1;
    }

    // Format: YYYY + 3 digit number (e.g., 2024001, 2024002)
    const nis = `${prefix}${sequentialNumber.toString().padStart(3, "0")}`;

    return nis;
  }

  static async getAll(query: PaginationQuery): Promise<PaginationResult<any>> {
    const { skip, take, page, limit } = buildPaginationQuery(query);

    const searchFilter = buildSearchFilter(query.search, ["nama", "nis"]);

    const where: Prisma.SiswaWhereInput = {
      ...searchFilter,
      ...(query.kelasId && query.kelasId !== "all"
        ? { kelasId: parseInt(query.kelasId as string) }
        : {}),
    };

    const [siswa, total] = await Promise.all([
      prisma.siswa.findMany({
        where,
        skip,
        take,
        orderBy: { id_siswa: "desc" },
        select: {
          id_siswa: true,
          nis: true,
          nama: true,
          alamat: true,
          tanggalLahir: true,
          jenisKelamin: true,
          fotoProfil: true,
          kelasId: true,
          kelas: {
            select: {
              id_kelas: true,
              namaKelas: true,
              tingkat: true,
              guru: {
                select: {
                  nama: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
      prisma.siswa.count({ where }),
    ]);

    return buildPaginationResult(siswa, total, page, limit);
  }

  static async getById(id: number) {
    const siswa = await prisma.siswa.findUnique({
      where: { id_siswa: id },
      include: {
        kelas: {
          select: {
            id_kelas: true,
            namaKelas: true,
            tingkat: true,
            guru: {
              select: {
                id_guru: true,
                nama: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        Siswa_Orangtua: {
          include: {
            orangtua: true,
          },
        },
        _count: {
          select: {
            nilaiRapor: true,
            absensi: true,
            pendaftaran: true,
          },
        },
      },
    });

    if (!siswa) {
      throw new Error("Siswa not found");
    }

    return siswa;
  }

  static async getByNIS(nis: string) {
    const siswa = await prisma.siswa.findUnique({
      where: { nis },
      include: {
        kelas: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!siswa) {
      throw new Error("Siswa not found");
    }

    return siswa;
  }

  static async create(data: CreateSiswaData) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("Email already exists");
    }

    // Generate NIS automatically if not provided
    const nis = data.nis || (await this.generateNIS());

    // Validate kelas if provided
    if (data.kelasId) {
      const kelas = await prisma.kelas.findUnique({
        where: { id_kelas: data.kelasId },
      });

      if (!kelas) {
        throw new Error("Kelas not found");
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password || "123456");

    const siswa = await prisma.siswa.create({
      data: {
        nis,
        nama: data.nama,
        alamat: data.alamat,
        tanggalLahir: data.tanggalLahir
          ? new Date(data.tanggalLahir)
          : undefined,
        jenisKelamin: data.jenisKelamin,
        kelasId: data.kelasId,
        fotoProfil: data.fotoProfil,

        // Create User
        user: {
          create: {
            email: data.email,
            password: hashedPassword,
            role: "SISWA",
          },
        },

        // Create OrangTua if provided
        Siswa_Orangtua: data.orangtuaNama
          ? {
              create: {
                status: "Wali",
                orangtua: {
                  create: {
                    nama: data.orangtuaNama,
                    hubungan: data.orangtuaHubungan || "Wali",
                    pekerjaan: data.orangtuaPekerjaan || "-",
                    alamat: data.orangtuaAlamat || data.alamat || "-",
                    noHp: data.orangtuaNoHp || "-",
                  },
                },
              },
            }
          : undefined,
      },
      include: {
        kelas: {
          select: {
            id_kelas: true,
            namaKelas: true,
            tingkat: true,
          },
        },
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return siswa;
  }

  static async update(id: number, data: UpdateSiswaData) {
    // Check if exists
    const existing = await prisma.siswa.findUnique({
      where: { id_siswa: id },
    });

    if (!existing) {
      throw new Error("Siswa not found");
    }

    // Validate kelas if provided
    if (data.kelasId) {
      const kelas = await prisma.kelas.findUnique({
        where: { id_kelas: data.kelasId },
      });

      if (!kelas) {
        throw new Error("Kelas not found");
      }
    }

    const updateData: any = {
      nama: data.nama,
      alamat: data.alamat,
      jenisKelamin: data.jenisKelamin,
      kelasId: data.kelasId,
      fotoProfil: data.fotoProfil,
    };

    if (data.tanggalLahir) {
      updateData.tanggalLahir = new Date(data.tanggalLahir);
    }

    const updated = await prisma.siswa.update({
      where: { id_siswa: id },
      data: updateData,
      include: {
        kelas: {
          select: {
            id_kelas: true,
            namaKelas: true,
            tingkat: true,
          },
        },
      },
    });

    return updated;
  }

  static async uploadFoto(id: number, fotoPath: string) {
    const existing = await prisma.siswa.findUnique({
      where: { id_siswa: id },
    });

    if (!existing) {
      throw new Error("Siswa not found");
    }

    const updated = await prisma.siswa.update({
      where: { id_siswa: id },
      data: { fotoProfil: fotoPath },
    });

    return updated;
  }

  static async delete(id: number) {
    const existing = await prisma.siswa.findUnique({
      where: { id_siswa: id },
      include: {
        _count: {
          select: {
            nilaiRapor: true,
            absensi: true,
            pendaftaran: true,
          },
        },
        user: true,
      },
    });

    if (!existing) {
      throw new Error("Siswa not found");
    }

    // Check if has related data
    const totalRelated = existing._count.nilaiRapor + existing._count.absensi;
    if (totalRelated > 0) {
      throw new Error(
        `Cannot delete siswa with existing academic records (${totalRelated} records)`
      );
    }

    // Delete related user if exists
    if (existing.user) {
      await prisma.user.delete({
        where: { id: existing.user.id },
      });
    }

    await prisma.siswa.delete({
      where: { id_siswa: id },
    });

    return { message: "Siswa deleted successfully" };
  }

  static async getStats() {
    const currentYear = new Date().getFullYear();

    const [total, male, female, withKelas, withoutKelas, newThisYear] =
      await Promise.all([
        prisma.siswa.count(),
        prisma.siswa.count({ where: { jenisKelamin: "L" } }),
        prisma.siswa.count({ where: { jenisKelamin: "P" } }),
        prisma.siswa.count({ where: { kelasId: { not: null } } }),
        prisma.siswa.count({ where: { kelasId: null } }),
        prisma.siswa.count({
          where: {
            nis: {
              startsWith: currentYear.toString(),
            },
          },
        }),
      ]);

    return {
      total,
      byGender: {
        male,
        female,
        unspecified: total - male - female,
      },
      byKelas: {
        assigned: withKelas,
        unassigned: withoutKelas,
      },
      newThisYear,
    };
  }

  static async getByKelas(kelasId: number) {
    const siswa = await prisma.siswa.findMany({
      where: { kelasId },
      orderBy: { nama: "asc" },
      select: {
        id_siswa: true,
        nis: true,
        nama: true,
        jenisKelamin: true,
        fotoProfil: true,
      },
    });

    return siswa;
  }

  static async searchByName(name: string) {
    const siswa = await prisma.siswa.findMany({
      where: {
        OR: [
          { nama: { contains: name } },
          { nama: { contains: name.toLowerCase() } },
          { nama: { contains: name.toUpperCase() } },
        ],
      },
      take: 10,
      select: {
        id_siswa: true,
        nis: true,
        nama: true,
        kelas: {
          select: {
            namaKelas: true,
            tingkat: true,
          },
        },
      },
    });

    return siswa;
  }
}
