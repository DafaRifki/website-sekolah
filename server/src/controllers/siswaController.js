import prisma from "../models/prisma.js";

export const getAllSiswa = async (req, res) => {
  const siswa = await prisma.siswa.findMany({ orderBy: { id: "asc" } });
  res.json(siswa);
};
