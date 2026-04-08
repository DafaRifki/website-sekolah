import { Router } from 'express';
import { 
  getStrukturOrganisasi, 
  createStrukturOrganisasi, 
  deleteStrukturOrganisasi, 
  updateStrukturOrganisasi
} from '../controllers/strukturOrganisasi.controller';
import { upload } from '../middleware/upload.middleware';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * Route: GET /api/struktur-organisasi
 * Diakses oleh: Publik (Landing Page) & Admin (Tabel)
 */
router.get('/', getStrukturOrganisasi);

/**
 * Route: POST /api/struktur-organisasi
 * Fungsi: Menambah data pejabat baru + Upload Foto
 * Keamanan: Disarankan menggunakan authenticateToken agar hanya admin yang bisa akses
 */
router.post(
  '/', 
  upload.single("foto"), 
  createStrukturOrganisasi
);

/**
 * Route: PUT /api/struktur-organisasi/:id
 * Fungsi: Update data pejabat atau Update Sambutan Kepala Sekolah
 * Keamanan: Wajib admin
 */
router.put(
  '/:id', 
  upload.single("foto"), 
  updateStrukturOrganisasi
);

/**
 * Route: DELETE /api/struktur-organisasi/:id
 * Fungsi: Menghapus data berdasarkan ID
 * Keamanan: Wajib admin
 */
router.delete(
  '/:id', 
   deleteStrukturOrganisasi
);

export default router;