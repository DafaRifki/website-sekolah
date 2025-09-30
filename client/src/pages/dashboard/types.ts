export interface User {
  name: string;
  email: string;
  role: "ADMIN" | "GURU" | "SISWA";
  statusPendaftaran?: "PENDING_VERIFIKASI" | "DITERIMA"; // khusus siswa
  isWaliKelas?: boolean; // khusus guru
}

export interface CardStatProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// Ringkasan untuk ADMIN
export interface DashboardSummary {
  totalSiswa: number | null;
  totalGuru: number | null;
  totalKelas: number | null;
  totalPendaftarBaru: number | null;
  totalPendaftarDiterima: number | null;
  tahunAjaran: string | null;
  tarifTahunan: number | null;
}

// Ringkasan untuk SISWA
export interface DashboardSiswa {
  biodata: {
    nama: string;
    kelas: string;
    wali: string;
  };
  nilaiRata: number | null;
  persentaseAbsensi: string;
  tarif?: string;
  statusPembayaran?: string;

  pembayaranTerakhir?: {
    id_pembayaran: number;
    jumlahBayar: number;
    metode: string | null;
    tanggal: string;
    keterangan: string | null;
    tahunAjaran: { namaTahun: string };
    tarif: { nominal: number; keterangan: string | null } | null;
  };
}
