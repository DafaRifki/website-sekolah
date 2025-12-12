import { prisma } from "../config/database";
import { PaginationQuery, PaginationResult } from "../types";
import {
  buildPaginationQuery,
  buildPaginationResult,
  buildSearchFilter,
} from "../utils/database.util";
import { Prisma } from "@prisma/client";

interface CreateTarifData {
  namaTagihan: string;
  nominal: number;
  keterangan?: string;
  tahunAjaranId: number;
}

interface UpdateTarifData {
  namaTagihan?: string;
  nominal?: number;
  keterangan?: string;
  tahunAjaranId?: number;
}

export class TarifPembayaranService {
  /**
   * Get all tarif with pagination and search
   */
  static async getAll(query: PaginationQuery): Promise<PaginationResult<any>> {
    const { skip, take, page, limit } = buildPaginationQuery(query);

    const searchFilter = buildSearchFilter(query.search, [
      "jenisPembayaran",
      "keterangan",
    ]);

    const where: Prisma.TarifPembayaranWhereInput = {
      ...searchFilter,
    };

    const [tarif, total] = await Promise.all([
      prisma.tarifPembayaran.findMany({
        where,
        skip,
        take,
        include: {
          tahunAjaran: {
            select: {
              id_tahun: true,
              namaTahun: true,
              semester: true,
            },
          },
          tagihan: {
            select: {
              id_tagihan: true,
            },
          },
        },
        orderBy: { id_tarif: "desc" },
      }),
      prisma.tarifPembayaran.count({ where }),
    ]);

    const formatted = tarif.map((t) => ({
      id_tarif: t.id_tarif,
      namaTagihan: t.namaTagihan,
      nominal: t.nominal,
      keterangan: t.keterangan,
      tahunAjaranId: t.tahunAjaranId,
      tahunAjaran: t.tahunAjaran,
      totalTagihan: t.tagihan.length,
    }));

    return buildPaginationResult(formatted, total, page, limit);
  }

  /**
   * Get tarif by ID
   */
  static async getById(id: number) {
    const tarif = await prisma.tarifPembayaran.findUnique({
      where: { id_tarif: id },
      include: {
        tahunAjaran: true,
        tagihan: {
          include: {
            siswa: {
              select: {
                id_siswa: true,
                nama: true,
              },
            },
          },
        },
      },
    });

    if (!tarif) {
      throw new Error("Tarif pembayaran not found");
    }

    return tarif;
  }

  /**
   * Get tarif by tahun ajaran
   */
  static async getByTahunAjaran(tahunAjaranId: number) {
    const tarif = await prisma.tarifPembayaran.findMany({
      where: { tahunAjaranId },
      include: {
        tahunAjaran: true,
        tagihan: {
          select: {
            id_tagihan: true,
          },
        },
      },
      orderBy: { namaTagihan: "asc" },
    });

    return tarif.map((t) => ({
      ...t,
      totalTagihan: t.tagihan.length,
    }));
  }

  /**
   * Get tarif by jenis pembayaran
   */
  static async getByJenis(jenis: string, tahunAjaranId?: number) {
    const where: Prisma.TarifPembayaranWhereInput = {
      namaTagihan: {
        contains: jenis,
      },
    };

    if (tahunAjaranId) {
      where.tahunAjaranId = tahunAjaranId;
    }

    const tarif = await prisma.tarifPembayaran.findMany({
      where,
      include: {
        tahunAjaran: true,
      },
      orderBy: { id_tarif: "desc" },
    });

    return tarif;
  }

  /**
   * Create new tarif
   */
  static async create(data: CreateTarifData) {
    // Validate tahun ajaran exists
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id_tahun: data.tahunAjaranId },
    });

    if (!tahunAjaran) {
      throw new Error("Tahun ajaran not found");
    }

    // Check duplicate
    const existing = await prisma.tarifPembayaran.findFirst({
      where: {
        namaTagihan: data.namaTagihan,
        tahunAjaranId: data.tahunAjaranId,
      },
    });

    if (existing) {
      throw new Error(
        `Tarif ${data.namaTagihan} untuk tahun ajaran ${tahunAjaran.namaTahun} sudah ada`
      );
    }

    const tarif = await prisma.tarifPembayaran.create({
      data,
      include: {
        tahunAjaran: true,
      },
    });

    return tarif;
  }

  /**
   * Update tarif
   */
  static async update(id: number, data: UpdateTarifData) {
    const existing = await prisma.tarifPembayaran.findUnique({
      where: { id_tarif: id },
    });

    if (!existing) {
      throw new Error("Tarif pembayaran not found");
    }

    // If updating tahun ajaran, validate it exists
    if (data.tahunAjaranId) {
      const tahunAjaran = await prisma.tahunAjaran.findUnique({
        where: { id_tahun: data.tahunAjaranId },
      });

      if (!tahunAjaran) {
        throw new Error("Tahun ajaran not found");
      }
    }

    // Check duplicate if jenis or tahun ajaran changed
    if (data.namaTagihan || data.tahunAjaranId) {
      const duplicate = await prisma.tarifPembayaran.findFirst({
        where: {
          id_tarif: { not: id },
          namaTagihan: data.namaTagihan || existing.namaTagihan,
          tahunAjaranId: data.tahunAjaranId || existing.tahunAjaranId,
        },
      });

      if (duplicate) {
        throw new Error("Tarif dengan jenis dan tahun ajaran ini sudah ada");
      }
    }

    const tarif = await prisma.tarifPembayaran.update({
      where: { id_tarif: id },
      data,
      include: {
        tahunAjaran: true,
      },
    });

    return tarif;
  }

  /**
   * Delete tarif
   */
  static async delete(id: number) {
    const existing = await prisma.tarifPembayaran.findUnique({
      where: { id_tarif: id },
      include: {
        tagihan: true,
      },
    });

    if (!existing) {
      throw new Error("Tarif pembayaran not found");
    }

    // Check if has tagihan
    if (existing.tagihan.length > 0) {
      throw new Error(
        "Cannot delete tarif yang sudah memiliki tagihan. Hapus tagihan terlebih dahulu."
      );
    }

    await prisma.tarifPembayaran.delete({
      where: { id_tarif: id },
    });

    return { message: "Tarif pembayaran deleted successfully" };
  }

  /**
   * Get statistics
   */
  static async getStats() {
    const [total, byJenis, totalNominal] = await Promise.all([
      prisma.tarifPembayaran.count(),
      prisma.tarifPembayaran.groupBy({
        by: ["namaTagihan"],
        _count: true,
      }),
      prisma.tarifPembayaran.aggregate({
        _sum: {
          nominal: true,
        },
      }),
    ]);

    return {
      total,
      byJenis: byJenis.map((item) => ({
        jenisPembayaran: item.namaTagihan,
        count: item._count,
      })),
      totalNominal: totalNominal._sum.nominal || 0,
    };
  }

  /**
   * Get jenis pembayaran list (unique)
   */
  static async getJenisList() {
    const tarif = await prisma.tarifPembayaran.findMany({
      select: {
        namaTagihan: true,
      },
      distinct: ["namaTagihan"],
      orderBy: {
        namaTagihan: "asc",
      },
    });

    return tarif.map((t) => t.namaTagihan);
  }
}
