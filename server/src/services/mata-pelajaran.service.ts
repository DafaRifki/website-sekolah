import { Prisma } from "@prisma/client";
import { PaginationQuery, PaginationResult } from "../types";
import {
  buildPaginationQuery,
  buildPaginationResult,
  buildSearchFilter,
} from "../utils/database.util";
import prisma from "../config/database";

interface CreateMataPelajaranData {
  namaMapel: string;
  kelompokMapel?: string;
}

interface UpdateMataPelajaranData {
  namaMapel?: string;
  kelompokMapel?: string;
}

export class MataPelajaranService {
  /**
   *  Get all mata pelajaran with pagination and search
   */
  static async getAll(query: PaginationQuery): Promise<PaginationResult<any>> {
    const { skip, take, page, limit } = buildPaginationQuery(query);

    const searchFilter = buildSearchFilter(query.search, [
      "namaMapel",
      "kelompokMapel",
    ]);

    const where: Prisma.MataPelajaranWhereInput = {
      ...searchFilter,
      ...(query.kelompokMapel && query.kelompokMapel !== "all"
        ? { kelompokMapel: query.kelompokMapel }
        : {}),
    };

    const [mataPelajaran, total] = await Promise.all([
      prisma.mataPelajaran.findMany({
        where,
        skip,
        take,
        orderBy: { id_mapel: "desc" },
        select: {
          id_mapel: true,
          namaMapel: true,
          kelompokMapel: true,
          _count: {
            select: {
              nilai: true,
            },
          },
        },
      }),
      prisma.mataPelajaran.count({ where }),
    ]);

    // Format response
    const formatted = mataPelajaran.map((mapel) => ({
      id_mapel: mapel.id_mapel,
      namaMapel: mapel.namaMapel,
      kelompokMapel: mapel.kelompokMapel,
      jumlahNilai: mapel._count.nilai,
    }));

    return buildPaginationResult(formatted, total, page, limit);
  }

  /**
   * Get mata pelajaran by ID
   */
  static async getById(id: number) {
    const mataPelajaran = await prisma.mataPelajaran.findUnique({
      where: { id_mapel: id },
      include: {
        _count: {
          select: {
            nilai: true,
          },
        },
      },
    });
    if (!mataPelajaran) {
      throw new Error("Mata pelajaran not found");
    }
    return mataPelajaran;
  }

  /**
   * Create new mata pelajaran
   */
  static async create(data: CreateMataPelajaranData) {
    // check if mata pelajaran already exists
    const existing = await prisma.mataPelajaran.findFirst({
      where: {
        namaMapel: {
          equals: data.namaMapel,
        },
      },
    });

    if (existing) {
      throw new Error(`Mata Pelajaran "${data.namaMapel}" already exists`);
    }

    const mataPelajaran = await prisma.mataPelajaran.create({
      data: {
        namaMapel: data.namaMapel,
        kelompokMapel: data.kelompokMapel,
      },
    });

    return mataPelajaran;
  }

  /**
   * Update mata pelajaran
   */
  static async update(id: number, data: UpdateMataPelajaranData) {
    const existing = await prisma.mataPelajaran.findUnique({
      where: { id_mapel: id },
    });

    if (!existing) {
      throw new Error("Mata pelajaran not found");
    }

    // Check if new name already exists (if changing name)
    if (data.namaMapel && data.namaMapel !== existing.namaMapel) {
      const duplicate = await prisma.mataPelajaran.findFirst({
        where: {
          namaMapel: {
            equals: data.namaMapel,
          },
          id_mapel: {
            not: id,
          },
        },
      });

      if (duplicate) {
        throw new Error(`Mata pelajaran "${data.namaMapel}" already exists`);
      }
    }

    const updated = await prisma.mataPelajaran.update({
      where: { id_mapel: id },
      data,
    });

    return updated;
  }

  /**
   * Delete mata pelajaran
   */
  static async delete(id: number) {
    const mataPelajaran = await prisma.mataPelajaran.findUnique({
      where: { id_mapel: id },
      include: {
        nilai: true,
      },
    });

    if (!mataPelajaran) {
      throw new Error("Mata pelajaran not found");
    }

    // Check if mata pelajaran has nilai records
    if (mataPelajaran.nilai.length > 0) {
      throw new Error(
        `Cannot delete mata pelajaran with ${mataPelajaran.nilai.length} nilai records. Delete nilai first.`
      );
    }

    await prisma.mataPelajaran.delete({
      where: { id_mapel: id },
    });

    return { message: "Mata pelajaran deleted successfully" };
  }

  /**
   * Get statistics
   */
  static async getStats() {
    const [total, withNilai, byKelompok] = await Promise.all([
      prisma.mataPelajaran.count(),
      prisma.mataPelajaran.count({
        where: {
          nilai: {
            some: {},
          },
        },
      }),
      prisma.mataPelajaran.groupBy({
        by: ["kelompokMapel"],
        _count: {
          kelompokMapel: true,
        },
      }),
    ]);

    return {
      total,
      withNilai,
      withoutNilai: total - withNilai,
      byKelompok: byKelompok.map((item) => ({
        kelompok: item.kelompokMapel || "Tidak ada kelompok",
        count: item._count.kelompokMapel,
      })),
    };
  }

  /**
   * Get mata pelajaran by kelompok
   */
  static async getByKelompok(kelompok: string) {
    const mataPelajaran = await prisma.mataPelajaran.findMany({
      where: {
        kelompokMapel: kelompok,
      },
      orderBy: {
        namaMapel: "asc",
      },
      select: {
        id_mapel: true,
        namaMapel: true,
        kelompokMapel: true,
        _count: {
          select: {
            nilai: true,
          },
        },
      },
    });

    return mataPelajaran;
  }

  /**
   * Get all kelompok mapel (unique)
   */
  static async getKelompokList() {
    const kelompoks = await prisma.mataPelajaran.findMany({
      where: {
        kelompokMapel: {
          not: null,
        },
      },
      select: {
        kelompokMapel: true,
      },
      distinct: ["kelompokMapel"],
      orderBy: {
        kelompokMapel: "asc",
      },
    });

    return kelompoks
      .map((k) => k.kelompokMapel)
      .filter((k): k is string => k !== null);
  }
}
