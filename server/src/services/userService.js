import prisma from "../models/prisma.js";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";

export const getAllUserService = async () => {
  return await prisma.user.findMany({
    select: { id: true, email: true, role: true },
    orderBy: { id: "asc" },
  });
};

export const getUserByIdService = async (id) => {
  return await prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: { id: true, email: true, role: true },
  });
};

export const createUserService = async (data) => {
  const { email, password, role, name, nip, nis, noHP, alamat } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) throw new Error("Email sudah digunakan");

  const hashedPassword = await bcrypt.hash(password, 10);

  const userData = { email, password: hashedPassword, role };

  if (role === "GURU") {
    if (!nip) throw new Error("NIP wajib diisi untuk role GURU");
    userData.guru = { create: { nama: name || "Nama Guru", nip, noHP } };
  }

  if (role === "SISWA") {
    if (!nis) throw new Error("NIS wajib diisi untuk role SISWA");
    userData.siswa = { create: { nama: name || "Nama SISWA", nis, alamat } };
  }

  const newUser = await prisma.user.create({
    data: userData,
    select: {
      id: true,
      email: true,
      role: true,
      guru: {
        select: {
          id_guru: true,
          nama: true,
          nip: true,
        },
      },
      siswa: {
        select: {
          id_siswa: true,
          nama: true,
          nis: true,
          alamat: true,
        },
      },
    },
  });
};

export const updatedUserService = async (id, data) => {
  const { email, password, role, name, currentPassword } = data;
  const existingUser = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existingUser) throw new Error("User tidak ditemukan");

  let updateData = {};
  if (email) updateData.email = email;
  if (role) updateData.role = role;
  if (password) {
    if (!currentPassword) throw new Error("Current Password wajib diisi");
    const isMatch = await bcrypt.compare(
      currentPassword,
      existingUser.password
    );
    if (!isMatch) throw new Error("Current Password salah!");
    updateData.password = await bcrypt.hash(password, 10);
  }

  const updateUser = await prisma.user.update({
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
    if (
      (updateUser.role === "GURU" || updateUser.role === "ADMIN") &&
      updateUser.guruId
    ) {
      await prisma.guru.update({
        where: { id_guru: updateUser.guruId },
        data: { nama: name, email },
      });
    }

    if (updateUser.role === "SISWA" && updateUser.siswaId) {
      await prisma.siswa.update({
        where: { id_siswa: updateUser.siswaId },
        data: { nama: name },
      });
    }
  }

  return updateUser;
};

export const deleteUserService = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
    include: {
      guru: true,
      siswa: true,
    },
  });

  if (!user) throw new Error("User tidak ditemukan");
  if (user.role === "GURU" && user.guru) {
    if (user.guru.fotoProfil) {
      const filePath = path.join(process.cwd(), user.guru.fotoProfil);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await prisma.guru.delete({ where: { id_guru: user.guru.id_guru } });
  }

  if (user.role === "SISWA" && user.siswa) {
    if (user.siswa.fotoProfil) {
      const filePath = path.join(process.cwd(), user.siswa.fotoProfil);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await prisma.siswa.delete({ where: { id_siswa: user.siswa.id_siswa } });
  }

  await prisma.user.delete({ where: { id: parseInt(id) } });
  return true;
};
