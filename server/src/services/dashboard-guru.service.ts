import { prisma } from "../config/database";

export class DashboardGuruService {
  /**
   * Get complete dashboard data for GURU role
   */
  static async getDashboard(guruId: number, tahunAjaranId?: number) {
    try {
      // Get active tahun ajaran if not specified
      const tahunAjaran = tahunAjaranId
        ? await prisma.tahunAjaran.findUnique({
            where: { id_tahun: tahunAjaranId },
          })
        : await prisma.tahunAjaran.findFirst({
            where: { isActive: true },
          });

      if (!tahunAjaran) {
        throw new Error("Tahun ajaran not found");
      }

      // Get guru with wali kelas info
      const guru = await prisma.guru.findUnique({
        where: { id_guru: guruId },
        include: {
          waliKelas: {
            include: {
              siswa: {
                include: {
                  absensi: {
                    where: {
                      id_tahun: tahunAjaran.id_tahun,
                    },
                  },
                  nilaiRapor: {
                    where: {
                      tahunAjaranId: tahunAjaran.id_tahun,
                    },
                  },
                  tagihan: {
                    where: {
                      tahunAjaranId: tahunAjaran.id_tahun,
                      status: {
                        in: ["BELUM_BAYAR", "CICIL"],
                      },
                    },
                    include: {
                      tarif: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!guru) {
        throw new Error("Guru not found");
      }

      // Check if wali kelas
      const isWaliKelas = guru.waliKelas && guru.waliKelas.length > 0;
      let waliKelasData = null;

      if (isWaliKelas) {
        const kelas = guru.waliKelas[0]; // Assuming one kelas per guru

        // Calculate statistics
        const totalSiswa = kelas.siswa.length;

        // Attendance today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendanceToday = await prisma.absensi.findMany({
          where: {
            tanggal: {
              gte: today,
            },
            siswa: {
              kelasId: kelas.id_kelas,
            },
            id_tahun: tahunAjaran.id_tahun,
          },
        });

        const attendanceStats = {
          hadir: attendanceToday.filter((a) => a.status === "HADIR").length,
          sakit: attendanceToday.filter((a) => a.status === "SAKIT").length,
          izin: attendanceToday.filter((a) => a.status === "IZIN").length,
          alpha: attendanceToday.filter((a) => a.status === "TIDAK_HADIR")
            .length,
          total: totalSiswa,
          inputted: attendanceToday.length,
          pending: totalSiswa - attendanceToday.length,
        };

        // Calculate class average grade
        const allNilai = kelas.siswa.flatMap((s) => s.nilaiRapor);
        const nilaiAverage =
          allNilai.length > 0
            ? Math.round(
                (allNilai.reduce((sum, n) => sum + n.nilai, 0) /
                  allNilai.length) *
                  10
              ) / 10
            : 0;

        // Outstanding payments count
        const outstandingPayments = kelas.siswa.filter(
          (s) => s.tagihan && s.tagihan.length > 0
        ).length;

        // Students with low attendance (< 75%)
        const lowAttendanceSiswa = kelas.siswa.filter((siswa) => {
          const totalAbsensi = siswa.absensi.length;
          if (totalAbsensi === 0) return false;

          const hadir = siswa.absensi.filter(
            (a) => a.status === "HADIR"
          ).length;
          const attendanceRate = (hadir / totalAbsensi) * 100;

          return attendanceRate < 75;
        });

        // Students with low grades (< 60)
        const lowGradesSiswa = kelas.siswa.filter((siswa) => {
          const nilai = siswa.nilaiRapor;
          if (nilai.length === 0) return false;

          const average =
            nilai.reduce((sum, n) => sum + n.nilai, 0) / nilai.length;

          return average < 60;
        });

        // Map students data
        const students = kelas.siswa.map((siswa) => {
          const totalAbsensi = siswa.absensi.length;
          const hadir = siswa.absensi.filter(
            (a) => a.status === "HADIR"
          ).length;
          const attendanceRate =
            totalAbsensi > 0 ? Math.round((hadir / totalAbsensi) * 100) : 0;

          const nilaiAvg =
            siswa.nilaiRapor.length > 0
              ? Math.round(
                  (siswa.nilaiRapor.reduce((sum, n) => sum + n.nilai, 0) /
                    siswa.nilaiRapor.length) *
                    10
                ) / 10
              : null;

          return {
            id_siswa: siswa.id_siswa,
            nama: siswa.nama,
            nis: siswa.nis,
            fotoProfil: siswa.fotoProfil,
            attendanceRate: `${attendanceRate}%`,
            nilaiAverage: nilaiAvg,
            outstandingBills: siswa.tagihan.length,
          };
        });

        waliKelasData = {
          kelas: {
            id_kelas: kelas.id_kelas,
            namaKelas: kelas.namaKelas,
            tingkat: kelas.tingkat,
          },
          statistics: {
            totalSiswa,
            nilaiAverage,
            attendanceToday: attendanceStats,
            outstandingPayments,
            lowAttendanceCount: lowAttendanceSiswa.length,
            lowGradesCount: lowGradesSiswa.length,
          },
          students,
          alerts: {
            lowAttendance: lowAttendanceSiswa.map((s) => ({
              id_siswa: s.id_siswa,
              nama: s.nama,
              attendanceRate: Math.round(
                (s.absensi.filter((a) => a.status === "HADIR").length /
                  s.absensi.length) *
                  100
              ),
            })),
            lowGrades: lowGradesSiswa.map((s) => ({
              id_siswa: s.id_siswa,
              nama: s.nama,
              average:
                Math.round(
                  (s.nilaiRapor.reduce((sum, n) => sum + n.nilai, 0) /
                    s.nilaiRapor.length) *
                    10
                ) / 10,
            })),
          },
        };
      }

      // Get recent activities
      const recentActivities = await this.getRecentActivities(
        guruId,
        tahunAjaran.id_tahun
      );

      return {
        guru: {
          id_guru: guru.id_guru,
          nama: guru.nama,
          nip: guru.nip,
          jabatan: guru.jabatan,
          fotoProfil: guru.fotoProfil,
        },
        tahunAjaran: {
          id_tahun: tahunAjaran.id_tahun,
          namaTahun: tahunAjaran.namaTahun,
          semester: tahunAjaran.semester,
        },
        isWaliKelas,
        waliKelas: waliKelasData,
        recentActivities,
      };
    } catch (error: any) {
      throw new Error(`Failed to get guru dashboard: ${error.message}`);
    }
  }

  /**
   * Get recent activities (nilai & absensi input)
   */
  static async getRecentActivities(guruId: number, tahunAjaranId: number) {
    try {
      // Get recent nilai input
      const recentNilai = await prisma.nilaiRapor.findMany({
        where: {
          siswa: {
            kelas: {
              waliId: guruId,
            },
          },
          tahunAjaranId,
        },
        include: {
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
        orderBy: {
          id_nilai: "desc",
        },
        take: 5,
      });

      // Get recent absensi input
      const recentAbsensi = await prisma.absensi.findMany({
        where: {
          siswa: {
            kelas: {
              waliId: guruId,
            },
          },
          id_tahun: tahunAjaranId,
        },
        include: {
          siswa: {
            select: {
              nama: true,
            },
          },
        },
        orderBy: {
          tanggal: "desc",
        },
        take: 10,
      });

      return {
        nilai: recentNilai.map((n) => ({
          type: "INPUT_NILAI",
          siswa: n.siswa.nama,
          mapel: n.mapel.namaMapel,
          nilai: n.nilai,
          semester: n.semester,
        })),
        absensi: recentAbsensi.map((a) => ({
          type: "INPUT_ABSENSI",
          siswa: a.siswa.nama,
          status: a.status,
          tanggal: a.tanggal,
          keterangan: a.keterangan,
        })),
      };
    } catch (error: any) {
      throw new Error(`Failed to get recent activities: ${error.message}`);
    }
  }

  /**
   * Get quick attendance input data for today
   */
  static async getAttendanceQuickInput(guruId: number, kelasId?: number) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get active tahun ajaran
      const tahunAjaran = await prisma.tahunAjaran.findFirst({
        where: { isActive: true },
      });

      if (!tahunAjaran) {
        throw new Error("No active tahun ajaran");
      }

      // Get kelas - either specified or wali kelas
      let kelas;
      if (kelasId) {
        kelas = await prisma.kelas.findUnique({
          where: { id_kelas: kelasId },
          include: {
            siswa: {
              include: {
                absensi: {
                  where: {
                    tanggal: {
                      gte: today,
                    },
                    id_tahun: tahunAjaran.id_tahun,
                  },
                },
              },
            },
          },
        });
      } else {
        // Get wali kelas
        kelas = await prisma.kelas.findFirst({
          where: { waliId: guruId },
          include: {
            siswa: {
              include: {
                absensi: {
                  where: {
                    tanggal: {
                      gte: today,
                    },
                    id_tahun: tahunAjaran.id_tahun,
                  },
                },
              },
            },
          },
        });
      }

      if (!kelas) {
        throw new Error("Kelas not found");
      }

      // Map students with attendance status
      const students = kelas.siswa.map((siswa) => {
        const todayAttendance = siswa.absensi[0] || null;

        return {
          id_siswa: siswa.id_siswa,
          nama: siswa.nama,
          nis: siswa.nis,
          fotoProfil: siswa.fotoProfil,
          status: todayAttendance?.status || null,
          keterangan: todayAttendance?.keterangan || null,
          id_absensi: todayAttendance?.id_absensi || null,
        };
      });

      return {
        kelas: {
          id_kelas: kelas.id_kelas,
          namaKelas: kelas.namaKelas,
          tingkat: kelas.tingkat,
        },
        tanggal: today,
        tahunAjaran: {
          id_tahun: tahunAjaran.id_tahun,
          namaTahun: tahunAjaran.namaTahun,
        },
        students,
        summary: {
          total: students.length,
          inputted: students.filter((s) => s.status !== null).length,
          pending: students.filter((s) => s.status === null).length,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get quick attendance: ${error.message}`);
    }
  }

  /**
   * Get statistics summary for guru
   */
  static async getStatistics(guruId: number, tahunAjaranId?: number) {
    try {
      const tahunAjaran = tahunAjaranId
        ? await prisma.tahunAjaran.findUnique({
            where: { id_tahun: tahunAjaranId },
          })
        : await prisma.tahunAjaran.findFirst({
            where: { isActive: true },
          });

      if (!tahunAjaran) {
        throw new Error("Tahun ajaran not found");
      }

      // Check if wali kelas
      const kelas = await prisma.kelas.findFirst({
        where: { waliId: guruId },
        include: {
          siswa: {
            include: {
              absensi: {
                where: { id_tahun: tahunAjaran.id_tahun },
              },
              nilaiRapor: {
                where: { tahunAjaranId: tahunAjaran.id_tahun },
              },
            },
          },
        },
      });

      if (!kelas) {
        return {
          isWaliKelas: false,
          message: "Guru is not a wali kelas",
        };
      }

      const totalSiswa = kelas.siswa.length;

      // Calculate attendance rate
      const totalAbsensi = kelas.siswa.reduce(
        (sum, s) => sum + s.absensi.length,
        0
      );
      const totalHadir = kelas.siswa.reduce(
        (sum, s) => sum + s.absensi.filter((a) => a.status === "HADIR").length,
        0
      );
      const attendanceRate =
        totalAbsensi > 0 ? Math.round((totalHadir / totalAbsensi) * 100) : 0;

      // Calculate average grade
      const allNilai = kelas.siswa.flatMap((s) => s.nilaiRapor);
      const nilaiAverage =
        allNilai.length > 0
          ? Math.round(
              (allNilai.reduce((sum, n) => sum + n.nilai, 0) /
                allNilai.length) *
                10
            ) / 10
          : 0;

      return {
        isWaliKelas: true,
        kelas: {
          namaKelas: kelas.namaKelas,
          tingkat: kelas.tingkat,
        },
        statistics: {
          totalSiswa,
          attendanceRate: `${attendanceRate}%`,
          nilaiAverage,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }

  /**
   * Get list of students with problems (low attendance or grades)
   */
  static async getStudentsWithProblems(guruId: number, tahunAjaranId?: number) {
    try {
      const tahunAjaran = tahunAjaranId
        ? await prisma.tahunAjaran.findUnique({
            where: { id_tahun: tahunAjaranId },
          })
        : await prisma.tahunAjaran.findFirst({
            where: { isActive: true },
          });

      if (!tahunAjaran) {
        throw new Error("Tahun ajaran not found");
      }

      const kelas = await prisma.kelas.findFirst({
        where: { waliId: guruId },
        include: {
          siswa: {
            include: {
              absensi: {
                where: { id_tahun: tahunAjaran.id_tahun },
              },
              nilaiRapor: {
                where: { tahunAjaranId: tahunAjaran.id_tahun },
              },
            },
          },
        },
      });

      if (!kelas) {
        throw new Error("Guru is not a wali kelas");
      }

      const problems = [];

      for (const siswa of kelas.siswa) {
        const issues: string[] = [];

        // Check attendance
        const totalAbsensi = siswa.absensi.length;
        if (totalAbsensi > 0) {
          const hadir = siswa.absensi.filter(
            (a) => a.status === "HADIR"
          ).length;
          const rate = (hadir / totalAbsensi) * 100;
          if (rate < 75) {
            issues.push(`Kehadiran rendah: ${Math.round(rate)}%`);
          }
        }

        // Check grades
        if (siswa.nilaiRapor.length > 0) {
          const avg =
            siswa.nilaiRapor.reduce((sum, n) => sum + n.nilai, 0) /
            siswa.nilaiRapor.length;
          if (avg < 60) {
            issues.push(`Nilai rendah: ${Math.round(avg * 10) / 10}`);
          }
        }

        if (issues.length > 0) {
          problems.push({
            id_siswa: siswa.id_siswa,
            nama: siswa.nama,
            nis: siswa.nis,
            issues,
          });
        }
      }

      return {
        kelas: {
          namaKelas: kelas.namaKelas,
        },
        totalProblems: problems.length,
        students: problems,
      };
    } catch (error: any) {
      throw new Error(`Failed to get students with problems: ${error.message}`);
    }
  }
}
