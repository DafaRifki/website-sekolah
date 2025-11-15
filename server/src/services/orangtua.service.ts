import { prisma } from "../config/database";
import { PaginationQuery, PaginationResult } from "../types/common.types";
import {
  buildPaginationQuery,
  buildPaginationResult,
  buildSearchFilter,
} from "../utils/database.util";
import { Prisma } from "@prisma/client";

interface CreateOrangTuaData {
  nama: string;
  hubungan: string; // Ayah, Ibu, Wali
  pekerjaan: string;
  alamat: string;
  noHp: string;
}

interface UpdateOrangTuaData {
  nama?: string;
  hubungan?: string;
  pekerjaan?: string;
  alamat?: string;
  noHp?: string;
}

interface LinkSiswaData {
  siswaId: number;
  status?: string; // Aktif, Tidak Aktif
}

export class OrangTuaService {
  /**
   * Get all orang tua with pagination and search
   */
  static async getAll(query: PaginationQuery): Promise<PaginationResult<any>> {
    const { skip, take, page, limit } = buildPaginationQuery(query);

    const searchFilter = buildSearchFilter(query.search, [
      "nama",
      "hubungan",
      "pekerjaan",
      "noHp",
    ]);

    const where: Prisma.OrangTuaWhereInput = {
      ...searchFilter,
    };

    const [orangTua, total] = await Promise.all([
      prisma.orangTua.findMany({
        where,
        skip,
        take,
        orderBy: { id_orangtua: "desc" },
        select: {
          id_orangtua: true,
          nama: true,
          hubungan: true,
          pekerjaan: true,
          alamat: true,
          noHp: true,
          _count: {
            select: {
              siswa: true,
            },
          },
        },
      }),
      prisma.orangTua.count({ where }),
    ]);

    // Format response
    const formatted = orangTua.map((ot) => ({
      id_orangtua: ot.id_orangtua,
      nama: ot.nama,
      hubungan: ot.hubungan,
      pekerjaan: ot.pekerjaan,
      alamat: ot.alamat,
      noHp: ot.noHp,
      jumlahSiswa: ot._count.siswa,
    }));

    return buildPaginationResult(formatted, total, page, limit);
  }

  /**
   * Get orang tua by ID
   */
  static async getById(id: number) {
    const orangTua = await prisma.orangTua.findUnique({
      where: { id_orangtua: id },
      include: {
        siswa: {
          include: {
            siswa: {
              select: {
                id_siswa: true,
                nis: true,
                nama: true,
                kelas: {
                  select: {
                    namaKelas: true,
                    tingkat: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!orangTua) {
      throw new Error("Orang tua not found");
    }

    return orangTua;
  }

  /**
   * Create new orang tua
   */
  static async create(data: CreateOrangTuaData) {
    const orangTua = await prisma.orangTua.create({
      data: {
        nama: data.nama,
        hubungan: data.hubungan,
        pekerjaan: data.pekerjaan,
        alamat: data.alamat,
        noHp: data.noHp,
      },
    });

    return orangTua;
  }

  /**
   * Update orang tua
   */
  static async update(id: number, data: UpdateOrangTuaData) {
    const existing = await prisma.orangTua.findUnique({
      where: { id_orangtua: id },
    });

    if (!existing) {
      throw new Error("Orang tua not found");
    }

    const updated = await prisma.orangTua.update({
      where: { id_orangtua: id },
      data,
    });

    return updated;
  }

  /**
   * Delete orang tua
   */
  static async delete(id: number) {
    const orangTua = await prisma.orangTua.findUnique({
      where: { id_orangtua: id },
      include: {
        siswa: true,
      },
    });

    if (!orangTua) {
      throw new Error("Orang tua not found");
    }

    // Check if orang tua has linked siswa
    if (orangTua.siswa.length > 0) {
      throw new Error(
        `Cannot delete orang tua with ${orangTua.siswa.length} linked siswa. Unlink siswa first.`
      );
    }

    await prisma.orangTua.delete({
      where: { id_orangtua: id },
    });

    return { message: "Orang tua deleted successfully" };
  }

  /**
   * Link orang tua to siswa
   */
  static async linkToSiswa(orangTuaId: number, data: LinkSiswaData) {
    // Check if orang tua exists
    const orangTua = await prisma.orangTua.findUnique({
      where: { id_orangtua: orangTuaId },
    });

    if (!orangTua) {
      throw new Error("Orang tua not found");
    }

    // Check if siswa exists
    const siswa = await prisma.siswa.findUnique({
      where: { id_siswa: data.siswaId },
    });

    if (!siswa) {
      throw new Error("Siswa not found");
    }

    // Check if link already exists
    const existingLink = await prisma.siswa_Orangtua.findUnique({
      where: {
        id_siswa_id_orangtua: {
          id_siswa: data.siswaId,
          id_orangtua: orangTuaId,
        },
      },
    });

    if (existingLink) {
      throw new Error("Siswa already linked to this orang tua");
    }

    // Create link
    const link = await prisma.siswa_Orangtua.create({
      data: {
        id_siswa: data.siswaId,
        id_orangtua: orangTuaId,
        status: data.status || "Aktif",
      },
      include: {
        siswa: {
          select: {
            id_siswa: true,
            nis: true,
            nama: true,
          },
        },
        orangtua: {
          select: {
            id_orangtua: true,
            nama: true,
            hubungan: true,
          },
        },
      },
    });

    return link;
  }

  /**
   * Unlink orang tua from siswa
   */
  static async unlinkFromSiswa(orangTuaId: number, siswaId: number) {
    // Check if link exists
    const link = await prisma.siswa_Orangtua.findUnique({
      where: {
        id_siswa_id_orangtua: {
          id_siswa: siswaId,
          id_orangtua: orangTuaId,
        },
      },
    });

    if (!link) {
      throw new Error("Link not found");
    }

    await prisma.siswa_Orangtua.delete({
      where: {
        id_siswa_id_orangtua: {
          id_siswa: siswaId,
          id_orangtua: orangTuaId,
        },
      },
    });

    return { message: "Orang tua unlinked from siswa successfully" };
  }

  /**
   * Get orang tua by siswa
   */
  static async getBySiswa(siswaId: number) {
    const siswa = await prisma.siswa.findUnique({
      where: { id_siswa: siswaId },
    });

    if (!siswa) {
      throw new Error("Siswa not found");
    }

    const orangTua = await prisma.siswa_Orangtua.findMany({
      where: { id_siswa: siswaId },
      include: {
        orangtua: true,
      },
    });

    return orangTua.map((link) => ({
      ...link.orangtua,
      status: link.status,
    }));
  }

  /**
   * Get siswa by orang tua
   */
  static async getSiswaByOrangTua(orangTuaId: number) {
    const orangTua = await prisma.orangTua.findUnique({
      where: { id_orangtua: orangTuaId },
    });

    if (!orangTua) {
      throw new Error("Orang tua not found");
    }

    const siswa = await prisma.siswa_Orangtua.findMany({
      where: { id_orangtua: orangTuaId },
      include: {
        siswa: {
          include: {
            kelas: {
              select: {
                namaKelas: true,
                tingkat: true,
              },
            },
          },
        },
      },
    });

    return siswa.map((link) => ({
      ...link.siswa,
      status: link.status,
    }));
  }

  /**
   * Get statistics
   */
  static async getStats() {
    const [total, withSiswa, byHubungan] = await Promise.all([
      prisma.orangTua.count(),
      prisma.orangTua.count({
        where: {
          siswa: {
            some: {},
          },
        },
      }),
      prisma.orangTua.groupBy({
        by: ["hubungan"],
        _count: {
          hubungan: true,
        },
      }),
    ]);

    return {
      total,
      withSiswa,
      withoutSiswa: total - withSiswa,
      byHubungan: byHubungan.map((item) => ({
        hubungan: item.hubungan,
        count: item._count.hubungan,
      })),
    };
  }
}
