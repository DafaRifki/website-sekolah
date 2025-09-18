import prisma from "../models/prisma.js";
import { getLatestTahunAjaranService } from "../services/tahunAjaranService.js";
import { getCurrentTarif } from "../services/tarifService.js";

// ========================
// Dashboard untuk ADMIN
// ========================
export const getDashboardSummary = async (req, res) => {
  try {
    const [
      totalSiswa,
      totalGuru,
      totalKelas,
      tahunAjaran,
      totalPendaftarBaru,
      totalPendaftarDiterima,
      tarifTahunan,
    ] = await Promise.all([
      prisma.siswa.count(),
      prisma.guru.count(),
      prisma.kelas.count(),
      // prisma.tahunAjaran.count(),
      getLatestTahunAjaranService(),
      prisma.pendaftaran.count({
        where: { statusDokumen: "BELUM_DITERIMA" }, // pending verifikasi
      }),
      prisma.pendaftaran.count({
        where: { statusDokumen: "LENGKAP" }, // sudah diterima
      }),
      getCurrentTarif(),
    ]);

    res.json({
      success: true,
      role: "ADMIN",
      totalSiswa,
      totalGuru,
      totalKelas,
      tahunAjaran: tahunAjaran,
      totalPendaftarBaru,
      totalPendaftarDiterima,
      tarifTahunan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ========================
// Dashboard untuk SISWA
// ========================
export const getDashboardSiswa = async (req, res) => {
  try {
    const userId = req.user.userId; // dari JWT
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId tidak ditemukan dalam token",
      });
    }

    // cari user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { siswaId: true },
    });

    if (!user || !user.siswaId) {
      return res
        .status(404)
        .json({ success: false, message: "User ini tidak punya data siswa" });
    }

    // ambil data siswa
    const siswa = await prisma.siswa.findUnique({
      where: { id_siswa: user.siswaId },
      include: {
        kelas: { include: { guru: true } },
        nilaiRapor: true,
        absensi: true,
      },
    });

    if (!siswa) {
      return res
        .status(404)
        .json({ success: false, message: "Siswa tidak ditemukan" });
    }

    // cari pendaftaran siswa di tahun ajaran terbaru
    const pendaftaran = await prisma.pendaftaran.findFirst({
      where: {
        siswaId: user.siswaId,
      },
      include: {
        tahunAjaran: {
          include: {
            tarif: {
              orderBy: { id_tarif: "desc" }, // jaga-jaga kalau ada lebih dari satu
              take: 1,
            },
          },
        },
      },
      orderBy: {
        tahunAjaran: { id_tahun: "desc" },
      },
    });

    const tarifTahunan = pendaftaran?.tahunAjaran?.tarif?.[0]?.nominal ?? null;
    const statusPembayaran = pendaftaran?.statusPembayaran ?? "BELUM";

    // hitung nilai rata-rata
    const nilaiRata = siswa.nilaiRapor.length
      ? (
          siswa.nilaiRapor.reduce((a, b) => a + b.nilai, 0) /
          siswa.nilaiRapor.length
        ).toFixed(2)
      : null;

    // hitung persentase absensi
    const totalAbsensi = siswa.absensi.length;
    const hadir = siswa.absensi.filter((a) => a.status === "HADIR").length;
    const persentaseAbsensi =
      totalAbsensi > 0 ? `${Math.round((hadir / totalAbsensi) * 100)}%` : "-";

    res.json({
      success: true,
      role: "SISWA",
      biodata: {
        nama: siswa.nama,
        kelas: siswa.kelas?.namaKelas ?? "-",
        wali: siswa.kelas?.guru?.nama ?? "-",
      },
      nilaiRata,
      persentaseAbsensi,
      tarif: tarifTahunan,
      tahunAjaran: pendaftaran?.tahunAjaran?.namaTahun ?? "-",
      statusPembayaran, // "LUNAS" / "BELUM"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
