import { prisma } from "../config/database";
import { PaginationQuery, PaginationResult } from "../types";
import {
  buildPaginationQuery,
  buildPaginationResult,
} from "../utils/database.util";
import { Prisma, StatusTagihan } from "@prisma/client";

interface CreatePembayaranData {
  tagihanId: number;
  jumlahBayar: number;
  metode?: string; // CASH, TRANSFER, etc.
  keterangan?: string;
  tanggal?: Date;
}

interface UpdatePembayaranData {
  jumlahBayar?: number;
  metode?: string;
  keterangan?: string;
  tanggal?: Date;
}

export class PembayaranService {
  /**
   * Get all pembayaran with pagination
   */
  static async getAll(query: PaginationQuery): Promise<PaginationResult<any>> {
    const { skip, take, page, limit } = buildPaginationQuery(query);

    const where: Prisma.PembayaranWhereInput = {};

    // Filter by search (siswa name or tagihan id)
    if (query.search) {
      where.OR = [
        {
          tagihan: {
            siswa: {
              nama: {
                contains: query.search,
              },
            },
          },
        },
        {
          tagihan: {
            tarif: {
              namaTagihan: {
                contains: query.search,
              },
            },
          },
        },
      ];
    }

    const [pembayaran, total] = await Promise.all([
      prisma.pembayaran.findMany({
        where,
        skip,
        take,
        include: {
          tagihan: {
            include: {
              siswa: {
                select: {
                  id_siswa: true,
                  nama: true,
                  kelas: {
                    select: {
                      namaKelas: true,
                    },
                  },
                },
              },
              tarif: {
                select: {
                  id_tarif: true,
                  namaTagihan: true,
                  nominal: true,
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
        orderBy: { id_pembayaran: "desc" },
      }),
      prisma.pembayaran.count({ where }),
    ]);

    const formatted = pembayaran.map((p) => ({
      id_pembayaran: p.id_pembayaran,
      tagihanId: p.tagihanId,
      siswa: p.tagihan.siswa,
      namaTagihan: p.tagihan.tarif.namaTagihan,
      nominalTagihan: p.tagihan.tarif.nominal,
      jumlahBayar: p.jumlahBayar,
      metode: p.metode,
      tanggal: p.tanggal,
      keterangan: p.keterangan,
      tahunAjaran: p.tagihan.tahunAjaran,
    }));

    return buildPaginationResult(formatted, total, page, limit);
  }

  /**
   * Get pembayaran by ID
   */
  static async getById(id: number) {
    const pembayaran = await prisma.pembayaran.findUnique({
      where: { id_pembayaran: id },
      include: {
        tagihan: {
          include: {
            siswa: {
              include: {
                kelas: true,
              },
            },
            tarif: true,
            tahunAjaran: true,
            pembayaran: {
              select: {
                id_pembayaran: true,
                jumlahBayar: true,
                tanggal: true,
                metode: true,
              },
            },
          },
        },
      },
    });

    if (!pembayaran) {
      throw new Error("Pembayaran not found");
    }

    // Calculate remaining balance
    const totalBayar = pembayaran.tagihan.pembayaran.reduce(
      (sum, p) => sum + p.jumlahBayar,
      0
    );

    return {
      ...pembayaran,
      totalBayarSebelumnya: totalBayar - pembayaran.jumlahBayar,
      totalBayarSekarang: totalBayar,
      sisaPembayaran: pembayaran.tagihan.tarif.nominal - totalBayar,
    };
  }

  /**
   * Get pembayaran by siswa
   */
  static async getBySiswa(
    siswaId: number,
    tahunAjaranId?: number
  ): Promise<any[]> {
    const where: Prisma.PembayaranWhereInput = {
      tagihan: {
        id_siswa: siswaId,
      },
    };

    if (tahunAjaranId) {
      where.tagihan = {
        id_siswa: siswaId,
        tahunAjaranId: tahunAjaranId,
      };
    }

    const pembayaran = await prisma.pembayaran.findMany({
      where,
      include: {
        tagihan: {
          include: {
            tarif: true,
            tahunAjaran: true,
          },
        },
      },
      orderBy: { tanggal: "desc" },
    });

    return pembayaran.map((p) => ({
      ...p,
      nominalTagihan: p.tagihan.tarif.nominal,
      namaTagihan: p.tagihan.tarif.namaTagihan,
    }));
  }

  /**
   * Get payment history for a tagihan
   */
  static async getByTagihan(tagihanId: number) {
    const tagihan = await prisma.tagihan.findUnique({
      where: { id_tagihan: tagihanId },
      include: {
        pembayaran: {
          orderBy: { tanggal: "desc" },
        },
        tarif: true,
        siswa: true,
      },
    });

    if (!tagihan) {
      throw new Error("Tagihan not found");
    }

    const totalBayar = tagihan.pembayaran.reduce(
      (sum, p) => sum + p.jumlahBayar,
      0
    );

    return {
      tagihan: {
        id_tagihan: tagihan.id_tagihan,
        siswa: tagihan.siswa.nama,
        namaTagihan: tagihan.tarif.namaTagihan,
        nominalTagihan: tagihan.tarif.nominal,
        status: tagihan.status,
      },
      pembayaran: tagihan.pembayaran,
      totalBayar,
      sisaPembayaran: tagihan.tarif.nominal - totalBayar,
    };
  }

  /**
   * Create pembayaran
   */
  static async create(data: CreatePembayaranData) {
    // Validate tagihan exists
    const tagihan = await prisma.tagihan.findUnique({
      where: { id_tagihan: data.tagihanId },
      include: {
        tarif: true,
        pembayaran: true,
      },
    });

    if (!tagihan) {
      throw new Error("Tagihan not found");
    }

    // Validate jumlah bayar
    if (data.jumlahBayar <= 0) {
      throw new Error("Jumlah bayar harus lebih dari 0");
    }

    // Calculate total that would be paid
    const totalBayarSebelumnya = tagihan.pembayaran.reduce(
      (sum, p) => sum + p.jumlahBayar,
      0
    );
    const totalBayarSekarang = totalBayarSebelumnya + data.jumlahBayar;

    // Validate tidak melebihi nominal tagihan
    if (totalBayarSekarang > tagihan.tarif.nominal) {
      throw new Error(
        `Total pembayaran (${totalBayarSekarang}) melebihi nominal tagihan (${tagihan.tarif.nominal})`
      );
    }

    // Create pembayaran
    const pembayaran = await prisma.pembayaran.create({
      data: {
        tagihanId: data.tagihanId,
        jumlahBayar: data.jumlahBayar,
        metode: data.metode,
        keterangan: data.keterangan,
        tanggal: data.tanggal || new Date(),
      },
      include: {
        tagihan: {
          include: {
            siswa: true,
            tarif: true,
          },
        },
      },
    });

    // Auto-update tagihan status
    await this.autoUpdateTagihanStatus(data.tagihanId);

    return pembayaran;
  }

  /**
   * Update pembayaran
   */
  static async update(id: number, data: UpdatePembayaranData) {
    const existing = await prisma.pembayaran.findUnique({
      where: { id_pembayaran: id },
      include: {
        tagihan: {
          include: {
            tarif: true,
            pembayaran: true,
          },
        },
      },
    });

    if (!existing) {
      throw new Error("Pembayaran not found");
    }

    // If updating jumlah bayar, validate
    if (data.jumlahBayar && data.jumlahBayar > 0) {
      const totalBayarLain = existing.tagihan.pembayaran
        .filter((p) => p.id_pembayaran !== id)
        .reduce((sum, p) => sum + p.jumlahBayar, 0);

      const totalBayarSekarang = totalBayarLain + data.jumlahBayar;

      if (totalBayarSekarang > existing.tagihan.tarif.nominal) {
        throw new Error(
          `Total pembayaran (${totalBayarSekarang}) melebihi nominal tagihan (${existing.tagihan.tarif.nominal})`
        );
      }
    }

    const pembayaran = await prisma.pembayaran.update({
      where: { id_pembayaran: id },
      data: {
        jumlahBayar: data.jumlahBayar,
        metode: data.metode,
        keterangan: data.keterangan,
        tanggal: data.tanggal,
      },
      include: {
        tagihan: {
          include: {
            siswa: true,
            tarif: true,
          },
        },
      },
    });

    // Auto-update tagihan status
    await this.autoUpdateTagihanStatus(existing.tagihanId);

    return pembayaran;
  }

  /**
   * Delete pembayaran
   */
  static async delete(id: number) {
    const existing = await prisma.pembayaran.findUnique({
      where: { id_pembayaran: id },
    });

    if (!existing) {
      throw new Error("Pembayaran not found");
    }

    const tagihanId = existing.tagihanId;

    await prisma.pembayaran.delete({
      where: { id_pembayaran: id },
    });

    // Auto-update tagihan status after deletion
    await this.autoUpdateTagihanStatus(tagihanId);

    return { message: "Pembayaran deleted successfully" };
  }

  /**
   * Auto-update tagihan status based on total pembayaran
   */
  private static async autoUpdateTagihanStatus(tagihanId: number) {
    const tagihan = await prisma.tagihan.findUnique({
      where: { id_tagihan: tagihanId },
      include: {
        pembayaran: true,
        tarif: true,
      },
    });

    if (!tagihan) return;

    const totalBayar = tagihan.pembayaran.reduce(
      (sum, p) => sum + p.jumlahBayar,
      0
    );

    let newStatus: StatusTagihan;

    if (totalBayar === 0) {
      newStatus = StatusTagihan.BELUM_BAYAR;
    } else if (totalBayar >= tagihan.tarif.nominal) {
      newStatus = StatusTagihan.LUNAS;
    } else {
      newStatus = StatusTagihan.CICIL;
    }

    if (tagihan.status !== newStatus) {
      await prisma.tagihan.update({
        where: { id_tagihan: tagihanId },
        data: { status: newStatus },
      });
    }
  }

  /**
   * Get statistics
   */
  static async getStats(tahunAjaranId?: number) {
    const where: Prisma.PembayaranWhereInput = {};

    if (tahunAjaranId) {
      where.tagihan = {
        tahunAjaranId: tahunAjaranId,
      };
    }

    const [total, allPembayaran] = await Promise.all([
      prisma.pembayaran.count({ where }),
      prisma.pembayaran.findMany({
        where,
        include: {
          tagihan: {
            include: {
              tarif: true,
            },
          },
        },
      }),
    ]);

    // Calculate statistics
    let totalBayar = 0;
    const metodeCounts: Record<string, number> = {};

    allPembayaran.forEach((p) => {
      totalBayar += p.jumlahBayar;
      const metode = p.metode || "UNKNOWN";
      metodeCounts[metode] = (metodeCounts[metode] || 0) + 1;
    });

    // Count by metode with amounts
    const byMetode = Object.entries(metodeCounts).map(([metode, count]) => ({
      metode,
      count,
    }));

    return {
      total,
      totalBayar,
      byMetode,
      rataRataBayar: total > 0 ? totalBayar / total : 0,
    };
  }

  /**
   * Get pembayaran by date range
   */
  static async getByDateRange(
    startDate: Date,
    endDate: Date,
    tahunAjaranId?: number
  ) {
    const where: Prisma.PembayaranWhereInput = {
      tanggal: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (tahunAjaranId) {
      where.tagihan = {
        tahunAjaranId: tahunAjaranId,
      };
    }

    const pembayaran = await prisma.pembayaran.findMany({
      where,
      include: {
        tagihan: {
          include: {
            siswa: {
              select: {
                id_siswa: true,
                nama: true,
              },
            },
            tarif: {
              select: {
                namaTagihan: true,
                nominal: true,
              },
            },
          },
        },
      },
      orderBy: { tanggal: "desc" },
    });

    const totalBayar = pembayaran.reduce((sum, p) => sum + p.jumlahBayar, 0);

    return {
      count: pembayaran.length,
      totalBayar,
      pembayaran: pembayaran.map((p) => ({
        id_pembayaran: p.id_pembayaran,
        siswa: p.tagihan.siswa.nama,
        namaTagihan: p.tagihan.tarif.namaTagihan,
        jumlahBayar: p.jumlahBayar,
        metode: p.metode,
        tanggal: p.tanggal,
      })),
    };
  }

  /**
   * Get payment receipt (for printing)
   */
  static async getReceipt(id: number) {
    const pembayaran = await this.getById(id);

    return {
      receipt_number: `KWT-${pembayaran.id_pembayaran}-${
        new Date(pembayaran.tanggal).toISOString().split("T")[0]
      }`,
      siswa: pembayaran.tagihan.siswa.nama,
      kelas: pembayaran.tagihan.siswa.kelas?.namaKelas,
      namaTagihan: pembayaran.tagihan.tarif.namaTagihan,
      nominalTagihan: pembayaran.tagihan.tarif.nominal,
      jumlahBayar: pembayaran.jumlahBayar,
      metode: pembayaran.metode,
      tanggal: pembayaran.tanggal,
      keterangan: pembayaran.keterangan,
      totalBayarSebelumnya: pembayaran.totalBayarSebelumnya,
      sisaPembayaran: pembayaran.sisaPembayaran,
      tahunAjaran: pembayaran.tagihan.tahunAjaran.namaTahun,
    };
  }

  /**
   * Bulk create pembayaran (dari CSV/Excel)
   */
  static async createBulk(data: CreatePembayaranData[]) {
    const results = {
      success: [] as any[],
      failed: [] as any[],
    };

    for (const item of data) {
      try {
        const pembayaran = await this.create(item);
        results.success.push({
          id_pembayaran: pembayaran.id_pembayaran,
          tagihanId: item.tagihanId,
          jumlahBayar: item.jumlahBayar,
        });
      } catch (error: any) {
        results.failed.push({
          tagihanId: item.tagihanId,
          jumlahBayar: item.jumlahBayar,
          error: error.message,
        });
      }
    }

    return results;
  }
}
