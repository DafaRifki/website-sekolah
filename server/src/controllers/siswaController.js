import fs from "fs";
import path from "path";
import prisma from "../models/prisma.js";
import bcrypt from "bcrypt";
import {
  createSiswaService,
  deleteSiswaService,
  getAllSiswaService,
  getSiswaByIdService,
  updateSiswaService,
} from "../services/siswaService.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const getAllSiswa = async (req, res) => {
  try {
    const siswa = await getAllSiswaService();
    // res.status(200).json({ success: true, data: siswa });
    return successResponse(res, 200, "Data siswa berhasil diambil", siswa);
  } catch (err) {
    console.log("Error getAllSiswa: ", err);
    //   res
    //     .status(500)
    //     .json({ success: false, message: "Terjadi kesalahan server" });
    // }
    return errorResponse(res, 500, "Terjadi kesalahan server", err.message);
  }
};

export const getSiswaById = async (req, res) => {
  try {
    const siswa = await getSiswaByIdService(req.params.id);

    if (!siswa) {
      return res.status(404).json({
        success: false,
        message: "Siswa tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: siswa,
    });
  } catch (error) {
    console.log("Error getSiswaById: ", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

export const getLaporanSiswa = async (req, res) => {
  try {
    const id_siswa = parseInt(req.params.id); // Huruf kecil
    const { semester } = req.query;

    if (isNaN(id_siswa)) {
      return res.status(400).json({ message: "id_siswa tidak valid" });
    }

    const laporan = await prisma.siswa.findUnique({
      where: { id_siswa },
      include: {
        kelas: {
          include: { guru: true },
        },
        Siswa_Orangtua: {
          include: { orangtua: true },
        },
        nilaiRapor: {
          where: { semester }, // filter semester ganjil/genap
          include: { mapel: true },
          take: 10,
          skip: 0,
        },
      },
    });

    res.json(laporan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createSiswa = async (req, res) => {
  try {
    const { email, password, nama, nis } = req.body;

    if (!email || !password || !nama || !nis) {
      return res.status(400).json({
        success: false,
        message: "Email, password, nama, dan NIS wajib diisi",
      });
    }

    const siswa = await createSiswaService(req.body, req.file);

    return res.status(201).json({
      success: true,
      message: "Siswa berhasil ditambahkan",
      data: siswa,
    });
  } catch (error) {
    console.error("Error createSiswa:", error);

    if (
      error.message.includes("Email sudah digunakan") ||
      error.message.includes("NIS sudah digunakan")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

export const updateSiswa = async (req, res) => {
  try {
    const { id } = req.params;
    const siswa = await updateSiswaService(id, req.body, req.file);

    return res.status(200).json({
      success: true,
      message: "Data siswa berhasil diupdate",
      data: siswa,
    });
  } catch (error) {
    console.error("Error updateSiswa:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

export const deleteSiswa = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "ADMIN" && req.user.role !== "GURU") {
      return errorResponse(res, 403, "Akses ditolak");
    }

    await deleteSiswaService(id);
    return successResponse(
      res,
      200,
      "Siswa dan akun user terkait berhasil dihapus"
    );
  } catch (err) {
    console.error("Error deleteSiswa:", err);
    return errorResponse(res, 500, "Gagal menghapus siswa", err.message);
  }
};
