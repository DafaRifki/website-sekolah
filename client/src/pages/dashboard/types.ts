// Dashboard Types
export interface DashboardSummary {
  totalSiswa: number;
  totalGuru: number;
  totalKelas: number;
  totalPendaftarBaru: number;
  totalPendaftarDiterima: number;
  tahunAjaran: string;
  tarifTahunan: number;
}

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

export interface DashboardGuru {
  guru: {
    id_guru: number;
    nama: string;
    nip: string;
    jabatan: string;
    fotoProfil: string | null;
  };
  tahunAjaran: {
    id_tahun: number;
    namaTahun: string;
    semester: string;
  };
  isWaliKelas: boolean;
  waliKelas: {
    kelas: {
      id_kelas: number;
      namaKelas: string;
      tingkat: number;
    };
    statistics: {
      totalSiswa: number;
      nilaiAverage: number;
      attendanceToday: {
        hadir: number;
        sakit: number;
        izin: number;
        alpha: number;
        total: number;
        inputted: number;
        pending: number;
      };
      outstandingPayments: number;
      lowAttendanceCount: number;
      lowGradesCount: number;
    };
    students: {
      id_siswa: number;
      nama: string;
      nis: string;
      fotoProfil: string | null;
      attendanceRate: string;
      nilaiAverage: number | null;
      outstandingBills: number;
    }[];
    alerts: {
      lowAttendance: {
        id_siswa: number;
        nama: string;
        attendanceRate: number;
      }[];
      lowGrades: {
        id_siswa: number;
        nama: string;
        average: number;
      }[];
    };
  } | null;
  recentActivities: {
    nilai: {
      type: string;
      siswa: string;
      mapel: string;
      nilai: number;
      semester: string;
    }[];
    absensi: {
      type: string;
      siswa: string;
      status: string;
      tanggal: string;
      keterangan: string | null;
    }[];
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "GURU" | "SISWA";
  statusPendaftaran?: "PENDING_VERIFIKASI" | "DITERIMA";
  isWaliKelas?: boolean;
}

export interface CardStatProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// export interface User {
//   name: string;
//   email: string;
//   role: "ADMIN" | "GURU" | "SISWA";
//   statusPendaftaran?: "PENDING_VERIFIKASI" | "DITERIMA"; // khusus siswa
//   isWaliKelas?: boolean; // khusus guru
// }

// export interface CardStatProps {
//   title: string;
//   value: string | number;
//   description: string;
//   icon: React.ReactNode;
//   color: string;
// }

// // Ringkasan untuk ADMIN
// export interface DashboardSummary {
//   totalSiswa: number | null;
//   totalGuru: number | null;
//   totalKelas: number | null;
//   totalPendaftarBaru: number | null;
//   totalPendaftarDiterima: number | null;
//   tahunAjaran: string | null;
//   tarifTahunan: number | null;
// }

// // Ringkasan untuk SISWA
// export interface DashboardSiswa {
//   biodata: {
//     nama: string;
//     kelas: string;
//     wali: string;
//   };
//   nilaiRata: number | null;
//   persentaseAbsensi: string;
//   tarif?: string;
//   statusPembayaran?: string;

//   pembayaranTerakhir?: {
//     id_pembayaran: number;
//     jumlahBayar: number;
//     metode: string | null;
//     tanggal: string;
//     keterangan: string | null;
//     tahunAjaran: { namaTahun: string };
//     tarif: { nominal: number; keterangan: string | null } | null;
//   };
// }
