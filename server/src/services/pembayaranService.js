import prisma from "../models/prisma.js";

/**
 * Ambil semua pembayaran (opsional filter by siswa atau tahun ajaran)
 */
export const getAllPembayaranService = async (filter = {}) => {
  return prisma.pembayaran.findMany({
    where: filter,
    include: {
      siswa: true,
      tahunAjaran: true,
      tarif: true,
    },
    orderBy: { tanggal: "desc" },
  });
};

/**
 * Ambil detail pembayaran by id
 */
export const getPembayaranByIdService = async (id) => {
  return prisma.pembayaran.findUnique({
    where: { id_pembayaran: Number(id) },
    include: {
      siswa: true,
      tahunAjaran: true,
      tarif: true,
    },
  });
};

/**
 * Tambah pembayaran baru
 * @param {Object} data
 */
export const createPembayaran = async (data) => {
  const { siswaId, tarifId, jumlahBayar, metode, keterangan } = data;

  // cari tahun ajaran yang aktif
  const tahunAktif = await prisma.tahunAjaran.findFirst({
    where: { kelasRel: { some: { isActive: true } } },
  });

  if (!tahunAktif) {
    throw new Error("Tahun ajaran aktif tidak ditemukan");
  }

  // insert data pembayaran
  const pembayaran = await prisma.pembayaran.create({
    data: {
      siswaId: Number(siswaId),
      tarifId: tarifId ? Number(tarifId) : null,
      tahunAjaranId: tahunAktif.id_tahun,
      jumlahBayar: Number(jumlahBayar),
      metode,
      keterangan,
    },
    include: {
      siswa: true,
      tarif: true,
      tahunAjaran: true,
    },
  });

  return pembayaran;
};

/**
 * Update pembayaran
 */
export const updatePembayaran = async (id, data) => {
  return prisma.pembayaran.update({
    where: { id_pembayaran: Number(id) },
    data: {
      siswaId: data.siswaId,
      tahunAjaranId: data.tahunAjaranId,
      tarifId: data.tarifId ?? null,
      tanggal: data.tanggal,
      jumlahBayar: data.jumlahBayar,
      metode: data.metode,
      keterangan: data.keterangan,
    },
  });
};

/**
 * Hapus pembayaran
 */
export const deletePembayaran = async (id) => {
  return prisma.pembayaran.delete({
    where: { id_pembayaran: Number(id) },
  });
};
