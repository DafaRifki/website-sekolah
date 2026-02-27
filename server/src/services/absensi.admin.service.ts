// src/services/absensi.admin.service.ts
// ADMIN DASHBOARD - Comprehensive Absensi Monitoring
// Tambahan service untuk Role ADMIN

import { prisma } from "../config/database";
import { StatusAbsensi } from "@prisma/client";

/**
 * Admin Absensi Service
 * Comprehensive monitoring and analytics for Admin role
 */
export class AbsensiAdminService {
  /**
   * ============================================================================
   * ADMIN DASHBOARD - OVERVIEW
   * ============================================================================
   */

  /**
   * Get Dashboard Overview (Today's Summary)
   */
  static async getDashboardOverview(tahunAjaranId?: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const where: any = {};
    if (tahunAjaranId) {
      where.id_tahun = tahunAjaranId;
    }

    // 1. Absensi Harian (dari sistem lama)
    const [totalSiswaAktif, absensiHariIni, absensiHariIniByStatus] =
      await Promise.all([
        prisma.siswa.count({ where: { status: "AKTIF" } }),
        prisma.absensi.count({
          where: {
            ...where,
            tanggal: { gte: today, lte: todayEnd },
          },
        }),
        prisma.absensi.groupBy({
          by: ["status"],
          where: {
            ...where,
            tanggal: { gte: today, lte: todayEnd },
          },
          _count: { status: true },
        }),
      ]);

    const absensiHarian = {
      totalSiswa: totalSiswaAktif,
      sudahAbsen: absensiHariIni,
      belumAbsen: totalSiswaAktif - absensiHariIni,
      hadir: 0,
      sakit: 0,
      izin: 0,
      alpha: 0,
    };

    absensiHariIniByStatus.forEach((item) => {
      if (item.status === "HADIR") absensiHarian.hadir = item._count.status;
      else if (item.status === "SAKIT")
        absensiHarian.sakit = item._count.status;
      else if (item.status === "IZIN") absensiHarian.izin = item._count.status;
      else if (item.status === "TIDAK_HADIR")
        absensiHarian.alpha = item._count.status;
    });

    // 2. Absensi Pertemuan (dari sistem baru)
    const wherePertemuan: any = {
      tanggal: { gte: today, lte: todayEnd },
    };

    if (tahunAjaranId) {
      wherePertemuan.guruMapel = {
        tahunAjaranId,
      };
    }

    const [
      totalPertemuanHariIni,
      pertemuanByStatus,
      totalGuruMengajar,
      detailAbsensiPertemuan,
    ] = await Promise.all([
      prisma.absensiPertemuan.count({ where: wherePertemuan }),
      prisma.absensiPertemuan.groupBy({
        by: ["statusPertemuan"],
        where: wherePertemuan,
        _count: { statusPertemuan: true },
      }),
      prisma.absensiPertemuan.findMany({
        where: wherePertemuan,
        select: {
          guruMapel: {
            select: {
              id_guru: true,
            },
          },
        },
        distinct: ["guruMapelId"],
      }),
      // GET ALL DETAIL ABSENSI from pertemuan
      prisma.detailAbsensiPertemuan.findMany({
        where: {
          absensiPertemuan: wherePertemuan,
        },
        select: {
          status: true,
          siswaId: true,
        },
      }),
    ]);

    const pertemuan = {
      totalPertemuan: totalPertemuanHariIni,
      guruMengajar: totalGuruMengajar.length,
      scheduled: 0,
      ongoing: 0,
      completed: 0,
      cancelled: 0,
    };

    pertemuanByStatus.forEach((item) => {
      if (item.statusPertemuan === "SCHEDULED")
        pertemuan.scheduled = item._count.statusPertemuan;
      else if (item.statusPertemuan === "ONGOING")
        pertemuan.ongoing = item._count.statusPertemuan;
      else if (item.statusPertemuan === "COMPLETED")
        pertemuan.completed = item._count.statusPertemuan;
      else if (item.statusPertemuan === "CANCELLED")
        pertemuan.cancelled = item._count.statusPertemuan;
    });

    // 3. Persentase Kehadiran

    const absensiPertemuanStats = {
      totalSiswaTerabsen: new Set(detailAbsensiPertemuan.map((d) => d.siswaId))
        .size,
      hadir: detailAbsensiPertemuan.filter((d) => d.status === "HADIR").length,
      sakit: detailAbsensiPertemuan.filter((d) => d.status === "SAKIT").length,
      izin: detailAbsensiPertemuan.filter((d) => d.status === "IZIN").length,
      alpha: detailAbsensiPertemuan.filter((d) => d.status === "TIDAK_HADIR")
        .length,
    };

    const combinedStats = {
      // Gunakan absensi pertemuan jika ada, fallback ke harian
      totalSiswa: totalSiswaAktif,
      sudahAbsen:
        absensiPertemuanStats.totalSiswaTerabsen > 0
          ? absensiPertemuanStats.totalSiswaTerabsen
          : absensiHarian.sudahAbsen,
      belumAbsen:
        totalSiswaAktif -
        (absensiPertemuanStats.totalSiswaTerabsen > 0
          ? absensiPertemuanStats.totalSiswaTerabsen
          : absensiHarian.sudahAbsen),
      hadir:
        absensiPertemuanStats.hadir > 0
          ? absensiPertemuanStats.hadir
          : absensiHarian.hadir,
      sakit:
        absensiPertemuanStats.sakit > 0
          ? absensiPertemuanStats.sakit
          : absensiHarian.sakit,
      izin:
        absensiPertemuanStats.izin > 0
          ? absensiPertemuanStats.izin
          : absensiHarian.izin,
      alpha:
        absensiPertemuanStats.alpha > 0
          ? absensiPertemuanStats.alpha
          : absensiHarian.alpha,
    };

    // Persentase
    const persentaseKehadiran =
      combinedStats.sudahAbsen > 0
        ? Math.round((combinedStats.hadir / combinedStats.sudahAbsen) * 100)
        : 0;

    const persentaseAbsensiComplete =
      combinedStats.totalSiswa > 0
        ? Math.round(
            (combinedStats.sudahAbsen / combinedStats.totalSiswa) * 100,
          )
        : 0;

    return {
      tanggal: today,
      absensiHarian: combinedStats, // Ini sudah gabungan!
      absensiPertemuan: absensiPertemuanStats, // Data asli dari pertemuan
      pertemuan,
      persentaseKehadiran,
      persentaseAbsensiComplete,
      dataSource: {
        fromPertemuan: absensiPertemuanStats.totalSiswaTerabsen > 0,
        fromHarian: absensiPertemuanStats.totalSiswaTerabsen === 0,
      },
    };
  }

  /**
   * Get All Classes Attendance Today
   */
  static async getKelasTodayAttendance(tahunAjaranId?: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const where: any = {};
    if (tahunAjaranId) {
      where.tahunAjaran = {
        some: {
          tahunAjaranId,
        },
      };
    }

    const kelasList = await prisma.kelas.findMany({
      where,
      include: {
        siswa: {
          where: { status: "AKTIF" },
        },
        guru: {
          select: {
            nama: true,
          },
        },
        guruMapel: {
          include: {
            jadwal: true,
          },
        },
      },
      orderBy: { namaKelas: "asc" },
    });

    const kelasAttendance = await Promise.all(
      kelasList.map(async (kelas) => {
        const siswaIds = kelas.siswa.map((s) => s.id_siswa);

        // 1. Get absensi harian
        const absensiHarian = await prisma.absensi.findMany({
          where: {
            id_siswa: { in: siswaIds },
            tanggal: { gte: today, lte: todayEnd },
          },
        });

        // 2. Get absensi pertemuan untuk kelas ini
        const guruMapelIds = kelas.guruMapel.map((gm) => gm.id);

        const detailAbsensiPertemuan =
          await prisma.detailAbsensiPertemuan.findMany({
            where: {
              siswaId: { in: siswaIds },
              absensiPertemuan: {
                guruMapelId: { in: guruMapelIds },
                tanggal: { gte: today, lte: todayEnd },
              },
            },
            distinct: ["siswaId"], // Each student counted once
          });

        // 3. Gabungkan stats (prioritas pertemuan)
        const usePertemuan = detailAbsensiPertemuan.length > 0;

        const stats = usePertemuan
          ? {
              totalSiswa: kelas.siswa.length,
              sudahAbsen: detailAbsensiPertemuan.length,
              belumAbsen: kelas.siswa.length - detailAbsensiPertemuan.length,
              hadir: detailAbsensiPertemuan.filter((d) => d.status === "HADIR")
                .length,
              sakit: detailAbsensiPertemuan.filter((d) => d.status === "SAKIT")
                .length,
              izin: detailAbsensiPertemuan.filter((d) => d.status === "IZIN")
                .length,
              alpha: detailAbsensiPertemuan.filter(
                (d) => d.status === "TIDAK_HADIR",
              ).length,
            }
          : {
              totalSiswa: kelas.siswa.length,
              sudahAbsen: absensiHarian.length,
              belumAbsen: kelas.siswa.length - absensiHarian.length,
              hadir: absensiHarian.filter((a) => a.status === "HADIR").length,
              sakit: absensiHarian.filter((a) => a.status === "SAKIT").length,
              izin: absensiHarian.filter((a) => a.status === "IZIN").length,
              alpha: absensiHarian.filter((a) => a.status === "TIDAK_HADIR")
                .length,
            };

        const persentase =
          stats.sudahAbsen > 0
            ? Math.round((stats.hadir / stats.sudahAbsen) * 100)
            : 0;

        return {
          id_kelas: kelas.id_kelas,
          namaKelas: kelas.namaKelas,
          tingkat: kelas.tingkat,
          waliKelas: kelas.guru?.nama || null,
          stats,
          persentaseKehadiran: persentase,
          dataSource: usePertemuan ? "pertemuan" : "harian",
        };
      }),
    );

    return {
      tanggal: today,
      kelasList: kelasAttendance,
    };
  }

  /**
   * Get All Teachers Teaching Today
   */
  static async getGuruTeachingToday(tahunAjaranId?: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const dayName = today.toLocaleDateString("id-ID", { weekday: "long" });

    const whereGuruMapel: any = {};
    if (tahunAjaranId) {
      whereGuruMapel.tahunAjaranId = tahunAjaranId;
    }

    // Get all GuruMapel with jadwal today
    const guruMapelList = await prisma.guruMapel.findMany({
      where: {
        ...whereGuruMapel,
        jadwal: {
          some: {
            hari: dayName,
          },
        },
      },
      include: {
        guru: {
          select: {
            id_guru: true,
            nama: true,
            nip: true,
          },
        },
        mapel: {
          select: {
            namaMapel: true,
          },
        },
        kelas: {
          select: {
            namaKelas: true,
            siswa: true,
          },
        },
        jadwal: {
          where: { hari: dayName },
          orderBy: { jamMulai: "asc" },
        },
      },
    });

    // Get pertemuan for each guruMapel
    const guruTeaching = await Promise.all(
      guruMapelList.map(async (gm) => {
        const pertemuanList = await prisma.absensiPertemuan.findMany({
          where: {
            guruMapelId: gm.id,
            tanggal: { gte: today, lte: todayEnd },
          },
          include: {
            detailAbsensi: true,
          },
        });

        const jadwalWithPertemuan = gm.jadwal.map((jadwal) => {
          const pertemuan = pertemuanList.find(
            (p) =>
              p.jamMulai === jadwal.jamMulai &&
              p.jamSelesai === jadwal.jamSelesai,
          );

          return {
            jadwal: {
              id_jadwal: jadwal.id_jadwal,
              guruMapelId: gm.id, // Tambahkan ini
              jamMulai: jadwal.jamMulai,
              jamSelesai: jadwal.jamSelesai,
              ruangan: jadwal.ruangan,
            },
            pertemuan: pertemuan
              ? {
                  id_absensi_pertemuan: pertemuan.id_absensi_pertemuan,
                  pertemuanKe: pertemuan.pertemuanKe,
                  statusPertemuan: pertemuan.statusPertemuan,
                  materi: pertemuan.materi,
                  sudahAbsen: pertemuan.detailAbsensi.length,
                  belumAbsen:
                    gm.kelas.siswa.length - pertemuan.detailAbsensi.length,
                }
              : null,
          };
        });

        return {
          guru: gm.guru,
          mapel: gm.mapel.namaMapel,
          kelas: gm.kelas.namaKelas,
          totalSiswa: gm.kelas.siswa.length,
          jadwalHariIni: jadwalWithPertemuan,
        };
      }),
    );

    // Group by guru
    const guruGrouped: Record<
      number,
      {
        guru: any;
        totalJadwal: number;
        totalPertemuan: number;
        jadwal: any[];
      }
    > = {};

    guruTeaching.forEach((item) => {
      const guruId = item.guru.id_guru;

      if (!guruGrouped[guruId]) {
        guruGrouped[guruId] = {
          guru: item.guru,
          totalJadwal: 0,
          totalPertemuan: 0,
          jadwal: [],
        };
      }

      item.jadwalHariIni.forEach((jadwal) => {
        guruGrouped[guruId].totalJadwal++;
        if (jadwal.pertemuan) {
          guruGrouped[guruId].totalPertemuan++;
        }

        guruGrouped[guruId].jadwal.push({
          mapel: item.mapel,
          kelas: item.kelas,
          totalSiswa: item.totalSiswa,
          ...jadwal,
        });
      });
    });

    return {
      tanggal: today,
      hari: dayName,
      totalGuru: Object.keys(guruGrouped).length,
      guruList: Object.values(guruGrouped),
    };
  }

  /**
   * ============================================================================
   * ANALYTICS & REPORTS
   * ============================================================================
   */

  /**
   * Get Attendance Trends (Weekly/Monthly)
   */
  static async getAttendanceTrends(
    period: "week" | "month",
    tahunAjaranId?: number,
  ) {
    const today = new Date();
    const startDate = new Date();

    if (period === "week") {
      startDate.setDate(today.getDate() - 7);
    } else {
      startDate.setMonth(today.getMonth() - 1);
    }

    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    const where: any = {
      tanggal: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (tahunAjaranId) {
      where.id_tahun = tahunAjaranId;
    }

    // Get absensi grouped by date
    const absensiList = await prisma.absensi.findMany({
      where,
      select: {
        tanggal: true,
        status: true,
      },
    });

    // Group by date
    const trendsByDate: Record<string, any> = {};

    absensiList.forEach((absensi) => {
      const dateKey = absensi.tanggal.toISOString().split("T")[0];

      if (!trendsByDate[dateKey]) {
        trendsByDate[dateKey] = {
          tanggal: absensi.tanggal,
          total: 0,
          hadir: 0,
          sakit: 0,
          izin: 0,
          alpha: 0,
        };
      }

      trendsByDate[dateKey].total++;

      if (absensi.status === "HADIR") trendsByDate[dateKey].hadir++;
      else if (absensi.status === "SAKIT") trendsByDate[dateKey].sakit++;
      else if (absensi.status === "IZIN") trendsByDate[dateKey].izin++;
      else if (absensi.status === "TIDAK_HADIR") trendsByDate[dateKey].alpha++;
    });

    // Convert to array and add persentase
    const trends = Object.values(trendsByDate).map((item: any) => ({
      ...item,
      persentaseKehadiran:
        item.total > 0 ? Math.round((item.hadir / item.total) * 100) : 0,
    }));

    // Sort by date
    trends.sort((a, b) => a.tanggal.getTime() - b.tanggal.getTime());

    return {
      period,
      startDate,
      endDate,
      trends,
    };
  }

  /**
   * Get Top Absent Students (Siswa dengan kehadiran rendah)
   */
  static async getTopAbsentStudents(
    limit: number = 10,
    tahunAjaranId?: number,
    startDate?: string,
    endDate?: string,
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

    // Get all absensi
    const absensiList = await prisma.absensi.findMany({
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
    const siswaAbsensi: Record<number, any> = {};

    absensiList.forEach((absensi) => {
      const siswaId = absensi.id_siswa;

      if (!siswaAbsensi[siswaId]) {
        siswaAbsensi[siswaId] = {
          siswa: absensi.siswa,
          total: 0,
          hadir: 0,
          sakit: 0,
          izin: 0,
          alpha: 0,
        };
      }

      siswaAbsensi[siswaId].total++;

      if (absensi.status === "HADIR") siswaAbsensi[siswaId].hadir++;
      else if (absensi.status === "SAKIT") siswaAbsensi[siswaId].sakit++;
      else if (absensi.status === "IZIN") siswaAbsensi[siswaId].izin++;
      else if (absensi.status === "TIDAK_HADIR") siswaAbsensi[siswaId].alpha++;
    });

    // Calculate persentase and sort
    const siswaList = Object.values(siswaAbsensi)
      .map((item: any) => ({
        ...item,
        persentaseKehadiran:
          item.total > 0 ? Math.round((item.hadir / item.total) * 100) : 0,
        totalAbsen: item.sakit + item.izin + item.alpha,
      }))
      .sort((a, b) => a.persentaseKehadiran - b.persentaseKehadiran)
      .slice(0, limit);

    return siswaList;
  }

  /**
   * Get Class Comparison (Perbandingan antar kelas)
   */
  static async getClassComparison(tahunAjaranId?: number, month?: number) {
    const startDate = new Date();
    const endDate = new Date();

    if (month) {
      startDate.setMonth(month - 1);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      endDate.setMonth(month);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Current month
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
    }

    const kelasList = await prisma.kelas.findMany({
      include: {
        siswa: {
          where: { status: "AKTIF" },
        },
      },
      orderBy: { namaKelas: "asc" },
    });

    const kelasComparison = await Promise.all(
      kelasList.map(async (kelas) => {
        const siswaIds = kelas.siswa.map((s) => s.id_siswa);

        const where: any = {
          id_siswa: { in: siswaIds },
          tanggal: {
            gte: startDate,
            lte: endDate,
          },
        };

        if (tahunAjaranId) {
          where.id_tahun = tahunAjaranId;
        }

        const absensiList = await prisma.absensi.findMany({
          where,
        });

        const stats = {
          totalSiswa: kelas.siswa.length,
          totalAbsensi: absensiList.length,
          hadir: absensiList.filter((a) => a.status === "HADIR").length,
          sakit: absensiList.filter((a) => a.status === "SAKIT").length,
          izin: absensiList.filter((a) => a.status === "IZIN").length,
          alpha: absensiList.filter((a) => a.status === "TIDAK_HADIR").length,
        };

        const persentaseKehadiran =
          stats.totalAbsensi > 0
            ? Math.round((stats.hadir / stats.totalAbsensi) * 100)
            : 0;

        return {
          id_kelas: kelas.id_kelas,
          namaKelas: kelas.namaKelas,
          tingkat: kelas.tingkat,
          stats,
          persentaseKehadiran,
        };
      }),
    );

    // Sort by persentase kehadiran
    kelasComparison.sort(
      (a, b) => b.persentaseKehadiran - a.persentaseKehadiran,
    );

    return {
      periode: {
        startDate,
        endDate,
        month: month || new Date().getMonth() + 1,
      },
      comparison: kelasComparison,
    };
  }

  /**
   * Search Absensi (Advanced Search)
   */
  static async searchAbsensi(params: {
    siswaId?: number;
    kelasId?: number;
    guruMapelId?: number;
    status?: StatusAbsensi;
    startDate?: string;
    endDate?: string;
    tahunAjaranId?: number;
    page?: number;
    limit?: number;
  }) {
    const {
      siswaId,
      kelasId,
      guruMapelId,
      status,
      startDate,
      endDate,
      tahunAjaranId,
      page = 1,
      limit = 50,
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause for absensi
    const where: any = {};

    if (siswaId) {
      where.id_siswa = siswaId;
    }

    if (kelasId) {
      const kelas = await prisma.kelas.findUnique({
        where: { id_kelas: kelasId },
        include: { siswa: true },
      });

      if (kelas) {
        where.id_siswa = {
          in: kelas.siswa.map((s) => s.id_siswa),
        };
      }
    }

    if (status) {
      where.status = status;
    }

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

    // If searching by guruMapel, use pertemuan
    if (guruMapelId) {
      const pertemuanList = await prisma.absensiPertemuan.findMany({
        where: {
          guruMapelId,
          ...(startDate &&
            endDate && {
              tanggal: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            }),
        },
        include: {
          detailAbsensi: {
            where: siswaId ? { siswaId } : {},
            include: {
              siswa: {
                select: {
                  id_siswa: true,
                  nis: true,
                  nama: true,
                  kelas: { select: { namaKelas: true } },
                },
              },
            },
          },
          guruMapel: {
            include: {
              guru: { select: { nama: true } },
              mapel: { select: { namaMapel: true } },
              kelas: { select: { namaKelas: true } },
            },
          },
        },
        skip,
        take: limit,
      });

      const total = await prisma.absensiPertemuan.count({
        where: {
          guruMapelId,
          ...(startDate &&
            endDate && {
              tanggal: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            }),
        },
      });

      return {
        type: "pertemuan",
        data: pertemuanList,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    // Regular absensi search
    const [absensiList, total] = await Promise.all([
      prisma.absensi.findMany({
        where,
        include: {
          siswa: {
            select: {
              id_siswa: true,
              nis: true,
              nama: true,
              kelas: { select: { namaKelas: true } },
            },
          },
          tahunAjaran: {
            select: { namaTahun: true },
          },
        },
        orderBy: { tanggal: "desc" },
        skip,
        take: limit,
      }),
      prisma.absensi.count({ where }),
    ]);

    return {
      type: "harian",
      data: absensiList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Generate Excel report for Absensi Per Mata Pelajaran
   */
  static async generateMapelAbsensiExcel(guruMapelId: number) {
    const ExcelJS = require("exceljs");

    // 1. Get GuruMapel Info
    const guruMapel = await prisma.guruMapel.findUnique({
      where: { id: guruMapelId },
      include: {
        guru: { select: { nama: true } },
        mapel: { select: { namaMapel: true } },
        kelas: {
          select: {
            id_kelas: true,
            namaKelas: true,
            siswa: {
              where: { status: "AKTIF" },
              select: {
                id_siswa: true,
                nis: true,
                nama: true,
              },
              orderBy: { nama: "asc" },
            },
          },
        },
        tahunAjaran: { select: { namaTahun: true, semester: true } },
      },
    });

    if (!guruMapel) throw new Error("Mata pelajaran tidak ditemukan");

    // 2. Get All Pertemuan for this GuruMapel
    const pertemuanList = await prisma.absensiPertemuan.findMany({
      where: { guruMapelId },
      include: {
        detailAbsensi: true,
      },
      orderBy: { tanggal: "asc" },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Rekap Absensi");

    // Header Info
    worksheet.addRow(["REKAPITULASI ABSENSI SISWA"]);
    worksheet.addRow([`Mata Pelajaran: ${guruMapel.mapel.namaMapel}`]);
    worksheet.addRow([`Guru Pengajar: ${guruMapel.guru.nama}`]);
    worksheet.addRow([`Kelas: ${guruMapel.kelas.namaKelas}`]);
    worksheet.addRow([
      `Tahun Ajaran: ${guruMapel.tahunAjaran.namaTahun} - Semester ${guruMapel.tahunAjaran.semester}`,
    ]);
    worksheet.addRow([]);

    // Style Header Title
    worksheet.getRow(1).font = { bold: true, size: 14 };

    // Column Headers
    const headers = ["No", "NIS", "Nama Siswa"];
    const dateHeaders = pertemuanList.map((p) => {
      const d = new Date(p.tanggal);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });

    const summaryHeaders = ["H", "S", "I", "A", "%"];
    worksheet.addRow([...headers, ...dateHeaders, ...summaryHeaders]);

    // Style Column Headers Row
    const headerRow = worksheet.getRow(7);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };

    // Set Column Widths
    worksheet.getColumn(1).width = 5;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 30;

    // Add Data
    guruMapel.kelas.siswa.forEach((siswa, index) => {
      const rowData: any[] = [index + 1, siswa.nis || "-", siswa.nama];

      let h = 0,
        s = 0,
        i = 0,
        a = 0;

      pertemuanList.forEach((p) => {
        const detail = p.detailAbsensi.find((d) => d.siswaId === siswa.id_siswa);
        const status = detail ? detail.status : "-";

        let label = "-";
        if (status === "HADIR") {
          label = "H";
          h++;
        } else if (status === "SAKIT") {
          label = "S";
          s++;
        } else if (status === "IZIN") {
          label = "I";
          i++;
        } else if (status === "TIDAK_HADIR") {
          label = "A";
          a++;
        }

        rowData.push(label);
      });

      const totalPertemuan = h + s + i + a;
      const persentase =
        totalPertemuan > 0 ? Math.round((h / totalPertemuan) * 100) : 0;

      rowData.push(h, s, i, a, `${persentase}%`);
      worksheet.addRow(rowData);
    });

    // Final Styling: Add Borders
    worksheet.eachRow((row: any, rowNumber: number) => {
      if (rowNumber >= 7) {
        row.eachCell((cell: any) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          if (rowNumber === 7 || cell.address.startsWith("A") || cell.address.startsWith("B") || cell.address.startsWith("C")) {
             // Leave some alignment defaults
          } else {
             cell.alignment = { horizontal: "center" };
          }
        });
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      buffer,
      filename: `Absensi_${guruMapel.mapel.namaMapel.replace(/\s+/g, "_")}_${guruMapel.kelas.namaKelas.replace(/\s+/g, "_")}.xlsx`,
    };
  }
}
