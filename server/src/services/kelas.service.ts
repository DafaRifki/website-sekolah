import { prisma } from "../config/database";
import { PaginationQuery, PaginationResult } from "../types/common.types";
import {
  buildPaginationQuery,
  buildPaginationResult,
  buildSearchFilter,
} from "../utils/database.util";
import { Prisma } from "@prisma/client";

interface CreateKelasData {
  namaKelas: string;
  tingkat: string;
  waliId?: number;
  tahunAjaranId?: number;
}

interface UpdateKelasData {
  namaKelas?: string;
  tingkat?: string;
  waliId?: number;
}

interface AssignSiswaData {
  siswaIds: number[];
}

export class KelasService {
  /**
   * Get all kelas with pagination and search
   */
  static async getAll(query: PaginationQuery): Promise<PaginationResult<any>> {
    const { skip, take, page, limit } = buildPaginationQuery(query);

    const searchFilter = buildSearchFilter(query.search, [
      "namaKelas",
      "tingkat",
    ]);

    const where: Prisma.KelasWhereInput = {
      ...searchFilter,
    };

    const [kelas, total] = await Promise.all([
      prisma.kelas.findMany({
        where,
        skip,
        take,
        orderBy: { id_kelas: "desc" },
        select: {
          id_kelas: true,
          namaKelas: true,
          tingkat: true,
          waliId: true,
          guru: {
            select: {
              id_guru: true,
              nip: true,
              nama: true,
              jabatan: true,
            },
          },
          _count: {
            select: {
              siswa: true,
            },
          },
          tahunRel: {
            where: {
              isActive: true,
            },
            select: {
              tahunAjaran: {
                select: {
                  namaTahun: true,
                  semester: true,
                },
              },
            },
          },
        },
      }),
      prisma.kelas.count({ where }),
    ]);

    // Format response
    const formattedKelas = kelas.map((k) => ({
      id_kelas: k.id_kelas,
      namaKelas: k.namaKelas,
      tingkat: k.tingkat,
      waliKelas: k.guru
        ? {
            id_guru: k.guru.id_guru,
            nip: k.guru.nip,
            nama: k.guru.nama,
            jabatan: k.guru.jabatan,
          }
        : null,
      jumlahSiswa: k._count.siswa,
      tahunAjaran:
        k.tahunRel.length > 0
          ? `${k.tahunRel[0].tahunAjaran.namaTahun} - Semester ${k.tahunRel[0].tahunAjaran.semester}`
          : null,
    }));

    return buildPaginationResult(formattedKelas, total, page, limit);
  }

  /**
   * Get kelas by ID
   */
  static async getById(id: number) {
    const kelas = await prisma.kelas.findUnique({
      where: { id_kelas: id },
      include: {
        guru: {
          select: {
            id_guru: true,
            nip: true,
            nama: true,
            jabatan: true,
            email: true,
            noHP: true,
          },
        },
        siswa: {
          select: {
            id_siswa: true,
            nis: true,
            nama: true,
            jenisKelamin: true,
            fotoProfil: true,
          },
          orderBy: {
            nama: "asc",
          },
        },
        tahunRel: {
          include: {
            tahunAjaran: {
              select: {
                id_tahun: true,
                namaTahun: true,
                semester: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!kelas) {
      throw new Error("Kelas not found");
    }

    return kelas;
  }

  /**
   * Create new kelas
   */
  static async create(data: CreateKelasData) {
    // Check if wali kelas exists and available
    if (data.waliId) {
      const guru = await prisma.guru.findUnique({
        where: { id_guru: data.waliId },
        include: {
          waliKelas: true,
        },
      });

      if (!guru) {
        throw new Error("Guru not found");
      }

      // Check if guru already assigned as wali kelas
      if (guru.waliKelas && guru.waliKelas.length > 0) {
        throw new Error(
          `Guru ${guru.nama} already assigned as wali kelas for ${guru.waliKelas[0].namaKelas}`
        );
      }
    }

    // Create kelas
    const kelas = await prisma.kelas.create({
      data: {
        namaKelas: data.namaKelas,
        tingkat: data.tingkat,
        waliId: data.waliId,
      },
      include: {
        guru: true,
      },
    });

    // If tahunAjaranId provided, create relation
    if (data.tahunAjaranId) {
      const tahunAjaran = await prisma.tahunAjaran.findUnique({
        where: { id_tahun: data.tahunAjaranId },
      });

      if (!tahunAjaran) {
        throw new Error("Tahun ajaran not found");
      }

      await prisma.kelasTahunAjaran.create({
        data: {
          kelasId: kelas.id_kelas,
          tahunAjaranId: data.tahunAjaranId,
          isActive: tahunAjaran.isActive,
        },
      });
    }

    return kelas;
  }

  /**
   * Update kelas
   */
  static async update(id: number, data: UpdateKelasData) {
    const existing = await prisma.kelas.findUnique({
      where: { id_kelas: id },
    });

    if (!existing) {
      throw new Error("Kelas not found");
    }

    // Check if changing wali kelas
    if (data.waliId !== undefined && data.waliId !== existing.waliId) {
      if (data.waliId) {
        const guru = await prisma.guru.findUnique({
          where: { id_guru: data.waliId },
          include: {
            waliKelas: true,
          },
        });

        if (!guru) {
          throw new Error("Guru not found");
        }

        // Check if guru already assigned as wali kelas (exclude current kelas)
        const otherWaliKelas = guru.waliKelas.filter((k) => k.id_kelas !== id);
        if (otherWaliKelas.length > 0) {
          throw new Error(
            `Guru ${guru.nama} already assigned as wali kelas for ${otherWaliKelas[0].namaKelas}`
          );
        }
      }
    }

    const updated = await prisma.kelas.update({
      where: { id_kelas: id },
      data,
      include: {
        guru: true,
        _count: {
          select: {
            siswa: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete kelas
   */
  static async delete(id: number) {
    const kelas = await prisma.kelas.findUnique({
      where: { id_kelas: id },
      include: {
        siswa: true,
        tahunRel: true,
      },
    });

    if (!kelas) {
      throw new Error("Kelas not found");
    }

    // Check if kelas has siswa
    if (kelas.siswa.length > 0) {
      throw new Error(
        `Cannot delete kelas with ${kelas.siswa.length} siswa. Remove siswa first.`
      );
    }

    // Delete tahun ajaran relations first
    if (kelas.tahunRel.length > 0) {
      await prisma.kelasTahunAjaran.deleteMany({
        where: { kelasId: id },
      });
    }

    await prisma.kelas.delete({
      where: { id_kelas: id },
    });

    return { message: "Kelas deleted successfully" };
  }

  /**
   * Assign wali kelas
   */
  static async assignWaliKelas(kelasId: number, guruId: number) {
    const kelas = await prisma.kelas.findUnique({
      where: { id_kelas: kelasId },
      include: { guru: true },
    });

    if (!kelas) {
      throw new Error("Kelas not found");
    }

    const guru = await prisma.guru.findUnique({
      where: { id_guru: guruId },
      include: { waliKelas: true },
    });

    if (!guru) {
      throw new Error("Guru not found");
    }

    // Check if guru already assigned as wali kelas for another class
    const otherWaliKelas = guru.waliKelas.filter((k) => k.id_kelas !== kelasId);
    if (otherWaliKelas.length > 0) {
      throw new Error(
        `Guru ${guru.nama} already assigned as wali kelas for ${otherWaliKelas[0].namaKelas}`
      );
    }

    const updated = await prisma.kelas.update({
      where: { id_kelas: kelasId },
      data: { waliId: guruId },
      include: {
        guru: true,
      },
    });

    return updated;
  }

  /**
   * Remove wali kelas
   */
  static async removeWaliKelas(kelasId: number) {
    const kelas = await prisma.kelas.findUnique({
      where: { id_kelas: kelasId },
    });

    if (!kelas) {
      throw new Error("Kelas not found");
    }

    if (!kelas.waliId) {
      throw new Error("Kelas does not have wali kelas");
    }

    await prisma.kelas.update({
      where: { id_kelas: kelasId },
      data: { waliId: null },
    });

    return { message: "Wali kelas removed successfully" };
  }

  /**
   * Assign siswa to kelas (bulk)
   */
  static async assignSiswa(kelasId: number, data: AssignSiswaData) {
    const kelas = await prisma.kelas.findUnique({
      where: { id_kelas: kelasId },
    });

    if (!kelas) {
      throw new Error("Kelas not found");
    }

    // Check if all siswa exist
    const siswa = await prisma.siswa.findMany({
      where: {
        id_siswa: {
          in: data.siswaIds,
        },
      },
    });

    if (siswa.length !== data.siswaIds.length) {
      throw new Error("Some siswa not found");
    }

    // Update siswa kelasId
    await prisma.siswa.updateMany({
      where: {
        id_siswa: {
          in: data.siswaIds,
        },
      },
      data: {
        kelasId: kelasId,
      },
    });

    return {
      message: `${data.siswaIds.length} siswa assigned to kelas successfully`,
    };
  }

  /**
   * Remove siswa from kelas
   */
  static async removeSiswa(kelasId: number, siswaId: number) {
    const siswa = await prisma.siswa.findUnique({
      where: { id_siswa: siswaId },
    });

    if (!siswa) {
      throw new Error("Siswa not found");
    }

    if (siswa.kelasId !== kelasId) {
      throw new Error("Siswa is not in this kelas");
    }

    await prisma.siswa.update({
      where: { id_siswa: siswaId },
      data: { kelasId: null },
    });

    return { message: "Siswa removed from kelas successfully" };
  }

  /**
   * Get siswa in kelas
   */
  static async getSiswaInKelas(kelasId: number) {
    const kelas = await prisma.kelas.findUnique({
      where: { id_kelas: kelasId },
    });

    if (!kelas) {
      throw new Error("Kelas not found");
    }

    const siswa = await prisma.siswa.findMany({
      where: { kelasId },
      select: {
        id_siswa: true,
        nis: true,
        nama: true,
        jenisKelamin: true,
        tanggalLahir: true,
        alamat: true,
        fotoProfil: true,
      },
      orderBy: {
        nama: "asc",
      },
    });

    return siswa;
  }

  /**
   * Move siswa to another kelas
   */
  static async moveSiswa(
    siswaId: number,
    fromKelasId: number,
    toKelasId: number
  ) {
    const siswa = await prisma.siswa.findUnique({
      where: { id_siswa: siswaId },
    });

    if (!siswa) {
      throw new Error("Siswa not found");
    }

    if (siswa.kelasId !== fromKelasId) {
      throw new Error("Siswa is not in the source kelas");
    }

    const toKelas = await prisma.kelas.findUnique({
      where: { id_kelas: toKelasId },
    });

    if (!toKelas) {
      throw new Error("Target kelas not found");
    }

    await prisma.siswa.update({
      where: { id_siswa: siswaId },
      data: { kelasId: toKelasId },
    });

    return {
      message: `Siswa moved to ${toKelas.namaKelas} successfully`,
    };
  }

  /**
   * Link kelas to tahun ajaran
   */
  static async linkTahunAjaran(kelasId: number, tahunAjaranId: number) {
    const kelas = await prisma.kelas.findUnique({
      where: { id_kelas: kelasId },
    });

    if (!kelas) {
      throw new Error("Kelas not found");
    }

    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id_tahun: tahunAjaranId },
    });

    if (!tahunAjaran) {
      throw new Error("Tahun ajaran not found");
    }

    // Check if relation already exists
    const existing = await prisma.kelasTahunAjaran.findFirst({
      where: {
        kelasId,
        tahunAjaranId,
      },
    });

    if (existing) {
      throw new Error("Kelas already linked to this tahun ajaran");
    }

    const relation = await prisma.kelasTahunAjaran.create({
      data: {
        kelasId,
        tahunAjaranId,
        isActive: tahunAjaran.isActive,
      },
      include: {
        kelas: true,
        tahunAjaran: true,
      },
    });

    return relation;
  }

  /**
   * Get statistics
   */
  static async getStats() {
    const [total, withWali, withoutWali, totalSiswa] = await Promise.all([
      prisma.kelas.count(),
      prisma.kelas.count({
        where: {
          waliId: {
            not: null,
          },
        },
      }),
      prisma.kelas.count({
        where: {
          waliId: null,
        },
      }),
      prisma.siswa.count({
        where: {
          kelasId: {
            not: null,
          },
        },
      }),
    ]);

    // Get kelas by tingkat
    const byTingkat = await prisma.kelas.groupBy({
      by: ["tingkat"],
      _count: {
        tingkat: true,
      },
    });

    return {
      total,
      withWali,
      withoutWali,
      totalSiswaInKelas: totalSiswa,
      byTingkat: byTingkat.map((item) => ({
        tingkat: item.tingkat,
        count: item._count.tingkat,
      })),
    };
  }
}
