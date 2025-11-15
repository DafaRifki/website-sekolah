import { prisma } from "../config/database";
import { hashPassword } from "../utils/hash.util";
import { PaginationQuery, PaginationResult } from "../types/common.types";
import {
  buildPaginationQuery,
  buildPaginationResult,
  buildSearchFilter,
} from "../utils/database.util";
import { Role } from "@prisma/client";

interface CreateUserData {
  email: string;
  password: string;
  role: "ADMIN" | "GURU" | "SISWA";
  guruId?: number;
  siswaId?: number;
}

interface UpdateUserData {
  email?: string;
  role?: "ADMIN" | "GURU" | "SISWA";
  guruId?: number;
  siswaId?: number;
}

export class UserService {
  static async getAllUsers(
    query: PaginationQuery
  ): Promise<PaginationResult<any>> {
    const { skip, take, page, limit } = buildPaginationQuery(query);

    // Build search filter
    const searchFilter = buildSearchFilter(query.search, ["email"]);

    // Build orderBy with proper Prisma types
    const orderBy: any = {};

    if (query.sortBy === "role") {
      orderBy.role = query.sortOrder === "desc" ? "desc" : "asc";
    } else if (query.sortBy === "email") {
      orderBy.email = query.sortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.id = "desc"; // Default sort by ID
    }

    const where = {
      ...searchFilter,
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          email: true,
          role: true,
          guruId: true,
          siswaId: true,
          guru: {
            select: {
              id_guru: true,
              nama: true,
              nip: true,
              jabatan: true,
            },
          },
          siswa: {
            select: {
              id_siswa: true,
              nama: true,
              nis: true,
              kelas: {
                select: {
                  namaKelas: true,
                  tingkat: true,
                },
              },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return buildPaginationResult(users, total, page, limit);
  }

  static async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        guruId: true,
        siswaId: true,
        guru: {
          select: {
            id_guru: true,
            nama: true,
            nip: true,
            email: true,
            jabatan: true,
            jenisKelamin: true,
            alamat: true,
            noHP: true,
            fotoProfil: true,
          },
        },
        siswa: {
          select: {
            id_siswa: true,
            nama: true,
            nis: true,
            alamat: true,
            tanggalLahir: true,
            jenisKelamin: true,
            fotoProfil: true,
            kelas: {
              select: {
                id_kelas: true,
                namaKelas: true,
                tingkat: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  static async createUser(data: CreateUserData) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("Email already exists");
    }

    // Validate role-specific data
    if (data.role === "GURU" && data.guruId) {
      const guru = await prisma.guru.findUnique({
        where: { id_guru: data.guruId },
      });
      if (!guru) {
        throw new Error("Guru not found");
      }
    }

    if (data.role === "SISWA" && data.siswaId) {
      const siswa = await prisma.siswa.findUnique({
        where: { id_siswa: data.siswaId },
      });
      if (!siswa) {
        throw new Error("Siswa not found");
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role as Role,
        guruId: data.guruId,
        siswaId: data.siswaId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        guruId: true,
        siswaId: true,
      },
    });

    return user;
  }

  static async updateUser(id: number, data: UpdateUserData) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Check email uniqueness if email is being updated
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new Error("Email already exists");
      }
    }

    // Validate role-specific data
    if (data.role === "GURU" && data.guruId) {
      const guru = await prisma.guru.findUnique({
        where: { id_guru: data.guruId },
      });
      if (!guru) {
        throw new Error("Guru not found");
      }
    }

    if (data.role === "SISWA" && data.siswaId) {
      const siswa = await prisma.siswa.findUnique({
        where: { id_siswa: data.siswaId },
      });
      if (!siswa) {
        throw new Error("Siswa not found");
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        role: data.role as Role,
        guruId: data.guruId,
        siswaId: data.siswaId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        guruId: true,
        siswaId: true,
      },
    });

    return updatedUser;
  }

  static async deleteUser(id: number) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Prevent deleting the last admin
    if (existingUser.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });

      if (adminCount <= 1) {
        throw new Error("Cannot delete the last admin user");
      }
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    return { message: "User deleted successfully" };
  }

  static async toggleUserStatus(id: number) {
    // For future implementation - user activation/deactivation
    // This would require adding an 'isActive' field to the User model
    throw new Error("User status toggle not implemented yet");
  }

  static async resetUserPassword(id: number, newPassword: string) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: "Password reset successfully" };
  }

  static async getUsersByRole(role: "ADMIN" | "GURU" | "SISWA") {
    const users = await prisma.user.findMany({
      where: { role: role as Role },
      select: {
        id: true,
        email: true,
        role: true,
        guru: {
          select: {
            id_guru: true,
            nama: true,
            nip: true,
          },
        },
        siswa: {
          select: {
            id_siswa: true,
            nama: true,
            nis: true,
          },
        },
      },
    });

    return users;
  }

  static async getUserStats() {
    const [totalUsers, adminCount, guruCount, siswaCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "GURU" } }),
      prisma.user.count({ where: { role: "SISWA" } }),
    ]);

    return {
      total: totalUsers,
      admin: adminCount,
      guru: guruCount,
      siswa: siswaCount,
    };
  }
}
