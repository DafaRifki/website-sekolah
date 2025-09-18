import { getAllTarifService } from "../services/tarifService.js";

export const getAllTarif = async (req, res) => {
  try {
    const tarif = await getAllTarifService();
    res.json({ success: true, data: tarif });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data tarif" });
  }
};
