// src/services/absensi.enhanced.service.ts
// Enhanced service dengan validasi jam dan logic yang lebih kompleks

import prisma from "../config/database";
import { StatusAbsensi, StatusPertemuan } from "@prisma/client";

export class AbsensiEnhancedService {
  /**
   * ============================================================================
   * GURU FEATURES - With Time Validation
   * ============================================================================
   */

  /**
   * Get jadwal hari ini dengan validasi jam
   * Hanya tampilkan jadwal yang bisa dimulai (sesuai jam)
   */
  static async getJadwalHariIniGuru(guruId: number) {
    const now = new Date();
    const dayName = now.toLocaleDateString("id-ID", { weekday: "long" });
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM

    // Get all jadwal for this guru today
    const jadwalList = await prisma.jadwal.findMany({
      where: {
        hari: dayName,
        guruMapel: {
          id_guru: guruId,
        },
      },
      include: {
        guruMapel: {
          include: {
            mapel: true,
            kelas: {
              include: {
                siswa: {
                  where: { status: "AKTIF" },
                },
              },
            },
            tahunAjaran: true,
          },
        },
      },
      orderBy: { jamMulai: "asc" },
    });

    // Check each jadwal for pertemuan status
    const jadwalWithStatus = await Promise.all(
      jadwalList.map(async (jadwal) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        // Check if pertemuan already exists for today
        const pertemuan = await prisma.absensiPertemuan.findFirst({
          where: {
            guruMapelId: jadwal.guruMapel.id,
            tanggal: { gte: today, lte: todayEnd },
            jamMulai: jadwal.jamMulai,
            jamSelesai: jadwal.jamSelesai,
          },
          include: {
            detailAbsensi: true,
          },
        });

        // Validasi apakah bisa dimulai
        const canStart = this.validateJamMengajar(
          currentTime,
          jadwal.jamMulai,
          jadwal.jamSelesai,
        );

        // Status pertemuan
        let statusInfo = {
          canStart: false,
          reason: "",
          pertemuan: null as any,
        };

        if (pertemuan) {
          // Sudah ada pertemuan
          statusInfo = {
            canStart: pertemuan.statusPertemuan !== "COMPLETED",
            reason: pertemuan.statusPertemuan,
            pertemuan: {
              id: pertemuan.id_absensi_pertemuan,
              pertemuanKe: pertemuan.pertemuanKe,
              statusPertemuan: pertemuan.statusPertemuan,
              materi: pertemuan.materi,
              sudahAbsen: pertemuan.detailAbsensi.length,
              belumAbsen:
                jadwal.guruMapel.kelas.siswa.length -
                pertemuan.detailAbsensi.length,
            },
          };
        } else {
          // Belum ada pertemuan
          if (!canStart.valid) {
            statusInfo = {
              canStart: false,
              reason: canStart.reason,
              pertemuan: null,
            };
          } else {
            statusInfo = {
              canStart: true,
              reason: "Ready to start",
              pertemuan: null,
            };
          }
        }

        return {
          id_jadwal: jadwal.id_jadwal,
          hari: jadwal.hari,
          jamMulai: jadwal.jamMulai,
          jamSelesai: jadwal.jamSelesai,
          ruangan: jadwal.ruangan,
          guruMapel: {
            id: jadwal.guruMapel.id,
            mapel: jadwal.guruMapel.mapel.namaMapel,
            kelas: jadwal.guruMapel.kelas.namaKelas,
            totalSiswa: jadwal.guruMapel.kelas.siswa.length,
            tahunAjaran: jadwal.guruMapel.tahunAjaran.namaTahun,
          },
          status: statusInfo,
        };
      }),
    );

    return {
      tanggal: now,
      hari: dayName,
      waktuSekarang: currentTime,
      jadwal: jadwalWithStatus,
    };
  }

  /**
   * Validasi jam mengajar
   * Boleh mulai 15 menit sebelum jam mulai sampai jam selesai
   */
  private static validateJamMengajar(
    currentTime: string,
    jamMulai: string,
    jamSelesai: string,
  ): { valid: boolean; reason: string } {
    const current = this.timeToMinutes(currentTime);
    const mulai = this.timeToMinutes(jamMulai);
    const selesai = this.timeToMinutes(jamSelesai);

    // Toleransi 15 menit sebelum
    const toleransi = 15;
    const mulaiWithToleransi = mulai - toleransi;

    if (current < mulaiWithToleransi) {
      const diff = mulaiWithToleransi - current;
      return {
        valid: false,
        reason: `Terlalu awal. Mulai dalam ${diff} menit`,
      };
    }

    if (current > selesai) {
      return {
        valid: false,
        reason: "Jadwal sudah terlewat",
      };
    }

    return {
      valid: true,
      reason: "Bisa dimulai",
    };
  }

  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Mulai pertemuan (Create AbsensiPertemuan)
   * Dengan validasi jam
   */
  static async mulaiPertemuan(data: {
    guruMapelId: number;
    jadwalId: number;
    pertemuanKe: number;
    materi?: string;
    keteranganGuru?: string;
  }) {
    // 1. Get jadwal & validate
    const jadwal = await prisma.jadwal.findUnique({
      where: { id_jadwal: data.jadwalId },
      include: {
        guruMapel: {
          include: {
            kelas: {
              include: {
                siswa: { where: { status: "AKTIF" } },
              },
            },
          },
        },
      },
    });

    if (!jadwal) {
      throw new Error("Jadwal tidak ditemukan");
    }

    // 2. Validate time
    const now = new Date();
    const currentTime = now.toTimeString().substring(0, 5);
    const validation = this.validateJamMengajar(
      currentTime,
      jadwal.jamMulai,
      jadwal.jamSelesai,
    );

    if (!validation.valid) {
      throw new Error(`Tidak bisa memulai pertemuan: ${validation.reason}`);
    }

    // 3. Check if already exists
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const existing = await prisma.absensiPertemuan.findFirst({
      where: {
        guruMapelId: data.guruMapelId,
        tanggal: { gte: today, lte: todayEnd },
        jamMulai: jadwal.jamMulai,
        jamSelesai: jadwal.jamSelesai,
      },
    });

    if (existing) {
      throw new Error("Pertemuan sudah dibuat untuk jadwal ini");
    }

    // 4. Create pertemuan
    const pertemuan = await prisma.absensiPertemuan.create({
      data: {
        guruMapelId: data.guruMapelId,
        pertemuanKe: data.pertemuanKe,
        tanggal: today,
        jamMulai: jadwal.jamMulai,
        jamSelesai: jadwal.jamSelesai,
        materi: data.materi,
        keteranganGuru: data.keteranganGuru,
        statusPertemuan: "ONGOING",
      },
    });

    // 5. Create detail absensi for all students (default null)
    const siswaList = jadwal.guruMapel.kelas.siswa;
    await prisma.detailAbsensiPertemuan.createMany({
      data: siswaList.map((siswa) => ({
        absensiPertemuanId: pertemuan.id_absensi_pertemuan,
        siswaId: siswa.id_siswa,
        status: "TIDAK_HADIR", // Default alpha, guru bisa ubah
      })),
    });

    return {
      pertemuan,
      totalSiswa: siswaList.length,
      message: "Pertemuan berhasil dimulai. Silakan isi presensi siswa.",
    };
  }

  /**
   * Input presensi per siswa
   * Bisa dilakukan satu per satu atau bulk
   */
  static async inputPresensiSiswa(data: {
    pertemuanId: number;
    siswaId: number;
    status: StatusAbsensi;
    keterangan?: string;
  }) {
    // Check if pertemuan exists and not completed
    const pertemuan = await prisma.absensiPertemuan.findUnique({
      where: { id_absensi_pertemuan: data.pertemuanId },
    });

    if (!pertemuan) {
      throw new Error("Pertemuan tidak ditemukan");
    }

    if (pertemuan.statusPertemuan === "COMPLETED") {
      throw new Error("Pertemuan sudah selesai, tidak bisa diubah");
    }

    // Update or create detail
    const detail = await prisma.detailAbsensiPertemuan.upsert({
      where: {
        absensiPertemuanId_siswaId: {
          absensiPertemuanId: data.pertemuanId,
          siswaId: data.siswaId,
        },
      },
      create: {
        absensiPertemuanId: data.pertemuanId,
        siswaId: data.siswaId,
        status: data.status,
        keterangan: data.keterangan,
        waktuCheckIn: new Date(),
      },
      update: {
        status: data.status,
        keterangan: data.keterangan,
        waktuCheckIn: new Date(),
      },
    });

    return detail;
  }

  /**
   * Input presensi bulk (semua siswa sekaligus)
   */
  static async inputPresensiBulk(data: {
    pertemuanId: number;
    detailAbsensi: Array<{
      siswaId: number;
      status: StatusAbsensi;
      keterangan?: string;
    }>;
  }) {
    // Check pertemuan
    const pertemuan = await prisma.absensiPertemuan.findUnique({
      where: { id_absensi_pertemuan: data.pertemuanId },
    });

    if (!pertemuan) {
      throw new Error("Pertemuan tidak ditemukan");
    }

    if (pertemuan.statusPertemuan === "COMPLETED") {
      throw new Error("Pertemuan sudah selesai");
    }

    // Update each detail
    const results = await Promise.all(
      data.detailAbsensi.map((item) =>
        prisma.detailAbsensiPertemuan.upsert({
          where: {
            absensiPertemuanId_siswaId: {
              absensiPertemuanId: data.pertemuanId,
              siswaId: item.siswaId,
            },
          },
          create: {
            absensiPertemuanId: data.pertemuanId,
            siswaId: item.siswaId,
            status: item.status,
            keterangan: item.keterangan,
            waktuCheckIn: new Date(),
          },
          update: {
            status: item.status,
            keterangan: item.keterangan,
            waktuCheckIn: new Date(),
          },
        }),
      ),
    );

    return {
      updated: results.length,
      message: "Presensi berhasil disimpan",
    };
  }

  /**
   * Selesaikan pertemuan
   * Set status ke COMPLETED
   */
  static async selesaikanPertemuan(pertemuanId: number) {
    const pertemuan = await prisma.absensiPertemuan.update({
      where: { id_absensi_pertemuan: pertemuanId },
      data: {
        statusPertemuan: "COMPLETED",
      },
      include: {
        detailAbsensi: true,
      },
    });

    // Count stats
    const stats = {
      total: pertemuan.detailAbsensi.length,
      hadir: pertemuan.detailAbsensi.filter((d) => d.status === "HADIR").length,
      sakit: pertemuan.detailAbsensi.filter((d) => d.status === "SAKIT").length,
      izin: pertemuan.detailAbsensi.filter((d) => d.status === "IZIN").length,
      alpha: pertemuan.detailAbsensi.filter((d) => d.status === "TIDAK_HADIR")
        .length,
    };

    return {
      pertemuan,
      stats,
      message: "Pertemuan selesai",
    };
  }

  /**
   * Get detail pertemuan (untuk edit/review)
   */
  static async getDetailPertemuan(pertemuanId: number) {
    const pertemuan = await prisma.absensiPertemuan.findUnique({
      where: { id_absensi_pertemuan: pertemuanId },
      include: {
        guruMapel: {
          include: {
            guru: { select: { nama: true } },
            mapel: { select: { namaMapel: true } },
            kelas: {
              include: {
                siswa: {
                  where: { status: "AKTIF" },
                  orderBy: { nama: "asc" },
                },
              },
            },
          },
        },
        detailAbsensi: {
          include: {
            siswa: {
              select: {
                id_siswa: true,
                nis: true,
                nama: true,
              },
            },
          },
        },
      },
    });

    if (!pertemuan) {
      throw new Error("Pertemuan tidak ditemukan");
    }

    // Merge siswa list with absensi detail
    const siswaList = pertemuan.guruMapel.kelas.siswa.map((siswa) => {
      const detail = pertemuan.detailAbsensi.find(
        (d) => d.siswaId === siswa.id_siswa,
      );

      return {
        id_siswa: siswa.id_siswa,
        nis: siswa.nis,
        nama: siswa.nama,
        status: detail?.status || null,
        keterangan: detail?.keterangan || null,
        waktuCheckIn: detail?.waktuCheckIn || null,
        id_detail: detail?.id_detail_absensi || null,
      };
    });

    // Stats
    const stats = {
      totalSiswa: siswaList.length,
      sudahAbsen: siswaList.filter((s) => s.status !== null).length,
      belumAbsen: siswaList.filter((s) => s.status === null).length,
      hadir: siswaList.filter((s) => s.status === "HADIR").length,
      sakit: siswaList.filter((s) => s.status === "SAKIT").length,
      izin: siswaList.filter((s) => s.status === "IZIN").length,
      alpha: siswaList.filter((s) => s.status === "TIDAK_HADIR").length,
    };

    return {
      pertemuan: {
        id: pertemuan.id_absensi_pertemuan,
        pertemuanKe: pertemuan.pertemuanKe,
        tanggal: pertemuan.tanggal,
        jamMulai: pertemuan.jamMulai,
        jamSelesai: pertemuan.jamSelesai,
        materi: pertemuan.materi,
        keteranganGuru: pertemuan.keteranganGuru,
        statusPertemuan: pertemuan.statusPertemuan,
        guru: pertemuan.guruMapel.guru.nama,
        mapel: pertemuan.guruMapel.mapel.namaMapel,
        kelas: pertemuan.guruMapel.kelas.namaKelas,
      },
      siswaList,
      stats,
    };
  }

  /**
   * Riwayat mengajar guru
   * Untuk melihat pertemuan-pertemuan sebelumnya
   */
  static async getRiwayatMengajar(
    guruId: number,
    options?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      page?: number;
    },
  ) {
    const where: any = {
      guruMapel: {
        id_guru: guruId,
      },
    };

    if (options?.startDate && options?.endDate) {
      where.tanggal = {
        gte: options.startDate,
        lte: options.endDate,
      };
    }

    const skip = options?.page ? (options.page - 1) * (options.limit || 10) : 0;
    const take = options?.limit || 10;

    const [pertemuanList, total] = await Promise.all([
      prisma.absensiPertemuan.findMany({
        where,
        include: {
          guruMapel: {
            include: {
              mapel: { select: { namaMapel: true } },
              kelas: { select: { namaKelas: true } },
            },
          },
          detailAbsensi: true,
        },
        orderBy: { tanggal: "desc" },
        skip,
        take,
      }),
      prisma.absensiPertemuan.count({ where }),
    ]);

    const riwayat = pertemuanList.map((p) => ({
      id: p.id_absensi_pertemuan,
      pertemuanKe: p.pertemuanKe,
      tanggal: p.tanggal,
      jamMulai: p.jamMulai,
      jamSelesai: p.jamSelesai,
      mapel: p.guruMapel.mapel.namaMapel,
      kelas: p.guruMapel.kelas.namaKelas,
      materi: p.materi,
      statusPertemuan: p.statusPertemuan,
      stats: {
        total: p.detailAbsensi.length,
        hadir: p.detailAbsensi.filter((d) => d.status === "HADIR").length,
        sakit: p.detailAbsensi.filter((d) => d.status === "SAKIT").length,
        izin: p.detailAbsensi.filter((d) => d.status === "IZIN").length,
        alpha: p.detailAbsensi.filter((d) => d.status === "TIDAK_HADIR").length,
      },
    }));

    return {
      riwayat,
      pagination: {
        page: options?.page || 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * ============================================================================
   * SISWA FEATURES
   * ============================================================================
   */

  /**
   * Kehadiranku - Stats per mata pelajaran
   */
  static async getKehadiranSiswa(siswaId: number) {
    // Get siswa with kelas
    const siswa = await prisma.siswa.findUnique({
      where: { id_siswa: siswaId },
      include: {
        kelas: {
          include: {
            guruMapel: {
              include: {
                mapel: { select: { namaMapel: true } },
                guru: { select: { nama: true } },
              },
            },
          },
        },
      },
    });

    if (!siswa) {
      throw new Error("Siswa tidak ditemukan");
    }

    // Get absensi per mapel
    const kehadiranPerMapel = await Promise.all(
      siswa.kelas!.guruMapel.map(async (gm) => {
        const detailList = await prisma.detailAbsensiPertemuan.findMany({
          where: {
            siswaId,
            absensiPertemuan: {
              guruMapelId: gm.id,
            },
          },
          include: {
            absensiPertemuan: {
              select: {
                pertemuanKe: true,
                tanggal: true,
                jamMulai: true,
                jamSelesai: true,
                materi: true,
                statusPertemuan: true,
              },
            },
          },
          orderBy: {
            absensiPertemuan: {
              tanggal: "desc",
            },
          },
        });

        const stats = {
          total: detailList.length,
          hadir: detailList.filter((d) => d.status === "HADIR").length,
          sakit: detailList.filter((d) => d.status === "SAKIT").length,
          izin: detailList.filter((d) => d.status === "IZIN").length,
          alpha: detailList.filter((d) => d.status === "TIDAK_HADIR").length,
        };

        const persentaseKehadiran =
          stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;

        return {
          mapel: gm.mapel.namaMapel,
          guru: gm.guru.nama,
          stats,
          persentaseKehadiran,
          riwayat: detailList.map((d) => ({
            pertemuanKe: d.absensiPertemuan.pertemuanKe,
            tanggal: d.absensiPertemuan.tanggal,
            jamMulai: d.absensiPertemuan.jamMulai,
            jamSelesai: d.absensiPertemuan.jamSelesai,
            materi: d.absensiPertemuan.materi,
            status: d.status,
            keterangan: d.keterangan,
            waktuCheckIn: d.waktuCheckIn,
          })),
        };
      }),
    );

    // Overall stats
    const totalAll = kehadiranPerMapel.reduce(
      (sum, m) => sum + m.stats.total,
      0,
    );
    const hadirAll = kehadiranPerMapel.reduce(
      (sum, m) => sum + m.stats.hadir,
      0,
    );
    const persentaseKeseluruhan =
      totalAll > 0 ? Math.round((hadirAll / totalAll) * 100) : 0;

    return {
      siswa: {
        id: siswa.id_siswa,
        nis: siswa.nis,
        nama: siswa.nama,
        kelas: siswa.kelas?.namaKelas,
      },
      overall: {
        totalPertemuan: totalAll,
        totalHadir: hadirAll,
        persentaseKehadiran: persentaseKeseluruhan,
      },
      perMapel: kehadiranPerMapel,
    };
  }

  /**
   * Jadwal pelajaran siswa
   */
  static async getJadwalSiswa(siswaId: number, hari?: string) {
    const siswa = await prisma.siswa.findUnique({
      where: { id_siswa: siswaId },
      include: { kelas: true },
    });

    if (!siswa || !siswa.kelas) {
      throw new Error("Siswa atau kelas tidak ditemukan");
    }

    const hariTarget =
      hari || new Date().toLocaleDateString("id-ID", { weekday: "long" });

    const jadwalList = await prisma.jadwal.findMany({
      where: {
        hari: hariTarget,
        guruMapel: {
          id_kelas: siswa.kelasId!,
        },
      },
      include: {
        guruMapel: {
          include: {
            mapel: { select: { namaMapel: true } },
            guru: { select: { nama: true } },
          },
        },
      },
      orderBy: { jamMulai: "asc" },
    });

    return {
      siswa: {
        nama: siswa.nama,
        kelas: siswa.kelas.namaKelas,
      },
      hari: hariTarget,
      jadwal: jadwalList.map((j) => ({
        id_jadwal: j.id_jadwal,
        jamMulai: j.jamMulai,
        jamSelesai: j.jamSelesai,
        ruangan: j.ruangan,
        mapel: j.guruMapel.mapel.namaMapel,
        guru: j.guruMapel.guru.nama,
      })),
    };
  }
}
