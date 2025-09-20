import {
  createKelasService,
  deleteKelasService,
  getAllKelasService,
  getKelasByIdService,
  getKelasByTahunAjaranService,
  updateKelasService,
} from "../services/KelasService.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const getAllKelas = async (req, res) => {
  try {
    const kelas = await getAllKelasService();
    return successResponse(res, 200, "Data kelas berhasil didapatkan", kelas);
  } catch (error) {
    return errorResponse(res, 500, "Terjadi kesalahan server", error.message);
  }
};

export const getKelasById = async (req, res) => {
  try {
    const { id } = req.params;
    const kelas = await getKelasByIdService(id);
    return successResponse(res, 200, "Data kelas berhasil diambil", kelas);
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

export const createKelas = async (req, res) => {
  try {
    const kelasData = req.body;
    const newKelas = await createKelasService(kelasData);
    return successResponse(res, 201, "Kelas berhasil dibuat", newKelas);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

export const updateKelas = async (req, res) => {
  try {
    const { id } = req.params;
    const kelasData = req.body;
    const updatedKelas = await updateKelasService(id, kelasData);
    return successResponse(res, 200, "Kelas berhasil diupdate", updatedKelas);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

export const deleteKelas = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteKelasService(id);
    return successResponse(res, 200, "Kelas berhasil dihapus");
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

export const getKelasByTahunAjaran = async (req, res) => {
  const { tahun } = req.query;

  if (!tahun) {
    return res.status(400).json({ message: "Tahun ajaran harus disertakan" });
  }

  try {
    const kelasList = await getKelasByTahunAjaranService(Number(tahun));
    res.json({ data: kelasList });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: err.message || "Terjadi kesalahan server" });
  }
};
