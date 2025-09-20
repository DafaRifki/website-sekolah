import {
  addManyKelasToTahunAjaranService,
  bulkUpdateKelasTahunAjaranService,
  createTahunAjaranService,
  deleteKelasFromTahunAjaranService,
  deleteTahunAjaranService,
  getAllTahunAjaranService,
  getTahunAjaranByIdService,
  updateTahunAjaranService,
} from "../services/tahunAjaranService.js";

export const getAllTahunAjaran = async (req, res) => {
  try {
    const tahunAjaran = await getAllTahunAjaranService();
    res.json({ success: true, data: tahunAjaran });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTahunAjaranById = async (req, res) => {
  try {
    const data = await getTahunAjaranByIdService(req.params.id);
    res.json({ success: true, data: data });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createTahunAjaran = async (req, res) => {
  try {
    const data = await createTahunAjaranService(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTahunAjaran = async (req, res) => {
  try {
    const data = await updateTahunAjaranService(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTahunAjaran = async (req, res) => {
  const { tahunAjaranId } = req.params;

  try {
    await deleteTahunAjaranService(tahunAjaranId);
    res.json({ success: true, message: "Tahun ajaran berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteKelasFromTahunAjaran = async (req, res) => {
  const { tahunAjaranId, kelasId } = req.params;

  try {
    await deleteKelasFromTahunAjaranService(tahunAjaranId, kelasId);
    res.json({
      success: true,
      message: "Kelas berhasil dihapus dari tahun ajaran",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addManyKelasToTahunAjaran = async (req, res) => {
  try {
    const { id_tahun, kelasIds, activeKelasId } = req.body;

    if (!id_tahun || !Array.isArray(kelasIds)) {
      return res.status(400).json({
        success: false,
        message: "id_tahun dan kelasIds wajib diisi",
      });
    }

    const result = await addManyKelasToTahunAjaranService(
      id_tahun,
      kelasIds,
      activeKelasId
    );

    res.status(201).json({
      success: true,
      message: "Kelas berhasil ditambahkan ke tahun ajaran",
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const bulkUpdateKelasTahunAjaran = async (req, res) => {
  const { tahunAjaranId, kelas } = req.body;
  try {
    await bulkUpdateKelasTahunAjaranService(tahunAjaranId, kelas);
    res.json({ success: true, message: "Perubahan kelas berhasil disimpan" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
