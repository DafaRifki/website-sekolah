import prisma from "../models/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  loginService,
  registerService,
  whoamiService,
} from "../services/authService.js";

// response error
const errorResponse = (res, status, message, error = null) => {
  return res.status(status).json({
    success: false,
    message,
    ...(error && { error }),
  });
};

export const register = async (req, res) => {
  try {
    const { nama, email, password } = req.body;

    // buat user + siswa
    const newUser = await registerService({ nama, email, password });

    res.status(201).json({
      message: "Register berhasil",
      data: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        siswa: {
          id_siswa: newUser.siswa.id_siswa,
          nama: newUser.siswa.nama,
        },
      },
    });
  } catch (error) {
    return errorResponse(
      res,
      400,
      "Gagal membuat data user baru",
      error.message
    );
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginService({ email, password });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true di production
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 hari
    });

    res.json({
      message: "Login berhasil",
      token,
      role: user.role,
    });
  } catch (error) {
    return errorResponse(
      res,
      401,
      "Login gagal, silahkan cek kembali email atau password anda",
      error.message
    );
  }
};

export const whoami = async (req, res) => {
  try {
    const user = await whoamiService(req.user.userId);
    res.json({ user });
  } catch (error) {
    return errorResponse(res, 404, "Data user tidak diketahui", error.message);
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      success: true,
      message: "Logout berhasil",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};
