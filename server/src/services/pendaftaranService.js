import { StatusDokumen } from "@prisma/client";
import prisma from "../models/prisma.js";
import bcrypt from "bcrypt";

/**
 * create calon siswa (pendaftar baru)
 * belum dibuat otomatis akun user / siswa.
 */
export const createPendaftaranService = async (data) => {
  return await prisma.pendaftaran.create({
    data: {
      nama: data.nama,
      alamat: data.alamat,
      tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : null,
      jenisKelamin: data.jenisKelamin,
      noHp: data.noHp,
      email: data.email,
      tahunAjaranId: data.tahunAjaranId,
    },
  });
};

/**
 * list semua pendaftar (opsional filter by statusDokumen)
 */
export const getAllPendaftaranService = async (status) => {
  return prisma.pendaftaran.findMany({
    where: status ? { StatusDokumen: status } : {},
    include: { tahunAjaran: true, siswa: true },
  });
};

// update pendaftaran
export const updatePendaftaranService = async (id, data) => {
  return await prisma.pendaftaran.update({
    where: { id_pendaftaran: id },
    data: {
      nama: data.nama,
      alamat: data.alamat,
      tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : undefined,
      jenisKelamin: data.jenisKelamin,
      noHp: data.noHp,
      email: data.email,
      statusDokumen: data.statusDokumen,
      statusPembayaran: data.statusPembayaran,
      tahunAjaranId: data.tahunAjaranId,
    },
  });
};

// Terima siswa baru (buat akun user + siswa)
export const terimaSiswaService = async (id, password = "password123") => {
  const pendaftaran = await prisma.pendaftaran.findUnique({
    where: { id_pendaftaran: id },
  });
  if (!pendaftaran) throw new Error("Pendaftaran tidak ditemukan");

  if (pendaftaran.siswaId) {
    throw new Error("Pendaftaran sudah diproses sebelumnya");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // buat akun siswa baru
  const siswa = await prisma.siswa.create({
    data: {
      nama: pendaftaran.nama,
      alamat: pendaftaran.alamat,
      tanggalLahir: pendaftaran.tanggalLahir,
      jenisKelamin: pendaftaran.jenisKelamin,
    },
  });

  // buat akun user login sebagai siswa
  await prisma.user.create({
    data: {
      email: pendaftaran.email,
      password: hashedPassword,
      role: "SISWA",
      siswaId: siswa.id_siswa,
    },
  });

  // update status pendaftaran
  await prisma.pendaftaran.update({
    where: { id_pendaftaran: id },
    data: {
      statusDokumen: "LENGKAP",
      siswaId: siswa.id_siswa,
    },
  });

  return siswa;
};

// tolak siswa baru
export const tolakSiswaService = async (id) => {
  return await prisma.pendaftaran.update({
    where: { id_pendaftaran: id },
    data: { statusDokumen: "KURANG" },
  });
};

// cek status siswa yang baru mendaftar sesuai email
export const cekStatusPendaftaranService = async (email) => {
  const pendaftaran = await prisma.pendaftaran.findUnique({
    where: { email },
    select: {
      id_pendaftaran: true,
      nama: true,
      email: true,
      statusDokumen: true,
      statusPembayaran: true,
      tahunAjaran: {
        select: { namaTahun: true },
      },
    },
  });

  if (!pendaftaran) {
    throw new Error("Pendaftaran tidak ditemukan");
  }

  return pendaftaran;
};
