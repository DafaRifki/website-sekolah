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
