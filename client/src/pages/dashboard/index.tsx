import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import CardStat from "./components/CardStat";
import {
  getDashboardSummary,
  getDashboardSiswa,
} from "./services/dashboardService";
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
} from "lucide-react";
import type {
  CardStatProps,
  User,
  DashboardSummary,
  DashboardSiswa,
} from "./types";

const DashboardPageIndex: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [siswaData, setSiswaData] = useState<DashboardSiswa | null>(null);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      getDashboardSummary()
        .then((data) => setSummary(data))
        .catch((err) => console.error(err));
    } else if (user?.role === "SISWA") {
      getDashboardSiswa()
        .then((data) => setSiswaData(data))
        .catch((err) => console.error(err));
    }
  }, [user]);

  const data: Record<string, CardStatProps[]> = {
    ADMIN: [
      {
        title: "Pendaftar Baru",
        value: summary?.totalPendaftarBaru ?? "-",
        description: "Menunggu verifikasi",
        icon: <ClipboardList className="text-blue-600" />,
        color: "blue",
      },
      {
        title: "Total Siswa Aktif",
        value: summary?.totalSiswa ?? "-",
        description: "Data siswa aktif",
        icon: <Users className="text-green-600" />,
        color: "green",
      },
      {
        title: "Total Guru",
        value: summary?.totalGuru ?? "-",
        description: "Data guru aktif",
        icon: <BookOpen className="text-yellow-600" />,
        color: "yellow",
      },
      {
        title: "Total Kelas",
        value: summary?.totalKelas ?? "-",
        description: "Jumlah kelas",
        icon: <Calendar className="text-green-500" />,
        color: "green",
      },
      {
        title: "Tahun Ajaran Aktif",
        value: summary?.tahunAjaran ?? "-",
        description: "Informasi tahun ajaran",
        icon: <Calendar className="text-blue-500" />,
        color: "blue",
      },
      {
        title: "Tarif Tahunan",
        value: summary?.tarifTahunan
          ? `Rp ${summary.tarifTahunan.toLocaleString("id-ID")}`
          : "-",
        description: "Dapat diubah tiap tahun",
        icon: <DollarSign className="text-red-500" />,
        color: "red",
      },

      {
        title: "Pengumuman",
        value: "5",
        description: "Pengumuman terbaru",
        icon: <Bell className="text-green-600" />,
        color: "green",
      },
      {
        title: "Laporan",
        value: "→",
        description: "Rekap absensi, nilai, data siswa",
        icon: <FileText className="text-yellow-500" />,
        color: "yellow",
      },
    ],
    GURU: [
      {
        title: "Kelas yang Diampu",
        value: "3",
        description: "Kelas aktif",
        icon: <Users />,
        color: "green",
      },
      {
        title: "Jadwal Mengajar",
        value: "12",
        description: "Pertemuan minggu ini",
        icon: <Calendar />,
        color: "blue",
      },
      {
        title: "Absensi Harian",
        value: "→",
        description: "Input absensi",
        icon: <UserCheck />,
        color: "red",
      },
      {
        title: "Nilai Rapor",
        value: "→",
        description: "Input nilai",
        icon: <Award />,
        color: "yellow",
      },
      {
        title: "Profil Guru",
        value: user?.name ?? "-",
        description: "Data guru",
        icon: <UserCircle />,
        color: "blue",
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
      },
      {
        title: "Tarif Pendaftaran",
        value: "Rp 500.000",
        description: "Biaya pendaftaran",
        icon: <DollarSign />,
        color: "green",
      },
      {
        title: "Dokumen",
        value: "4",
        description: "Dokumen sudah diupload",
        icon: <FolderOpen />,
        color: "blue",
      },
    ],
    SISWA_DITERIMA: [
      {
        title: "Biodata",
        value: siswaData?.biodata?.nama ?? "-",
        description: `Kelas: ${siswaData?.biodata?.kelas ?? "-"}, Wali: ${
          siswaData?.biodata?.wali ?? "-"
        }`,
        icon: <UserCircle />,
        color: "green",
      },
      {
        title: "Absensi",
        value: siswaData?.persentaseAbsensi ?? "-",
        description: "Kehadiran semester ini",
        icon: <UserCheck />,
        color: "green",
      },
      {
        title: "Nilai Rapor",
        value: siswaData?.nilaiRata ?? "-",
        description: "Rata-rata semester ini",
        icon: <Award />,
        color: "yellow",
      },
      {
        title: "Tarif Tahunan",
        value:
          siswaData?.statusPembayaran === "LUNAS"
            ? "Lunas"
            : siswaData?.tarif
            ? `Rp ${siswaData.tarif.toLocaleString("id-ID")}`
            : "-",
        description: "Biaya sekolah sesuai tahun ajaran aktif",
        icon: <DollarSign className="text-red-500" />,
        color: siswaData?.statusPembayaran === "LUNAS" ? "green" : "red",
      },
      {
        title: "Pembayaran Terakhir",
        value: siswaData?.pembayaranTerakhir
          ? `Rp ${siswaData.pembayaranTerakhir.jumlahBayar.toLocaleString(
              "id-ID"
            )}`
          : "-",
        description: siswaData?.pembayaranTerakhir
          ? `${siswaData.pembayaranTerakhir.metode ?? "-"} | ${
              siswaData.pembayaranTerakhir.tahunAjaran?.namaTahun ?? "-"
            }`
          : "Belum ada pembayaran",
        icon: <DollarSign className="text-green-600" />,
        color: "green",
      },
      {
        title: "Pengumuman & Jadwal",
        value: "5",
        description: "Informasi terbaru",
        icon: <Bell />,
        color: "blue",
      },
    ],
  };

  let cardsToShow: CardStatProps[] = [];
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

export default DashboardPageIndex;
