import prisma from "../models/prisma.js";
import bcrypt from "bcrypt";

export const getAllGuru = async (req, res) => {
  try {
    const guru = await prisma.guru.findMany({
      orderBy: { id_guru: "asc" },
      include: { user: { select: { email: true, role: true } } },
    });

    res.status(200).json({ success: true, data: guru });
  } catch (error) {
    console.log("Error getAllGuru: ", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

export const getGuruById = async (req, res) => {
  try {
    const { id } = req.params;

    const guru = await prisma.guru.findUnique({
      where: { id_guru: parseInt(id) },
      include: {
        user: {
          select: { email: true, role: true },
        },
      },
    });

    if (!guru) {
      return res.status(404).json({
        success: false,
        message: "Guru tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: guru,
    });
  } catch (error) {
    console.log("Error getGuruById: ", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

export const createGuru = async (req, res) => {
  try {
    const { email, password, nama, nip, noHP, jenisKelamin, alamat, jabatan } =
      req.body;

    if (!email || !password || !nama || !nip || !noHP) {
      return res.status(400).json({
        success: false,
        message: "Email, password, nama, nip, dan noHP wajib diisi",
      });
    }

    const existingGuru = await prisma.user.findUnique({ where: { email } });
    if (existingGuru) {
      return res.status(400).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newGuru = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "GURU",
        guru: {
          create: {
            email,
            nama,
            nip,
            noHP,
            jenisKelamin,
            alamat,
            jabatan,
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        guru: {
          select: {
            id_guru: true,
            email: true,
            nama: true,
            nip: true,
            noHP: true,
            jenisKelamin: true,
            alamat: true,
            jabatan: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Guru berhasil dibuat",
      data: newGuru,
    });
  } catch (error) {
    console.error("CreateGuru Error: ", error);
    res.status(500).json({
      success: false,
      message: "Gagal membuat guru",
    });
  }
};
