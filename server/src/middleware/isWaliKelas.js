import prisma from "../models/prisma.js";

export const isWaliKelas = async (req, res, next) => {
  try {
    // Pastikan req.body selalu ada
    const body = req.body || {};
    let kelasId = body.kelasId;

    // Kalau tidak ada di body, cek dari params.id (misalnya update/delete siswa)
    if (!kelasId && req.params.id) {
      const siswa = await prisma.siswa.findUnique({
        where: { id_siswa: parseInt(req.params.id) },
      });
      if (!siswa) {
        return res.status(404).json({
          success: false,
          message: "Siswa tidak ditemukan",
        });
      }
      kelasId = siswa.kelasId;
    }

    if (!kelasId) {
      return res.status(400).json({
        success: false,
        message: "Kelas ID tidak ditemukan",
      });
    }

    // Pastikan user sudah login
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid atau belum login",
      });
    }

    // Pastikan rolenya GURU
    if (req.user.role !== "GURU") {
      return res.status(403).json({
        success: false,
        message: "Hanya guru yang boleh mengakses",
      });
    }

    // Cari data guru berdasarkan user login
    const guru = await prisma.guru.findFirst({
      where: { user: { id: req.user.id } },
    });

    if (!guru) {
      return res.status(403).json({
        success: false,
        message: "Akun ini bukan guru",
      });
    }

    // Cari data kelas
    const kelas = await prisma.kelas.findUnique({
      where: { id_kelas: parseInt(kelasId) },
    });

    if (!kelas) {
      return res.status(404).json({
        success: false,
        message: "Kelas tidak ditemukan",
      });
    }

    // Cek apakah guru login adalah wali dari kelas ini
    if (kelas.waliId !== guru.id_guru) {
      return res.status(403).json({
        success: false,
        message: "Anda bukan wali kelas dari kelas ini",
      });
    }

    // Lolos validasi
    req.guru = guru;
    req.kelas = kelas;
    next();
  } catch (error) {
    console.error("Error isWaliKelas middleware:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};
