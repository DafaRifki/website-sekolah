import {
  createUserService,
  deleteUserService,
  getAllUserService,
  getUserByIdService,
  updatedUserService,
} from "../services/userService.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const getAllUser = async (req, res) => {
  try {
    const user = await getAllUserService();
    return successResponse(res, 200, "Data user berhasil didapatkan", user);
  } catch (error) {
    return errorResponse(res, 500, "Terjadi kesalahan server", error.message);
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserByIdService(id);

    if (!user)
      return errorResponse(res, 404, "User tidak ditemukan", error.message);

    return successResponse(
      res,
      200,
      "Data user berhasil didapatkan sesuai ID",
      user
    );
  } catch (error) {
    return errorResponse(res, 500, "Terjadi kesalahan server", error.message);
  }
};

export const createUser = async (req, res) => {
  try {
    const newUser = await createUserService(req.body);
    return successResponse(res, 201, "User berhasil dibuat", newUser);
  } catch (error) {
    return errorResponse(res, 400, "User gagal dibuat", error.message);
  }
};

export const updateUser = async (req, res) => {
  try {
    const updatedUser = await updatedUserService(req.params.id, req.body);
    // res.json({ success: true, data: updatedUser });
    return successResponse(res, 200, "User berhasil diupdate", updatedUser);
  } catch (error) {
    // console.error("UpdateUser Error:", error);
    // res.status(500).json({ success: false, message: "Gagal update user" });
    return errorResponse(res, 400, "User gagal diupdate", error.message);
  }
};

export const deleteUser = async (req, res) => {
  try {
    await deleteUserService(req.params.id);
    res.json({
      success: true,
      message: "User dan data terkait berhasil dihapus",
    });
  } catch (error) {
    console.error("DeleteUser Error: ", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus user",
      error: error.message,
    });
  }
};
