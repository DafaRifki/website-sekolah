import prisma from "../models/prisma.js";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";

export const getAllUser = async (req, res) => {
  try {
    const user = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { id: "asc" },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "terjadi kesalahan server", error });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user)
      return res.status(404).json({ message: "Data user tidak ditemukan" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "terjadi kesalahan server", error });
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, password, role, name, nip, nis, noHP, alamat } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password, dan role wajib diisi",
      });
    }

    // cek email sudah dipakah atau belum
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      email,
      password: hashedPassword,
      role,
    };

    if (role === "GURU") {
      if (!nip) {
        return res
          .status(400)
          .json({ success: false, message: "NIP wajib diisi untuk role GURU" });
      }
      userData.guru = {
        create: {
          nama: name || "Nama Guru",
          nip,
          noHP,
        },
      };
    }

    if (role === "SISWA") {
      if (!nis) {
        return res.status(400).json({
          success: false,
          message: "NIS wajib diisi untuk role SISWA",
        });
      }
      userData.siswa = {
        create: {
          nama: name || "Nama Siswa",
          nis,
          alamat,
        },
      };
    }

    const newUser = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        role: true,
        // jika role GURU/SISWA di inputkan sesuai ke tabel terkait
        guru: { select: { id_guru: true, nama: true, nip: true, noHP: true } },
        siswa: {
          select: { id_siswa: true, nama: true, nis: true, alamat: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "User berhasil dibuat",
      data: newUser,
    });
  } catch (error) {
    console.error("CreateUser Error: ", error);
    res.status(500).json({ success: false, message: "Gagal membuat user" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, role, name, currentPassword } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID diperlukan" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });
    }

    let updateData = {};
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password wajib diisi untuk merubah password",
        });
      }

      const isMatch = await bcrypt.compare(
        currentPassword,
        existingUser.password
      );
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password salah",
        });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        guruId: true,
        siswaId: true,
      },
    });

    if (name) {
      if (updatedUser.role === "GURU" && updatedUser.guruId) {
        await prisma.guru.update({
          where: { id_guru: updatedUser.guruId },
          data: { nama: name },
        });
      }

      if (updatedUser.role === "SISWA" && updatedUser.siswaId) {
        await prisma.siswa.update({
          where: { id_siswa: updatedUser.siswaId },
          data: { nama: name },
        });
      }
    }

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("UpdateUser Error:", error);
    res.status(500).json({ success: false, message: "Gagal update user" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID diperlukan" });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        guru: true,
        siswa: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });
    }

    // kalau data user guru -> hapus data guru juga
    if (user.role === "GURU" && user.guru) {
      if (user.guru.fotoProfil) {
        const filePath = path.join(process.cwd(), user.guru.fotoProfil);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await prisma.guru.delete({
        where: { id_guru: user.guru.id_guru },
      });
    }

    // kalau data user siswa -> hapus siswa juga
    if (user.role === "SISWA" && user.siswa) {
      if (user.siswa.fotoProfil) {
        const filePath = path.join(process.cwd(), user.siswa.fotoProfil);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await prisma.siswa.delete({
        where: { id_siswa: user.siswa.id_siswa },
      });
    }

    // hapus user
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

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
