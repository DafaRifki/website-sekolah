import { prisma } from "../config/database";
import { hashPassword, comparePassword } from "../utils/hash.util";
import { generateTokens } from "../utils/jwt.util";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../types/auth.types";
import { Role } from "@prisma/client";

export class AuthService {
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const { email, password, nama, role = "SISWA" } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Transaction to create User and possibly Siswa
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role as Role,
        },
      });

      // If role is SISWA, create Siswa record with PENDING_VERIFIKASI status
      // This allows verification without changing schema
      if (role === "SISWA") {
        await tx.siswa.create({
          data: {
            nama: nama || email.split("@")[0], // Fallback name
            status: "PENDING_VERIFIKASI", // Special status for new registrations
            user: {
              connect: { id: user.id },
            },
          },
        });
      }

      return user;
    });

    // Generate tokens
    const tokens = generateTokens({
      userId: result.id,
      email: result.email,
      role: result.role,
    });

    return {
      user: {
        id: result.id,
        email: result.email,
        role: result.role,
      },
      tokens,
    };
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        guruId: true,
        siswaId: true,
        siswa: {
          select: {
            status: true, // Get status to check verification
            pendaftaran: {
              select: {
                statusDokumen: true,
                statusPembayaran: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check verification status for SISWA
    if (user.role === "SISWA" && user.siswa) {
      if (user.siswa.status === "PENDING_VERIFIKASI") {
        throw new Error(
          "Akun Anda sedang dalam proses verifikasi admin. Silakan tunggu hingga disetujui.",
        );
      }
      
      // If status is NONAKTIF (blocked), also prevent login
      if (user.siswa.status === "NONAKTIF") {
         throw new Error("Akun Anda dinonaktifkan. Silakan hubungi admin.");
      }
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    let statusPendaftaran: string | undefined;
    if (user.role === "SISWA" && user.siswa?.pendaftaran?.[0]) {
      const pendaftaran = user.siswa.pendaftaran[0];
      // Logic: If document is missing OR payment is installment -> PENDING
      if (
        pendaftaran.statusDokumen !== "LENGKAP" ||
        pendaftaran.statusPembayaran === "CICIL"
      ) {
        statusPendaftaran = "PENDING_VERIFIKASI";
      } else {
        statusPendaftaran = "DITERIMA";
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        statusPendaftaran,
      },
      tokens,
    };
  }

  static async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token (gunakan fungsi dari jwt.util.ts)
      const { verifyRefreshToken } = await import("../utils/jwt.util");
      const decoded = verifyRefreshToken(refreshToken);

      // Check if user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Generate new access token
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        accessToken: tokens.accessToken,
      };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  static async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
            jenisKelamin: true,
            tempatLahir: true,
            tanggalLahir: true,
            alamat: true,
            noHP: true,
            email: true,
            pendidikan: true,
            jabatan: true,
            statusKepegawaian: true,
            fotoProfil: true,
            waliKelas: {
              select: {
                id_kelas: true,
                namaKelas: true,
              },
            },
            mengajarMapel: {
              select: {
                id_mapel: true,
                mapel: {
                  select: {
                    namaMapel: true,
                  },
                },
                kelas: {
                  select: {
                    id_kelas: true,
                    namaKelas: true,
                  },
                },
              },
            },
          },
        },
        siswa: {
          select: {
            id_siswa: true,
            nis: true,
            nisn: true,
            nama: true,
            jenisKelamin: true,
            tempatLahir: true,
            tanggalLahir: true,
            agama: true,
            alamat: true,
            noHP: true,
            email: true,
            namaAyah: true,
            namaIbu: true,
            pekerjaanAyah: true,
            pekerjaanIbu: true,
            noTeleponOrtu: true,
            kelas: {
              select: {
                id_kelas: true,
                namaKelas: true,
                tingkat: true,
                guru: {
                  select: {
                    nama: true,
                  },
                },
              },
            },
            fotoProfil: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  static async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ) {
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: "Password changed successfully" };
  }

  static async updateProfile(
    userId: number,
    data: { email?: string; name?: string }
  ) {
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        guruId: true,
        siswaId: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check email uniqueness if email is being updated
    if (data.email && data.email !== user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new Error("Email already exists");
      }
    }

    // Update user email if provided
    if (data.email) {
      await prisma.user.update({
        where: { id: userId },
        data: { email: data.email },
      });
    }

    // Update name in guru or siswa record if applicable
    if (data.name) {
      if (user.guruId) {
        await prisma.guru.update({
          where: { id_guru: user.guruId },
          data: { nama: data.name },
        });
      } else if (user.siswaId) {
        await prisma.siswa.update({
          where: { id_siswa: user.siswaId },
          data: { nama: data.name },
        });
      }
    }

    // Return updated profile
    return await this.getProfile(userId);
  }
}
