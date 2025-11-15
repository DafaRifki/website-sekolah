import { prisma } from "../config/database";
import { PaginationQuery, PaginationResult } from "../types/common.types";
import {
  buildPaginationQuery,
  buildPaginationResult,
  buildSearchFilter,
} from "../utils/database.util";
import { Prisma } from "@prisma/client";

interface CreateTahunAjaranData {
  namaTahun: string;
  startDate: Date | string;
  endDate: Date | string;
  semester: number;
  isActive?: boolean;
}

interface UpdateTahunAjaranData {
  namaTahun?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  semester?: number;
  isActive?: boolean;
}

export class TahunAjaranService {
  static async getAll(query: PaginationQuery): Promise<PaginationResult<any>> {
    const { skip, take, page, limit } = buildPaginationQuery(query);

    const searchFilter = buildSearchFilter(query.search, ["namaTahun"]);

    const where: Prisma.TahunAjaranWhereInput = {
      ...searchFilter,
    };

    const [tahunAjaran, total] = await Promise.all([
      prisma.tahunAjaran.findMany({
        where,
        skip,
        take,
        orderBy: [{ namaTahun: "desc" }, { semester: "asc" }],
        select: {
          id_tahun: true,
          namaTahun: true,
          startDate: true,
          endDate: true,
          semester: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              daftar: true,
              kelasRel: true,
              absensi: true,
            },
          },
        },
      }),
      prisma.tahunAjaran.count({ where }),
    ]);

    return buildPaginationResult(tahunAjaran, total, page, limit);
  }

  static async getById(id: number) {
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id_tahun: id },
      include: {
        _count: {
          select: {
            daftar: true,
            kelasRel: true,
            absensi: true,
            tarif: true,
          },
        },
      },
    });

    if (!tahunAjaran) {
      throw new Error("Tahun ajaran not found");
    }

    return tahunAjaran;
  }

  static async getActive() {
    const activeTahunAjaran = await prisma.tahunAjaran.findFirst({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            daftar: true,
            kelasRel: true,
          },
        },
      },
    });

    if (!activeTahunAjaran) {
      throw new Error("No active tahun ajaran found");
    }

    return activeTahunAjaran;
  }

  static async getCurrent() {
    const now = new Date();

    const currentTahunAjaran = await prisma.tahunAjaran.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { startDate: "desc" },
    });

    if (!currentTahunAjaran) {
      throw new Error("No current tahun ajaran found for this date");
    }

    return currentTahunAjaran;
  }

  static async getByYear(year: string) {
    const tahunAjaran = await prisma.tahunAjaran.findMany({
      where: { namaTahun: year },
      orderBy: { semester: "asc" },
    });

    if (tahunAjaran.length === 0) {
      throw new Error("No tahun ajaran found for this year");
    }

    return tahunAjaran;
  }

  static async create(data: CreateTahunAjaranData) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // Validate dates
    if (startDate >= endDate) {
      throw new Error("End date must be after start date");
    }

    // Validate semester
    if (data.semester !== 1 && data.semester !== 2) {
      throw new Error("Semester must be 1 or 2");
    }

    // Check for existing combination
    const existing = await prisma.tahunAjaran.findUnique({
      where: {
        namaTahun_semester: {
          namaTahun: data.namaTahun,
          semester: data.semester,
        },
      },
    });

    if (existing) {
      throw new Error(
        `Tahun ajaran ${data.namaTahun} semester ${data.semester} already exists`
      );
    }

    // If setting as active, deactivate others
    if (data.isActive) {
      await prisma.tahunAjaran.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const tahunAjaran = await prisma.tahunAjaran.create({
      data: {
        namaTahun: data.namaTahun,
        startDate: startDate,
        endDate: endDate,
        semester: data.semester,
        isActive: data.isActive || false,
      },
    });

    return tahunAjaran;
  }

  static async update(id: number, data: UpdateTahunAjaranData) {
    const existing = await prisma.tahunAjaran.findUnique({
      where: { id_tahun: id },
    });

    if (!existing) {
      throw new Error("Tahun ajaran not found");
    }

    // Validate dates if provided
    if (data.startDate || data.endDate) {
      const startDate = data.startDate
        ? new Date(data.startDate)
        : existing.startDate;
      const endDate = data.endDate ? new Date(data.endDate) : existing.endDate;

      if (startDate >= endDate) {
        throw new Error("End date must be after start date");
      }
    }

    // Validate semester if provided
    if (data.semester && data.semester !== 1 && data.semester !== 2) {
      throw new Error("Semester must be 1 or 2");
    }

    // Check for conflicts if changing year or semester
    if (data.namaTahun || data.semester) {
      const newNamaTahun = data.namaTahun || existing.namaTahun;
      const newSemester = data.semester || existing.semester;

      if (
        newNamaTahun !== existing.namaTahun ||
        newSemester !== existing.semester
      ) {
        const conflict = await prisma.tahunAjaran.findUnique({
          where: {
            namaTahun_semester: {
              namaTahun: newNamaTahun,
              semester: newSemester,
            },
          },
        });

        if (conflict && conflict.id_tahun !== id) {
          throw new Error(
            "Tahun ajaran with this year and semester already exists"
          );
        }
      }
    }

    // If setting as active, deactivate others
    if (data.isActive) {
      await prisma.tahunAjaran.updateMany({
        where: {
          isActive: true,
          id_tahun: { not: id },
        },
        data: { isActive: false },
      });
    }

    const updateData: any = {
      namaTahun: data.namaTahun,
      semester: data.semester,
      isActive: data.isActive,
    };

    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }

    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }

    const updated = await prisma.tahunAjaran.update({
      where: { id_tahun: id },
      data: updateData,
    });

    return updated;
  }

  static async setActive(id: number) {
    const existing = await prisma.tahunAjaran.findUnique({
      where: { id_tahun: id },
    });

    if (!existing) {
      throw new Error("Tahun ajaran not found");
    }

    // Deactivate all others
    await prisma.tahunAjaran.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Activate this one
    const activated = await prisma.tahunAjaran.update({
      where: { id_tahun: id },
      data: { isActive: true },
    });

    return activated;
  }

  static async delete(id: number) {
    const existing = await prisma.tahunAjaran.findUnique({
      where: { id_tahun: id },
      include: {
        _count: {
          select: {
            daftar: true,
            kelasRel: true,
            absensi: true,
          },
        },
      },
    });

    if (!existing) {
      throw new Error("Tahun ajaran not found");
    }

    // Prevent deletion if has related data
    const totalRelated =
      existing._count.daftar +
      existing._count.kelasRel +
      existing._count.absensi;
    if (totalRelated > 0) {
      throw new Error(
        `Cannot delete tahun ajaran with existing data (${totalRelated} related records)`
      );
    }

    // Prevent deletion of active tahun ajaran
    if (existing.isActive) {
      throw new Error(
        "Cannot delete active tahun ajaran. Please set another tahun ajaran as active first."
      );
    }

    await prisma.tahunAjaran.delete({
      where: { id_tahun: id },
    });

    return { message: "Tahun ajaran deleted successfully" };
  }

  static async getStats() {
    const now = new Date();

    const [
      total,
      active,
      current,
      upcoming,
      past,
      semester1Count,
      semester2Count,
    ] = await Promise.all([
      prisma.tahunAjaran.count(),
      prisma.tahunAjaran.count({ where: { isActive: true } }),
      prisma.tahunAjaran.count({
        where: {
          startDate: { lte: now },
          endDate: { gte: now },
        },
      }),
      prisma.tahunAjaran.count({
        where: { startDate: { gt: now } },
      }),
      prisma.tahunAjaran.count({
        where: { endDate: { lt: now } },
      }),
      prisma.tahunAjaran.count({ where: { semester: 1 } }),
      prisma.tahunAjaran.count({ where: { semester: 2 } }),
    ]);

    return {
      total,
      active,
      current,
      upcoming,
      past,
      bySemester: {
        semester1: semester1Count,
        semester2: semester2Count,
      },
    };
  }
}
