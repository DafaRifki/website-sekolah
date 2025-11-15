import { prisma } from "../config/database";
import { PaginationQuery, PaginationResult } from "../types/common.types";
import {
  buildPaginationQuery,
  buildPaginationResult,
  buildSearchFilter,
} from "../utils/database.util";
import { Prisma } from "@prisma/client";

interface CreateNilaiData {
  id_siswa: number;
  id_mapel: number;
  tahunAjaranId: number;
  semester: string;
  nilai: number;
}

interface UpdateNilaiData {
  nilai: number;
}

interface BulkCreateNilaiData {
  kelasId: number;
  id_mapel: number;
  tahunAjaranId: number;
  semester: string;
  nilaiData: Array<{
    id_siswa: number;
    nilai: number;
  }>;
}

export class NilaiService {
  /**
   * Create nilai (single)
   */
  static async create(data: CreateNilaiData) {
    // Validate siswa exists
    const siswa = await prisma.siswa.findUnique({
      where: { id_siswa: data.id_siswa },
    });
    if (!siswa) {
      throw new Error("Siswa not found");
    }

    // Validate mata pelajaran exists
    const mapel = await prisma.mataPelajaran.findUnique({
      where: { id_mapel: data.id_mapel },
    });
    if (!mapel) {
      throw new Error("Mata pelajaran not found");
    }

    // Validate tahun ajaran exists
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id_tahun: data.tahunAjaranId },
    });
    if (!tahunAjaran) {
      throw new Error("Tahun ajaran not found");
    }

    // Validate nilai (0-100)
    if (data.nilai < 0 || data.nilai > 100) {
      throw new Error("Nilai must be between 0 and 100");
    }

    // Check if nilai already exists
    const existing = await prisma.nilaiRapor.findFirst({
      where: {
        id_siswa: data.id_siswa,
        id_mapel: data.id_mapel,
        tahunAjaranId: data.tahunAjaranId,
        semester: data.semester,
      },
    });

    if (existing) {
      throw new Error(
        "Nilai already exists for this siswa, mapel, and semester"
      );
    }

    const nilai = await prisma.nilaiRapor.create({
      data: {
        id_siswa: data.id_siswa,
        id_mapel: data.id_mapel,
        tahunAjaranId: data.tahunAjaranId,
        semester: data.semester,
        nilai: data.nilai,
      },
      include: {
        siswa: {
          select: {
            nis: true,
            nama: true,
          },
        },
        mapel: {
          select: {
            namaMapel: true,
            kelompokMapel: true,
          },
        },
        tahunAjaran: {
          select: {
            namaTahun: true,
          },
        },
      },
    });

    return nilai;
  }

  /**
   * Bulk create nilai (per kelas)
   */
  static async bulkCreate(data: BulkCreateNilaiData) {
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

    // Validate mata pelajaran exists
    const mapel = await prisma.mataPelajaran.findUnique({
      where: { id_mapel: data.id_mapel },
    });

    if (!mapel) {
      throw new Error("Mata pelajaran not found");
    }

    // Validate tahun ajaran exists
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id_tahun: data.tahunAjaranId },
    });

    if (!tahunAjaran) {
      throw new Error("Tahun ajaran not found");
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ siswaId: number; error: string }>,
    };

    // Create nilai for each siswa
    for (const nilaiItem of data.nilaiData) {
      try {
        // Check if siswa is in kelas
        const siswaInKelas = kelas.siswa.find(
          (s) => s.id_siswa === nilaiItem.id_siswa
        );

        if (!siswaInKelas) {
          throw new Error("Siswa not in this kelas");
        }

        // Validate nilai
        if (nilaiItem.nilai < 0 || nilaiItem.nilai > 100) {
          throw new Error("Nilai must be between 0 and 100");
        }

        // Check if nilai already exists
        const existing = await prisma.nilaiRapor.findFirst({
          where: {
            id_siswa: nilaiItem.id_siswa,
            id_mapel: data.id_mapel,
            tahunAjaranId: data.tahunAjaranId,
            semester: data.semester,
          },
        });

        if (existing) {
          // Update instead of create
          await prisma.nilaiRapor.update({
            where: { id_nilai: existing.id_nilai },
            data: { nilai: nilaiItem.nilai },
          });
        } else {
          // Create new
          await prisma.nilaiRapor.create({
            data: {
              id_siswa: nilaiItem.id_siswa,
              id_mapel: data.id_mapel,
              tahunAjaranId: data.tahunAjaranId,
              semester: data.semester,
              nilai: nilaiItem.nilai,
            },
          });
        }

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          siswaId: nilaiItem.id_siswa,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Update nilai
   */
  static async update(id: number, data: UpdateNilaiData) {
    const existing = await prisma.nilaiRapor.findUnique({
      where: { id_nilai: id },
    });

    if (!existing) {
      throw new Error("Nilai not found");
    }

    // Validate nilai
    if (data.nilai < 0 || data.nilai > 100) {
      throw new Error("Nilai must be between 0 and 100");
    }

    const updated = await prisma.nilaiRapor.update({
      where: { id_nilai: id },
      data: { nilai: data.nilai },
      include: {
        siswa: {
          select: {
            nis: true,
            nama: true,
          },
        },
        mapel: {
          select: {
            namaMapel: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete nilai
   */
  static async delete(id: number) {
    const nilai = await prisma.nilaiRapor.findUnique({
      where: { id_nilai: id },
    });

    if (!nilai) {
      throw new Error("Nilai not found");
    }

    await prisma.nilaiRapor.delete({
      where: { id_nilai: id },
    });

    return { message: "Nilai deleted successfully" };
  }

  /**
   * Get nilai by siswa
   */
  static async getBySiswa(
    siswaId: number,
    tahunAjaranId?: number,
    semester?: string
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
      where.tahunAjaranId = tahunAjaranId;
    }

    if (semester) {
      where.semester = semester;
    }

    const nilai = await prisma.nilaiRapor.findMany({
      where,
      include: {
        mapel: {
          select: {
            id_mapel: true,
            namaMapel: true,
            kelompokMapel: true,
          },
        },
        tahunAjaran: {
          select: {
            namaTahun: true,
          },
        },
      },
      orderBy: [
        { tahunAjaranId: "desc" },
        { semester: "asc" },
        { mapel: { namaMapel: "asc" } },
      ],
    });

    // Calculate rata-rata
    const rataRata =
      nilai.length > 0
        ? nilai.reduce((sum, n) => sum + n.nilai, 0) / nilai.length
        : 0;

    return {
      siswa: {
        id_siswa: siswa.id_siswa,
        nis: siswa.nis,
        nama: siswa.nama,
      },
      nilai,
      rataRata: Math.round(rataRata * 100) / 100,
      totalMapel: nilai.length,
    };
  }

  /**
   * Get nilai by kelas & mata pelajaran
   */
  static async getByKelasMapel(
    kelasId: number,
    mapelId: number,
    tahunAjaranId: number,
    semester: string
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

    const mapel = await prisma.mataPelajaran.findUnique({
      where: { id_mapel: mapelId },
    });

    if (!mapel) {
      throw new Error("Mata pelajaran not found");
    }

    // Get nilai for all siswa in kelas
    const nilaiList = await Promise.all(
      kelas.siswa.map(async (siswa) => {
        const nilai = await prisma.nilaiRapor.findFirst({
          where: {
            id_siswa: siswa.id_siswa,
            id_mapel: mapelId,
            tahunAjaranId,
            semester,
          },
        });

        return {
          id_siswa: siswa.id_siswa,
          nis: siswa.nis,
          nama: siswa.nama,
          nilai: nilai?.nilai || null,
          id_nilai: nilai?.id_nilai || null,
        };
      })
    );

    // Calculate statistics
    const nilaiValues = nilaiList
      .filter((n) => n.nilai !== null)
      .map((n) => n.nilai as number);

    const stats = {
      totalSiswa: kelas.siswa.length,
      sudahDinilai: nilaiValues.length,
      belumDinilai: kelas.siswa.length - nilaiValues.length,
      rataRata:
        nilaiValues.length > 0
          ? Math.round(
              (nilaiValues.reduce((sum, n) => sum + n, 0) /
                nilaiValues.length) *
                100
            ) / 100
          : 0,
      nilaiTertinggi: nilaiValues.length > 0 ? Math.max(...nilaiValues) : 0,
      nilaiTerendah: nilaiValues.length > 0 ? Math.min(...nilaiValues) : 0,
    };

    return {
      kelas: {
        id_kelas: kelas.id_kelas,
        namaKelas: kelas.namaKelas,
        tingkat: kelas.tingkat,
      },
      mapel: {
        id_mapel: mapel.id_mapel,
        namaMapel: mapel.namaMapel,
      },
      nilaiList,
      stats,
    };
  }

  /**
   * Generate rapor siswa
   */
  static async generateRapor(
    siswaId: number,
    tahunAjaranId: number,
    semester: string
  ) {
    const siswa = await prisma.siswa.findUnique({
      where: { id_siswa: siswaId },
      include: {
        kelas: {
          include: {
            guru: true,
          },
        },
      },
    });

    if (!siswa) {
      throw new Error("Siswa not found");
    }

    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id_tahun: tahunAjaranId },
    });

    if (!tahunAjaran) {
      throw new Error("Tahun ajaran not found");
    }

    // Get all nilai
    const nilai = await prisma.nilaiRapor.findMany({
      where: {
        id_siswa: siswaId,
        tahunAjaranId,
        semester,
      },
      include: {
        mapel: true,
      },
      orderBy: {
        mapel: {
          namaMapel: "asc",
        },
      },
    });

    // Group by kelompok mapel
    const nilaiByKelompok: Record<string, any[]> = {};
    nilai.forEach((n) => {
      const kelompok = n.mapel.kelompokMapel || "Lainnya";
      if (!nilaiByKelompok[kelompok]) {
        nilaiByKelompok[kelompok] = [];
      }
      nilaiByKelompok[kelompok].push({
        namaMapel: n.mapel.namaMapel,
        nilai: n.nilai,
      });
    });

    // Calculate rata-rata
    const rataRata =
      nilai.length > 0
        ? Math.round(
            (nilai.reduce((sum, n) => sum + n.nilai, 0) / nilai.length) * 100
          ) / 100
        : 0;

    // Get absensi statistics (if exists)
    const [totalAbsensi, hadir, sakit, izin, alpha] = await Promise.all([
      prisma.absensi.count({
        where: {
          id_siswa: siswaId,
          id_tahun: tahunAjaranId,
        },
      }),
      prisma.absensi.count({
        where: {
          id_siswa: siswaId,
          id_tahun: tahunAjaranId,
          status: "HADIR",
        },
      }),
      prisma.absensi.count({
        where: {
          id_siswa: siswaId,
          id_tahun: tahunAjaranId,
          status: "SAKIT",
        },
      }),
      prisma.absensi.count({
        where: {
          id_siswa: siswaId,
          id_tahun: tahunAjaranId,
          status: "IZIN",
        },
      }),
      prisma.absensi.count({
        where: {
          id_siswa: siswaId,
          id_tahun: tahunAjaranId,
          status: "TIDAK_HADIR",
        },
      }),
    ]);

    return {
      siswa: {
        nis: siswa.nis,
        nama: siswa.nama,
        kelas: siswa.kelas
          ? `${siswa.kelas.namaKelas} - ${siswa.kelas.tingkat}`
          : "-",
        waliKelas: siswa.kelas?.guru?.nama || "-",
      },
      tahunAjaran: {
        namaTahun: tahunAjaran.namaTahun,
        semester,
      },
      nilai: nilaiByKelompok,
      rataRata,
      totalMapel: nilai.length,
      absensi: {
        total: totalAbsensi,
        hadir,
        sakit,
        izin,
        alpha,
        persentaseKehadiran:
          totalAbsensi > 0 ? Math.round((hadir / totalAbsensi) * 100) : 0,
      },
    };
  }

  /**
   * Get statistics
   */
  static async getStats(tahunAjaranId?: number) {
    const where: any = {};
    if (tahunAjaranId) {
      where.tahunAjaranId = tahunAjaranId;
    }

    const [total, rataRataOverall] = await Promise.all([
      prisma.nilaiRapor.count({ where }),
      prisma.nilaiRapor.aggregate({
        where,
        _avg: {
          nilai: true,
        },
      }),
    ]);

    return {
      totalNilai: total,
      rataRataOverall:
        Math.round((rataRataOverall._avg.nilai || 0) * 100) / 100,
    };
  }
}
