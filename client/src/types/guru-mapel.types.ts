// ============================================================================
// GURU MAPEL TYPES
// ============================================================================

export interface GuruMapel {
  id: number;
  id_guru: number;
  id_mapel: number;
  id_kelas: number;
  tahunAjaranId: number;
  createdAt: string;
  updatedAt: string;
  guru: {
    id_guru: number;
    nip: string;
    nama: string;
    email?: string;
    noHP?: string;
  };
  mapel: {
    id_mapel: number;
    namaMapel: string;
    kelompokMapel?: string;
    deskripsi?: string;
  };
  kelas: {
    id_kelas: number;
    namaKelas: string;
    tingkat: string;
    jurusan?: string;
  };
  tahunAjaran: {
    id_tahun: number;
    namaTahun: string;
    semester: number;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
  };
  _count?: {
    jadwal: number;
  };
}

export interface CreateGuruMapelData {
  id_guru: number;
  id_mapel: number;
  id_kelas: number;
  tahunAjaranId: number;
}

export interface GuruMapelFilters {
  page?: number;
  limit?: number;
  search?: string;
  tahunAjaranId?: number;
  kelasId?: number;
  guruId?: number;
  mapelId?: number;
}

export interface GuruMapelStats {
  total: number;
  totalGuru: number;
  totalMapel: number;
  totalKelas: number;
  averagePerGuru: number;
}
