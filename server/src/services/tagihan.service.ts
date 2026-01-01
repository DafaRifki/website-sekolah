import { prisma } from "../config/database";
import { PaginationQuery, PaginationResult } from "../types";
import {
  buildPaginationQuery,
  buildPaginationResult,
  buildSearchFilter,
} from "../utils/database.util";
import { Prisma, StatusTagihan } from "@prisma/client";

interface CreateTagihanData {
  id_siswa: number;
  tarifId: number;
  tahunAjaranId: number;
  bulan?: string;
  status?: StatusTagihan;
}

interface UpdateTagihanData {
  status?: StatusTagihan;
  bulan?: string;
}

interface GenerateBulkTagihanData {
  tarifId: number;
  tahunAjaranId: number;
  bulan?: string;
  siswaIds?: number[]; // If empty, generate for all active students
}

export class TagihanService {
  /**
   * Get all tagihan with pagination
   */
  static async getAll(query: PaginationQuery): Promise<PaginationResult<any>> {
    const { skip, take, page, limit } = buildPaginationQuery(query);

    const where: Prisma.TagihanWhereInput = {};

    // Filter by search if provided
    if (query.search) {
      where.OR = [
        {
          siswa: {
            nama: {
              contains: query.search,
            },
          },
        },
        {
          tarif: {
            namaTagihan: {
              contains: query.search,
            },
          },
        },
      ];
    }

    // Filter by tahunAjaranId if provided
    if (query.tahunAjaranId) {
      where.tahunAjaranId = parseInt(query.tahunAjaranId as string);
    }

    // Filter by status if provided
    if (query.status && query.status !== "all") {
      where.status = query.status as StatusTagihan;
    }

    const [tagihan, total] = await Promise.all([
      prisma.tagihan.findMany({
        where,
        skip,
        take,
        include: {
          siswa: {
            select: {
              id_siswa: true,
              nama: true,
              kelas: {
                select: {
                  id_kelas: true,
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
              semester: true,
            },
          },
          pembayaran: {
            select: {
              id_pembayaran: true,
              jumlahBayar: true,
            },
          },
        },
        orderBy: { id_tagihan: "desc" },
      }),
      prisma.tagihan.count({ where }),
    ]);

    const formatted = tagihan.map((t) => {
      const totalBayar = t.pembayaran.reduce(
        (sum, p) => sum + p.jumlahBayar,
        0
      );
      const sisa = t.tarif.nominal - totalBayar;

      return {
        id_tagihan: t.id_tagihan,
        siswa: t.siswa,
        tarif: t.tarif,
        tahunAjaran: t.tahunAjaran,
        bulan: t.bulan,
        status: t.status,
        totalBayar,
        sisaPembayaran: sisa,
        jumlahPembayaran: t.pembayaran.length,
      };
    });

    return buildPaginationResult(formatted, total, page, limit);
  }

  /**
   * Get tagihan by ID
   */
  static async getById(id: number) {
    const tagihan = await prisma.tagihan.findUnique({
      where: { id_tagihan: id },
      include: {
        siswa: {
          include: {
            kelas: true,
          },
        },
        tarif: true,
        tahunAjaran: true,
        pembayaran: {
          orderBy: { tanggal: "desc" },
        },
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
      ...tagihan,
      totalBayar,
      sisaPembayaran: tagihan.tarif.nominal - totalBayar,
    };
  }

  /**
   * Get tagihan by siswa
   */
  static async getBySiswa(
    siswaId: number,
    tahunAjaranId?: number,
    status?: StatusTagihan
  ) {
    const where: Prisma.TagihanWhereInput = {
      id_siswa: siswaId,
    };

    if (tahunAjaranId) {
      where.tahunAjaranId = tahunAjaranId;
    }

    if (status) {
      where.status = status;
    }

    const tagihan = await prisma.tagihan.findMany({
      where,
      include: {
        tarif: true,
        tahunAjaran: true,
        pembayaran: {
          select: {
            id_pembayaran: true,
            jumlahBayar: true,
            tanggal: true,
          },
        },
      },
      orderBy: { id_tagihan: "desc" },
    });

    return tagihan.map((t) => {
      const totalBayar = t.pembayaran.reduce(
        (sum, p) => sum + p.jumlahBayar,
        0
      );

      return {
        ...t,
        totalBayar,
        sisaPembayaran: t.tarif.nominal - totalBayar,
      };
    });
  }

  /**
   * Get outstanding tagihan (belum lunas)
   */
  static async getOutstanding(tahunAjaranId?: number) {
    const where: Prisma.TagihanWhereInput = {
      status: {
        in: [StatusTagihan.BELUM_BAYAR, StatusTagihan.CICIL],
      },
    };

    if (tahunAjaranId) {
      where.tahunAjaranId = tahunAjaranId;
    }

    const tagihan = await prisma.tagihan.findMany({
      where,
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
        tarif: true,
        pembayaran: {
          select: {
            jumlahBayar: true,
          },
        },
      },
      orderBy: [{ tahunAjaranId: "desc" }, { id_siswa: "asc" }],
    });

    return tagihan.map((t) => {
      const totalBayar = t.pembayaran.reduce(
        (sum, p) => sum + p.jumlahBayar,
        0
      );

      return {
        id_tagihan: t.id_tagihan,
        siswa: t.siswa,
        tarif: t.tarif,
        bulan: t.bulan,
        status: t.status,
        totalBayar,
        sisaPembayaran: t.tarif.nominal - totalBayar,
      };
    });
  }

  /**
   * Create single tagihan
   */
  static async create(data: CreateTagihanData) {
    // Validate siswa exists
    const siswa = await prisma.siswa.findUnique({
      where: { id_siswa: data.id_siswa },
    });

    if (!siswa) {
      throw new Error("Siswa not found");
    }

    // Validate tarif exists
    const tarif = await prisma.tarifPembayaran.findUnique({
      where: { id_tarif: data.tarifId },
    });

    if (!tarif) {
      throw new Error("Tarif pembayaran not found");
    }

    // Validate tahun ajaran exists
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id_tahun: data.tahunAjaranId },
    });

    if (!tahunAjaran) {
      throw new Error("Tahun ajaran not found");
    }

    // Check duplicate (unique constraint: id_siswa, tarifId, tahunAjaranId, bulan)
    const existing = await prisma.tagihan.findFirst({
      where: {
        id_siswa: data.id_siswa,
        tarifId: data.tarifId,
        tahunAjaranId: data.tahunAjaranId,
        bulan: data.bulan || null,
      },
    });

    if (existing) {
      throw new Error(
        `Tagihan untuk siswa ini dengan tarif "${
          tarif.namaTagihan
        }" di tahun ajaran ${tahunAjaran.namaTahun} ${
          data.bulan ? `bulan ${data.bulan}` : ""
        } sudah ada`
      );
    }

    const tagihan = await prisma.tagihan.create({
      data: {
        id_siswa: data.id_siswa,
        tarifId: data.tarifId,
        tahunAjaranId: data.tahunAjaranId,
        bulan: data.bulan,
        status: data.status || StatusTagihan.BELUM_BAYAR,
      },
      include: {
        siswa: true,
        tarif: true,
        tahunAjaran: true,
      },
    });

    return tagihan;
  }

  /**
   * Generate bulk tagihan
   */
  static async generateBulk(data: GenerateBulkTagihanData) {
    // Validate tarif exists
    const tarif = await prisma.tarifPembayaran.findUnique({
      where: { id_tarif: data.tarifId },
    });

    if (!tarif) {
      throw new Error("Tarif pembayaran not found");
    }

    // Validate tahun ajaran exists
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id_tahun: data.tahunAjaranId },
    });

    if (!tahunAjaran) {
      throw new Error("Tahun ajaran not found");
    }

    // Get siswa list
    let siswaList;
    if (data.siswaIds && data.siswaIds.length > 0) {
      siswaList = await prisma.siswa.findMany({
        where: {
          id_siswa: {
            in: data.siswaIds,
          },
        },
      });
    } else {
      // Get all active siswa
      siswaList = await prisma.siswa.findMany();
    }

    if (siswaList.length === 0) {
      throw new Error("No siswa found");
    }

    // Generate tagihan for each siswa
    const created = [];
    const skipped = [];

    for (const siswa of siswaList) {
      // Check if tagihan already exists
      const existing = await prisma.tagihan.findFirst({
        where: {
          id_siswa: siswa.id_siswa,
          tarifId: data.tarifId,
          tahunAjaranId: data.tahunAjaranId,
          bulan: data.bulan || null,
        },
      });

      if (existing) {
        skipped.push({
          siswa: siswa.nama,
          reason: "Tagihan already exists",
        });
        continue;
      }

      try {
        const tagihan = await prisma.tagihan.create({
          data: {
            id_siswa: siswa.id_siswa,
            tarifId: data.tarifId,
            tahunAjaranId: data.tahunAjaranId,
            bulan: data.bulan,
            status: StatusTagihan.BELUM_BAYAR,
          },
        });

        created.push({
          id_tagihan: tagihan.id_tagihan,
          siswa: siswa.nama,
        });
      } catch (error: any) {
        skipped.push({
          siswa: siswa.nama,
          reason: error.message,
        });
      }
    }

    return {
      success: true,
      created: created.length,
      skipped: skipped.length,
      details: {
        created,
        skipped,
      },
    };
  }

  /**
   * Update tagihan status
   */
  static async updateStatus(id: number, status: StatusTagihan) {
    const existing = await prisma.tagihan.findUnique({
      where: { id_tagihan: id },
      include: {
        pembayaran: true,
        tarif: true,
      },
    });

    if (!existing) {
      throw new Error("Tagihan not found");
    }

    // Auto-calculate status based on pembayaran if status is LUNAS
    if (status === StatusTagihan.LUNAS) {
      const totalBayar = existing.pembayaran.reduce(
        (sum, p) => sum + p.jumlahBayar,
        0
      );

      if (totalBayar < existing.tarif.nominal) {
        throw new Error(
          `Cannot mark as LUNAS. Pembayaran (${totalBayar}) belum mencapai nominal tarif (${existing.tarif.nominal})`
        );
      }
    }

    const tagihan = await prisma.tagihan.update({
      where: { id_tagihan: id },
      data: { status },
      include: {
        siswa: true,
        tarif: true,
        tahunAjaran: true,
      },
    });

    return tagihan;
  }

  /**
   * Auto-update status based on pembayaran
   */
  static async autoUpdateStatus(tagihanId: number) {
    const tagihan = await prisma.tagihan.findUnique({
      where: { id_tagihan: tagihanId },
      include: {
        pembayaran: true,
        tarif: true,
      },
    });

    if (!tagihan) {
      throw new Error("Tagihan not found");
    }

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

    // Only update if status changed
    if (tagihan.status !== newStatus) {
      await prisma.tagihan.update({
        where: { id_tagihan: tagihanId },
        data: { status: newStatus },
      });
    }

    return newStatus;
  }

  /**
   * Delete tagihan
   */
  static async delete(id: number) {
    const existing = await prisma.tagihan.findUnique({
      where: { id_tagihan: id },
      include: {
        pembayaran: true,
      },
    });

    if (!existing) {
      throw new Error("Tagihan not found");
    }

    // Check if has pembayaran
    if (existing.pembayaran.length > 0) {
      throw new Error(
        "Cannot delete tagihan yang sudah memiliki pembayaran. Hapus pembayaran terlebih dahulu."
      );
    }

    await prisma.tagihan.delete({
      where: { id_tagihan: id },
    });

    return { message: "Tagihan deleted successfully" };
  }

  /**
   * Get statistics
   */
  static async getStats(tahunAjaranId?: number) {
    const where: Prisma.TagihanWhereInput = {};

    if (tahunAjaranId) {
      where.tahunAjaranId = tahunAjaranId;
    }

    const [total, byStatus, allTagihan] = await Promise.all([
      prisma.tagihan.count({ where }),
      prisma.tagihan.groupBy({
        by: ["status"],
        where,
        _count: true,
      }),
      prisma.tagihan.findMany({
        where,
        include: {
          tarif: {
            select: {
              nominal: true,
            },
          },
          pembayaran: {
            select: {
              jumlahBayar: true,
            },
          },
        },
      }),
    ]);

    let totalTagihan = 0;
    let totalBayar = 0;

    allTagihan.forEach((t) => {
      totalTagihan += t.tarif.nominal;
      const bayar = t.pembayaran.reduce((sum, p) => sum + p.jumlahBayar, 0);
      totalBayar += bayar;
    });

    return {
      total,
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      totalTagihan,
      totalBayar,
      sisaPembayaran: totalTagihan - totalBayar,
    };
  }

  /**
   * Get tagihan by bulan (for monthly report)
   */
  static async getByBulan(bulan: string, tahunAjaranId?: number) {
    const where: Prisma.TagihanWhereInput = {
      bulan: bulan,
    };

    if (tahunAjaranId) {
      where.tahunAjaranId = tahunAjaranId;
    }

    const tagihan = await prisma.tagihan.findMany({
      where,
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
        tarif: true,
        pembayaran: {
          select: {
            jumlahBayar: true,
          },
        },
      },
      orderBy: [{ siswa: { nama: "asc" } }],
    });

    return tagihan.map((t) => {
      const totalBayar = t.pembayaran.reduce(
        (sum, p) => sum + p.jumlahBayar,
        0
      );

      return {
        ...t,
        totalBayar,
        sisaPembayaran: t.tarif.nominal - totalBayar,
      };
    });
  }
  /**
   * Get summary for siswa dashboard
   */
  static async getSiswaSummary(siswaId: number) {
    // 1. Get all outstanding bills
    const outstanding = await prisma.tagihan.findMany({
      where: {
        id_siswa: siswaId,
        status: {
          in: [StatusTagihan.BELUM_BAYAR, StatusTagihan.CICIL],
        },
      },
      include: {
        tarif: true,
        tahunAjaran: true,
        pembayaran: true,
      },
      orderBy: { id_tagihan: "desc" },
    });

    let totalSisaPembayaran = 0;

    outstanding.forEach((t) => {
      const bayar = t.pembayaran.reduce((sum, p) => sum + p.jumlahBayar, 0);
      totalSisaPembayaran += t.tarif.nominal - bayar;
    });

    // 2. Get latest bill (could be one of the outstanding, or just the latest created)
    // If we want "tagihan terbaru", we just take the first from outstanding if exists,
    // or checks all tagihan. Usually we care about the pending ones first.
    // If no pending, maybe show "All paid".

    // For the UI "Tagihan Terbaru" card:
    let tagihanTerbaru = null;
    if (outstanding.length > 0) {
      const latest = outstanding[0];
      const bayarLatest = latest.pembayaran.reduce(
        (sum, p) => sum + p.jumlahBayar,
        0
      );

      tagihanTerbaru = {
        namaTagihan: latest.tarif.namaTagihan,
        bulan: latest.bulan,
        tahunAjaran: latest.tahunAjaran.namaTahun,
        sisa: latest.tarif.nominal - bayarLatest,
      };
    }

    return {
      totalSisaPembayaran,
      jumlahTagihanBelumLunas: outstanding.length,
      tagihanTerbaru,
    };
  }
}
