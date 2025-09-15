import prisma from "../models/prisma.js";

export const getAllTahunAjaranService = async () => {
  try {
    return await prisma.tahunAjaran.findMany({
      orderBy: { id_tahun: "asc" },
      select: {
        id_tahun: true,
        namaTahun: true,
        kelasRel: {
          select: {
            isActive: true,
            kelas: {
              select: {
                id_kelas: true,
                namaKelas: true,
                tingkat: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    throw new Error(`Error fetching tahun ajaran: ${error.message}`);
  }
};

export const getTahunAjaranByIdService = async (id_tahun) => {
  const tahunAjaran = await prisma.tahunAjaran.findUnique({
    where: { id_tahun: parseInt(id_tahun) },
    select: {
      id_tahun: true,
      namaTahun: true,
      kelasRel: {
        select: {
          isActive: true,
          kelas: {
            select: {
              id_kelas: true,
              namaKelas: true,
              tingkat: true,
            },
          },
        },
      },
    },
  });
  if (!tahunAjaran) throw new Error("Tahun ajaran tidak ditemukan");
  return tahunAjaran;
};

export const createTahunAjaranService = async (data) => {
  const [namaTahun, kelasIds = [], activeKelasId] = data;

  return prisma.tahunAjaran.create({
    data: {
      namaTahun,
      ...(Array.isArray(kelasIds) && kelasIds.length > 0
        ? {
            kelasRel: {
              create: kelasIds.map((kelasId) => ({
                kelasId,
                isActive: kelasId === activeKelasId,
              })),
            },
          }
        : {}),
    },
    include: {
      kelasRel: {
        include: {
          kelas: true,
        },
      },
    },
  });
};

export const updateTahunAjaranService = async (id_tahun, data) => {
  const { namaTahun, kelasIds = [], activeKelasId } = data;

  const tahunAjaran = await prisma.tahunAjaran.update({
    where: { id_tahun: parseInt(id_tahun) },
    data: { namaTahun },
  });

  // hapus relasi lama (jika ada)
  await prisma.kelasTahunAjaran.deleteMany({
    where: { tahunAjaranId: parseInt(id_tahun) },
  });

  // buat relasi baru
  await prisma.kelasTahunAjaran.createMany({
    data: kelasIds.map((kelasId) => ({
      kelasId,
      tahunAjaranId: parseInt(id_tahun),
      isActive: kelasId === activeKelasId,
    })),
  });

  return prisma.tahunAjaran.findUnique({
    where: { id_tahun: parseInt(id_tahun) },
    include: {
      kelasRel: {
        include: { kelas: true },
      },
    },
  });
};
