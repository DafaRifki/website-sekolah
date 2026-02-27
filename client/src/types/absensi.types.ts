export type StatusAbsensi = "HADIR" | "SAKIT" | "IZIN" | "TIDAK_HADIR";
export type StatusPertemuan =
  | "SCHEDULED"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

export interface DashboardAdmin {
  tanggal: string;
  absensiHarian: {
    totalSiswa: number;
    sudahAbsen: number;
    belumAbsen: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
  };
  pertemuan: {
    totalPertemuan: number;
    guruMengajar: number;
    scheduled: number;
    ongoing: number;
    completed: number;
    cancelled: number;
  };
  persentaseKehadiran: number;
  persentaseAbsensiComplete: number;
}

export interface ClassAttendance {
  id_kelas: number;
  namaKelas: string;
  tingkat: string;
  waliKelas: string | null;
  stats: {
    totalSiswa: number;
    sudahAbsen: number;
    belumAbsen: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
  };
  persentaseKehadiran: number;
}

export interface GuruJadwal {
  guruMapelId: number;
  namaMapel: string;
  namaKelas: string;
  totalSiswa: number;
  jadwal: {
    id_jadwal: number;
    hari: string;
    jamMulai: string;
    jamSelesai: string;
    ruangan: string | null;
  };
  absensi: {
    id_absensi_pertemuan: number;
    pertemuanKe: number;
    statusPertemuan: StatusPertemuan;
    sudahAbsen: number;
    belumAbsen: number;
  } | null;
}

export interface SiswaAbsensi {
  id_siswa: number;
  nis: string;
  nama: string;
  status: StatusAbsensi | null;
  keterangan: string | null;
  id_detail?: number;
}

export interface PertemuanDetail {
  pertemuan: {
    id_absensi_pertemuan: number;
    pertemuanKe: number;
    tanggal: string;
    jamMulai: string;
    jamSelesai: string;
    materi: string | null;
    keteranganGuru: string | null;
    statusPertemuan: StatusPertemuan;
    guru: string;
    mapel: string;
    kelas: string;
  };
  siswaList: SiswaAbsensi[];
  stats: {
    totalSiswa: number;
    sudahAbsen: number;
    belumAbsen: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
  };
}

export interface SiswaRiwayat {
  siswa: {
    id_siswa: number;
    nis: string;
    nama: string;
  };
  absensi: Array<{
    id_absensi: number;
    tanggal: string;
    status: StatusAbsensi;
    keterangan: string | null;
  }>;
  stats: {
    total: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
  };
  persentaseKehadiran: number;
}

export interface BulkAbsensiRequest {
  guruMapelId: number;
  pertemuanKe: number;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  materi?: string;
  keteranganGuru?: string;
  detailAbsensi: Array<{
    siswaId: number;
    status: StatusAbsensi;
    keterangan?: string;
    waktuCheckIn?: string;
  }>;
}
