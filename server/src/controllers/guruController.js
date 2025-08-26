import prisma from "../models/prisma.js";

export const getAllGuru = async (req, res) => {
  try {
    const guru = await prisma.guru.findMany({
      orderBy: { id_guru: "asc" },
      include: { user: { select: { email: true, role: true } } },
    });

    res.status(200).json({ success: true, data: guru });
  } catch (error) {
    console.log("Error getAllGuru: ", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

export const getGuruById = async (req, res) => {
  try {
    const { id } = req.params;

    const guru = await prisma.guru.findUnique({
      where: { id_guru: parseInt(id) },
      include: {
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

    res.status(200).json({
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
