export interface NilaiInput {
  id_siswa: number;
  id_mapel: number;
  tahunAjaranId: number;
  semester: string;
  nilai?: number;
  nilaiTugas?: number;
  nilaiUTS?: number;
  nilaiUAS?: number;
}

export interface NilaiBulkInput {
  kelasId: number;
  mapelId: number;
  tahunAjaranId: number;
  semester: string;
  nilaiList: Array<{
    id_siswa: number;
    nilai?: number;
    nilaiTugas?: number;
    nilaiUTS?: number;
    nilaiUAS?: number;
  }>;
}

export interface MapelKelas {
  id_mapel: number;
  namaMapel: string;
  kelompokMapel: string;
  kelas: {
    id_kelas: number;
    namaKelas: string;
    tingkat: string;
  };
}

export interface SiswaWithNilai {
  id_siswa: number;
  nis: string;
  nama: string;
  kelas: {
    id_kelas: number;
    namaKelas: string;
  };
  nilai?: {
    id_nilai: number;
    nilai: number;
    nilaiTugas?: number;
    nilaiUTS?: number;
    nilaiUAS?: number;
  };
}

export interface NilaiStatistics {
  totalSiswa: number;
  siswaWithNilai: number;
  siswaWithoutNilai: number;
  rataRata: number;
}

export interface NilaiDetail {
  id_nilai: number;
  id_siswa: number;
  id_mapel: number;
  tahunAjaranId: number;
  semester: string;
  nilai: number;
  nilaiTugas?: number;
  nilaiUTS?: number;
  nilaiUAS?: number;
  siswa: {
    id_siswa: number;
    nis: string;
    nama: string;
    kelas: {
      id_kelas: number;
      namaKelas: string;
    };
  };
  mapel: {
    id_mapel: number;
    namaMapel: string;
    kelompokMapel: string;
  };
  tahunAjaran: {
    id_tahun: number;
    namaTahun: string;
  };
}
