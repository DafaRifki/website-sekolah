import fs from "fs";
import path from "path";
import prisma from "../models/prisma.js";
import bcrypt from "bcrypt";

export const getAllSiswa = async (req, res) => {
  const siswa = await prisma.siswa.findMany({ orderBy: { id: "asc" } });
  res.json(siswa);
};

export const getSiswaById = async (req, res) => {
  try {
    const { id } = req.params;

    const siswa = await prisma.siswa.findUnique({
      where: { id: parseInt(id) },
      include: {
        kelas: true,
        user: {
          select: { email: true, role: true },
        },
      },
    });

    if (!siswa) {
      return res.status(404).json({
        success: false,
        message: "Siswa tidak ditemukan",
      });
    }

    res.json({
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

export const createSiswa = async (req, res) => {
  try {
    const { email, password, nama, nis, alamat, tanggalLahir, kelasId } =
      req.body;

    // cek email yang unik
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const fotoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "SISWA",
      },
    });

    const siswa = await prisma.siswa.create({
      data: {
        nama,
        nis,
        alamat,
        tanggalLahir: new Date(tanggalLahir),
        fotoProfil: fotoUrl,
        userId: user.id,
        kelasId: parseInt(kelasId),
      },
    });

    res.status(201).json({
      success: true,
      message: "Siswa berhasil ditambahkan",
      data: siswa,
    });
  } catch (error) {
    console.log("Error createSiswa: ", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

export const updateSiswa = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nis, alamat, tanggalLahir, kelasId } = req.body;

    const oldData = await prisma.siswa.findUnique({
      where: { id: parseInt(id) },
    });

    let fotoProfilUrl = undefined;
    if (req.files && req.files.fotoProfil) {
      if (oldData.fotoProfil) {
        const oldPath = path.join(process.cwd(), oldData.fotoProfil);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      fotoProfilUrl = `/uploads/${req.files.fotoProfil[0].filename}`;
    }

    const updateSiswa = await prisma.siswa.update({
      where: { id: parseInt(id) },
      data: {
        ...(nama && { nama }),
        ...(nis && { nis }),
        ...(alamat && { alamat }),
        ...(tanggalLahir && { tanggalLahir: new Date(tanggalLahir) }),
        ...(fotoProfilUrl && { fotoProfil: fotoProfilUrl }),
        ...(kelasId && { kelasId: parseInt(kelasId) }),
      },
    });

    res.status(200).json({
      success: true,
      message: "Data siswa berhasil diupdate",
      data: updateSiswa,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

export const deleteSiswa = async (req, res) => {
  try {
    const { id } = req.params;

    const siswa = await prisma.siswa.findUnique({
      where: { id: parseInt(id) },
    });

    if (!siswa) {
      return res.status(404).json({
        success: false,
        message: "Siswa tidak ditemukan",
      });
    }

    if (siswa.fotoProfil) {
      const filePath = path.join(process.cwd(), siswa.fotoProfil);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.siswa.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: "Data siswa berhasil dihapus" });
  } catch (error) {
    console.log("Error deleteSiswa: ", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};
