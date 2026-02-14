import { Request, Response, NextFunction } from "express";
import { AuthUser, UserRole } from "../types/common.types";
import { sendError } from "../utils/response.util";
import { verifyAccessToken } from "../utils/jwt.util";
import prisma from "../config/database";
import { Role } from "@prisma/client";

// Extend request type untuk include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer token

    if (!token) {
      return sendError(res, "Access token required", null, 401);
    }

    // verify token
    const decoded = verifyAccessToken(token);

    // get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        guruId: true,
        siswaId: true,
        guru: {
          select: {
            isWaliKelas: true,
            waliKelas: {
              select: {
                id_kelas: true,
              },
            },
            mengajarMapel: {
              select: {
                id_kelas: true,
                id_mapel: true,
              },
            },
          },
        },
        siswa: {
          select: {
            kelasId: true,
          },
        },
      },
    });

    if (!user) {
      return sendError(res, "User not found", null, 401);
    }

    // Process additional data
    let kelasWaliIds: number[] | undefined;
    let mengajarKelas: number[] | undefined;
    let mengajarMapel: number[] | undefined;

    if (user.guru) {
      if (user.guru.waliKelas && user.guru.waliKelas.length > 0) {
        kelasWaliIds = user.guru.waliKelas.map((k) => k.id_kelas);
      }

      if (user.guru.mengajarMapel) {
        mengajarKelas = [
          ...new Set(user.guru.mengajarMapel.map((m) => m.id_kelas)),
        ];
        mengajarMapel = [
          ...new Set(user.guru.mengajarMapel.map((m) => m.id_mapel)),
        ];
      }
    }

    // attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      guruId: user.guruId || undefined,
      siswaId: user.siswaId || undefined,
      isWaliKelas:
        user.guru?.isWaliKelas || (user.guru?.waliKelas?.length || 0) > 0,
      kelasWaliIds,
      mengajarKelas,
      mengajarMapel,
      siswaKelasId: user.siswa?.kelasId || undefined,
    };
    next();
  } catch (error: any) {
    if (error.message === "Invalid or expired access token") {
      return sendError(res, "Token expired or invalid", null, 401);
    }
    return sendError(res, "Authentication failed", error.message, 401);
  }
};

// Role-based authorization middleware
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "Authentication required", null, 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        "Insufficient permissions",
        `Required roles: ${roles.join(", ")}`,
        403,
      );
    }

    next();
  };
};

/**
 * Require ADMIN role only
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return sendError(res, "Authentication required", null, 401);
  }

  if (req.user.role !== "ADMIN") {
    return sendError(res, "Access denied. Admin only.", null, 403);
  }

  next();
};

/**
 * Require GURU role (wali kelas OR guru mapel)
 */
export const requireGuru = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return sendError(res, "Authentication required", null, 401);
  }

  if (req.user.role !== "GURU" && req.user.role !== "ADMIN") {
    return sendError(res, "Access denied. Guru only.", null, 403);
  }

  next();
};

/**
 * Require WALI KELAS specifically
 */
export const requireWaliKelas = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return sendError(res, "Authentication required", null, 401);
  }

  // Admin can do everything
  if (req.user.role === "ADMIN") {
    return next();
  }

  // Must be guru and wali kelas
  if (req.user.role !== "GURU" || !req.user.isWaliKelas) {
    return sendError(
      res,
      "Access denied. Only wali kelas can perform this action.",
      null,
      403,
    );
  }

  next();
};

/**
 * Check if user can edit specific nilai
 * Usage: requireNilaiAccess (gets nilaiId from params)
 */
export const requireNilaiAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return sendError(res, "Authentication required", null, 401);
  }

  const nilaiId = parseInt(req.params.id || req.params.nilaiId);

  if (isNaN(nilaiId)) {
    return sendError(res, "Nilai ID is required", null, 400);
  }

  // Admin can edit all
  if (req.user.role === "ADMIN") {
    return next();
  }

  try {
    // Get nilai to check ownership
    const nilai = await prisma.nilaiRapor.findUnique({
      where: { id_nilai: nilaiId },
      include: {
        siswa: {
          select: { kelasId: true },
        },
      },
    });

    if (!nilaiId) {
      return sendError(res, "Nilai not found", null, 404);
    }

    const kelasId = nilai?.siswa.kelasId;

    // Guru: check if wali kelas or mengajar mapel
    if (req.user.role === "GURU") {
      // Wali kelas: can edit if student in their class
      if (req.user.kelasWaliIds?.includes(kelasId!)) {
        return next();
      }

      // Guru mapel: can edit if teaches this mapel in this class
      const guruMapel = await prisma.guruMapel.findFirst({
        where: {
          id_guru: req.user.guruId,
          id_mapel: nilai?.id_mapel,
          id_kelas: kelasId!,
          tahunAjaranId: nilai?.tahunAjaranId,
        },
      });

      if (guruMapel) {
        return next();
      }
    }

    return sendError(
      res,
      "Access denied",
      "You don't have permission to edit this nilai",
      403,
    );
  } catch (error: any) {
    return sendError(res, "Failed to verify access", error.message, 500);
  }
};

// Check if user owns resource or is admin
export const requireOwnershipOrAdmin = (resourceKey: string = "id") => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "Authentication required", null, 401);
    }

    // Admin can access everything
    if (req.user.role === "ADMIN") {
      return next();
    }

    const resourceId = parseInt(req.params[resourceKey]);

    // For GURU role
    if (req.user.role === "GURU" && req.user.guruId === resourceId) {
      return next();
    }

    // For SISWA role
    if (req.user.role === "SISWA" && req.user.siswaId === resourceId) {
      return next();
    }

    return sendError(
      res,
      "Access denied",
      "You can only access your own data",
      403,
    );
  };
};

/**
 * Check if user has access to specific kelas
 * Usage: requireKelasAccess("kelasId")
 */
export const requireKelasAccess = (kelasIdParam: string = "kelasId") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "Authentication required", null, 401);
    }

    const kelasId = parseInt(
      req.params?.[kelasIdParam] ||
        req.body?.kelasId ||
        (req.query?.kelasId as string),
    );

    if (isNaN(kelasId)) {
      return sendError(res, "Kelas ID is required", null, 400);
    }

    // Admin has access to all
    if (req.user.role === Role.ADMIN) {
      return next();
    }

    // Guru: check if wali kelas or mengajar di kelas
    if (req.user.role === Role.GURU) {
      // Wali kelas of this class?
      if (req.user.kelasWaliIds?.includes(kelasId)) {
        return next();
      }

      // Mengajar di kelas ini?
      if (req.user.mengajarKelas?.includes(kelasId)) {
        return next();
      }
    }

    // Siswa: check if belongs to kelas
    if (req.user.role === Role.SISWA) {
      if (req.user.siswaKelasId === kelasId) {
        return next();
      }
    }

    return sendError(
      res,
      "Access denied",
      "You don't have access to this class",
      403,
    );
  };
};

/**
 * Check if guru can edit nilai for specific mapel
 * Usage: requireMapelAccess (gets mapelId from body/params)
 */
export const requireMapelAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return sendError(res, "Authentication required", null, 401);
  }

  const mapelId = parseInt(req.params.mapelId || req.body.id_mapel);

  if (isNaN(mapelId)) {
    return sendError(res, "Mapel ID is required", null, 400);
  }

  // Admin can edit all
  if (req.user.role === Role.ADMIN) {
    return next();
  }

  // Wali kelas can edit all mapel in their class
  if (req.user.role === Role.GURU && req.user.isWaliKelas) {
    return next();
  }

  // Guru mapel: only their subjects
  if (req.user.role === Role.GURU) {
    if (req.user.mengajarMapel?.includes(mapelId)) {
      return next();
    }
  }

  return sendError(res, "Access denied", "You don't teach this subject", 403);
};

/**
 * Check if user can access specific rapor
 * Usage: requireRaporAccess (gets id from params)
 */
export const requireRaporAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return sendError(res, "Authentication required", null, 401);
  }

  const raporId = parseInt(req.params.id || req.params.raporId);

  if (isNaN(raporId)) {
    return sendError(res, "Rapor ID is required", null, 400);
  }

  // Admin can access all
  if (req.user.role === "ADMIN") {
    return next();
  }

  try {
    // Get rapor to check ownership
    const rapor = await prisma.rapor.findUnique({
      where: { id_rapor: raporId },
      include: {
        siswa: {
          select: {
            kelasId: true,
          },
        },
      },
    });

    if (!rapor) {
      return sendError(res, "Rapor not found", null, 404);
    }

    // Siswa: only their own rapor
    if (req.user.role === "SISWA") {
      if (req.user.siswaId === rapor.id_siswa) {
        return next();
      }
    }

    // Guru: if wali kelas or mengajar di kelas siswa
    if (req.user.role === "GURU") {
      const kelasId = rapor.siswa.kelasId;

      if (
        req.user.kelasWaliIds?.includes(kelasId!) ||
        req.user.mengajarKelas?.includes(kelasId!)
      ) {
        return next();
      }
    }

    return sendError(
      res,
      "Access denied",
      "You don't have access to this rapor",
      403,
    );
  } catch (error: any) {
    return sendError(res, "Failed to verify access", error.message, 500);
  }
};

/**
 * Check if user is the specific wali kelas for a rapor
 */
export const requireWaliKelasAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return sendError(res, "Authentication required", null, 401);
  }

  // Admin always has access
  if (req.user.role === "ADMIN") {
    return next();
  }

  const raporId = parseInt(req.params.id || req.params.raporId);
  if (isNaN(raporId)) {
    return sendError(res, "Rapor ID is required", null, 400);
  }

  try {
    const rapor = await prisma.rapor.findUnique({
      where: { id_rapor: raporId },
      include: { siswa: { select: { kelasId: true } } },
    });

    if (!rapor) {
      return sendError(res, "Rapor not found", null, 404);
    }

    if (req.user.role === "GURU") {
      const kelasId = rapor.siswa.kelasId;
      if (req.user.kelasWaliIds?.includes(kelasId!)) {
        return next();
      }
    }

    return sendError(
      res,
      "Access denied",
      "Only the wali kelas for this student's class can perform this action",
      403,
    );
  } catch (error: any) {
    return sendError(res, "Failed to verify access", error.message, 500);
  }
};

// ============================================================================
// HELPER FUNCTIONS (OPTIONAL)
// ============================================================================

/**
 * Check if current user is wali kelas for specific kelas
 */
export const isWaliKelasFor = (req: Request, kelasId: number): boolean => {
  return (
    req.user?.role === Role.ADMIN ||
    (req.user?.role === Role.GURU &&
      req.user?.isWaliKelas === true &&
      (req.user?.kelasWaliIds?.includes(kelasId) ?? false))
  );
};

/**
 * Check if current user mengajar mapel
 */
export const canTeachMapel = (req: Request, mapelId: number): boolean => {
  return (
    req.user?.role === Role.ADMIN ||
    (req.user?.role === Role.GURU &&
      (req.user?.isWaliKelas === true ||
        (req.user?.mengajarMapel?.includes(mapelId) ?? false)))
  );
};

/**
 * Check if current user has access to kelas
 */
export const hasKelasAccess = (req: Request, kelasId: number): boolean => {
  if (req.user?.role === Role.ADMIN) return true;
  if (req.user?.role === Role.GURU) {
    return (
      req.user?.kelasWaliIds?.includes(kelasId) ||
      req.user?.mengajarKelas?.includes(kelasId) ||
      false
    );
  }
  if (req.user?.role === Role.SISWA) {
    return req.user?.siswaKelasId === kelasId;
  }
  return false;
};
