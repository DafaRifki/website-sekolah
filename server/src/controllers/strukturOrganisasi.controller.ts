import { Request, Response } from 'express';
import * as strukturService from '../services/strukturOrganisasi.service';

/**
 * GET - Mengambil semua data dan mengelompokkannya sesuai kategori
 * Digunakan oleh Tabel Admin dan Landing Page
 */
export const getStrukturOrganisasi = async (req: Request, res: Response) => {
  try {
    const allData = await strukturService.getAllStruktur();
    
    // Kelompokkan data agar frontend tidak crash saat melakukan spread (...)
    const groupedData = {
      ketuaYayasan: allData.filter((item: any) => item.kategori === 'ketuaYayasan') || [],
      kepalaKomiteTU: allData.filter((item: any) => item.kategori === 'kepalaKomiteTU') || [],
      wakasek: allData.filter((item: any) => item.kategori === 'wakasek') || [],
      staff: allData.filter((item: any) => item.kategori === 'staff') || [],
    };

    res.status(200).json({
      success: true,
      data: groupedData
    });
  } catch (error: any) {
    console.error('Error fetching struktur organisasi:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Gagal mengambil data struktur' 
    });
  }
};

/**
 * POST - Menambah data baru dengan upload foto
 */
export const createStrukturOrganisasi = async (req: Request, res: Response) => {
  try {
    const { kategori, jabatan, nama, ttl, alamat, telp, sambutan } = req.body;

    // Validasi input wajib
    if (!kategori || !jabatan || !nama) {
      return res.status(400).json({ success: false, message: 'Kategori, jabatan, dan nama wajib diisi' });
    }

    // Validasi file
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Foto wajib diunggah' });
    }

    // Konsisten simpan dengan prefix guru/
    const fotoPath = `guru/${req.file.filename}`;

    const newData = await strukturService.createStruktur({
      kategori,
      jabatan,
      nama,
      foto: fotoPath,
      ttl,
      alamat,
      telp,
      sambutan 
    });

    res.status(201).json({ 
      success: true,
      message: 'Data struktur organisasi berhasil ditambahkan', 
      data: newData 
    });
  } catch (error: any) {
    console.error('Error creating struktur organisasi:', error);
    res.status(500).json({ success: false, message: error.message || 'Terjadi kesalahan pada server' });
  }
};

/**
 * PUT - Memperbarui data yang sudah ada
 */
export const updateStrukturOrganisasi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { kategori, jabatan, nama, ttl, alamat, telp, sambutan } = req.body;

    // Cek keberadaan data
    const existingData = await strukturService.getStrukturById(parseInt(id));
    if (!existingData) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    let fotoPath = existingData.foto; // Default pakai foto lama

    // Jika ada upload foto baru
    if (req.file) {
      // PERBAIKAN DI SINI: Samakan dengan create, gunakan 'guru/' bukan 'uploads/'
      fotoPath = `guru/${req.file.filename}`;
    }

    const updatedData = await strukturService.updateStruktur(parseInt(id), {
      kategori,
      jabatan,
      nama,
      foto: fotoPath,
      ttl,
      alamat,
      telp,
      sambutan 
    });

    res.status(200).json({ 
      success: true, 
      message: "Data berhasil diperbarui", 
      data: updatedData 
    });
  } catch (error: any) {
    console.error('Error updating struktur organisasi:', error);
    res.status(500).json({ success: false, message: "Gagal memperbarui data" });
  }
};

/**
 * DELETE - Menghapus data berdasarkan ID
 */
export const deleteStrukturOrganisasi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }

    await strukturService.deleteStruktur(parseInt(id));
    
    res.status(200).json({ 
      success: true,
      message: "Data struktur organisasi berhasil dihapus" 
    });
  } catch (error: any) {
    console.error('Error deleting struktur organisasi:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus data dari database' });
  }
};