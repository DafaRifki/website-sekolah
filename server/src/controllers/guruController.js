import prisma from "../models/prisma.js";

export const getAllGuru = async (req, res) => {
  const guru = await prisma.guru.findMany({ orderBy: { id: "asc" } });
  res.json(guru);
};
