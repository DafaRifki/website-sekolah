import prisma from "../models/prisma.js";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";

export const getAllGuruService = async () => {
  return await prisma.guru.findMany({
    orderBy: { id_guru: "asc" },
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
    },
  });
};

export const getGuruByIdService = async (id) => {
  return await prisma.guru.findUnique({
    where: { id_guru: parseInt(id) },
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
      waliKelas: {
        select: { id_kelas: true, namaKelas: true, tingkat: true },
      },
    },
  });
};

export const createGuruService = async (data) => {
  const {
    email,
    password,
    nama,
    nip,
    noHP,
    jenisKelamin,
    alamat,
    jabatan,
    fotoProfil,
  } = data;

  const existingGuru = await prisma.user.findUnique({ where: { email } });
  if (existingGuru) throw new Error("Email sudah digunakan");

  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: role || "GURU",
      guru: {
        create: {
          email,
          nama,
          nip,
          noHP,
          jenisKelamin,
          alamat,
          jabatan,
          fotoProfil,
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
          fotoProfil: true,
        },
      },
    },
  });
};

export const updateGuruService = async (id, data, file) => {
  const {
    email,
    password,
    nama,
    nip,
    noHP,
    jenisKelamin,
    alamat,
    jabatan,
    role,
  } = data;

  const existingGuru = await prisma.guru.findUnique({
    where: { id_guru: parseInt(id) },
    include: { user: true }, // ✅ ambil data user juga
  });
  if (!existingGuru) throw new Error("Guru tidak ditemukan");

  let updatedGuruData = {
    ...(nama && { nama }),
    ...(nip && { nip }),
    ...(alamat && { alamat }),
    ...(jabatan && { jabatan }),
    ...(jenisKelamin && { jenisKelamin }),
    ...(noHP && { noHP }),
  };

  // handle foto profil
  if (file) {
    const uploadDir = path.join(process.cwd(), "uploads");

    if (existingGuru.fotoProfil) {
      const oldPath = path.join(uploadDir, existingGuru.fotoProfil);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    updatedGuruData.fotoProfil = file.filename;
  }

  // update user
  let updatedUserData = {};
  if (email) updatedUserData.email = email;
  if (password) {
    updatedUserData.password = await bcrypt.hash(password, 10);
  }
  if (role) updatedUserData.role = role;

  // jalankan transaksi supaya aman
  return await prisma.$transaction(async (tx) => {
    const updatedGuru = await tx.guru.update({
      where: { id_guru: parseInt(id) },
      data: {
        ...updatedGuruData,
        user: Object.keys(updatedUserData).length
          ? { update: updatedUserData }
          : undefined,
      },
      include: { user: true },
    });

    return updatedGuru;
  });
};

export const deleteGuruService = async (id) => {
  const existingGuru = await prisma.guru.findUnique({
    where: { id_guru: parseInt(id) },
    include: { user: true },
  });

  if (!existingGuru) throw new Error("Guru tidak ditemukan");

  await prisma.guru.delete({
    where: { id_guru: parseInt(id) },
  });

  return await prisma.user.delete({
    where: { id: existingGuru.user.id },
  });
};
