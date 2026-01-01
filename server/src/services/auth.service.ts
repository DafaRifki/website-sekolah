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
    const { email, password, role = "SISWA" } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role as Role,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
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
            email: true,
            jabatan: true,
            fotoProfil: true,
          },
        },
        siswa: {
          select: {
            id_siswa: true,
            nama: true,
            nis: true,
            kelas: {
              select: {
                id_kelas: true,
                namaKelas: true,
                tingkat: true,
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
}
