import prisma from "../models/prisma.js";

export const getAllKelasService = async () => {
  return await prisma.kelas.findMany({
    orderBy: { id_kelas: "asc" },
  });
};
