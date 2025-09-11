import prisma from "../models/prisma.js";

export const getAllKelasService = async () => {
  try {
    return await prisma.kelas.findMany({
      orderBy: { id_kelas: "asc" },
      include: {
        guru: {
          select: { id_guru: true, nama: true, nip: true, email: true },
        },
        siswa: {
          select: {
            id_siswa: true,
            nama: true,
            nis: true,
          },
        },
        _count: {
          select: { siswa: true },
        },
      },
    });
  } catch (error) {
    throw new Error(`Error fetching all kelas: ${error.message}`);
  }
};

export const getKelasByIdService = async (id_kelas) => {
  try {
    const kelas = await prisma.kelas.findUnique({
      where: { id_kelas: parseInt(id_kelas) },
      include: {
        guru: {
          select: {
            id_guru: true,
            nama: true,
            nip: true,
            email: true,
            noHP: true,
          },
        },
        siswa: {
          select: {
            id_siswa: true,
            nama: true,
            nis: true,
            jenisKelamin: true,
            alamat: true,
          },
          orderBy: { nama: "asc" },
        },
      },
    });

    if (!kelas) {
      throw new Error("Kelas tidak ditemukan");
    }

    return kelas;
  } catch (error) {
    throw new Error(`Error fetching kelas: ${error.message}`);
  }
};

export const createKelasService = async (kelasData) => {
  try {
    const { namaKelas, tingkat, waliId } = kelasData;

    // Validasi input
    if (!namaKelas || !tingkat) {
      throw new Error("Nama kelas dan tingkat wajib diisi");
    }

    // Cek apakah nama kelas sudah ada
    const existingKelas = await prisma.kelas.findFirst({
      where: { namaKelas: namaKelas },
    });

    if (existingKelas) {
      throw new Error("Nama kelas sudah ada");
    }

    // Jika ada waliId, pastikan guru tersebut ada dan belum menjadi wali kelas lain
    if (waliId) {
      const guru = await prisma.guru.findUnique({
        where: { id_guru: parseInt(waliId) },
      });

      if (!guru) {
        throw new Error("Guru tidak ditemukan");
      }

      // Cek apakah guru sudah menjadi wali kelas lain
      const existingWali = await prisma.kelas.findFirst({
        where: { waliId: parseInt(waliId) },
      });

      if (existingWali) {
        throw new Error("Guru sudah menjadi wali kelas lain");
      }
    }

    return await prisma.kelas.create({
      data: {
        namaKelas,
        tingkat,
        waliId: waliId ? parseInt(waliId) : null,
      },
      include: {
        guru: {
          select: {
            id_guru: true,
            nama: true,
            nip: true,
          },
        },
      },
    });
  } catch (error) {
    throw new Error(`Error creating kelas: ${error.message}`);
  }
};

export const updateKelasService = async (id_kelas, kelasData) => {
  try {
    const { namaKelas, tingkat, waliId } = kelasData;

    // Cek apakah kelas exists
    const existingKelas = await prisma.kelas.findUnique({
      where: { id_kelas: parseInt(id_kelas) },
    });

    if (!existingKelas) {
      throw new Error("Kelas tidak ditemukan");
    }

    // Validasi hanya untuk field yang dikirim
    const updateData = {};

    // Validasi namaKelas jika ada
    if (namaKelas !== undefined) {
      if (!namaKelas || namaKelas.trim() === "") {
        throw new Error("Nama kelas tidak boleh kosong");
      }

      // Cek duplikasi nama kelas
      const duplicateKelas = await prisma.kelas.findFirst({
        where: {
          namaKelas: namaKelas.trim(),
          NOT: { id_kelas: parseInt(id_kelas) },
        },
      });

      if (duplicateKelas) {
        throw new Error("Nama kelas sudah ada");
      }

      updateData.namaKelas = namaKelas.trim();
    }

    // Validasi tingkat jika ada
    if (tingkat !== undefined) {
      if (!tingkat || tingkat.toString().trim() === "") {
        throw new Error("Tingkat tidak boleh kosong");
      }
      updateData.tingkat = tingkat;
    }

    // Validasi waliId jika ada (termasuk jika null untuk menghapus wali)
    if (waliId !== undefined) {
      if (waliId === null) {
        // Menghapus wali kelas
        updateData.waliId = null;
      } else {
        // Menambah/mengubah wali kelas
        const guru = await prisma.guru.findUnique({
          where: { id_guru: parseInt(waliId) },
        });

        if (!guru) {
          throw new Error("Guru tidak ditemukan");
        }

        // Cek apakah guru sudah menjadi wali kelas lain
        const existingWali = await prisma.kelas.findFirst({
          where: {
            waliId: parseInt(waliId),
            NOT: { id_kelas: parseInt(id_kelas) },
          },
        });

        if (existingWali) {
          throw new Error("Guru sudah menjadi wali kelas lain");
        }

        updateData.waliId = parseInt(waliId);
      }
    }

    // Jika tidak ada data yang akan diupdate
    if (Object.keys(updateData).length === 0) {
      throw new Error("Tidak ada data yang akan diupdate");
    }

    return await prisma.kelas.update({
      where: { id_kelas: parseInt(id_kelas) },
      data: updateData,
      include: {
        guru: {
          select: {
            id_guru: true,
            nama: true,
            nip: true,
          },
        },
      },
    });
  } catch (error) {
    throw new Error(`Error updating kelas: ${error.message}`);
  }
};

export const deleteKelasService = async (id_kelas) => {
  try {
    // Cek apakah kelas exists
    const existingKelas = await prisma.kelas.findUnique({
      where: { id_kelas: parseInt(id_kelas) },
      include: {
        siswa: true,
      },
    });

    if (!existingKelas) {
      throw new Error("Kelas tidak ditemukan");
    }

    // Cek apakah kelas masih memiliki siswa
    if (existingKelas.siswa.length > 0) {
      throw new Error("Tidak dapat menghapus kelas yang masih memiliki siswa");
    }

    return await prisma.kelas.delete({
      where: { id_kelas: parseInt(id_kelas) },
    });
  } catch (error) {
    throw new Error(`Error deleting kelas: ${error.message}`);
  }
};
