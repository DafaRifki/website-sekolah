import prisma from "../models/prisma.js";

export const getAllPendaftaran = async (req, res) => {
  try {
    const data = await prisma.pendaftaran.findMany({
      orderBy: { id_pendaftaran: "desc" },
      include: {
        tahunAjaran: { select: { id_tahun: true, namaTahun: true } },
        siswa: { select: { id_siswa: true, nama: true, nis: true } },
      },
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
