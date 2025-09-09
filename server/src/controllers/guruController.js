import {
  createGuruService,
  deleteGuruService,
  getAllGuruService,
  getGuruByIdService,
  updateGuruService,
} from "../services/guruService.js";

// response error
const errorResponse = (res, status, message, error = null) => {
  return res.status(status).json({
    success: false,
    message,
    ...(error && { error }),
  });
};

// parse ID
const parseId = (id) => {
  const parsed = parseInt(id, 10);
  return isNaN(parsed) ? null : parsed;
};

export const getAllGuru = async (req, res) => {
  try {
    const guru = await getAllGuruService();

    res.status(200).json({ success: true, data: guru });
  } catch (error) {
    console.log("Error getAllGuru: ", error);
    return errorResponse(res, 500, "Terjadi kesalahan server", error.message);
  }
};

export const getGuruById = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return errorResponse(res, 400, "ID Guru tidak valid");

    const guru = await getGuruByIdService(id);

    if (!guru) return errorResponse(res, 404, "Guru tidak ditemukan");

    res.status(200).json({ success: true, data: guru });
  } catch (error) {
    console.log("Error getGuruById: ", error);
    return errorResponse(res, 500, "Terjadi kesalahan server", error.message);
  }
};

export const createGuru = async (req, res) => {
  try {
    const { file } = req;
    const data = {
      ...req.body,
      fotoProfil: file ? `${file.filename}` : null,
    };

    const newGuru = await createGuruService(data);

    res.status(201).json({
      success: true,
      message: "Guru berhasil dibuat",
      data: newGuru,
    });
  } catch (error) {
    console.error("CreateGuru Error: ", error);
    return errorResponse(res, 400, "Gagal membuat guru", error.message);
  }
};

export const updateGuru = async (req, res) => {
  try {
    const id = parseId(req.params.id);

    const updateGuru = await updateGuruService(id, req.body, req.file);

    res.status(200).json({
      success: true,
      message: "Data guru berhasil diupdate",
      data: updateGuru,
    });
  } catch (error) {
    return errorResponse(
      res,
      400,
      "Gagal memperbarui data guru",
      error.message
    );
  }
};

export const deleteGuru = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const deletedGuru = await deleteGuruService(id);

    res.status(200).json({
      success: true,
      message: "Guru berhasil dihapus",
      data: deletedGuru,
    });
  } catch (error) {
    console.error("DeleteGuru Error: ", error);
    return errorResponse(res, 400, "Gagal menghapus data guru", error.message);
  }
};
