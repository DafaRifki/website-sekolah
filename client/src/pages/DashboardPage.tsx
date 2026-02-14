import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  Calendar,
  Bell,
  FileText,
  Award,
  ClipboardList,
  UserCheck,
  DollarSign,
  FolderOpen,
  UserCircle,
  PieChart,
} from "lucide-react";
import { useOutletContext, useNavigate } from "react-router-dom";
import apiClient from "@/config/axios";

interface User {
  name: string;
  email: string;
  role: "ADMIN" | "GURU" | "SISWA";
  statusPendaftaran?: "PENDING_VERIFIKASI" | "DITERIMA"; // khusus siswa
  isWaliKelas?: boolean; // khusus guru
}

interface CardStatProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color: string;
  url?: string;
}

const colorMap: Record<string, string> = {
  green: "hover:bg-green-100 active:bg-green-200 text-green-600",
  yellow: "hover:bg-yellow-100 active:bg-yellow-200 text-yellow-600",
  red: "hover:bg-red-100 active:bg-red-200 text-red-600",
  blue: "hover:bg-blue-100 active:bg-blue-200 text-blue-600",
};

const CardStat: React.FC<CardStatProps> = React.memo(
  ({ title, value, description, icon, color, url }) => {
    const navigate = useNavigate();

    return (
      <Card
        onClick={() => url && navigate(url)}
        className={`cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 ${colorMap[color]}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${colorMap[color].split(" ")[2]}`}>
            {value}
          </p>
          <p className="text-xs text-gray-500">{description}</p>
        </CardContent>
      </Card>
    );
  },
);

const DashboardPage: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();

  // Statistik global untuk admin
  const [summary, setSummary] = useState<any>({
    totalSiswa: null,
    totalGuru: null,
    totalKelas: null,
    totalPendaftarBaru: null,
    totalPendaftarDiterima: null,
    tahunAjaran: null,
  });

  useEffect(() => {
    if (user?.role === "ADMIN") {
      apiClient
        .get("/dashboard/summary")
        .then((res) => {
          setSummary(res.data);
        })
        .catch((err) => console.error(err));
    }
  }, [user]);

  const dataSiswa = summary.siswaData || {};

  // Data card per role
  const data = {
    ADMIN: [
      {
        title: "Pendaftar Baru",
        value: summary.totalPendaftarBaru ?? "-",
        description: "Menunggu verifikasi",
        icon: <ClipboardList className="text-blue-600" />,
        color: "blue" as const,
        url: "/siswa-baru/pendaftaran",
      },
      {
        title: "Total Siswa Aktif",
        value: summary.totalSiswa ?? "-",
        description: "Data siswa aktif",
        icon: <Users className="text-green-600" />,
        color: "green" as const,
        url: "/siswa",
      },
      {
        title: "Total Guru",
        value: summary.totalGuru ?? "-",
        description: "Data guru aktif",
        icon: <BookOpen className="text-yellow-600" />,
        color: "yellow" as const,
        url: "/guru",
      },
      {
        title: "Data Kelas",
        value: summary.totalKelas ?? "-",
        description: "Kelas tersedia",
        icon: <PieChart className="text-red-600" />,
        color: "red" as const,
        url: "/kelas",
      },
      {
        title: "Tahun Ajaran Aktif",
        value: summary.tahunAjaran ?? "-",
        description: "Periode akademik",
        icon: <Calendar className="text-green-500" />,
        color: "green" as const,
        url: "/tahun-ajaran",
      },
      {
        title: "Tarif Tahunan",
        value: "Rp 5.000.000",
        description: "Dapat diubah tiap tahun",
        icon: <DollarSign className="text-red-500" />,
        color: "red" as const,
      },
      {
        title: "Pengumuman",
        value: "5",
        description: "Pengumuman terbaru",
        icon: <Bell className="text-green-600" />,
        color: "green" as const,
      },
      {
        title: "Laporan",
        value: "→",
        description: "Rekap absensi, nilai, data siswa",
        icon: <FileText className="text-yellow-500" />,
        color: "yellow" as const,
      },
    ],

    // hardcode sementara untuk guru & siswa
    GURU: [
      {
        title: "Kelas yang Diampu",
        value: "3",
        description: "Kelas aktif",
        icon: <Users />,
        color: "green",
        url: "/kelas",
      },
      {
        title: "Jadwal Mengajar",
        value: "12",
        description: "Pertemuan minggu ini",
        icon: <Calendar />,
        color: "blue",
        url: "/guru/jadwal",
      },
      {
        title: "Absensi Harian",
        value: "→",
        description: "Input absensi",
        icon: <UserCheck />,
        color: "red",
        url: "/absensi",
      },
      {
        title: "Nilai Rapor",
        value: "→",
        description: "Input nilai",
        icon: <Award />,
        color: "yellow",
        url: "/guru/nilai",
      },
      {
        title: "Profil Guru",
        value: user?.name ?? "-",
        description: "Data guru",
        icon: <UserCircle />,
        color: "blue",
        url: "/settings/profile",
      },
      ...(user?.isWaliKelas
        ? [
            {
              title: "Daftar Siswa",
              value: "30",
              description: "Siswa di kelas Anda",
              icon: <Users />,
              color: "green",
            },
            {
              title: "Orang Tua Siswa",
              value: "30",
              description: "Kontak orang tua siswa",
              icon: <FolderOpen />,
              color: "red",
            },
            {
              title: "Rekap Absensi & Nilai",
              value: "→",
              description: "Kelas yang Anda wali",
              icon: <FileText />,
              color: "yellow",
              url: "/e-rapor",
            },
          ]
        : []),
    ],

    SISWA_PENDING: [
      {
        title: "Status Pendaftaran",
        value: "Menunggu",
        description: "Menunggu verifikasi admin",
        icon: <ClipboardList />,
        color: "red",
        url: "/cek-status",
      },
      {
        title: "Tarif Pendaftaran",
        value: "Rp 500.000",
        description: "Biaya pendaftaran",
        icon: <DollarSign />,
        color: "green",
        url: "/cek-status",
      },
      {
        title: "Dokumen",
        value: "4",
        description: "Dokumen sudah diupload",
        icon: <FolderOpen />,
        color: "blue",
        url: "/cek-status",
      },
    ],

    SISWA_DITERIMA: [
      {
        title: "Biodata",
        value: "Lengkap",
        description: "Data pribadi Anda",
        icon: <UserCircle />,
        color: "green",
        url: "/settings/profile",
      },
      {
        title: "Kelas & Wali",
        value: dataSiswa.kelasWali ?? "-",
        description: "Wali kelas",
        icon: <Users />,
        color: "blue",
        url: "/siswa/jadwal",
      },
      {
        title: "Absensi",
        value: "95%",
        description: "Kehadiran semester ini",
        icon: <UserCheck />,
        color: "green",
      },
      {
        title: "Nilai Rapor",
        value: "87",
        description: "Rata-rata semester ini",
        icon: <Award />,
        color: "yellow",
        url: "/siswa/e-rapor",
      },
      {
        title: "Tarif Tahunan",
        value: "Rp 5.000.000",
        description: "Biaya sekolah",
        icon: <DollarSign />,
        color: "red",
        url: "/dashboard/tagihan",
      },
      {
        title: "Pengumuman & Jadwal",
        value: "5",
        description: "Informasi terbaru",
        icon: <Bell />,
        color: "blue",
        url: "/siswa/jadwal",
      },
    ],
  };

  let cardsToShow: any[] = [];
  if (user?.role === "ADMIN") cardsToShow = data.ADMIN;
  else if (user?.role === "GURU") cardsToShow = data.GURU;
  else if (user?.role === "SISWA")
    cardsToShow =
      user.statusPendaftaran === "PENDING_VERIFIKASI"
        ? data.SISWA_PENDING
        : data.SISWA_DITERIMA;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-green-700">
        Dashboard {user?.role}
      </h1>
      <p className="text-gray-500">Selamat datang, {user?.name}</p>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-6">
        {cardsToShow.map((item, idx) => (
          <CardStat key={idx} {...item} />
        ))}
      </div>

      {user?.role === "SISWA" &&
        user.statusPendaftaran === "PENDING_VERIFIKASI" && (
          <div className="mt-6 p-4 border border-yellow-300 bg-yellow-50 rounded-lg text-sm text-yellow-700">
            Silakan datang ke sekolah untuk menyerahkan dokumen fisik &
            melakukan pembayaran.
          </div>
        )}
    </div>
  );
};

export default DashboardPage;
