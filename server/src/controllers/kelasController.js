import { getAllKelasService } from "../services/KelasService.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const getAllKelas = async (req, res) => {
  try {
    const kelas = await getAllKelasService();
    return successResponse(res, 200, "Data kelas berhasil didapatkan", kelas);
  } catch (error) {
    return errorResponse(res, 500, "Terjadi kesalahan server", error.message);
  }
};
