import prisma from "../models/prisma.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const [totalSiswa, totalGuru, totalKelas] = await Promise.all([
      prisma.siswa.count(),
      prisma.guru.count(),
      prisma.kelas.count(),
    ]);

    res.json({
      success: true,
      totalSiswa,
      totalGuru,
      totalKelas,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
