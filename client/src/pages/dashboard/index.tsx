// src/pages/dashboard/DashboardPageIndex.tsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import CardStat from "./components/CardStat";
import {
  getDashboardSummary,
  getDashboardSiswa,
  getDashboardGuru,
  getTagihanSummarySiswa,
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
  AlertCircle,
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
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [siswaData, setSiswaData] = useState<DashboardSiswa | null>(null);
  const [guruData, setGuruData] = useState<DashboardGuru | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const hasShownAlert = useRef(false);

  // Ambil user dari localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user:", error);
      }
    }
    setLoading(false);
  }, []);

  // Fetch data dashboard berdasarkan role
  useEffect(() => {
    if (!user || loading) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        if (user.role === "ADMIN") {
          const data = await getDashboardSummary();
          setSummary(data);
        } else if (user.role === "GURU") {
          const data = await getDashboardGuru();
          setGuruData(data);
        } else if (user.role === "SISWA") {
          const [siswaDashboard, tagihanSummary] = await Promise.all([
            getDashboardSiswa(),
            getTagihanSummarySiswa().catch(() => null), // ← Aman kalau endpoint belum ada / error
          ]);

          setSiswaData({
            ...siswaDashboard,
            tagihanSummary: tagihanSummary || {
              totalSisaPembayaran: 0,
              jumlahTagihanBelumLunas: 0,
              tagihanTerbaru: null,
            },
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); // ← Hanya depend on user, TIDAK pada loading!

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  // Efek untuk menampilkan notifikasi tagihan jika ada tagihan belum lunas (hanya untuk SISWA)
  useEffect(() => {
    if (
      user?.role === "SISWA" &&
      siswaData?.tagihanSummary &&
      !loading &&
      !hasShownAlert.current
    ) {
      // Jika siswa sudah diterima (bukan pending verifikasi)
      // atau logika ini juga berlaku untuk siswa pending jika mereka punya tagihan
      const { jumlahTagihanBelumLunas, totalSisaPembayaran } =
        siswaData.tagihanSummary;

      if (jumlahTagihanBelumLunas > 0) {
        hasShownAlert.current = true;
        Swal.fire({
          title: "Pembayaran Tertunggak",
          text: `Halo ${
            siswaData.biodata?.nama || "Siswa"
          }, Anda memiliki ${jumlahTagihanBelumLunas} tagihan belum lunas sebesar ${formatRupiah(
            totalSisaPembayaran
          )}.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Lihat Detail",
          cancelButtonText: "Tutup",
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/dashboard/tagihan");
          }
        });
      }
    }
  }, [user, siswaData, loading, navigate]);

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
        value: summary?.tarifTahunan ? formatRupiah(summary.tarifTahunan) : "-",
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
        value: guruData?.isWaliKelas ? "1" : "0",
        description: guruData?.waliKelas?.kelas.namaKelas ?? "Tidak ada",
        icon: <Users className="text-green-600" />,
        color: "green",
      },
      {
        title: "Jadwal Mengajar",
        value: "-",
        description: "Pertemuan minggu ini",
        icon: <Calendar className="text-blue-600" />,
        color: "blue",
      },
      {
        title: "Absensi Harian",
        value: guruData?.waliKelas?.statistics?.attendanceToday?.pending ?? "0",
        description: "Input absensi",
        icon: <UserCheck className="text-red-600" />,
        color: "red",
      },
      {
        title: "Profil Guru",
        value: guruData?.guru?.nama ?? user?.name ?? "-",
        description: guruData?.guru?.jabatan ?? "Guru",
        icon: <UserCircle className="text-blue-600" />,
        color: "blue",
      },
      ...(guruData?.isWaliKelas
        ? [
            {
              title: "Daftar Siswa",
              value: guruData?.waliKelas?.statistics.totalSiswa ?? "0",
              description: `Siswa di ${guruData.waliKelas?.kelas.namaKelas}`,
              icon: <Users className="text-green-600" />,
              color: "green",
            },
            {
              title: "Masalah Absensi",
              value: guruData.waliKelas?.statistics.lowAttendanceCount ?? "0",
              description: "Siswa kehadiran < 75%",
              icon: <FolderOpen className="text-red-600" />,
              color: "red",
            },
            {
              title: "Nilai Rata-rata Kelas",
              value: guruData.waliKelas?.statistics.nilaiAverage ?? "0",
              description: "Rata-rata semua mapel",
              icon: <FileText className="text-yellow-600" />,
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
        icon: <AlertCircle className="text-red-600" />,
        color: "red",
      },
      {
        title: "Tarif Pendaftaran",
        value: "Rp 500.000",
        description: "Biaya pendaftaran",
        icon: <DollarSign className="text-green-600" />,
        color: "green",
      },
      {
        title: "Dokumen",
        value: "4",
        description: "Dokumen sudah diupload",
        icon: <FolderOpen className="text-blue-600" />,
        color: "blue",
      },
    ],
    SISWA_DITERIMA: [
      {
        title: "Biodata",
        value: siswaData?.biodata?.nama ?? "-",
        description: `Kelas: ${siswaData?.biodata?.kelas ?? "-"} • Wali: ${
          siswaData?.biodata?.wali ?? "-"
        }`,
        icon: <UserCircle className="text-green-600" />,
        color: "green",
      },
      {
        title: "Absensi",
        value: siswaData?.persentaseAbsensi ?? "0%",
        description: "Kehadiran semester ini",
        icon: <UserCheck className="text-green-600" />,
        color: "green",
      },
      {
        title: "Nilai Rapor",
        value: siswaData?.nilaiRata ? siswaData.nilaiRata.toFixed(1) : "-",
        description: "Rata-rata semester ini",
        icon: <Award className="text-yellow-600" />,
        color: "yellow",
      },

      // CARD: Tagihan Belum Lunas
      {
        title: "Tagihan Belum Lunas",
        value: siswaData?.tagihanSummary?.jumlahTagihanBelumLunas ?? 0,
        description:
          siswaData?.tagihanSummary?.totalSisaPembayaran > 0
            ? `Sisa: ${formatRupiah(
                siswaData.tagihanSummary.totalSisaPembayaran
              )}`
            : "Semua lunas!",
        icon: (
          <DollarSign
            className={
              siswaData?.tagihanSummary?.totalSisaPembayaran > 0
                ? "text-red-600"
                : "text-green-600"
            }
          />
        ),
        color:
          siswaData?.tagihanSummary?.totalSisaPembayaran > 0 ? "red" : "green",
      },

      // CARD: Tagihan Terbaru
      {
        title: "Tagihan Terbaru",
        value:
          siswaData?.tagihanSummary?.tagihanTerbaru?.namaTagihan ?? "Tidak ada",
        description: siswaData?.tagihanSummary?.tagihanTerbaru
          ? `${
              siswaData.tagihanSummary.tagihanTerbaru.bulan
                ? siswaData.tagihanSummary.tagihanTerbaru.bulan + " • "
                : ""
            }${
              siswaData.tagihanSummary.tagihanTerbaru.tahunAjaran
            } • Sisa: ${formatRupiah(
              siswaData.tagihanSummary.tagihanTerbaru.sisa
            )}`
          : "Semua tagihan sudah lunas",
        icon: <FileText className="text-orange-600" />,
        color: "orange",
      },

      // CARD: Pembayaran Terakhir (dari data lama)
      {
        title: "Pembayaran Terakhir",
        value: siswaData?.pembayaranTerakhir
          ? formatRupiah(siswaData.pembayaranTerakhir.jumlahBayar)
          : "-",
        description: siswaData?.pembayaranTerakhir
          ? `${new Date(
              siswaData.pembayaranTerakhir.tanggal
            ).toLocaleDateString("id-ID")} • ${
              siswaData.pembayaranTerakhir.metode ?? "-"
            }`
          : "Belum ada riwayat",
        icon: <DollarSign className="text-green-600" />,
        color: "green",
      },

      {
        title: "Pengumuman",
        value: "0",
        description: "Pengumuman terbaru",
        icon: <Bell className="text-blue-500" />,
        color: "blue",
      },
    ],
  };

  let cardsToShow: CardStatProps[] = [];
  if (user?.role === "ADMIN") cardsToShow = data.ADMIN;
  else if (user?.role === "GURU") cardsToShow = data.GURU;
  else if (user?.role === "SISWA") {
    cardsToShow =
      user.statusPendaftaran === "PENDING_VERIFIKASI"
        ? data.SISWA_PENDING
        : data.SISWA_DITERIMA;
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
        <span className="ml-4 text-lg text-gray-600">Memuat dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-green-700">
          Dashboard {user?.role}
        </h1>
        <p className="text-gray-600 mt-2">
          Selamat datang,{" "}
          <span className="font-semibold text-green-700">
            {user?.role === "GURU"
              ? guruData?.guru?.nama ?? user?.name
              : user?.role === "SISWA"
              ? siswaData?.biodata?.nama ?? user?.name
              : user?.name ?? "-"}
          </span>
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cardsToShow.map((item, idx) => (
          <CardStat key={idx} {...item} />
        ))}
      </div>

      {user?.role === "SISWA" &&
        user.statusPendaftaran === "PENDING_VERIFIKASI" && (
          <div className="mt-8 p-6 border-2 border-yellow-400 bg-yellow-50 rounded-xl text-yellow-800 flex items-start gap-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0" />
            <p className="text-sm">
              Silakan datang ke sekolah untuk menyerahkan dokumen fisik &
              melakukan pembayaran pendaftaran.
            </p>
          </div>
        )}
    </div>
  );
};

export default DashboardPageIndex;
