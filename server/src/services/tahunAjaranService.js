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

export const getLatestTahunAjaranService = async () => {
  try {
    const latest = await prisma.tahunAjaran.findFirst({
      orderBy: { id_tahun: "desc" }, // ambil yang paling baru
      select: { namaTahun: true }, // hanya ambil nama tahun
    });
    return latest?.namaTahun || null;
  } catch (error) {
    throw new Error(`Error fetching latest tahun ajaran: ${error.message}`);
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

export const deleteTahunAjaranService = async (tahunAjaranId) => {
  if (!tahunAjaranId) {
    throw new Error("Tahun ajaran tidak valid");
  }

  // Hapus tahun ajaran, Prisma akan otomatis menolak jika masih ada relasi
  // jadi kita hapus relasi pivot dulu
  await prisma.kelasTahunAjaran.deleteMany({
    where: { tahunAjaranId: Number(tahunAjaranId) },
  });

  await prisma.tahunAjaran.delete({
    where: { id_tahun: Number(tahunAjaranId) },
  });

  return { message: "Tahun ajaran berhasil dihapus" };
};

export const deleteKelasFromTahunAjaranService = async (
  tahunAjaranId,
  kelasId
) => {
  if (!tahunAjaranId || !kelasId) {
    throw new Error("Tahun ajaran atau kelas tidak valid");
  }

  // Hapus relasi kelas dari tahun ajaran
  await prisma.kelasTahunAjaran.delete({
    where: {
      kelasId_tahunAjaranId: {
        kelasId: Number(kelasId),
        tahunAjaranId: Number(tahunAjaranId),
      },
    },
  });

  return { message: "Kelas berhasil dihapus dari tahun ajaran" };
};

export const addManyKelasToTahunAjaranService = async (
  id_tahun,
  kelasIds,
  activeKelasId
) => {
  if (!kelasIds || kelasIds.length === 0) {
    throw new Error("kelasIds tidak boleh kosong");
  }

  // pastikan tahun ajaran ada
  const tahun = await prisma.tahunAjaran.findUnique({
    where: { id_tahun: parseInt(id_tahun) },
  });
  if (!tahun) throw new Error("Tahun ajaran tidak ditemukan");

  // insert banyak relasi sekaligus
  await prisma.kelasTahunAjaran.createMany({
    data: kelasIds.map((kelasId) => ({
      kelasId,
      tahunAjaranId: parseInt(id_tahun),
      isActive: kelasId === activeKelasId,
    })),
    skipDuplicates: true, // supaya tidak error kalau sudah ada
  });

  // ambil lagi data terbaru
  return prisma.tahunAjaran.findUnique({
    where: { id_tahun: parseInt(id_tahun) },
    include: {
      kelasRel: {
        include: { kelas: true },
      },
    },
  });
};

export const bulkUpdateKelasTahunAjaranService = async (
  tahunAjaranId,
  kelasList
) => {
  if (!tahunAjaranId || !Array.isArray(kelasList)) {
    throw new Error("Data tidak valid");
  }

  const updatePromises = kelasList.map((k) =>
    prisma.kelasTahunAjaran.update({
      where: { kelasId_tahunAjaranId: { kelasId: k.id_kelas, tahunAjaranId } },
      data: { isActive: k.isActive },
    })
  );

  await Promise.all(updatePromises);
  return { message: "Status kelas berhasil diperbarui" };
};
