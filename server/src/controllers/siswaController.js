import fs from "fs";
import path from "path";
import prisma from "../models/prisma.js";
import bcrypt from "bcrypt";

export const getAllSiswa = async (req, res) => {
  try {
    const siswa = await prisma.siswa.findMany({
      orderBy: { id_siswa: "asc" },
      include: {
        user: { select: { email: true, role: true } },
        kelas: true,
      },
    });

    res.status(200).json({ success: true, data: siswa });
  } catch (err) {
    console.log("Error getAllSiswa: ", err);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
};

export const getSiswaById = async (req, res) => {
  try {
    const { id } = req.params;

    const siswa = await prisma.siswa.findUnique({
      where: { id_siswa: parseInt(id) },
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

export const createSiswa = async (req, res) => {
  try {
    const {
      email,
      password,
      nama,
      nis,
      alamat,
      tanggalLahir,
      kelasId,
      jenisKelamin,
    } = req.body;

    // cek email yang unik
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    // Cek NIS unik
    const existingSiswa = await prisma.siswa.findUnique({ where: { nis } });
    if (existingSiswa) {
      return res.status(400).json({
        success: false,
        message: "NIS sudah digunakan",
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
        jenisKelamin,
        fotoProfil: fotoUrl,
        kelasId: kelasId ? parseInt(kelasId) : null,
      },
    });

    // update user agar punya relasi ke siswa
    await prisma.user.update({
      where: { id: user.id },
      data: { siswaId: siswa.id_siswa },
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
    const { nama, nis, alamat, tanggalLahir, kelasId, jenisKelamin, email } =
      req.body;

    const oldData = await prisma.siswa.findUnique({
      where: { id_siswa: parseInt(id) },
      include: { user: true }, // 🔑 ambil juga data user terkait
    });

    if (!oldData) {
      return res.status(404).json({ message: "Siswa tidak ditemukan" });
    }

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

    // 🔑 Update Siswa
    const updateSiswa = await prisma.siswa.update({
      where: { id_siswa: parseInt(id) },
      data: {
        ...(nama && { nama }),
        ...(nis && { nis }),
        ...(alamat && { alamat }),
        ...(tanggalLahir && { tanggalLahir: new Date(tanggalLahir) }),
        ...(jenisKelamin && { jenisKelamin }),
        ...(fotoProfilUrl && { fotoProfil: fotoProfilUrl }),
        ...(kelasId && { kelasId: parseInt(kelasId) }),
      },
      include: { user: true },
    });

    // 🔑 Update email di tabel User kalau dikirim
    if (email && oldData.user) {
      await prisma.user.update({
        where: { id: oldData.user.id },
        data: { email },
      });
    }

    res.status(200).json({
      success: true,
      message: "Data siswa berhasil diupdate",
      data: updateSiswa,
    });
  } catch (error) {
    console.error("Error updateSiswa:", error);
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

    if (req.user.role !== "ADMIN" && req.user.role !== "GURU") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const siswaId = parseInt(id);

    const siswa = await prisma.siswa.findUnique({
      where: { id_siswa: siswaId },
    });

    if (!siswa) {
      return res.status(404).json({ message: "Siswa tidak ditemukan" });
    }

    // 🔑 Hapus user yang terhubung dulu
    await prisma.user.deleteMany({
      where: { siswaId: siswaId },
    });

    // Hapus relasi siswa-orangtua
    await prisma.siswa_Orangtua.deleteMany({
      where: { id_siswa: siswaId },
    });

    // Hapus nilai rapor
    await prisma.nilaiRapor.deleteMany({
      where: { id_siswa: siswaId },
    });

    // Terakhir hapus siswa
    await prisma.siswa.delete({
      where: { id_siswa: siswaId },
    });

    res.json({ message: "Siswa dan akun user terkait berhasil dihapus" });
  } catch (error) {
    console.error("Error deleteSiswa:", error);
    res
      .status(500)
      .json({ message: "Gagal menghapus siswa", error: error.message });
  }
};
