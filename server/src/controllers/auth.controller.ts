import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { sendSuccess, sendError } from "../utils/response.util";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);

      sendSuccess(res, "Registration successful", result);
    } catch (error: any) {
      sendError(res, "Registration failed", error.message, 400);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);

      sendSuccess(res, "Login successful", result);
    } catch (error: any) {
      sendError(res, "Login failed", error.message, 401);
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return sendError(res, "Refresh token required", null, 400);
      }

      const result = await AuthService.refreshToken(refreshToken);

      sendSuccess(res, "Token refreshed successfully", result);
    } catch (error: any) {
      sendError(res, "Token refresh failed", error.message, 401);
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, "Authentication required", null, 401);
      }

      const profile = await AuthService.getProfile(req.user.id);

      sendSuccess(res, "Profile retrieved successfully", profile);
    } catch (error: any) {
      sendError(res, "Failed to get profile", error.message, 400);
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, "Authentication required", null, 401);
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return sendError(
          res,
          "Current password and new password are required",
          null,
          400
        );
      }

      if (newPassword.length < 6) {
        return sendError(
          res,
          "New password must be at least 6 characters long",
          null,
          400
        );
      }

      const result = await AuthService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );

      sendSuccess(res, "Password changed successfully", result);
    } catch (error: any) {
      sendError(res, "Failed to change password", error.message, 400);
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      // In stateless JWT, logout is handled client-side
      // But we can implement token blacklisting here if needed

      sendSuccess(res, "Logout successful", {
        message: "Please remove the token from client storage",
      });
    } catch (error: any) {
      sendError(res, "Logout failed", error.message, 400);
    }
  }
}
