import prisma from "../models/prisma.js";

export const getAllGuru = async (req, res) => {
  const guru = await prisma.guru.findMany({ orderBy: { id: "asc" } });
  res.json(guru);
};

export const getGuruById = async (req, res) => {
  try {
    const { id } = req.params;

    const guru = await prisma.guru.findUnique({
      where: { id: parseInt(id) },
      include: {
        waliKelas: true,
        user: {
          select: { email: true, role: true },
        },
      },
    });

    if (!guru) {
      return res.status(404).json({
        success: false,
        message: "Guru tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: guru,
    });
  } catch (error) {
    console.log("Error getGuruById: ", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};
