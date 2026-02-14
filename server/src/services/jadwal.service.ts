import { Prisma } from "@prisma/client";
import { PaginationQuery, PaginationResult } from "../types";
import {
  buildPaginationQuery,
  buildPaginationResult,
} from "../utils/database.util";
import { prisma } from "../config/database";

interface CreateJadwalData {
  guruMapelId: number;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan?: string;
  keterangan?: string;
}

interface UpdateJadwalData {
  guruMapelId?: number;
  hari?: string;
  jamMulai?: string;
  jamSelesai?: string;
  ruangan?: string;
  keterangan?: string;
}

// Daftar hari yang valid
const VALID_DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export class JadwalService {
  /**
   * Validate hari
   */
  private static validateHari(hari: string) {
    if (!VALID_DAYS.includes(hari)) {
      throw new Error(`Invalid hari. Must be one of: ${VALID_DAYS.join(", ")}`);
    }
  }

  /**
   * Validate time format (HH:MM)
   */
  private static validateTimeFormat(time: string) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      throw new Error(
        `Invalid time format: ${time}. Use HH:MM format (e.g., 07:00)`,
      );
    }
  }

  /**
   * Check if jadwal conflicts with existing jadwal
   */
  private static async checkConflict(
    guruMapelId: number,
    hari: string,
    jamMulai: string,
    jamSelesai: string,
    excludeId?: number,
  ) {
    const guruMapel = await prisma.guruMapel.findUnique({
      where: { id: guruMapelId },
      select: {
        id_guru: true,
        id_kelas: true,
        tahunAjaranId: true,
      },
    });

    if (!guruMapel) {
      throw new Error("Guru mapel assignment not found");
    }

    // Check guru conflict (same guru, same day, overlapping time)
    const guruConflict = await prisma.jadwal.findFirst({
      where: {
        id_jadwal: excludeId ? { not: excludeId } : undefined,
        hari,
        guruMapel: {
          id_guru: guruMapel.id_guru,
          tahunAjaranId: guruMapel.tahunAjaranId,
        },
        OR: [
          // New jadwal starts during existing jadwal
          {
            AND: [
              { jamMulai: { lte: jamMulai } },
              { jamSelesai: { gt: jamMulai } },
            ],
          },
          // New jadwal ends during existing jadwal
          {
            AND: [
              { jamMulai: { lt: jamSelesai } },
              { jamSelesai: { gte: jamSelesai } },
            ],
          },
          // New jadwal completely encompasses existing jadwal
          {
            AND: [
              { jamMulai: { gte: jamMulai } },
              { jamSelesai: { lte: jamSelesai } },
            ],
          },
        ],
      },
      include: {
        guruMapel: {
          include: {
            guru: { select: { nama: true } },
            mapel: { select: { namaMapel: true } },
          },
        },
      },
    });

    if (guruConflict) {
      throw new Error(
        `Konflik jadwal guru: ${guruConflict.guruMapel.guru.nama} sudah mengajar ${guruConflict.guruMapel.mapel.namaMapel} pada ${hari} jam ${guruConflict.jamMulai}-${guruConflict.jamSelesai}`,
      );
    }

    // Check kelas conflict (same kelas, same day, overlapping time)
    const kelasConflict = await prisma.jadwal.findFirst({
      where: {
        id_jadwal: excludeId ? { not: excludeId } : undefined,
        hari,
        guruMapel: {
          id_kelas: guruMapel.id_kelas,
          tahunAjaranId: guruMapel.tahunAjaranId,
        },
        OR: [
          {
            AND: [
              { jamMulai: { lte: jamMulai } },
              { jamSelesai: { gt: jamMulai } },
            ],
          },
          {
            AND: [
              { jamMulai: { lt: jamSelesai } },
              { jamSelesai: { gte: jamSelesai } },
            ],
          },
          {
            AND: [
              { jamMulai: { gte: jamMulai } },
              { jamSelesai: { lte: jamSelesai } },
            ],
          },
        ],
      },
      include: {
        guruMapel: {
          include: {
            kelas: { select: { namaKelas: true } },
            mapel: { select: { namaMapel: true } },
          },
        },
      },
    });

    if (kelasConflict) {
      throw new Error(
        `Konflik jadwal kelas: ${kelasConflict.guruMapel.kelas.namaKelas} sudah ada jadwal ${kelasConflict.guruMapel.mapel.namaMapel} pada ${hari} jam ${kelasConflict.jamMulai}-${kelasConflict.jamSelesai}`,
      );
    }
  }

  /**
   * Get all jadwal with filters
   */
  static async getAll(
    query: PaginationQuery & {
      kelasId?: string;
      guruId?: string;
      hari?: string;
      tahunAjaranId?: string;
    },
  ): Promise<PaginationResult<any>> {
    const { skip, take, page, limit } = buildPaginationQuery(query);

    const where: Prisma.JadwalWhereInput = {
      ...(query.hari && { hari: query.hari }),
      ...(query.kelasId && {
        guruMapel: { id_kelas: parseInt(query.kelasId) },
      }),
      ...(query.guruId && {
        guruMapel: { id_guru: parseInt(query.guruId) },
      }),
      ...(query.tahunAjaranId && {
        guruMapel: { tahunAjaranId: parseInt(query.tahunAjaranId) },
      }),
      ...(query.search && {
        OR: [
          { guruMapel: { guru: { nama: { contains: query.search } } } },
          { guruMapel: { mapel: { namaMapel: { contains: query.search } } } },
          { hari: { contains: query.search } },
        ],
      }),
    };

    const [jadwal, total] = await Promise.all([
      prisma.jadwal.findMany({
        where,
        skip,
        take,
        orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
        include: {
          guruMapel: {
            include: {
              guru: {
                select: {
                  id_guru: true,
                  nip: true,
                  nama: true,
                },
              },
              mapel: {
                select: {
                  id_mapel: true,
                  namaMapel: true,
                  kelompokMapel: true,
                },
              },
              kelas: {
                select: {
                  id_kelas: true,
                  namaKelas: true,
                  tingkat: true,
                },
              },
              tahunAjaran: {
                select: {
                  id_tahun: true,
                  namaTahun: true,
                  semester: true,
                },
              },
            },
          },
        },
      }),
      prisma.jadwal.count({ where }),
    ]);

    return buildPaginationResult(jadwal, total, page, limit);
  }

  /**
   * Get jadwal by ID
   */
  static async getById(id: number) {
    const jadwal = await prisma.jadwal.findUnique({
      where: { id_jadwal: id },
      include: {
        guruMapel: {
          include: {
            guru: {
              select: {
                id_guru: true,
                nip: true,
                nama: true,
                email: true,
              },
            },
            mapel: {
              select: {
                id_mapel: true,
                namaMapel: true,
                kelompokMapel: true,
              },
            },
            kelas: {
              select: {
                id_kelas: true,
                namaKelas: true,
                tingkat: true,
                jurusan: true,
              },
            },
            tahunAjaran: {
              select: {
                id_tahun: true,
                namaTahun: true,
                semester: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!jadwal) {
      throw new Error("Jadwal not found");
    }

    return jadwal;
  }

  /**
   * Get jadwal for specific kelas
   */
  static async getByKelas(kelasId: number, tahunAjaranId?: number) {
    const where: Prisma.JadwalWhereInput = {
      guruMapel: {
        id_kelas: kelasId,
        ...(tahunAjaranId && { tahunAjaranId }),
      },
    };

    const jadwal = await prisma.jadwal.findMany({
      where,
      orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
      include: {
        guruMapel: {
          include: {
            guru: {
              select: {
                id_guru: true,
                nama: true,
              },
            },
            mapel: {
              select: {
                id_mapel: true,
                namaMapel: true,
                kelompokMapel: true,
              },
            },
            tahunAjaran: {
              select: {
                id_tahun: true,
                namaTahun: true,
                semester: true,
              },
            },
          },
        },
      },
    });

    return jadwal;
  }

  /**
   * Get jadwal for specific guru
   */
  static async getByGuru(guruId: number, tahunAjaranId?: number) {
    const where: Prisma.JadwalWhereInput = {
      guruMapel: {
        id_guru: guruId,
        ...(tahunAjaranId && { tahunAjaranId }),
      },
    };

    const jadwal = await prisma.jadwal.findMany({
      where,
      orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
      include: {
        guruMapel: {
          include: {
            mapel: {
              select: {
                id_mapel: true,
                namaMapel: true,
                kelompokMapel: true,
              },
            },
            kelas: {
              select: {
                id_kelas: true,
                namaKelas: true,
                tingkat: true,
              },
            },
            tahunAjaran: {
              select: {
                id_tahun: true,
                namaTahun: true,
                semester: true,
              },
            },
          },
        },
      },
    });

    return jadwal;
  }

  /**
   * Create new jadwal
   */
  static async create(data: CreateJadwalData) {
    // Validate hari
    this.validateHari(data.hari);

    // Validate time format
    this.validateTimeFormat(data.jamMulai);
    this.validateTimeFormat(data.jamSelesai);

    // Validate jamSelesai > jamMulai
    if (data.jamSelesai <= data.jamMulai) {
      throw new Error("Jam selesai harus lebih besar dari jam mulai");
    }

    // Check conflicts
    await this.checkConflict(
      data.guruMapelId,
      data.hari,
      data.jamMulai,
      data.jamSelesai,
    );

    const jadwal = await prisma.jadwal.create({
      data,
      include: {
        guruMapel: {
          include: {
            guru: {
              select: {
                id_guru: true,
                nama: true,
              },
            },
            mapel: {
              select: {
                id_mapel: true,
                namaMapel: true,
              },
            },
            kelas: {
              select: {
                id_kelas: true,
                namaKelas: true,
              },
            },
            tahunAjaran: {
              select: {
                id_tahun: true,
                namaTahun: true,
              },
            },
          },
        },
      },
    });

    return jadwal;
  }

  /**
   * Update jadwal
   */
  static async update(id: number, data: UpdateJadwalData) {
    const existing = await prisma.jadwal.findUnique({
      where: { id_jadwal: id },
    });

    if (!existing) {
      throw new Error("Jadwal not found");
    }

    // Validate hari if provided
    if (data.hari) {
      this.validateHari(data.hari);
    }

    // Validate time format if provided
    if (data.jamMulai) {
      this.validateTimeFormat(data.jamMulai);
    }
    if (data.jamSelesai) {
      this.validateTimeFormat(data.jamSelesai);
    }

    const jamMulai = data.jamMulai || existing.jamMulai;
    const jamSelesai = data.jamSelesai || existing.jamSelesai;

    // Validate jamSelesai > jamMulai
    if (jamSelesai <= jamMulai) {
      throw new Error("Jam selesai harus lebih besar dari jam mulai");
    }

    // Check conflicts if time or hari changed
    if (data.hari || data.jamMulai || data.jamSelesai || data.guruMapelId) {
      await this.checkConflict(
        data.guruMapelId || existing.guruMapelId,
        data.hari || existing.hari,
        jamMulai,
        jamSelesai,
        id, // exclude current jadwal from conflict check
      );
    }

    const updated = await prisma.jadwal.update({
      where: { id_jadwal: id },
      data,
      include: {
        guruMapel: {
          include: {
            guru: {
              select: {
                id_guru: true,
                nama: true,
              },
            },
            mapel: {
              select: {
                id_mapel: true,
                namaMapel: true,
              },
            },
            kelas: {
              select: {
                id_kelas: true,
                namaKelas: true,
              },
            },
            tahunAjaran: {
              select: {
                id_tahun: true,
                namaTahun: true,
              },
            },
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete jadwal
   */
  static async delete(id: number) {
    const jadwal = await prisma.jadwal.findUnique({
      where: { id_jadwal: id },
    });

    if (!jadwal) {
      throw new Error("Jadwal not found");
    }

    await prisma.jadwal.delete({
      where: { id_jadwal: id },
    });

    return { message: "Jadwal deleted successfully" };
  }

  /**
   * Get statistics
   */
  static async getStats(tahunAjaranId?: number) {
    const where: Prisma.JadwalWhereInput = tahunAjaranId
      ? { guruMapel: { tahunAjaranId } }
      : {};

    const [total, byHari, byKelas] = await Promise.all([
      prisma.jadwal.count({ where }),
      prisma.jadwal.groupBy({
        by: ["hari"],
        where,
        _count: {
          hari: true,
        },
      }),
      prisma.jadwal.groupBy({
        by: ["guruMapelId"],
        where,
        _count: {
          guruMapelId: true,
        },
      }),
    ]);

    return {
      total,
      byHari: byHari.map((item) => ({
        hari: item.hari,
        count: item._count.hari,
      })),
      totalKelasWithJadwal: byKelas.length,
    };
  }
}
