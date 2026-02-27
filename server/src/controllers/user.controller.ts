import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { sendSuccess, sendError } from "../utils/response.util";
import { PaginationQuery } from "../types/common.types";

export class UserController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const query = req.query as unknown as PaginationQuery;
      const result = await UserService.getAllUsers(query);

      sendSuccess(
        res,
        "Users retrieved successfully",
        result.data,
        result.pagination
      );
    } catch (error: any) {
      sendError(res, "Failed to get users", error.message, 400);
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid user ID", null, 400);
      }

      const user = await UserService.getUserById(id);
      sendSuccess(res, "User retrieved successfully", user);
    } catch (error: any) {
      if (error.message === "User not found") {
        return sendError(res, "User not found", null, 404);
      }
      sendError(res, "Failed to get user", error.message, 400);
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const user = await UserService.createUser(req.body);
      sendSuccess(res, "User created successfully", user, undefined);
    } catch (error: any) {
      if (error.message === "Email already exists") {
        return sendError(res, "Email already exists", null, 409);
      }
      sendError(res, "Failed to create user", error.message, 400);
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid user ID", null, 400);
      }

      const user = await UserService.updateUser(id, req.body);
      sendSuccess(res, "User updated successfully", user);
    } catch (error: any) {
      if (error.message === "User not found") {
        return sendError(res, "User not found", null, 404);
      }
      if (error.message === "Email already exists") {
        return sendError(res, "Email already exists", null, 409);
      }
      sendError(res, "Failed to update user", error.message, 400);
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return sendError(res, "Invalid user ID", null, 400);
      }

      // Prevent users from deleting themselves
      if (req.user && req.user.id === id) {
        return sendError(res, "Cannot delete your own account", null, 400);
      }

      const result = await UserService.deleteUser(id);
      sendSuccess(res, "User deleted successfully", result);
    } catch (error: any) {
      if (error.message === "User not found") {
        return sendError(res, "User not found", null, 404);
      }
      if (error.message === "Cannot delete the last admin user") {
        return sendError(res, "Cannot delete the last admin user", null, 400);
      }
      sendError(res, "Failed to delete user", error.message, 400);
    }
  }

  static async resetUserPassword(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { newPassword } = req.body;

      if (isNaN(id)) {
        return sendError(res, "Invalid user ID", null, 400);
      }

      if (!newPassword || newPassword.length < 6) {
        return sendError(
          res,
          "New password must be at least 6 characters long",
          null,
          400
        );
      }

      const result = await UserService.resetUserPassword(id, newPassword);
      sendSuccess(res, "Password reset successfully", result);
    } catch (error: any) {
      if (error.message === "User not found") {
        return sendError(res, "User not found", null, 404);
      }
      sendError(res, "Failed to reset password", error.message, 400);
    }
  }

  static async getUsersByRole(req: Request, res: Response) {
    try {
      const { role } = req.params;

      if (!["ADMIN", "GURU", "SISWA"].includes(role)) {
        return sendError(res, "Invalid role specified", null, 400);
      }

      const users = await UserService.getUsersByRole(
        role as "ADMIN" | "GURU" | "SISWA"
      );
      sendSuccess(res, `${role} users retrieved successfully`, users);
    } catch (error: any) {
      sendError(res, "Failed to get users by role", error.message, 400);
    }
  }

  static async getUserStats(req: Request, res: Response) {
    try {
      const stats = await UserService.getUserStats();
      sendSuccess(res, "User statistics retrieved successfully", stats);
    } catch (error: any) {
      sendError(res, "Failed to get user statistics", error.message, 400);
    }
  }

  static async getPendingStudents(req: Request, res: Response) {
    try {
      const users = await UserService.getPendingStudents();
      sendSuccess(res, "Pending students retrieved successfully", users);
    } catch (error: any) {
      sendError(res, "Failed to get pending students", error.message, 400);
    }
  }

  static async verifyStudent(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return sendError(res, "Invalid ID", null, 400);

      const result = await UserService.verifyStudent(id);
      sendSuccess(res, result.message, null);
    } catch (error: any) {
      sendError(res, "Failed to verify student", error.message, 400);
    }
  }

  static async rejectStudent(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return sendError(res, "Invalid ID", null, 400);

      const result = await UserService.rejectStudent(id);
      sendSuccess(res, result.message, null);
    } catch (error: any) {
      sendError(res, "Failed to reject student", error.message, 400);
    }
  }

  static async getUnlinkedData(req: Request, res: Response) {
    try {
      const result = await UserService.getUnlinkedData();
      sendSuccess(res, "Unlinked data retrieved successfully", result);
    } catch (error: any) {
      sendError(res, "Failed to get unlinked data", error.message, 400);
    }
  }

  static async verifyAndLinkUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { targetId, targetType } = req.body;

      if (isNaN(id) || isNaN(targetId) || !targetType) {
        return sendError(res, "Invalid input data", null, 400);
      }

      if (!["SISWA", "GURU", "ADMIN"].includes(targetType)) {
        return sendError(res, "Invalid target type", null, 400);
      }

      // For ADMIN, targetId might be 0 or null, so we default to 0 if valid check passes for other types
      const parsedTargetId = targetType === "ADMIN" ? 0 : parseInt(targetId);

      // Only check isNaN for SISWA/GURU
      if (targetType !== "ADMIN" && isNaN(parsedTargetId)) {
         return sendError(res, "Invalid target ID", null, 400);
      }

      const result = await UserService.verifyAndLinkUser(
        id,
        parsedTargetId,
        targetType
      );
      sendSuccess(res, result.message, null);
    } catch (error: any) {
      sendError(res, "Failed to link user", error.message, 400);
    }
  }
}
