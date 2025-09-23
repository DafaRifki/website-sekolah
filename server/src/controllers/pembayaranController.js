import {
  createPembayaran,
  deletePembayaran,
  getAllPembayaranService,
  getPembayaranByIdService,
  updatePembayaran,
} from "../services/pembayaranService.js";

/**
 * GET api/pembayaran
 */
export const index = async (req, res) => {
  try {
    const filter = {};
    if (req.query.siswaId) filter.siswaId = Number(req.query.siswaId);
    if (req.query.tahunAjaranId)
      filter.tahunAjaranId = Number(req.query.tahunAjaranId);

    const data = await getAllPembayaranService(filter);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/pembayaran/:id
 */
export const show = async (req, res) => {
  try {
    const data = await getPembayaranByIdService(req.params.id);
    if (!data)
      return res.status(404).json({ error: "Pembayaran tidak ditemukan" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/pembayaran
 */
export const store = async (req, res) => {
  try {
    const pembayaran = await createPembayaran(req.body);

    res.status(201).json({
      success: true,
      message: "Pembayaran berhasil disimpan",
      data: pembayaran,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Gagal menyimpan pembayaran",
    });
  }
};

/**
 * PUT /api/pembayaran/:id
 */
export const update = async (req, res) => {
  try {
    const data = await updatePembayaran(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE /api/pembayaran/:id
 */
export const destroy = async (req, res) => {
  try {
    const data = await deletePembayaran(req.params.id);
    res.json({ message: "Pembayaran dihapus", data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
