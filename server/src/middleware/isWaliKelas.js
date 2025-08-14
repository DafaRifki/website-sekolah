import prisma from "../models/prisma.js";

export const isWaliKelas = async (req, res, next) => {
  try {
    // Pastikan req.body selalu ada
    const body = req.body || {};
    let kelasId = body.kelasId;

    // Kalau tidak ada di body dan ada params.id (untuk DELETE/PATCH)
    if (!kelasId && req.params.id) {
      const siswa = await prisma.siswa.findUnique({
        where: { id: parseInt(req.params.id) },
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

    const userId = req.user.userId || req.user.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "ID pengguna tidak ditemukan di token",
      });
    }

    // Ambil data guru
    const guru = await prisma.guru.findUnique({
      where: { userId },
    });

    if (!guru) {
      return res.status(403).json({
        success: false,
        message: "Akun ini bukan guru",
      });
    }

    // Ambil data kelas
    const kelas = await prisma.kelas.findUnique({
      where: { id: parseInt(kelasId) },
    });

    if (!kelas) {
      return res.status(404).json({
        success: false,
        message: "Kelas tidak ditemukan",
      });
    }

    // Cek wali kelas
    if (kelas.guruId !== guru.id) {
      return res.status(403).json({
        success: false,
        message: "Anda bukan wali kelas dari kelas ini",
      });
    }

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
