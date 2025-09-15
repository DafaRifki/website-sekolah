import {
  createTahunAjaranService,
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
