import { Request, Response, NextFunction } from "express";
import { AuthUser, UserRole } from "../types/common.types";
import { sendError } from "../utils/response.util";
import { verifyAccessToken } from "../utils/jwt.util";
import prisma from "../config/database";

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
  next: NextFunction
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
      },
    });

    if (!user) {
      return sendError(res, "User not found", null, 401);
    }

    // attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      guruId: user.guruId || undefined,
      siswaId: user.siswaId || undefined,
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
        403
      );
    }

    next();
  };
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
      403
    );
  };
};
