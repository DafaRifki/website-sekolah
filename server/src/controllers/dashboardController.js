import prisma from "../models/prisma.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const [
      totalSiswa,
      totalGuru,
      totalKelas,
      tahunAjaran,
      totalPendaftarBaru,
      totalPendaftarDiterima,
    ] = await Promise.all([
      prisma.siswa.count(),
      prisma.guru.count(),
      prisma.kelas.count(),
      prisma.tahunAjaran.count(),
      prisma.pendaftaran.count({
        where: { statusDokumen: "BELUM_DITERIMA" }, // pending verifikasi
      }),
      prisma.pendaftaran.count({
        where: { statusDokumen: "LENGKAP" }, // sudah diterima
      }),
    ]);

    res.json({
      success: true,
      totalSiswa,
      totalGuru,
      totalKelas,
      tahunAjaran,
      totalPendaftarBaru,
      totalPendaftarDiterima,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
