import prisma from "../models/prisma.js";

export const getAllTarifService = async () => {
  return prisma.tarifPembayaran.findMany({
    include: { tahunAjaran: true },
    orderBy: { id_tarif: "desc" },
  });
};

// ambil tarif terbaru dari tahun ajaran aktif
export const getCurrentTarif = async () => {
  const tahunAjaranAktif = await prisma.tahunAjaran.findFirst({
    orderBy: { id_tahun: "desc" },
    where: { kelasRel: { some: { isActive: true } } },
    include: {
      tarif: { orderBy: { id_tarif: "desc" }, take: 1 },
    },
  });

  return tahunAjaranAktif?.tarif[0]?.nominal ?? null;
};
