import prisma from "../models/prisma.js";

export const isWaliKelas = async (req, res, next) => {
  try {
    const body = req.body || {};
    let kelasId = body.kelasId;

    if (!kelasId && req.params.id) {
      const siswa = await prisma.siswa.findUnique({
        where: { id_siswa: parseInt(req.params.id) },
      });
      if (!siswa) {
        return res
          .status(404)
          .json({ success: false, message: "Siswa tidak ditemukan" });
      }
      kelasId = siswa.kelasId;
    }

    if (!kelasId) {
      return res
        .status(400)
        .json({ success: false, message: "Kelas ID tidak ditemukan" });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid atau belum login",
      });
    }

    // ✅ Kalau ADMIN, langsung lolos tanpa cek wali kelas
    if (req.user.role === "ADMIN") {
      return next();
    }

    // Kalau bukan admin, wajib guru
    if (req.user.role !== "GURU") {
      return res
        .status(403)
        .json({ success: false, message: "Hanya guru yang boleh mengakses" });
    }

    const guru = await prisma.guru.findFirst({
      where: { user: { id: req.user.id } },
    });

    if (!guru) {
      return res
        .status(403)
        .json({ success: false, message: "Akun ini bukan guru" });
    }

    const kelas = await prisma.kelas.findUnique({
      where: { id_kelas: parseInt(kelasId) },
    });

    if (!kelas) {
      return res
        .status(404)
        .json({ success: false, message: "Kelas tidak ditemukan" });
    }

    if (kelas.waliId !== guru.id_guru) {
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
