import { prisma } from "../config/database";

export class DashboardService {
  /**
   * Get dashboard summary
   * Statistics: total siswa, guru, kelas, tahun ajaran aktif
   */
  static async getSummary() {
    try {
      const [totalSiswa, totalGuru, totalKelas, tahunAjaranAktif] =
        await Promise.all([
          prisma.siswa.count(),
          prisma.guru.count(),
          prisma.kelas.count(),
          prisma.tahunAjaran.findFirst({
            where: { isActive: true },
          }),
        ]);

      // Calculate days remaining
      let hariTersisa = 0;
      if (tahunAjaranAktif) {
        const today = new Date();
        const endDate = new Date(tahunAjaranAktif.endDate);
        hariTersisa = Math.ceil(
          (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      return {
        totalSiswa,
        totalGuru,
        totalKelas,
        tahunAjaranAktif: tahunAjaranAktif
          ? {
              id_tahun: tahunAjaranAktif.id_tahun,
              namaTahun: tahunAjaranAktif.namaTahun,
              semester: tahunAjaranAktif.semester,
              startDate: tahunAjaranAktif.startDate,
              endDate: tahunAjaranAktif.endDate,
              hariTersisa,
            }
          : null,
      };
    } catch (error: any) {
      throw new Error(`Failed to get dashboard summary: ${error.message}`);
    }
  }

  /**
   * Get financial summary
   * Total tagihan, terbayar, sisa, breakdown by status
   */
  static async getFinancial(tahunAjaranId?: number) {
    try {
      const where: any = {};
      if (tahunAjaranId) {
        where.tahunAjaranId = tahunAjaranId;
      }

      // Get all tagihan
      const allTagihan = await prisma.tagihan.findMany({
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
      });

      // Calculate totals
      let totalTagihan = 0;
      let totalTerbayar = 0;
      let lunas = 0;
      let cicil = 0;
      let belumBayar = 0;

      allTagihan.forEach((t) => {
        totalTagihan += t.tarif.nominal;
        const bayar = t.pembayaran.reduce((sum, p) => sum + p.jumlahBayar, 0);
        totalTerbayar += bayar;

        if (t.status === "LUNAS") lunas++;
        else if (t.status === "CICIL") cicil++;
        else belumBayar++;
      });

      const sisaPembayaran = totalTagihan - totalTerbayar;
      const persentaseBayar =
        totalTagihan > 0 ? Math.round((totalTerbayar / totalTagihan) * 100) : 0;

      // Get breakdown by tarif
      const tarifBreakdown = await prisma.tarifPembayaran.findMany({
        where: tahunAjaranId ? { tahunAjaranId } : undefined,
        include: {
          tagihan: {
            include: {
              pembayaran: {
                select: {
                  jumlahBayar: true,
                },
              },
            },
          },
        },
      });

      const byTarif = tarifBreakdown.map((tarif) => {
        let tarifTotal = 0;
        let tarifBayar = 0;

        tarif.tagihan.forEach((t) => {
          tarifTotal += tarif.nominal;
          const bayar = t.pembayaran.reduce((sum, p) => sum + p.jumlahBayar, 0);
          tarifBayar += bayar;
        });

        return {
          id_tarif: tarif.id_tarif,
          namaTagihan: tarif.namaTagihan,
          total: tarifTotal,
          terbayar: tarifBayar,
          sisa: tarifTotal - tarifBayar,
        };
      });

      return {
        totalTagihan,
        totalTerbayar,
        sisaPembayaran,
        persentaseBayar,
        statusBreakdown: {
          LUNAS: lunas,
          CICIL: cicil,
          BELUM_BAYAR: belumBayar,
        },
        byTarif,
      };
    } catch (error: any) {
      throw new Error(`Failed to get financial summary: ${error.message}`);
    }
  }

  /**
   * Get academic summary
   * Attendance rate, average nilai, performance issues
   */
  static async getAcademic(tahunAjaranId?: number) {
    try {
      const where: any = {};
      if (tahunAjaranId) {
        where.id_tahun = tahunAjaranId;
      }

      // Get attendance stats (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const absensi = await prisma.absensi.findMany({
        where: {
          ...where,
          tanggal: {
            gte: thirtyDaysAgo,
          },
        },
      });

      let hadir = 0;
      let sakit = 0;
      let izin = 0;
      let tidakHadir = 0;

      absensi.forEach((a) => {
        if (a.status === "HADIR") hadir++;
        else if (a.status === "SAKIT") sakit++;
        else if (a.status === "IZIN") izin++;
        else tidakHadir++;
      });

      const totalAbsensi = absensi.length;
      const attendanceRate =
        totalAbsensi > 0
          ? Math.round((hadir / totalAbsensi) * 100 * 10) / 10
          : 0;

      // Get nilai stats
      const nilaiData = await prisma.nilaiRapor.findMany({
        where,
        select: {
          nilai: true,
          id_siswa: true,
        },
      });

      const siswaWithLowValue = new Set<number>();
      let totalNilai = 0;

      nilaiData.forEach((n) => {
        totalNilai += n.nilai;
        if (n.nilai < 70) {
          siswaWithLowValue.add(n.id_siswa);
        }
      });

      const averageNilai =
        nilaiData.length > 0
          ? Math.round((totalNilai / nilaiData.length) * 10) / 10
          : 0;

      return {
        attendance: {
          rate: attendanceRate,
          hadir,
          sakit,
          izin,
          tidakHadir,
          total: totalAbsensi,
        },
        nilai: {
          average: averageNilai,
          recordsCount: nilaiData.length,
          siswaPerformanceIssues: siswaWithLowValue.size,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get academic summary: ${error.message}`);
    }
  }

  /**
   * Get pendaftaran summary
   * Pending, approved, rejected count
   */
  static async getPendaftaran(tahunAjaranId?: number) {
    try {
      const where: any = {};
      if (tahunAjaranId) {
        where.tahunAjaranId = tahunAjaranId;
      }

      // Get status breakdown
      const statusBreakdown = await prisma.pendaftaran.groupBy({
        by: ["statusDokumen"],
        where,
        _count: true,
      });

      const pembayaranBreakdown = await prisma.pendaftaran.groupBy({
        by: ["statusPembayaran"],
        where,
        _count: true,
      });

      const total = await prisma.pendaftaran.count({ where });

      // Get pending dengan incomplete documents
      const incomplete = await prisma.pendaftaran.count({
        where: {
          ...where,
          statusDokumen: "KURANG",
        },
      });

      return {
        total,
        byStatusDokumen: statusBreakdown.map((s) => ({
          status: s.statusDokumen,
          count: s._count,
        })),
        byStatusPembayaran: pembayaranBreakdown.map((s) => ({
          status: s.statusPembayaran,
          count: s._count,
        })),
        pendingAction: incomplete,
      };
    } catch (error: any) {
      throw new Error(`Failed to get pendaftaran summary: ${error.message}`);
    }
  }

  /**
   * Get alerts
   * Outstanding bills, low attendance, pending approvals
   */
  static async getAlerts(tahunAjaranId?: number) {
    try {
      // Outstanding bills (30+ hari belum bayar)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const outstandingBills = await prisma.tagihan.count({
        where: {
          status: { in: ["BELUM_BAYAR", "CICIL"] },
          ...(tahunAjaranId ? { tahunAjaranId } : {}),
        },
      });

      // Low attendance students (< 80% in last 30 days)
      const thirtyDaysAgoDate = new Date();
      thirtyDaysAgoDate.setDate(thirtyDaysAgoDate.getDate() - 30);

      const absensiData = await prisma.absensi.findMany({
        where: {
          tanggal: { gte: thirtyDaysAgoDate },
          ...(tahunAjaranId ? { id_tahun: tahunAjaranId } : {}),
        },
        select: {
          id_siswa: true,
          status: true,
        },
      });

      const siswaAttendance: Record<number, { hadir: number; total: number }> =
        {};

      absensiData.forEach((a) => {
        if (!siswaAttendance[a.id_siswa]) {
          siswaAttendance[a.id_siswa] = { hadir: 0, total: 0 };
        }
        siswaAttendance[a.id_siswa].total++;
        if (a.status === "HADIR") {
          siswaAttendance[a.id_siswa].hadir++;
        }
      });

      const lowAttendance = Object.values(siswaAttendance).filter(
        (a) => (a.hadir / a.total) * 100 < 80
      ).length;

      // Pending approvals
      const pendingApprovals = await prisma.pendaftaran.count({
        where: {
          statusDokumen: "KURANG",
          ...(tahunAjaranId ? { tahunAjaranId } : {}),
        },
      });

      return {
        critical: {
          outstandingBills,
          incompleteDocuments: pendingApprovals,
        },
        warning: {
          lowAttendance,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get alerts: ${error.message}`);
    }
  }

  /**
   * Get recent activities
   * Last 10 activities
   */
  static async getActivities(limit: number = 10) {
    try {
      // Combine multiple activity types
      const [pembayaran, pendaftaran, nilai, absensi] = await Promise.all([
        prisma.pembayaran.findMany({
          take: limit,
          select: {
            id_pembayaran: true,
            tanggal: true,
            jumlahBayar: true,
            tagihan: {
              select: {
                siswa: {
                  select: {
                    nama: true,
                  },
                },
              },
            },
          },
          orderBy: { tanggal: "desc" },
        }),
        prisma.pendaftaran.findMany({
          take: limit,
          select: {
            id_pendaftaran: true,
            nama: true,
            updatedAt: true,
            statusDokumen: true,
          },
          orderBy: { updatedAt: "desc" },
        }),
        prisma.nilaiRapor.findMany({
          take: limit,
          select: {
            id_nilai: true,
            siswa: {
              select: {
                nama: true,
              },
            },
            mapel: {
              select: {
                namaMapel: true,
              },
            },
          },
          orderBy: { id_nilai: "desc" },
        }),
        prisma.absensi.findMany({
          take: limit,
          select: {
            id_absensi: true,
            tanggal: true,
            siswa: {
              select: {
                nama: true,
              },
            },
            status: true,
          },
          orderBy: { tanggal: "desc" },
        }),
      ]);

      const activities = [
        ...pembayaran.map((p) => ({
          type: "PEMBAYARAN",
          id: p.id_pembayaran,
          description: `Pembayaran Rp ${p.jumlahBayar} oleh ${p.tagihan.siswa.nama}`,
          timestamp: p.tanggal,
        })),
        ...pendaftaran.map((p) => ({
          type: "PENDAFTARAN",
          id: p.id_pendaftaran,
          description: `Pendaftaran ${p.nama} - ${p.statusDokumen}`,
          timestamp: p.updatedAt,
        })),
        ...nilai.map((n) => ({
          type: "NILAI",
          id: n.id_nilai,
          description: `Nilai ${n.siswa.nama} - ${n.mapel.namaMapel}`,
          timestamp: new Date(),
        })),
        ...absensi.map((a) => ({
          type: "ABSENSI",
          id: a.id_absensi,
          description: `Absensi ${a.siswa.nama} - ${a.status}`,
          timestamp: a.tanggal,
        })),
      ];

      // Sort by timestamp and limit
      return activities
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, limit);
    } catch (error: any) {
      throw new Error(`Failed to get activities: ${error.message}`);
    }
  }

  /**
   * Get charts data
   * All chart data combined
   */
  static async getChartsData(tahunAjaranId?: number) {
    try {
      const where: any = {};
      if (tahunAjaranId) {
        where.tahunAjaranId = tahunAjaranId;
      }

      // Chart 1: Tagihan status distribution
      const tagihanStatus = await prisma.tagihan.groupBy({
        by: ["status"],
        where,
        _count: true,
      });

      const chart1 = tagihanStatus.map((t) => ({
        name: t.status,
        value: t._count,
        percentage: Math.round(
          (t._count / tagihanStatus.reduce((sum, s) => sum + s._count, 0)) * 100
        ),
      }));

      // Chart 2: Payment trend by month (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const pembayaran = await prisma.pembayaran.findMany({
        where: {
          tanggal: { gte: sixMonthsAgo },
          tagihan: where,
        },
        select: {
          tanggal: true,
          jumlahBayar: true,
        },
      });

      const chart2: Record<string, number> = {};
      pembayaran.forEach((p) => {
        const month = new Date(p.tanggal).toLocaleString("id-ID", {
          month: "short",
          year: "numeric",
        });
        chart2[month] = (chart2[month] || 0) + p.jumlahBayar;
      });

      // Chart 3: Revenue by payment method
      const byMetode = await prisma.pembayaran.groupBy({
        by: ["metode"],
        where: {
          tagihan: where,
        },
        _sum: {
          jumlahBayar: true,
        },
      });

      const chart3 = byMetode
        .filter((b) => b.metode)
        .map((b) => ({
          name: b.metode || "UNKNOWN",
          value: b._sum.jumlahBayar || 0,
        }));

      // Chart 4: Student distribution by class
      const byKelas = await prisma.kelas.findMany({
        select: {
          namaKelas: true,
          siswa: {
            select: {
              id_siswa: true,
            },
          },
        },
      });

      const chart4 = byKelas
        .map((k) => ({
          name: k.namaKelas,
          value: k.siswa.length,
        }))
        .sort((a, b) => b.value - a.value);

      // Chart 5: Academic performance distribution
      const nilaiStats = await prisma.nilaiRapor.findMany({
        where,
        select: {
          nilai: true,
        },
      });

      let excellent = 0;
      let good = 0;
      let needsImprovement = 0;
      let totalNilai = 0;

      nilaiStats.forEach((n) => {
        totalNilai += n.nilai;
        if (n.nilai >= 85) excellent++;
        else if (n.nilai >= 70) good++;
        else needsImprovement++;
      });

      const chart5 = {
        average: nilaiStats.length > 0 ? totalNilai / nilaiStats.length : 0,
        distribution: [
          { name: "Excellent (≥85)", value: excellent },
          { name: "Good (70-84)", value: good },
          {
            name: "Needs Improvement (<70)",
            value: needsImprovement,
          },
        ],
      };

      return {
        tagihanStatus: chart1,
        paymentTrend: Object.entries(chart2).map(([month, value]) => ({
          month,
          value,
        })),
        revenueByMethod: chart3,
        studentByClass: chart4,
        academicPerformance: chart5,
      };
    } catch (error: any) {
      throw new Error(`Failed to get charts data: ${error.message}`);
    }
  }

  /**
   * Get stats by month
   * Payment history month by month
   */
  static async getStatsByMonth(tahunAjaranId?: number) {
    try {
      const whereTagihan: any = {};
      if (tahunAjaranId) {
        whereTagihan.tahunAjaranId = tahunAjaranId;
      }

      const pembayaran = await prisma.pembayaran.findMany({
        where: {
          tagihan: whereTagihan,
        },
        select: {
          tanggal: true,
          jumlahBayar: true,
        },
      });

      const monthlyStats: Record<
        string,
        { total: number; count: number; average: number }
      > = {};

      pembayaran.forEach((p) => {
        const month = new Date(p.tanggal).toLocaleString("id-ID", {
          month: "long",
          year: "numeric",
        });

        if (!monthlyStats[month]) {
          monthlyStats[month] = { total: 0, count: 0, average: 0 };
        }

        monthlyStats[month].total += p.jumlahBayar;
        monthlyStats[month].count++;
      });

      // Calculate average
      Object.keys(monthlyStats).forEach((month) => {
        monthlyStats[month].average = Math.round(
          monthlyStats[month].total / monthlyStats[month].count
        );
      });

      return monthlyStats;
    } catch (error: any) {
      throw new Error(`Failed to get monthly stats: ${error.message}`);
    }
  }
}
