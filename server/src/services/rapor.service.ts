import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";

export const getAllRapor = async (
  tahunAjaranId: number,
  kelasId: number,
  semester: string,
) => {
  // 1. Ambil data Rapor beserta info Siswa
  const rapors = await prisma.rapor.findMany({
    where: {
      tahunAjaranId,
      semester,
      siswa: {
        kelasId: kelasId, // Filter berdasarkan kelas siswa saat ini
      },
    },
    include: {
      siswa: {
        select: {
          id_siswa: true,
          nis: true,
          nama: true,
        },
      },
      tahunAjaran: {
        select: { namaTahun: true },
      },
    },
    orderBy: {
      siswa: {
        nama: "asc",
      },
    },
  });

  if (rapors.length === 0) return [];

  // 2. OPTIMALISASI: Ambil rata-rata nilai & jumlah mapel dalam SATU query agregat
  // daripada loop query per siswa (N+1 Problem).
  const siswaIds = rapors.map((r) => r.id_siswa);

  const nilaiAggregates = await prisma.nilaiRapor.groupBy({
    by: ["id_siswa"],
    where: {
      id_siswa: { in: siswaIds },
      tahunAjaranId,
      semester,
    },
    _avg: {
      nilai: true,
    },
    _count: {
      id_mapel: true,
    },
  });

  // 3. Gabungkan data Rapor dengan hasil Agregat Nilai
  const result = rapors.map((rapor) => {
    const stats = nilaiAggregates.find((n) => n.id_siswa === rapor.id_siswa);
    return {
      ...rapor,
      rataRata: stats?._avg.nilai || 0,
      totalMapel: stats?._count.id_mapel || 0,
    };
  });

  return result;
};

export const generateBulkRapor = async (
  tahunAjaranId: number,
  kelasId: number,
  semester: string,
) => {
  // Ambil semua siswa aktif di kelas tersebut
  const siswaList = await prisma.siswa.findMany({
    where: {
      kelasId,
      status: "AKTIF",
    },
    select: { id_siswa: true },
  });

  if (siswaList.length === 0) {
    throw new Error("Tidak ada siswa aktif di kelas ini.");
  }

  // Gunakan Transaction untuk memastikan konsistensi data
  return await prisma.$transaction(async (tx) => {
    let createdCount = 0;

    for (const s of siswaList) {
      // Cek apakah rapor sudah ada agar tidak duplikat
      const existing = await tx.rapor.findUnique({
        where: {
          id_siswa_tahunAjaranId_semester: {
            id_siswa: s.id_siswa,
            tahunAjaranId,
            semester,
          },
        },
      });

      if (!existing) {
        await tx.rapor.create({
          data: {
            id_siswa: s.id_siswa,
            tahunAjaranId,
            semester,
            status: "DRAFT",
          },
        });
        createdCount++;
      }
    }
    return { createdCount, totalSiswa: siswaList.length };
  });
};

export const publishRapor = async (id_rapor: number) => {
  return await prisma.rapor.update({
    where: { id_rapor },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
};

/**
 * Bulk publish rapor in a class
 */
export const bulkPublishRapor = async (
  tahunAjaranId: number,
  kelasId: number,
  semester: string,
) => {
  return await prisma.rapor.updateMany({
    where: {
      tahunAjaranId,
      semester,
      status: "DRAFT",
      siswa: {
        kelasId,
      },
    },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
};

export const generateSingleRapor = async (
  id_siswa: number,
  tahunAjaranId: number,
  semester: string,
) => {
  const siswa = await prisma.siswa.findUnique({
    where: { id_siswa },
    select: {
      id_siswa: true,
      kelasId: true,
      status: true,
      nama: true,
      nis: true,
    },
  });

  if (!siswa || siswa.status !== "AKTIF") {
    throw new Error("Siswa tidak ditemukan atau tidak aktif.");
  }

  const existing = await prisma.rapor.findUnique({
    where: {
      id_siswa_tahunAjaranId_semester: {
        id_siswa,
        tahunAjaranId,
        semester,
      },
    },
  });

  if (existing) {
    throw new Error("Rapor untuk siswa ini sudah ada di periode tersebut");
  }

  const nilaiStats = await prisma.nilaiRapor.aggregate({
    where: {
      id_siswa,
      tahunAjaranId,
      semester,
    },
    _avg: { nilai: true },
    _count: { id_mapel: true },
  });

  const newRapor = await prisma.rapor.create({
    data: {
      id_siswa,
      tahunAjaranId,
      semester,
      status: "DRAFT",
    },
    include: {
      siswa: {
        select: { id_siswa: true, nis: true, nama: true },
      },
      tahunAjaran: { select: { namaTahun: true } },
    },
  });

  return {
    ...newRapor,
    rataRata: Number(nilaiStats._avg.nilai?.toFixed(1)) || 0,
    totalMapel: nilaiStats._count.id_mapel || 0,
  };
};

/**
 * Get rapor detail (Wali kelas / siswa)
 */
export const getRaporDetail = async (id_rapor: number) => {
  const rapor = await prisma.rapor.findUnique({
    where: { id_rapor },
    include: {
      siswa: {
        select: {
          id_siswa: true,
          nis: true,
          nama: true,
          jenisKelamin: true,
          kelas: {
            select: {
              id_kelas: true,
              namaKelas: true,
              tingkat: true,
              guru: {
                select: {
                  id_guru: true,
                  nama: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      tahunAjaran: {
        select: {
          id_tahun: true,
          namaTahun: true,
          semester: true,
        },
      },
    },
  });

  if (!rapor) {
    throw new Error("Rapor tidak ditemukan");
  }

  // get nilai grouped by kelompok
  const nilai = await prisma.nilaiRapor.findMany({
    where: {
      id_siswa: rapor.id_siswa,
      tahunAjaranId: rapor.tahunAjaranId,
      semester: rapor.semester,
    },
    include: {
      mapel: {
        select: {
          id_mapel: true,
          namaMapel: true,
          kelompokMapel: true,
        },
      },
    },
    orderBy: {
      mapel: {
        kelompokMapel: "asc",
      },
    },
  });

  // group by kelompok
  const nilaiGrouped: { [key: string]: any[] } = {};
  nilai.forEach((n) => {
    const kelompok = n.mapel.kelompokMapel || "Lainnya";
    if (!nilaiGrouped[kelompok]) {
      nilaiGrouped[kelompok] = [];
    }
    nilaiGrouped[kelompok].push({
      id_nilai: n.id_nilai,
      namaMapel: n.mapel.namaMapel,
      nilai: n.nilai,
      nilaiTugas: n.nilaiTugas,
      nilaiUTS: n.nilaiUTS,
      nilaiUAS: n.nilaiUAS,
    });
  });

  // Calculate rata-rata
  const totalNilai = nilai.reduce((sum, n) => sum + n.nilai, 0);
  const rataRata = nilai.length > 0 ? totalNilai / nilai.length : 0;

  return {
    rapor,
    nilai: nilaiGrouped,
    rataRata: Number(rataRata.toFixed(1)),
    totalMapel: nilai.length,
  };
};

/**
 * Get rapor by student, year, and semester
 */
export const getRaporByStudent = async (
  id_siswa: number,
  tahunAjaranId: number,
  semester: string,
) => {
  const rapor = await prisma.rapor.findUnique({
    where: {
      id_siswa_tahunAjaranId_semester: {
        id_siswa,
        tahunAjaranId,
        semester,
      },
    },
    select: { id_rapor: true },
  });

  if (!rapor) {
    return null;
  }

  return await getRaporDetail(rapor.id_rapor);
};

/**
 * Update catatan wali kelas
 */
export const updateCatatanWaliKelas = async (
  id_rapor: number,
  data: {
    catatanWaliKelas?: string;
    sikapSpritual?: string;
    sikapSosial?: string;
    deskripsiSpritual?: string;
    deskripsiSosial?: string;
    ekstrakurikuler?: any;
    prestasi?: any;
    naik?: boolean;
    kelas?: string;
  },
) => {
  const updateData: any = {
    updatedAt: new Date(),
  };

  // Only update provided fields
  Object.keys(data).forEach((key) => {
    if (data[key as keyof typeof data] !== undefined) {
      updateData[key] = data[key as keyof typeof data];
    }
  });

  return await prisma.rapor.update({
    where: { id_rapor },
    data: updateData,
  });
};

/**
 * Get siswa list untuk input nilai (Guru Mapel)
 * Hanya siswa di kelas yang diajar oleh guru
 */
export const getSiswaForNilaiInput = async (
  guruId: number | null,
  kelasId: number,
  mapelId: number,
  tahunAjaranId: number,
  isAdmin: boolean = false,
) => {
  // Verify guru mengajar mapel ini di kelas ini (Skip for Admin)
  if (!isAdmin && guruId) {
    const guruMapel = await prisma.guruMapel.findFirst({
      where: {
        id_guru: guruId,
        id_mapel: mapelId,
        id_kelas: kelasId,
        tahunAjaranId,
      },
    });

    if (!guruMapel) {
      throw new Error(
        "Anda tidak mengajar mata pelajaran ini di kelas tersebut",
      );
    }
  }

  // Get siswa list with existing nilai
  const siswa = await prisma.siswa.findMany({
    where: {
      kelasId,
      status: "AKTIF",
    },
    select: {
      id_siswa: true,
      nis: true,
      nama: true,
    },
    orderBy: {
      nama: "asc",
    },
  });

  // Get existing nilai for these students
  const siswaIds = siswa.map((s) => s.id_siswa);

  const nilaiList = await prisma.nilaiRapor.findMany({
    where: {
      id_siswa: { in: siswaIds },
      id_mapel: mapelId,
      tahunAjaranId,
    },
    select: {
      id_siswa: true,
      semester: true,
      nilai: true,
      nilaiTugas: true,
      nilaiUTS: true,
      nilaiUAS: true,
    },
  });

  // Create map for quick lookup
  const nilaiMap = new Map(
    nilaiList.map((n) => [`${n.id_siswa}-${n.semester}`, n]),
  );

  // Merge data
  const result = siswa.map((s) => {
    const nilai1 = nilaiMap.get(`${s.id_siswa}-1`);
    const nilai2 = nilaiMap.get(`${s.id_siswa}-2`);

    return {
      ...s,
      semester1: nilai1
        ? {
            nilai: nilai1.nilai,
            nilaiTugas: nilai1.nilaiTugas,
            nilaiUTS: nilai1.nilaiUTS,
            nilaiUAS: nilai1.nilaiUAS,
          }
        : null,
      semester2: nilai2
        ? {
            nilai: nilai2.nilai,
            nilaiTugas: nilai2.nilaiTugas,
            nilaiUTS: nilai2.nilaiUTS,
            nilaiUAS: nilai2.nilaiUAS,
          }
        : null,
    };
  });

  return result;
};

/**
 * Input nilai single student (Guru Mapel)
 */
export const inputNilaiSiswa = async (
  guruId: number | null,
  data: {
    id_siswa: number;
    id_mapel: number;
    tahunAjaranId: number;
    semester: string;
    nilai?: number;
    nilaiTugas?: number;
    nilaiUTS?: number;
    nilaiUAS?: number;
  },
  isAdmin: boolean = false,
) => {
  // Verify guru mengajar mapel ini (Skip for Admin)
  const siswa = await prisma.siswa.findUnique({
    where: { id_siswa: data.id_siswa },
    select: { kelasId: true, status: true },
  });

  if (!siswa || siswa.status !== "AKTIF") {
    throw new Error("Siswa tidak ditemukan atau tidak aktif");
  }

  if (!isAdmin && guruId) {
    const guruMapel = await prisma.guruMapel.findFirst({
      where: {
        id_guru: guruId,
        id_mapel: data.id_mapel,
        id_kelas: siswa.kelasId!,
        tahunAjaranId: data.tahunAjaranId,
      },
    });

    if (!guruMapel) {
      throw new Error("Anda tidak mengajar mata pelajaran ini untuk siswa ini");
    }
  }

  // Calculate final nilai if breakdown provided
  let finalNilai = data.nilai;

  if (!finalNilai && data.nilaiTugas && data.nilaiUTS && data.nilaiUAS) {
    // Formula: 30% Tugas + 30% UTS + 40% UAS
    finalNilai =
      data.nilaiTugas * 0.3 + data.nilaiUTS * 0.3 + data.nilaiUAS * 0.4;
    finalNilai = Math.round(finalNilai * 10) / 10; // Round to 1 decimal
  }

  if (!finalNilai) {
    throw new Error("Nilai akhir atau breakdown nilai harus diisi");
  }

  // Upsert nilai
  const nilai = await prisma.nilaiRapor.upsert({
    where: {
      id_siswa_id_mapel_tahunAjaranId_semester: {
        id_siswa: data.id_siswa,
        id_mapel: data.id_mapel,
        tahunAjaranId: data.tahunAjaranId,
        semester: data.semester,
      },
    },
    update: {
      nilai: finalNilai,
      nilaiTugas: data.nilaiTugas || null,
      nilaiUTS: data.nilaiUTS || null,
      nilaiUAS: data.nilaiUAS || null,
      updatedAt: new Date(),
    },
    create: {
      id_siswa: data.id_siswa,
      id_mapel: data.id_mapel,
      tahunAjaranId: data.tahunAjaranId,
      semester: data.semester,
      nilai: finalNilai,
      nilaiTugas: data.nilaiTugas || null,
      nilaiUTS: data.nilaiUTS || null,
      nilaiUAS: data.nilaiUAS || null,
    },
    include: {
      siswa: {
        select: {
          id_siswa: true,
          nis: true,
          nama: true,
        },
      },
      mapel: {
        select: {
          id_mapel: true,
          namaMapel: true,
        },
      },
    },
  });

  return nilai;
};

/**
 * Bulk input nilai for multiple students (Guru Mapel)
 */
export const inputNilaiBulk = async (
  guruId: number | null,
  kelasId: number,
  mapelId: number,
  tahunAjaranId: number,
  semester: string,
  nilaiList: Array<{
    id_siswa: number;
    nilai?: number | null;
    nilaiTugas?: number | null;
    nilaiUTS?: number | null;
    nilaiUAS?: number | null;
  }>,
  isAdmin: boolean = false,
) => {
  // Verify ownership (Skip for Admin)
  if (!isAdmin && guruId) {
    const guruMapel = await prisma.guruMapel.findFirst({
      where: {
        id_guru: guruId,
        id_mapel: mapelId,
        id_kelas: kelasId,
        tahunAjaranId,
      },
    });

    if (!guruMapel) {
      throw new Error(
        "Anda tidak mengajar mata pelajaran ini di kelas tersebut",
      );
    }
  }

  // Process in transaction
  return await prisma.$transaction(async (tx) => {
    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ siswaId: number; error: string }> = [];

    for (const item of nilaiList) {
      try {
        // Calculate final nilai
        let finalNilai = item.nilai;

        if (!finalNilai && item.nilaiTugas && item.nilaiUTS && item.nilaiUAS) {
          finalNilai =
            item.nilaiTugas * 0.3 + item.nilaiUTS * 0.3 + item.nilaiUAS * 0.4;
          finalNilai = Math.round(finalNilai * 10) / 10;
        }

        if (!finalNilai) {
          throw new Error("Nilai tidak valid");
        }

        // Upsert nilai
        await tx.nilaiRapor.upsert({
          where: {
            id_siswa_id_mapel_tahunAjaranId_semester: {
              id_siswa: item.id_siswa,
              id_mapel: mapelId,
              tahunAjaranId,
              semester,
            },
          },
          update: {
            nilai: finalNilai,
            nilaiTugas: item.nilaiTugas || null,
            nilaiUTS: item.nilaiUTS || null,
            nilaiUAS: item.nilaiUAS || null,
            updatedAt: new Date(),
          },
          create: {
            id_siswa: item.id_siswa,
            id_mapel: mapelId,
            tahunAjaranId,
            semester,
            nilai: finalNilai,
            nilaiTugas: item.nilaiTugas || null,
            nilaiUTS: item.nilaiUTS || null,
            nilaiUAS: item.nilaiUAS || null,
          },
        });

        successCount++;
      } catch (error: any) {
        errorCount++;
        errors.push({
          siswaId: item.id_siswa,
          error: error.message,
        });
      }
    }

    return {
      successCount,
      errorCount,
      total: nilaiList.length,
      errors,
    };
  });
};

/**
 * Get mata pelajaran dan kelas (Admin: Semua, Guru: Sesuai Jadwal)
 */
export const getMapelByGuru = async (
  guruId: number | null,
  tahunAjaranId: number,
) => {
  const where: any = { tahunAjaranId };
  if (guruId) {
    where.id_guru = guruId;
  }

  const guruMapelList = await prisma.guruMapel.findMany({
    where,
    include: {
      mapel: {
        select: {
          id_mapel: true,
          namaMapel: true,
          kelompokMapel: true,
        },
      },
      kelas: {
        select: {
          id_kelas: true,
          namaKelas: true,
          tingkat: true,
        },
      },
    },
    orderBy: [
      {
        kelas: {
          namaKelas: "asc",
        },
      },
      {
        mapel: {
          namaMapel: "asc",
        },
      },
    ],
  });

  // Unique-ify by mapel-kelas pair (avoid duplicates if multiple teachers assigned)
  const uniqueMap = new Map<string, any>();

  guruMapelList.forEach((gm) => {
    const key = `${gm.id_mapel}-${gm.id_kelas}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, {
        id_mapel: gm.mapel.id_mapel,
        namaMapel: gm.mapel.namaMapel,
        kelompokMapel: gm.mapel.kelompokMapel,
        kelas: {
          id_kelas: gm.kelas.id_kelas,
          namaKelas: gm.kelas.namaKelas,
          tingkat: gm.kelas.tingkat,
        },
      });
    }
  });

  return Array.from(uniqueMap.values());
};

/**
 * Get nilai statistics for guru dashboard
 */
export const getNilaiStatsByGuru = async (
  guruId: number | null,
  tahunAjaranId: number,
  semester: string,
) => {
  const where: any = { tahunAjaranId };
  if (guruId) {
    where.id_guru = guruId;
  }

  // Get all mapel-kelas yang diajar
  const guruMapelList = await prisma.guruMapel.findMany({
    where,
    select: {
      id_mapel: true,
      id_kelas: true,
    },
  });

  if (guruMapelList.length === 0) {
    return {
      totalSiswa: 0,
      siswaWithNilai: 0,
      siswaWithoutNilai: 0,
      rataRata: 0,
    };
  }

  // Get total siswa
  const kelasIds = Array.from(new Set(guruMapelList.map((gm) => gm.id_kelas)));

  const totalSiswa = await prisma.siswa.count({
    where: {
      kelasId: { in: kelasIds },
      status: "AKTIF",
    },
  });

  // Get nilai statistics
  const nilaiStats = await prisma.nilaiRapor.aggregate({
    where: {
      id_mapel: { in: guruMapelList.map((gm) => gm.id_mapel) },
      tahunAjaranId,
      semester,
    },
    _count: {
      id_nilai: true,
    },
    _avg: {
      nilai: true,
    },
  });

  return {
    totalSiswa,
    siswaWithNilai: nilaiStats._count.id_nilai,
    siswaWithoutNilai: totalSiswa - nilaiStats._count.id_nilai,
    rataRata: Number(nilaiStats._avg.nilai?.toFixed(1)) || 0,
  };
};

/**
 * Update existing nilai
 * Access: Admin, Guru Mapel (yang mengajar), Wali Kelas
 */
export const updateNilai = async (
  nilaiId: number,
  guruId: number | null,
  data: {
    nilai?: number;
    nilaiTugas?: number;
    nilaiUTS?: number;
    nilaiUAS?: number;
  },
  isAdmin: boolean = false,
) => {
  // Get current nilai
  const currentNilai = await prisma.nilaiRapor.findUnique({
    where: { id_nilai: nilaiId },
    include: {
      siswa: { select: { kelasId: true } },
    },
  });

  if (!currentNilai) {
    throw new Error("Nilai tidak ditemukan");
  }

  // Verify access (Skip for Admin)
  if (!isAdmin && guruId) {
    // Check if wali kelas
    const isWaliKelas = await prisma.kelas.findFirst({
      where: {
        id_kelas: currentNilai.siswa.kelasId!,
        waliId: guruId,
      },
    });

    if (!isWaliKelas) {
      // Check if guru mapel
      const guruMapel = await prisma.guruMapel.findFirst({
        where: {
          id_guru: guruId,
          id_mapel: currentNilai.id_mapel,
          id_kelas: currentNilai.siswa.kelasId!,
          tahunAjaranId: currentNilai.tahunAjaranId,
        },
      });

      if (!guruMapel) {
        throw new Error("Anda tidak memiliki akses untuk edit nilai ini");
      }
    }
  }

  // Calculate new final nilai if breakdown updated
  let finalNilai = data.nilai;

  if (!finalNilai) {
    const tugas = data.nilaiTugas ?? currentNilai.nilaiTugas;
    const uts = data.nilaiUTS ?? currentNilai.nilaiUTS;
    const uas = data.nilaiUAS ?? currentNilai.nilaiUAS;

    if (tugas && uts && uas) {
      finalNilai = tugas * 0.3 + uts * 0.3 + uas * 0.4;
      finalNilai = Math.round(finalNilai * 10) / 10;
    }
  }

  // Update nilai
  return await prisma.nilaiRapor.update({
    where: { id_nilai: nilaiId },
    data: {
      nilai: finalNilai ?? currentNilai.nilai,
      nilaiTugas: data.nilaiTugas ?? currentNilai.nilaiTugas,
      nilaiUTS: data.nilaiUTS ?? currentNilai.nilaiUTS,
      nilaiUAS: data.nilaiUAS ?? currentNilai.nilaiUAS,
      updatedAt: new Date(),
    },
    include: {
      siswa: {
        select: {
          id_siswa: true,
          nis: true,
          nama: true,
        },
      },
      mapel: {
        select: {
          id_mapel: true,
          namaMapel: true,
        },
      },
    },
  });
};

/**
 * Delete nilai
 * Access: Admin, Wali Kelas ONLY
 */
export const deleteNilaiById = async (nilaiId: number) => {
  const nilai = await prisma.nilaiRapor.findUnique({
    where: { id_nilai: nilaiId },
  });

  if (!nilai) {
    throw new Error("Nilai tidak ditemukan");
  }

  return await prisma.nilaiRapor.delete({
    where: { id_nilai: nilaiId },
  });
};

/**
 * Get nilai by ID with details
 */
export const getNilaiById = async (nilaiId: number) => {
  return await prisma.nilaiRapor.findUnique({
    where: { id_nilai: nilaiId },
    include: {
      siswa: {
        select: {
          id_siswa: true,
          nis: true,
          nama: true,
          kelas: {
            select: {
              id_kelas: true,
              namaKelas: true,
            },
          },
        },
      },
      mapel: {
        select: {
          id_mapel: true,
          namaMapel: true,
          kelompokMapel: true,
        },
      },
      tahunAjaran: {
        select: {
          id_tahun: true,
          namaTahun: true,
        },
      },
    },
  });
};

// ============================================================================
// SHARED FUNCTIONS
// ============================================================================

/**
 * Delete rapor
 */
export const deleteRapor = async (id_rapor: number) => {
  return await prisma.rapor.delete({
    where: { id_rapor },
  });
};

/**
 * Get rapor statistics
 */
export const getRaporStatistics = async (
  kelasId?: number,
  tahunAjaranId?: number,
) => {
  const where: any = {};

  if (kelasId) {
    where.siswa = { kelasId };
  }
  if (tahunAjaranId) {
    where.tahunAjaranId = tahunAjaranId;
  }

  const [total, published, draft] = await Promise.all([
    prisma.rapor.count({ where }),
    prisma.rapor.count({ where: { ...where, status: "PUBLISHED" } }),
    prisma.rapor.count({ where: { ...where, status: "DRAFT" } }),
  ]);

  return {
    total,
    published,
    draft,
  };
};

/**
 * Generate PDF Rapor using PDFKit
 */
export const generateRaporPDF = async (id_rapor: number) => {
  const PDFDocument = (await import("pdfkit")).default;
  const detail = await getRaporDetail(id_rapor);
  const { rapor, nilai, rataRata } = detail;

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err: Error) => reject(err));

    // -- Header --
    doc.fontSize(16).text("LAPORAN HASIL BELAJAR (RAPOR)", { align: "center" });
    doc.fontSize(12).text("SMA/SMK CONTOH", { align: "center" }); // Bisa disesuaikan
    doc.moveDown();

    // -- Info Siswa --
    doc.fontSize(10);
    const infoY = doc.y;
    doc.text(`Nama Peserta Didik : ${rapor.siswa.nama}`, 50, infoY);
    doc.text(`Kelas : ${rapor.siswa.kelas?.namaKelas || "-"}`, 350, infoY);
    doc.text(`Nomor Induk/NISN  : ${rapor.siswa.nis || "-"}`, 50, doc.y);
    doc.text(`Semester : ${rapor.semester}`, 350, doc.y - 12);
    doc.text(`Tahun Pelajaran    : ${rapor.tahunAjaran.namaTahun}`, 50, doc.y);
    doc.moveDown();

    // -- Tabel Nilai --
    const tableTop = doc.y;
    doc.font("Helvetica-Bold");
    doc.text("Mata Pelajaran", 50, tableTop);
    doc.text("Tugas", 250, tableTop, { width: 50, align: "center" });
    doc.text("UTS", 300, tableTop, { width: 50, align: "center" });
    doc.text("UAS", 350, tableTop, { width: 50, align: "center" });
    doc.text("Akhir", 400, tableTop, { width: 50, align: "center" });
    doc.text("Grade", 450, tableTop, { width: 50, align: "center" });
    doc.font("Helvetica");
    doc
      .moveTo(50, doc.y + 2)
      .lineTo(500, doc.y + 2)
      .stroke();
    doc.moveDown(0.5);

    Object.entries(nilai).forEach(([kelompok, mapels]: [string, any[]]) => {
      doc.font("Helvetica-Bold").text(kelompok, 50, doc.y);
      doc.font("Helvetica");
      mapels.forEach((m) => {
        const y = doc.y;
        doc.text(m.namaMapel, 60, y, { width: 180 });
        doc.text(m.nilaiTugas || "-", 250, y, { width: 50, align: "center" });
        doc.text(m.nilaiUTS || "-", 300, y, { width: 50, align: "center" });
        doc.text(m.nilaiUAS || "-", 350, y, { width: 50, align: "center" });
        doc.text(m.nilai, 400, y, { width: 50, align: "center" });

        let predikat = "D";
        if (m.nilai >= 90) predikat = "A";
        else if (m.nilai >= 80) predikat = "B";
        else if (m.nilai >= 70) predikat = "C";
        doc.text(predikat, 450, y, { width: 50, align: "center" });
        doc.moveDown(0.5);
      });
    });

    doc.moveDown();
    doc
      .font("Helvetica-Bold")
      .text(`Rata-rata Nilai: ${rataRata}`, { align: "right" });
    doc.moveDown();

    // -- Kehadiran --
    doc.text("Ketidakhadiran:", 50, doc.y);
    doc.font("Helvetica");
    doc.text(`1. Sakit : ${rapor.totalSakit} hari`, 60, doc.y);
    doc.text(`2. Izin  : ${rapor.totalIzin} hari`, 60, doc.y);
    doc.text(`3. Tanpa Keterangan : ${rapor.totalAlpha} hari`, 60, doc.y);
    doc.moveDown();

    // -- Catatan --
    doc.font("Helvetica-Bold").text("Catatan Wali Kelas:", 50, doc.y);
    doc.font("Helvetica").text(rapor.catatanWaliKelas || "-", 50, doc.y);

    doc.end();
  });
};

/**
 * Generate Excel Rapor using ExcelJS
 */
export const generateRaporExcel = async (id_rapor: number) => {
  const ExcelJS = (await import("exceljs")).default;
  const detail = await getRaporDetail(id_rapor);
  const { rapor, nilai, rataRata } = detail;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Rapor");

  // Style helper
  const boldCentered: any = {
    font: { bold: true },
    alignment: { horizontal: "center" },
  };

  // Title
  worksheet.mergeCells("A1:G1");
  worksheet.getCell("A1").value = "HALAMAN NILAI HASIL BELAJAR (RAPOR)";
  worksheet.getCell("A1").style = boldCentered;

  worksheet.addRow([]);
  worksheet.addRow([
    "Nama Peserta Didik",
    ":",
    rapor.siswa.nama,
    "",
    "Kelas",
    ":",
    rapor.siswa.kelas?.namaKelas || "-",
  ]);
  worksheet.addRow([
    "NISN",
    ":",
    rapor.siswa.nis || "-",
    "",
    "Semester",
    ":",
    rapor.semester,
  ]);
  worksheet.addRow(["Tahun Pelajaran", ":", rapor.tahunAjaran.namaTahun]);
  worksheet.addRow([]);

  // Table Header
  const headerRow = worksheet.addRow([
    "No",
    "Mata Pelajaran",
    "Nilai Tugas",
    "Nilai UTS",
    "Nilai UAS",
    "Nilai Akhir",
    "Predikat",
  ]);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  let no = 1;
  Object.entries(nilai).forEach(([kelompok, mapels]: [string, any[]]) => {
    const groupRow = worksheet.addRow(["", kelompok]);
    groupRow.getCell(2).font = { bold: true };

    mapels.forEach((m) => {
      let predikat = "D";
      if (m.nilai >= 90) predikat = "A";
      else if (m.nilai >= 80) predikat = "B";
      else if (m.nilai >= 70) predikat = "C";

      const row = worksheet.addRow([
        no++,
        m.namaMapel,
        m.nilaiTugas || "-",
        m.nilaiUTS || "-",
        m.nilaiUAS || "-",
        m.nilai,
        predikat,
      ]);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });
  });

  worksheet.addRow([]);
  worksheet.addRow(["", "Rata-rata", "", "", "", rataRata]);
  if (worksheet.lastRow) {
    worksheet.lastRow.getCell(2).font = { bold: true };
    worksheet.lastRow.getCell(6).font = { bold: true };
  }

  worksheet.addRow([]);
  worksheet.addRow(["Ketidakhadiran"]);
  worksheet.addRow(["1. Sakit", ":", rapor.totalSakit, "hari"]);
  worksheet.addRow(["2. Izin", ":", rapor.totalIzin, "hari"]);
  worksheet.addRow(["3. Tanpa Keterangan", ":", rapor.totalAlpha, "hari"]);

  worksheet.getColumn(2).width = 30;
  worksheet.getColumn(3).width = 12;
  worksheet.getColumn(4).width = 12;
  worksheet.getColumn(5).width = 12;
  worksheet.getColumn(6).width = 12;

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};
