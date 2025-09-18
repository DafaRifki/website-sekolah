import {
  cekStatusPendaftaranService,
  createPendaftaranService,
  getAllPendaftaranService,
  terimaSiswaService,
  tolakSiswaService,
  updatePendaftaranService,
} from "../services/pendaftaranService.js";

export const createPendaftaran = async (req, res) => {
  try {
    const data = req.body;

    // parse tanggal lahir agar valid ISO Date
    if (data.tanggalLahir) {
      data.tanggalLahir = new Date(data.tanggalLahir);
      if (isNaN(data.tanggalLahir)) {
        return res.status(400).json({
          success: false,
          message:
            "Format tanggalLahir tidak valid. Gunakan format YYYY-MM-DD.",
        });
      }
    }

    const result = await createPendaftaranService(data);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPendaftaran = async (req, res) => {
  try {
    const { status } = req.query; // bisa ?status=PENDING
    const result = await getAllPendaftaranService(status);
    res.json({ success: true, data: result });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE
export const updatePendaftaran = async (req, res) => {
  try {
    const result = await updatePendaftaranService(
      parseInt(req.params.id),
      req.body
    );
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Terima siswa
export const terimaSiswa = async (req, res) => {
  try {
    const result = await terimaSiswaService(parseInt(req.params.id));
    res.json({ success: true, message: "Siswa diterima", data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Tolak siswa
export const tolakSiswa = async (req, res) => {
  try {
    const result = await tolakSiswaService(parseInt(req.params.id));
    res.json({ success: true, message: "Siswa ditolak", data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Cek status pendaftaran siswa
export const cekStatusPendaftaran = async (req, res) => {
  try {
    const { email } = req.query; // siswa isi form dengan email pendaftaran
    const result = await cekStatusPendaftaranService(email);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};
