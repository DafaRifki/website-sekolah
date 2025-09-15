import prisma from "../models/prisma.js";

/**
 * Ambil semua kelas beserta wali, tahun ajaran aktif, dan jumlah siswa
 */
export const getAllKelasService = async () => {
  try {
    return await prisma.kelas.findMany({
      orderBy: { id_kelas: "asc" },
      include: {
        guru: {
          select: { id_guru: true, nama: true, nip: true, email: true },
        },
        tahunRel: {
          where: { isActive: true },
          include: {
            tahunAjaran: {
              select: { id_tahun: true, namaTahun: true },
            },
          },
        },
        siswa: {
          select: { id_siswa: true, nama: true, nis: true },
        },
        _count: { select: { siswa: true } },
      },
    });
  } catch (error) {
    throw new Error(`Error fetching all kelas: ${error.message}`);
  }
};

/**
 * Ambil detail kelas by ID
 */
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
        tahunRel: {
          where: { isActive: true }, // hanya yang aktif
          include: {
            tahunAjaran: { select: { id_tahun: true, namaTahun: true } },
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

    if (!kelas) throw new Error("Kelas tidak ditemukan");

    // mapping tahunAjaran aktif langsung ke properti kelas
    const tahunAjaranAktif =
      kelas.tahunRel.length > 0 ? kelas.tahunRel[0].tahunAjaran : null;

    return {
      ...kelas,
      tahunAjaran: tahunAjaranAktif, // ini yang dipakai FE
    };
  } catch (error) {
    throw new Error(`Error fetching kelas: ${error.message}`);
  }
};

/**
 * Buat kelas baru
 */
export const createKelasService = async (kelasData) => {
  try {
    const { namaKelas, tingkat, waliId, tahunAjaranId } = kelasData;

    if (!namaKelas || !tingkat)
      throw new Error("Nama kelas dan tingkat wajib diisi");

    // cek duplikat nama kelas
    const existingKelas = await prisma.kelas.findFirst({
      where: { namaKelas: namaKelas.trim() },
    });
    if (existingKelas) throw new Error("Nama kelas sudah ada");

    // validasi waliId
    if (waliId) {
      const guru = await prisma.guru.findUnique({
        where: { id_guru: parseInt(waliId) },
      });
      if (!guru) throw new Error("Guru tidak ditemukan");

      const existingWali = await prisma.kelas.findFirst({
        where: { waliId: parseInt(waliId) },
      });
      if (existingWali) throw new Error("Guru sudah menjadi wali kelas lain");
    }

    // buat kelas
    const kelas = await prisma.kelas.create({
      data: {
        namaKelas: namaKelas.trim(),
        tingkat,
        waliId: waliId ? parseInt(waliId) : null,
      },
    });

    // jika ada tahun ajaran, buat relasi aktif di pivot
    if (tahunAjaranId) {
      await prisma.kelasTahunAjaran.create({
        data: {
          kelasId: kelas.id_kelas,
          tahunAjaranId: parseInt(tahunAjaranId),
          isActive: true,
        },
      });
    }

    return kelas;
  } catch (error) {
    throw new Error(`Error creating kelas: ${error.message}`);
  }
};

/**
 * Update kelas
 */
export const updateKelasService = async (id_kelas, kelasData) => {
  try {
    const { namaKelas, tingkat, waliId, tahunAjaranId, isActive } = kelasData;

    const existingKelas = await prisma.kelas.findUnique({
      where: { id_kelas: parseInt(id_kelas) },
    });
    if (!existingKelas) throw new Error("Kelas tidak ditemukan");

    const updateData = {};

    // validasi nama kelas hanya jika diubah
    if (
      namaKelas !== undefined &&
      namaKelas.trim() !== existingKelas.namaKelas
    ) {
      if (!namaKelas.trim()) throw new Error("Nama kelas tidak boleh kosong");

      const duplicateKelas = await prisma.kelas.findFirst({
        where: {
          namaKelas: namaKelas.trim(),
          NOT: { id_kelas: existingKelas.id_kelas },
        },
      });
      if (duplicateKelas) throw new Error("Nama kelas sudah ada");

      updateData.namaKelas = namaKelas.trim();
    }

    // validasi tingkat
    if (tingkat !== undefined) {
      if (!tingkat.toString().trim())
        throw new Error("Tingkat tidak boleh kosong");
      updateData.tingkat = tingkat;
    }

    // validasi waliId
    if (waliId !== undefined) {
      if (waliId === null) {
        updateData.waliId = null;
      } else {
        const guru = await prisma.guru.findUnique({
          where: { id_guru: parseInt(waliId) },
        });
        if (!guru) throw new Error("Guru tidak ditemukan");

        const existingWali = await prisma.kelas.findFirst({
          where: {
            waliId: parseInt(waliId),
            NOT: { id_kelas: parseInt(id_kelas) },
          },
        });
        if (existingWali) throw new Error("Guru sudah menjadi wali kelas lain");

        updateData.waliId = parseInt(waliId);
      }
    }

    // update data kelas utama
    const kelas = await prisma.kelas.update({
      where: { id_kelas: parseInt(id_kelas) },
      data: updateData,
    });

    // jika tahun ajaran dipilih
    if (tahunAjaranId !== undefined) {
      if (isActive) {
        // non-aktifkan semua tahun ajaran kelas ini
        await prisma.kelasTahunAjaran.updateMany({
          where: { kelasId: kelas.id_kelas },
          data: { isActive: false },
        });
      }

      // aktifkan atau buat tahun ajaran baru
      await prisma.kelasTahunAjaran.upsert({
        where: {
          kelasId_tahunAjaranId: {
            kelasId: kelas.id_kelas,
            tahunAjaranId: parseInt(tahunAjaranId),
          },
        },
        update: { isActive: !!isActive },
        create: {
          kelasId: kelas.id_kelas,
          tahunAjaranId: parseInt(tahunAjaranId),
          isActive: !!isActive,
        },
      });
    }

    return kelas;
  } catch (error) {
    throw new Error(`Error updating kelas: ${error.message}`);
  }
};

/**
 * Hapus kelas
 */
export const deleteKelasService = async (id_kelas) => {
  try {
    const existingKelas = await prisma.kelas.findUnique({
      where: { id_kelas: parseInt(id_kelas) },
      include: { siswa: true },
    });
    if (!existingKelas) throw new Error("Kelas tidak ditemukan");
    if (existingKelas.siswa.length > 0) {
      throw new Error("Tidak dapat menghapus kelas yang masih memiliki siswa");
    }

    // hapus relasi pivot dulu (biar tidak ada FK error)
    await prisma.kelasTahunAjaran.deleteMany({
      where: { kelasId: parseInt(id_kelas) },
    });

    return await prisma.kelas.delete({
      where: { id_kelas: parseInt(id_kelas) },
    });
  } catch (error) {
    throw new Error(`Error deleting kelas: ${error.message}`);
  }
};
