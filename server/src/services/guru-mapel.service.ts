import { Prisma } from "@prisma/client";
import { PaginationQuery, PaginationResult } from "../types";
import {
  buildPaginationQuery,
  buildPaginationResult,
  buildSearchFilter,
} from "../utils/database.util";
import { prisma } from "../config/database";

interface CreateGuruMapelData {
  id_guru: number;
  id_mapel: number;
  id_kelas: number;
  tahunAjaranId: number;
}

interface UpdateGuruMapelData {
  id_guru?: number;
  id_mapel?: number;
  id_kelas?: number;
  tahunAjaranId?: number;
}

export class GuruMapelService {
  /**
   * Get all guru mapel with pagination and filters
   */
  static async getAll(
    query: PaginationQuery & {
      tahunAjaranId?: string;
      kelasId?: string;
      guruId?: string;
      mapelId?: string;
    },
  ): Promise<PaginationResult<any>> {
    const { skip, take, page, limit } = buildPaginationQuery(query);

    const where: Prisma.GuruMapelWhereInput = {
      ...(query.tahunAjaranId && {
        tahunAjaranId: parseInt(query.tahunAjaranId),
      }),
      ...(query.kelasId && { id_kelas: parseInt(query.kelasId) }),
      ...(query.guruId && { id_guru: parseInt(query.guruId) }),
      ...(query.mapelId && { id_mapel: parseInt(query.mapelId) }),
      ...(query.search && {
        OR: [
          { guru: { nama: { contains: query.search } } },
          { mapel: { namaMapel: { contains: query.search } } },
          { kelas: { namaKelas: { contains: query.search } } },
        ],
      }),
    };

    const [guruMapel, total] = await Promise.all([
      prisma.guruMapel.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
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
          _count: {
            select: {
              jadwal: true,
            },
          },
        },
      }),
      prisma.guruMapel.count({ where }),
    ]);

    return buildPaginationResult(guruMapel, total, page, limit);
  }

  /**
   * Get guru mapel by ID
   */
  static async getById(id: number) {
    const guruMapel = await prisma.guruMapel.findUnique({
      where: { id },
      include: {
        guru: {
          select: {
            id_guru: true,
            nip: true,
            nama: true,
            email: true,
            noHP: true,
          },
        },
        mapel: {
          select: {
            id_mapel: true,
            namaMapel: true,
            kelompokMapel: true,
            deskripsi: true,
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
            startDate: true,
            endDate: true,
          },
        },
        jadwal: {
          select: {
            id_jadwal: true,
            hari: true,
            jamMulai: true,
            jamSelesai: true,
            ruangan: true,
          },
          orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
        },
      },
    });

    if (!guruMapel) {
      throw new Error("Guru mapel assignment not found");
    }

    return guruMapel;
  }

  /**
   * Get all assignments for specific guru
   */
  static async getByGuru(guruId: number, tahunAjaranId?: number) {
    const where: Prisma.GuruMapelWhereInput = {
      id_guru: guruId,
      ...(tahunAjaranId && { tahunAjaranId }),
    };

    const assignments = await prisma.guruMapel.findMany({
      where,
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
        _count: {
          select: {
            jadwal: true,
          },
        },
      },
      orderBy: [{ tahunAjaranId: "desc" }, { kelas: { namaKelas: "asc" } }],
    });

    return assignments;
  }

  /**
   * Get all assignments for specific kelas
   */
  static async getByKelas(kelasId: number, tahunAjaranId?: number) {
    const where: Prisma.GuruMapelWhereInput = {
      id_kelas: kelasId,
      ...(tahunAjaranId && { tahunAjaranId }),
    };

    const assignments = await prisma.guruMapel.findMany({
      where,
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
        tahunAjaran: {
          select: {
            id_tahun: true,
            namaTahun: true,
            semester: true,
            isActive: true,
          },
        },
      },
      orderBy: [
        { mapel: { kelompokMapel: "asc" } },
        { mapel: { namaMapel: "asc" } },
      ],
    });

    return assignments;
  }

  /**
   * Create new guru mapel assignment
   */
  static async create(data: CreateGuruMapelData) {
    // Validate guru exists
    const guru = await prisma.guru.findUnique({
      where: { id_guru: data.id_guru },
    });

    if (!guru) {
      throw new Error("Guru not found");
    }

    // Validate mapel exists
    const mapel = await prisma.mataPelajaran.findUnique({
      where: { id_mapel: data.id_mapel },
    });

    if (!mapel) {
      throw new Error("Mata pelajaran not found");
    }

    // Validate kelas exists
    const kelas = await prisma.kelas.findUnique({
      where: { id_kelas: data.id_kelas },
    });

    if (!kelas) {
      throw new Error("Kelas not found");
    }

    // Validate tahun ajaran exists
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id_tahun: data.tahunAjaranId },
    });

    if (!tahunAjaran) {
      throw new Error("Tahun ajaran not found");
    }

    // Check for duplicate assignment
    const existing = await prisma.guruMapel.findFirst({
      where: {
        id_guru: data.id_guru,
        id_mapel: data.id_mapel,
        id_kelas: data.id_kelas,
        tahunAjaranId: data.tahunAjaranId,
      },
    });

    if (existing) {
      throw new Error(
        `${guru.nama} sudah ditugaskan mengajar ${mapel.namaMapel} di kelas ${kelas.namaKelas} untuk tahun ajaran ${tahunAjaran.namaTahun}`,
      );
    }

    const guruMapel = await prisma.guruMapel.create({
      data,
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
          },
        },
        tahunAjaran: {
          select: {
            id_tahun: true,
            namaTahun: true,
          },
        },
      },
    });

    return guruMapel;
  }

  /**
   * Update guru mapel assignment
   */
  static async update(id: number, data: UpdateGuruMapelData) {
    const existing = await prisma.guruMapel.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Guru mapel assignment not found");
    }

    // Check for duplicate if any key field is being changed
    if (data.id_guru || data.id_mapel || data.id_kelas || data.tahunAjaranId) {
      const duplicate = await prisma.guruMapel.findFirst({
        where: {
          id_guru: data.id_guru || existing.id_guru,
          id_mapel: data.id_mapel || existing.id_mapel,
          id_kelas: data.id_kelas || existing.id_kelas,
          tahunAjaranId: data.tahunAjaranId || existing.tahunAjaranId,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new Error("Duplicate assignment already exists");
      }
    }

    const updated = await prisma.guruMapel.update({
      where: { id },
      data,
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
          },
        },
        tahunAjaran: {
          select: {
            id_tahun: true,
            namaTahun: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete guru mapel assignment
   */
  static async delete(id: number) {
    const guruMapel = await prisma.guruMapel.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            jadwal: true,
          },
        },
      },
    });

    if (!guruMapel) {
      throw new Error("Guru mapel assignment not found");
    }

    // Check if has jadwal
    if (guruMapel._count.jadwal > 0) {
      throw new Error(
        `Cannot delete assignment with ${guruMapel._count.jadwal} jadwal records. Delete jadwal first.`,
      );
    }

    await prisma.guruMapel.delete({
      where: { id },
    });

    return { message: "Guru mapel assignment deleted successfully" };
  }

  /**
   * Get statistics
   */
  static async getStats(tahunAjaranId?: number) {
    const where: Prisma.GuruMapelWhereInput = tahunAjaranId
      ? { tahunAjaranId }
      : {};

    const [total, byGuru, byMapel, byKelas] = await Promise.all([
      prisma.guruMapel.count({ where }),
      prisma.guruMapel.groupBy({
        by: ["id_guru"],
        where,
        _count: {
          id_guru: true,
        },
      }),
      prisma.guruMapel.groupBy({
        by: ["id_mapel"],
        where,
        _count: {
          id_mapel: true,
        },
      }),
      prisma.guruMapel.groupBy({
        by: ["id_kelas"],
        where,
        _count: {
          id_kelas: true,
        },
      }),
    ]);

    return {
      total,
      totalGuru: byGuru.length,
      totalMapel: byMapel.length,
      totalKelas: byKelas.length,
      averagePerGuru: byGuru.length > 0 ? total / byGuru.length : 0,
    };
  }
}
