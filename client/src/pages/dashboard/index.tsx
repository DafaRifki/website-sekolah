import React, { useEffect, useState } from "react";
// import { useOutletContext } from "react-router-dom";
import CardStat from "./components/CardStat";
import {
  getDashboardSummary,
  getDashboardSiswa,
  getDashboardGuru,
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
  DashboardGuru,
} from "./types";

const DashboardPageIndex: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  // const { user } = useOutletContext<{ user: User }>();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [siswaData, setSiswaData] = useState<DashboardSiswa | null>(null);
  const [guruData, setGuruData] = useState<DashboardGuru | null>(null);

  useEffect(() => {
    // get user from localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    if (user.role === "ADMIN") {
      getDashboardSummary()
        .then((data) => setSummary(data))
        .catch((err) => console.error(err));
    } else if (user.role === "SISWA") {
      getDashboardSiswa()
        .then((data) => setSiswaData(data))
        .catch((err) => console.error(err));
    } else if (user.role === "GURU") {
      getDashboardGuru()
        .then((data) => setGuruData(data))
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
        value: guruData?.isWaliKelas ? "1" : "0", // Currently limited to wali kelas logic or simple count
        description: guruData?.waliKelas?.kelas.namaKelas ?? "Tidak ada",
        icon: <Users />,
        color: "green",
      },
      {
        title: "Jadwal Mengajar",
        value: "-", // Api doesn`t provide this yet
        description: "Pertemuan minggu ini",
        icon: <Calendar />,
        color: "blue",
      },
      {
        title: "Absensi Harian",
        value: guruData?.waliKelas?.statistics?.attendanceToday?.pending ?? "0",
        description: "Input absensi",
        icon: <UserCheck />,
        color: "red",
      },
      // {
      //   title: "Nilai Rapor",
      //   value: "→",
      //   description: "Input nilai",
      //   icon: <Award />,
      //   color: "yellow",
      // },
      {
        title: "Profil Guru",
        value: guruData?.guru?.nama ?? user?.name ?? "-",
        description: guruData?.guru?.jabatan ?? "Guru",
        icon: <UserCircle />,
        color: "blue",
      },
      ...(guruData?.isWaliKelas
        ? [
            {
              title: "Daftar Siswa",
              value: guruData?.waliKelas?.statistics.totalSiswa ?? "0",
              description: `Siswa di ${guruData.waliKelas?.kelas.namaKelas}`,
              icon: <Users />,
              color: "green",
            },
            {
              title: "Masalah Absensi",
              value: guruData.waliKelas?.statistics.lowAttendanceCount ?? "0",
              description: "Siswa kehadiran < 75%",
              icon: <FolderOpen />,
              color: "red",
            },
            {
              title: "Nilai Rata-rata Kelas",
              value: guruData.waliKelas?.statistics.nilaiAverage ?? "0",
              description: "Rata-rata semua mapel",
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
        value: siswaData?.persentaseAbsensi ?? "0%",
        description: "Kehadiran semester ini",
        icon: <UserCheck />,
        color: "green",
      },
      {
        title: "Nilai Rapor",
        value: siswaData?.nilaiRata ? siswaData.nilaiRata.toFixed(1) : "-",
        description: "Rata-rata semester ini",
        icon: <Award />,
        color: "yellow",
      },
      {
        title: "Status SPP",
        value:
          siswaData?.statusPembayaran === "LUNAS"
            ? "Lunas"
            : siswaData?.tarif
            ? `Rp ${Number(siswaData.tarif).toLocaleString("id-ID")}`
            : "-",
        description:
          siswaData?.statusPembayaran === "LUNAS"
            ? "Semua tagihan lunas"
            : "Total tagihan belum dibayar",
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
          ? `${new Date(
              siswaData.pembayaranTerakhir.tanggal
            ).toLocaleDateString("id-ID")} | ${
              siswaData.pembayaranTerakhir.metode ?? "-"
            }`
          : "Belum ada riwayat",
        icon: <DollarSign className="text-green-600" />,
        color: "green",
      },
      {
        title: "Pengumuman",
        value: "0", // TODO: Fetch announcement count
        description: "Pengumuman terbaru",
        icon: <Bell className="text-blue-500" />,
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
      <p className="text-gray-500">
        Selamat datang,{" "}
        {user?.role === "GURU"
          ? guruData?.guru?.nama ?? user?.name
          : user?.role === "SISWA"
          ? siswaData?.biodata?.nama ?? user?.name
          : user?.name}
      </p>

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
