// ============================================================================
// JADWAL TYPES
// ============================================================================

export interface Jadwal {
  id_jadwal: number;
  guruMapelId: number;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan?: string;
  keterangan?: string;
  createdAt: string;
  updatedAt: string;
  guruMapel: {
    id: number;
    guru: {
      id_guru: number;
      nip: string;
      nama: string;
      email?: string;
    };
    mapel: {
      id_mapel: number;
      namaMapel: string;
      kelompokMapel?: string;
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
    };
  };
}

export interface CreateJadwalData {
  guruMapelId: number;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan?: string;
  keterangan?: string;
}

export interface JadwalFilters {
  page?: number;
  limit?: number;
  kelasId?: number;
  guruId?: number;
  hari?: string;
  tahunAjaranId?: number;
}

export interface JadwalStats {
  total: number;
  byHari: Array<{
    hari: string;
    count: number;
  }>;
  totalKelasWithJadwal: number;
}

export type Hari = "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu";

export const HARI_OPTIONS: Hari[] = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

// Helper for weekly schedule display
export interface JadwalByDay {
  [hari: string]: Jadwal[];
}

export interface TimeSlot {
  jamMulai: string;
  jamSelesai: string;
  jadwal: {
    [hari: string]: Jadwal | null;
  };
}
