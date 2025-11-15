import { prisma } from "../config/database";
import { Prisma, StatusAbsensi } from "@prisma/client";

interface CreateAbsensiData {
  id_siswa: number;
  tanggal: Date | string;
  status: StatusAbsensi;
  keterangan?: string;
  id_tahun: number;
}

interface BulkCreateAbsensiData {
  kelasId: number;
  tanggal: Date | string;
  id_tahun: number;
  absensiData: Array<{
    id_siswa: number;
    status: StatusAbsensi;
    keterangan?: string;
  }>;
}

interface UpdateAbsensiData {
  status?: StatusAbsensi;
  keterangan?: string;
}

export class AbsensiService {
  /**
   * Create absensi (single)
   */
  static async create(data: CreateAbsensiData) {
    // Validate siswa exists
    const siswa = await prisma.siswa.findUnique({
      where: { id_siswa: data.id_siswa },
    });

    if (!siswa) {
      throw new Error("Siswa not found");
    }

    // Validate tahun ajaran exists
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id_tahun: data.id_tahun },
    });

    if (!tahunAjaran) {
      throw new Error("Tahun ajaran not found");
    }

    const tanggal = new Date(data.tanggal);
    tanggal.setHours(0, 0, 0, 0); // Reset time to 00:00:00

    // Check if absensi already exists for this date
    const existing = await prisma.absensi.findFirst({
      where: {
        id_siswa: data.id_siswa,
        tanggal: tanggal,
        id_tahun: data.id_tahun,
      },
    });

    if (existing) {
      throw new Error("Absensi already exists for this date");
    }

    const absensi = await prisma.absensi.create({
      data: {
        id_siswa: data.id_siswa,
        tanggal: tanggal,
        status: data.status,
        keterangan: data.keterangan,
        id_tahun: data.id_tahun,
      },
      include: {
        siswa: {
          select: {
            nis: true,
            nama: true,
          },
        },
        tahunAjaran: {
          select: {
            namaTahun: true,
          },
        },
      },
    });

    return absensi;
  }

  /**
   * Bulk create absensi (per kelas per hari)
   */
  static async bulkCreate(data: BulkCreateAbsensiData) {
    // Validate kelas exists
    const kelas = await prisma.kelas.findUnique({
      where: { id_kelas: data.kelasId },
      include: {
        siswa: true,
      },
    });

    if (!kelas) {
      throw new Error("Kelas not found");
    }

    // Validate tahun ajaran exists
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id_tahun: data.id_tahun },
    });

    if (!tahunAjaran) {
      throw new Error("Tahun ajaran not found");
    }

    const tanggal = new Date(data.tanggal);
    tanggal.setHours(0, 0, 0, 0);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ siswaId: number; error: string }>,
    };

    // Create/update absensi for each siswa
    for (const absensiItem of data.absensiData) {
      try {
        // Check if siswa is in kelas
        const siswaInKelas = kelas.siswa.find(
          (s) => s.id_siswa === absensiItem.id_siswa
        );

        if (!siswaInKelas) {
          throw new Error("Siswa not in this kelas");
        }

        // Check if absensi already exists
        const existing = await prisma.absensi.findFirst({
          where: {
            id_siswa: absensiItem.id_siswa,
            tanggal: tanggal,
            id_tahun: data.id_tahun,
          },
        });

        if (existing) {
          // Update instead of create
          await prisma.absensi.update({
            where: { id_absensi: existing.id_absensi },
            data: {
              status: absensiItem.status,
              keterangan: absensiItem.keterangan,
            },
          });
        } else {
          // Create new
          await prisma.absensi.create({
            data: {
              id_siswa: absensiItem.id_siswa,
              tanggal: tanggal,
              status: absensiItem.status,
              keterangan: absensiItem.keterangan,
              id_tahun: data.id_tahun,
            },
          });
        }

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          siswaId: absensiItem.id_siswa,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Update absensi
   */
  static async update(id: number, data: UpdateAbsensiData) {
    const existing = await prisma.absensi.findUnique({
      where: { id_absensi: id },
    });

    if (!existing) {
      throw new Error("Absensi not found");
    }

    const updated = await prisma.absensi.update({
      where: { id_absensi: id },
      data,
      include: {
        siswa: {
          select: {
            nis: true,
            nama: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete absensi
   */
  static async delete(id: number) {
    const absensi = await prisma.absensi.findUnique({
      where: { id_absensi: id },
    });

    if (!absensi) {
      throw new Error("Absensi not found");
    }

    await prisma.absensi.delete({
      where: { id_absensi: id },
    });

    return { message: "Absensi deleted successfully" };
  }

  /**
   * Get absensi by siswa
   */
  static async getBySiswa(
    siswaId: number,
    startDate?: string,
    endDate?: string,
    tahunAjaranId?: number
  ) {
    const siswa = await prisma.siswa.findUnique({
      where: { id_siswa: siswaId },
    });

    if (!siswa) {
      throw new Error("Siswa not found");
    }

    const where: any = {
      id_siswa: siswaId,
    };

    if (tahunAjaranId) {
      where.id_tahun = tahunAjaranId;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      where.tanggal = {
        gte: start,
        lte: end,
      };
    }

    const absensi = await prisma.absensi.findMany({
      where,
      orderBy: {
        tanggal: "desc",
      },
      include: {
        tahunAjaran: {
          select: {
            namaTahun: true,
          },
        },
      },
    });

    // Calculate statistics
    const stats = {
      total: absensi.length,
      hadir: absensi.filter((a) => a.status === "HADIR").length,
      sakit: absensi.filter((a) => a.status === "SAKIT").length,
      izin: absensi.filter((a) => a.status === "IZIN").length,
      alpha: absensi.filter((a) => a.status === "TIDAK_HADIR").length,
    };

    const persentaseKehadiran =
      stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;

    return {
      siswa: {
        id_siswa: siswa.id_siswa,
        nis: siswa.nis,
        nama: siswa.nama,
      },
      absensi,
      stats,
      persentaseKehadiran,
    };
  }

  /**
   * Get absensi by kelas (per hari)
   */
  static async getByKelas(
    kelasId: number,
    tanggal: string,
    tahunAjaranId: number
  ) {
    const kelas = await prisma.kelas.findUnique({
      where: { id_kelas: kelasId },
      include: {
        siswa: {
          orderBy: { nama: "asc" },
        },
      },
    });

    if (!kelas) {
      throw new Error("Kelas not found");
    }

    const date = new Date(tanggal);
    date.setHours(0, 0, 0, 0);

    // Get absensi for all siswa in kelas for this date
    const absensiList = await Promise.all(
      kelas.siswa.map(async (siswa) => {
        const absensi = await prisma.absensi.findFirst({
          where: {
            id_siswa: siswa.id_siswa,
            tanggal: date,
            id_tahun: tahunAjaranId,
          },
        });

        return {
          id_siswa: siswa.id_siswa,
          nis: siswa.nis,
          nama: siswa.nama,
          status: absensi?.status || null,
          keterangan: absensi?.keterangan || null,
          id_absensi: absensi?.id_absensi || null,
        };
      })
    );

    // Calculate statistics
    const absensiValues = absensiList.filter((a) => a.status !== null);
    const stats = {
      totalSiswa: kelas.siswa.length,
      sudahAbsen: absensiValues.length,
      belumAbsen: kelas.siswa.length - absensiValues.length,
      hadir: absensiList.filter((a) => a.status === "HADIR").length,
      sakit: absensiList.filter((a) => a.status === "SAKIT").length,
      izin: absensiList.filter((a) => a.status === "IZIN").length,
      alpha: absensiList.filter((a) => a.status === "TIDAK_HADIR").length,
    };

    return {
      kelas: {
        id_kelas: kelas.id_kelas,
        namaKelas: kelas.namaKelas,
        tingkat: kelas.tingkat,
      },
      tanggal: date,
      absensiList,
      stats,
    };
  }

  /**
   * Get rekap absensi (bulanan/per periode)
   */
  static async getRekap(
    kelasId?: number,
    startDate?: string,
    endDate?: string,
    tahunAjaranId?: number
  ) {
    const where: any = {};

    if (tahunAjaranId) {
      where.id_tahun = tahunAjaranId;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      where.tanggal = {
        gte: start,
        lte: end,
      };
    }

    if (kelasId) {
      const kelas = await prisma.kelas.findUnique({
        where: { id_kelas: kelasId },
        include: { siswa: true },
      });

      if (!kelas) {
        throw new Error("Kelas not found");
      }

      where.id_siswa = {
        in: kelas.siswa.map((s) => s.id_siswa),
      };
    }

    // Get all absensi in period
    const absensi = await prisma.absensi.findMany({
      where,
      include: {
        siswa: {
          select: {
            id_siswa: true,
            nis: true,
            nama: true,
            kelas: {
              select: {
                namaKelas: true,
              },
            },
          },
        },
      },
    });

    // Group by siswa
    const rekapBySiswa: Record<number, any> = {};

    absensi.forEach((a) => {
      if (!rekapBySiswa[a.id_siswa]) {
        rekapBySiswa[a.id_siswa] = {
          siswa: a.siswa,
          total: 0,
          hadir: 0,
          sakit: 0,
          izin: 0,
          alpha: 0,
          persentaseKehadiran: 0,
        };
      }

      rekapBySiswa[a.id_siswa].total++;

      if (a.status === "HADIR") rekapBySiswa[a.id_siswa].hadir++;
      else if (a.status === "SAKIT") rekapBySiswa[a.id_siswa].sakit++;
      else if (a.status === "IZIN") rekapBySiswa[a.id_siswa].izin++;
      else if (a.status === "TIDAK_HADIR") rekapBySiswa[a.id_siswa].alpha++;
    });

    // Calculate persentase kehadiran
    Object.values(rekapBySiswa).forEach((rekap: any) => {
      rekap.persentaseKehadiran =
        rekap.total > 0 ? Math.round((rekap.hadir / rekap.total) * 100) : 0;
    });

    return {
      periode: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      rekap: Object.values(rekapBySiswa),
    };
  }

  /**
   * Get statistics
   */
  static async getStats(tahunAjaranId?: number) {
    const where: any = {};
    if (tahunAjaranId) {
      where.id_tahun = tahunAjaranId;
    }

    const [total, byStatus] = await Promise.all([
      prisma.absensi.count({ where }),
      prisma.absensi.groupBy({
        by: ["status"],
        where,
        _count: {
          status: true,
        },
      }),
    ]);

    const stats: any = {
      total,
      hadir: 0,
      sakit: 0,
      izin: 0,
      alpha: 0,
    };

    byStatus.forEach((item) => {
      if (item.status === "HADIR") stats.hadir = item._count.status;
      else if (item.status === "SAKIT") stats.sakit = item._count.status;
      else if (item.status === "IZIN") stats.izin = item._count.status;
      else if (item.status === "TIDAK_HADIR") stats.alpha = item._count.status;
    });

    stats.persentaseKehadiran =
      total > 0 ? Math.round((stats.hadir / total) * 100) : 0;

    return stats;
  }
}
