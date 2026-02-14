import { Request, Response } from "express";
import * as raporService from "../services/rapor.service";
import { sendError, sendSuccess } from "../utils/response.util";

export const getRaporList = async (req: Request, res: Response) => {
  try {
    const { tahunId, kelasId, semester } = req.query;

    if (!tahunId || !kelasId || !semester) {
      return res.status(400).json({ message: "Parameter tidak lengkap" });
    }

    const data = await raporService.getAllRapor(
      Number(tahunId),
      Number(kelasId),
      String(semester),
    );

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateBulk = async (req: Request, res: Response) => {
  try {
    const { tahunId, kelasId, semester } = req.body;

    const result = await raporService.generateBulkRapor(
      Number(tahunId),
      Number(kelasId),
      String(semester),
    );

    res.json({ success: true, message: "Generate berhasil", data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStatusPublish = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await raporService.publishRapor(Number(id));
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkPublish = async (req: Request, res: Response) => {
  try {
    const { tahunId, kelasId, semester } = req.body;

    if (!tahunId || !kelasId || !semester) {
      return res.status(400).json({
        success: false,
        message: "tahunId, kelasId, dan semester harus diisi",
      });
    }

    const result = await raporService.bulkPublishRapor(
      Number(tahunId),
      Number(kelasId),
      String(semester),
    );

    res.json({
      success: true,
      message: `Berhasil mempublikasikan ${result.count} rapor`,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateSingle = async (req: Request, res: Response) => {
  try {
    const { id_siswa, tahunId, semester } = req.body;

    if (!id_siswa || !tahunId || !semester) {
      return res.status(400).json({
        success: false,
        message: "id_siswa, tahunId, dan semester wajib diisi",
      });
    }

    const result = await raporService.generateSingleRapor(
      Number(id_siswa),
      Number(tahunId),
      String(semester),
    );

    res.status(201).json({
      success: true,
      message: "Rapor siswa berhasil digenerate (status: DRAFT)",
      data: result,
    });
  } catch (error: any) {
    console.error("generateSingle error:", error);

    const status = error.message?.includes("sudah ada") ? 409 : 500;
    const message =
      error.message ||
      "Gagal generate rapor siswa. Pastikan data nilai sudah lengkap.";

    res.status(status).json({ success: false, message });
  }
};

export const getRaporDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const data = await raporService.getRaporDetail(Number(id));

    return sendSuccess(res, "Berhasil mengambil detail rapor", data);
  } catch (error: any) {
    return sendError(res, "Gagal mengambil detail rapor", error.message, 500);
  }
};

/**
 * PUT /api/rapor/:id/catatan
 * Update catatan wali kelas & penilaian sikap
 * Access: Wali Kelas, Admin
 */
export const updateCatatan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const result = await raporService.updateCatatanWaliKelas(Number(id), data);

    return sendSuccess(res, "Catatan berhasil diupdate", result);
  } catch (error: any) {
    return sendError(res, "Gagal update catatan", error.message, 500);
  }
};

/**
 * DELETE /api/rapor/:id
 * Delete rapor
 * Access: Wali Kelas, Admin
 */
export const deleteRapor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await raporService.deleteRapor(Number(id));

    return sendSuccess(res, "Rapor berhasil dihapus", null);
  } catch (error: any) {
    return sendError(res, "Gagal hapus rapor", error.message, 500);
  }
};

/**
 * GET /api/rapor/statistics
 * Get rapor statistics
 * Access: Wali Kelas, Admin
 */
export const getRaporStatistics = async (req: Request, res: Response) => {
  try {
    const { kelasId, tahunId } = req.query;

    const stats = await raporService.getRaporStatistics(
      kelasId ? Number(kelasId) : undefined,
      tahunId ? Number(tahunId) : undefined,
    );

    return sendSuccess(res, "Berhasil mengambil statistik rapor", stats);
  } catch (error: any) {
    return sendError(res, "Gagal mengambil statistik", error.message, 500);
  }
};

/**
 * GET /api/rapor/siswa/me
 * Get current student's rapor
 * Access: Siswa
 */
export const getMyRapor = async (req: Request, res: Response) => {
  try {
    const siswaId = req.user?.siswaId;
    const { tahunId, semester } = req.query;

    if (!siswaId) {
      return sendError(res, "Siswa ID tidak ditemukan", null, 400);
    }

    if (!tahunId || !semester) {
      return sendError(res, "tahunId dan semester wajib diisi", null, 400);
    }

    const data = await raporService.getRaporByStudent(
      Number(siswaId),
      Number(tahunId),
      String(semester),
    );

    if (!data) {
      return sendSuccess(res, "Rapor belum tersedia untuk periode ini", null);
    }

    return sendSuccess(res, "Berhasil mengambil rapor saya", data);
  } catch (error: any) {
    return sendError(res, "Gagal mengambil rapor", error.message, 500);
  }
};

// ============================================================================
// GURU MAPEL CONTROLLERS (NEW)
// ============================================================================

/**
 * GET /api/rapor/guru/mapel
 * Get mata pelajaran yang diajar guru
 * Access: Guru (Mapel & Wali Kelas)
 */
export const getMapelByGuru = async (req: Request, res: Response) => {
  try {
    const guruId = req.user?.role === "ADMIN" ? null : req.user?.guruId;
    const { tahunId } = req.query;

    if (req.user?.role !== "ADMIN" && !guruId) {
      return sendError(res, "Guru ID tidak ditemukan", null, 400);
    }

    if (!tahunId) {
      return sendError(res, "tahunId wajib diisi", null, 400);
    }

    const mapel = await raporService.getMapelByGuru(
      guruId || null,
      Number(tahunId),
    );

    return sendSuccess(res, "Berhasil mengambil mata pelajaran", mapel);
  } catch (error: any) {
    return sendError(res, "Gagal mengambil mata pelajaran", error.message, 500);
  }
};

/**
 * GET /api/rapor/guru/siswa
 * Get siswa list untuk input nilai
 * Access: Guru Mapel
 */
export const getSiswaForNilai = async (req: Request, res: Response) => {
  try {
    const guruId = req.user?.role === "ADMIN" ? null : req.user?.guruId;
    const { kelasId, mapelId, tahunId } = req.query;

    if (req.user?.role !== "ADMIN" && !guruId) {
      return sendError(res, "Guru ID tidak ditemukan", null, 400);
    }

    if (!kelasId || !mapelId || !tahunId) {
      return sendError(
        res,
        "kelasId, mapelId, dan tahunId wajib diisi",
        null,
        400,
      );
    }

    const siswa = await raporService.getSiswaForNilaiInput(
      guruId || null,
      Number(kelasId),
      Number(mapelId),
      Number(tahunId),
      req.user?.role === "ADMIN",
    );

    return sendSuccess(res, "Berhasil mengambil data siswa", siswa);
  } catch (error: any) {
    return sendError(res, "Gagal mengambil data siswa", error.message, 500);
  }
};

/**
 * POST /api/rapor/guru/nilai
 * Input nilai single student
 * Access: Guru Mapel
 */
export const inputNilai = async (req: Request, res: Response) => {
  try {
    const guruId = req.user?.role === "ADMIN" ? null : req.user?.guruId;

    if (req.user?.role !== "ADMIN" && !guruId) {
      return sendError(res, "Guru ID tidak ditemukan", null, 400);
    }

    const {
      id_siswa,
      id_mapel,
      tahunAjaranId,
      semester,
      nilai,
      nilaiTugas,
      nilaiUTS,
      nilaiUAS,
    } = req.body;

    if (!id_siswa || !id_mapel || !tahunAjaranId || !semester) {
      return sendError(
        res,
        "id_siswa, id_mapel, tahunAjaranId, dan semester wajib diisi",
        null,
        400,
      );
    }

    const result = await raporService.inputNilaiSiswa(
      guruId || null,
      {
        id_siswa: Number(id_siswa),
        id_mapel: Number(id_mapel),
        tahunAjaranId: Number(tahunAjaranId),
        semester: String(semester),
        nilai: nilai ? Number(nilai) : undefined,
        nilaiTugas: nilaiTugas ? Number(nilaiTugas) : undefined,
        nilaiUTS: nilaiUTS ? Number(nilaiUTS) : undefined,
        nilaiUAS: nilaiUAS ? Number(nilaiUAS) : undefined,
      },
      req.user?.role === "ADMIN",
    );

    return sendSuccess(res, "Nilai berhasil diinput", result);
  } catch (error: any) {
    return sendError(res, "Gagal input nilai", error.message, 500);
  }
};

/**
 * PUT /api/rapor/guru/nilai/:id
 * Update nilai
 * Access: Admin, Guru Mapel, Wali Kelas
 */
export const updateNilaiController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const guruId = req.user?.role === "ADMIN" ? null : req.user?.guruId;

    if (req.user?.role !== "ADMIN" && !guruId) {
      return sendError(res, "Guru ID tidak ditemukan", null, 400);
    }

    const result = await raporService.updateNilai(
      Number(id),
      guruId || null,
      req.body,
      req.user?.role === "ADMIN",
    );

    return sendSuccess(res, "Nilai berhasil diupdate", result);
  } catch (error: any) {
    return sendError(res, "Gagal update nilai", error.message, 500);
  }
};

/**
 * DELETE /api/rapor/guru/nilai/:id
 * Delete nilai
 * Access: Admin, Wali Kelas ONLY
 */
export const deleteNilaiController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await raporService.deleteNilaiById(Number(id));

    return sendSuccess(res, "Nilai berhasil dihapus", null);
  } catch (error: any) {
    return sendError(res, "Gagal hapus nilai", error.message, 500);
  }
};

/**
 * GET /api/rapor/guru/nilai/:id
 * Get nilai detail
 * Access: Admin, Guru Mapel, Wali Kelas
 */
export const getNilaiDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const nilai = await raporService.getNilaiById(Number(id));

    if (!nilai) {
      return sendError(res, "Nilai tidak ditemukan", null, 404);
    }

    return sendSuccess(res, "Berhasil mengambil detail nilai", nilai);
  } catch (error: any) {
    return sendError(res, "Gagal mengambil detail nilai", error.message, 500);
  }
};

/**
 * POST /api/rapor/guru/nilai-bulk
 * Input nilai multiple students
 * Access: Guru Mapel
 */
export const inputNilaiBulk = async (req: Request, res: Response) => {
  try {
    const guruId = req.user?.role === "ADMIN" ? null : req.user?.guruId;

    if (req.user?.role !== "ADMIN" && !guruId) {
      return sendError(res, "Guru ID tidak ditemukan", null, 400);
    }

    const { kelasId, mapelId, tahunAjaranId, semester, nilaiList } = req.body;

    if (!kelasId || !mapelId || !tahunAjaranId || !semester || !nilaiList) {
      return sendError(res, "Parameter tidak lengkap", null, 400);
    }

    if (!Array.isArray(nilaiList) || nilaiList.length === 0) {
      return sendError(
        res,
        "nilaiList harus berupa array dan tidak boleh kosong",
        null,
        400,
      );
    }

    const result = await raporService.inputNilaiBulk(
      guruId || null,
      Number(kelasId),
      Number(mapelId),
      Number(tahunAjaranId),
      String(semester),
      nilaiList,
      req.user?.role === "ADMIN",
    );

    return sendSuccess(
      res,
      `Berhasil input ${result.successCount} nilai, gagal ${result.errorCount}`,
      result,
    );
  } catch (error: any) {
    return sendError(res, "Gagal input bulk nilai", error.message, 500);
  }
};

/**
 * GET /api/rapor/guru/statistics
 * Get nilai statistics for guru dashboard
 * Access: Guru Mapel
 */
export const getNilaiStatistics = async (req: Request, res: Response) => {
  try {
    const guruId = req.user?.role === "ADMIN" ? null : req.user?.guruId;
    const { tahunId, semester } = req.query;

    if (req.user?.role !== "ADMIN" && !guruId) {
      return sendError(res, "Guru ID tidak ditemukan", null, 400);
    }

    if (!tahunId || !semester) {
      return sendError(res, "tahunId dan semester wajib diisi", null, 400);
    }

    const stats = await raporService.getNilaiStatsByGuru(
      guruId || null,
      Number(tahunId),
      String(semester),
    );

    return sendSuccess(res, "Berhasil mengambil statistik nilai", stats);
  } catch (error: any) {
    return sendError(res, "Gagal mengambil statistik", error.message, 500);
  }
};

/**
 * Export Rapor to PDF
 */
export const exportPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const buffer = await raporService.generateRaporPDF(Number(id));

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=rapor-${id}.pdf`,
    );
    res.send(buffer);
  } catch (error: any) {
    return sendError(res, "Gagal ekspor PDF", error.message, 500);
  }
};

/**
 * Export Rapor to Excel
 */
export const exportExcel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const buffer = await raporService.generateRaporExcel(Number(id));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=rapor-${id}.xlsx`,
    );
    res.send(buffer);
  } catch (error: any) {
    return sendError(res, "Gagal ekspor Excel", error.message, 500);
  }
};
