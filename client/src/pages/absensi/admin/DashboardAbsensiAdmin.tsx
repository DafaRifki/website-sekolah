// src/pages/absensi/admin/DashboardAbsensiAdmin.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle,
  Activity,
  BookOpen,
  GraduationCap,
  RefreshCw,
  CheckCircle,
  XCircle,
  BarChart3,
  Download,
} from "lucide-react";
import { AbsensiService } from "@/services/absensi.service";
import type { DashboardAdmin, ClassAttendance } from "@/types/absensi.types";

interface GuruTeachingData {
  guru: { id_guru: number; nama: string; nip: string };
  totalJadwal: number;
  totalPertemuan: number;
  jadwal: Array<{
    mapel: string;
    kelas: string;
    totalSiswa: number;
    jadwal: {
      id_jadwal: number;
      guruMapelId: number; // Tambahkan ini
      jamMulai: string;
      jamSelesai: string;
      ruangan: string | null;
    };
    pertemuan: {
      id_absensi_pertemuan: number;
      pertemuanKe: number;
      statusPertemuan: string;
      materi: string | null;
      sudahAbsen: number;
      belumAbsen: number;
    } | null;
  }>;
}

type TabType = "overview" | "classes" | "teachers";

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ONGOING: "bg-amber-100 text-amber-700 border-amber-200",
  SCHEDULED: "bg-blue-100 text-blue-700 border-blue-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};
const STATUS_LABEL: Record<string, string> = {
  COMPLETED: "✓ Selesai",
  ONGOING: "⏳ Berlangsung",
  SCHEDULED: "📅 Dijadwalkan",
  CANCELLED: "✗ Dibatalkan",
};

export default function DashboardAbsensiAdmin() {
  const [dashboard, setDashboard] = useState<DashboardAdmin | null>(null);
  const [classList, setClassList] = useState<ClassAttendance[]>([]);
  const [guruList, setGuruList] = useState<GuruTeachingData[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingGuru, setLoadingGuru] = useState(true);
  const [selectedTab, setSelectedTab] = useState<TabType>("overview");

  // ✅ FIX: Separate fetch functions WITHOUT useCallback
  const fetchDashboard = async () => {
    setLoadingDashboard(true);
    try {
      console.log("📡 Fetching dashboard...");
      const res = await AbsensiService.getAdminDashboard();
      console.log("✅ Dashboard response:", res);

      if (res.success) {
        setDashboard(res.data);
        toast.success("Dashboard berhasil dimuat");
      } else {
        toast.error("Dashboard tidak berhasil dimuat");
      }
    } catch (error: any) {
      console.error("❌ Dashboard error:", error);
      toast.error(error.response?.data?.message || "Gagal memuat dashboard");
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      console.log("📡 Fetching classes...");
      const res = await AbsensiService.getClassesToday();
      console.log("✅ Classes response:", res);

      if (res.success) {
        setClassList(res.data.kelasList || []);
      }
    } catch (error: any) {
      console.error("❌ Classes error:", error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchGuru = async () => {
    setLoadingGuru(true);
    try {
      console.log("📡 Fetching guru...");
      const res = await AbsensiService.getTeachersToday();
      console.log("✅ Guru response:", res);

      if (res.success) {
        setGuruList(res.data.guruList || []);
      }
    } catch (error: any) {
      console.error("❌ Guru error:", error);
    } finally {
      setLoadingGuru(false);
    }
  };

  // ✅ FIX: fetchAll function that calls all fetches
  const fetchAll = () => {
    fetchDashboard();
    fetchClasses();
    fetchGuru();
  };

  // ✅ FIX: useEffect with empty dependencies - only run once on mount
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount

  const handleDownloadExcel = async (guruMapelId: number) => {
    try {
      toast.promise(AbsensiService.downloadMapelAbsensiExcel(guruMapelId), {
        loading: "Menyiapkan file Excel...",
        success: "File Excel berhasil diunduh",
        error: (err) => err.message || "Gagal mengunduh file Excel",
      });
    } catch (error: any) {
      console.error("❌ Download error:", error);
    }
  };

  // ---- Sub-components ----
  const StatCard = ({
    icon: Icon,
    label,
    value,
    subtitle,
    gradient,
    badge,
  }: {
    icon: React.ElementType;
    label: string;
    value: number | string;
    subtitle?: string;
    gradient: string;
    badge?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: "0 12px 28px rgba(0,0,0,0.12)" }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {badge !== undefined && (
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${gradient} text-white`}>
              {badge}%
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-gray-500 mb-0.5">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "classes", label: "Per Kelas", icon: BookOpen },
    { id: "teachers", label: "Guru Mengajar", icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-teal-50/20 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Absensi
          </h1>
          <p className="text-gray-500 flex items-center gap-1.5 mt-1">
            <Calendar className="w-4 h-4" />
            {dashboard
              ? new Date(dashboard.tanggal).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-emerald-300 text-gray-600 hover:text-emerald-600 rounded-xl font-medium shadow-sm transition-all">
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh</span>
        </motion.button>
      </motion.div>

      {/* Tab Navigation */}
      <div className="mb-5 flex gap-1.5 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              selectedTab === tab.id
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}>
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ============================================================
            TAB: OVERVIEW
        ============================================================ */}
        {selectedTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5">
            {loadingDashboard ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse h-32"
                  />
                ))}
              </div>
            ) : dashboard ? (
              <>
                {/* Stats Utama */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={Users}
                    label="Total Siswa Aktif"
                    value={dashboard.absensiHarian.totalSiswa}
                    subtitle="Siswa terdaftar aktif"
                    gradient="from-blue-500 to-blue-600"
                  />
                  <StatCard
                    icon={UserCheck}
                    label="Sudah Absen"
                    value={dashboard.absensiHarian.sudahAbsen}
                    subtitle={`${dashboard.absensiHarian.belumAbsen} belum absen`}
                    gradient="from-emerald-500 to-teal-600"
                    badge={String(dashboard.persentaseAbsensiComplete)}
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Total Hadir"
                    value={dashboard.absensiHarian.hadir}
                    subtitle="Siswa hadir hari ini"
                    gradient="from-green-500 to-emerald-600"
                    badge={String(dashboard.persentaseKehadiran)}
                  />
                  <StatCard
                    icon={UserX}
                    label="Tidak Hadir"
                    value={
                      dashboard.absensiHarian.sakit +
                      dashboard.absensiHarian.izin +
                      dashboard.absensiHarian.alpha
                    }
                    subtitle={`S: ${dashboard.absensiHarian.sakit}  I: ${dashboard.absensiHarian.izin}  A: ${dashboard.absensiHarian.alpha}`}
                    gradient="from-red-500 to-rose-600"
                  />
                </div>

                {/* Progress Kehadiran */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    Distribusi Kehadiran Hari Ini
                  </h2>
                  <div className="space-y-3">
                    {[
                      {
                        label: "Hadir",
                        value: dashboard.absensiHarian.hadir,
                        color: "emerald",
                        icon: CheckCircle,
                      },
                      {
                        label: "Sakit",
                        value: dashboard.absensiHarian.sakit,
                        color: "blue",
                        icon: AlertCircle,
                      },
                      {
                        label: "Izin",
                        value: dashboard.absensiHarian.izin,
                        color: "amber",
                        icon: Clock,
                      },
                      {
                        label: "Alpha",
                        value: dashboard.absensiHarian.alpha,
                        color: "red",
                        icon: XCircle,
                      },
                    ].map((item) => {
                      const pct =
                        dashboard.absensiHarian.totalSiswa > 0
                          ? (item.value / dashboard.absensiHarian.totalSiswa) *
                            100
                          : 0;
                      return (
                        <div key={item.label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                              <item.icon
                                className={`w-4 h-4 text-${item.color}-500`}
                              />
                              {item.label}
                            </span>
                            <span
                              className={`text-sm font-bold text-${item.color}-600`}>
                              {item.value}{" "}
                              <span className="text-gray-400 font-normal">
                                ({pct.toFixed(1)}%)
                              </span>
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={`h-full bg-gradient-to-r from-${item.color}-400 to-${item.color}-600 rounded-full`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pertemuan Stats */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    Statistik Pertemuan Hari Ini
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      {
                        label: "Total Pertemuan",
                        value: dashboard.pertemuan.totalPertemuan,
                        color: "bg-blue-50 border-blue-200 text-blue-700",
                      },
                      {
                        label: "Guru Mengajar",
                        value: dashboard.pertemuan.guruMengajar,
                        color: "bg-purple-50 border-purple-200 text-purple-700",
                      },
                      {
                        label: "Berlangsung",
                        value: dashboard.pertemuan.ongoing,
                        color: "bg-amber-50 border-amber-200 text-amber-700",
                      },
                      {
                        label: "Selesai",
                        value: dashboard.pertemuan.completed,
                        color:
                          "bg-emerald-50 border-emerald-200 text-emerald-700",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`text-center p-4 rounded-xl border ${item.color}`}>
                        <p className="text-3xl font-bold">{item.value}</p>
                        <p className="text-xs font-medium mt-1">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Gagal memuat data dashboard</p>
                <button
                  onClick={fetchDashboard}
                  className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                  Coba Lagi
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ============================================================
            TAB: PER KELAS
        ============================================================ */}
        {selectedTab === "classes" && (
          <motion.div
            key="classes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Kehadiran Per Kelas
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Monitoring kehadiran seluruh kelas hari ini
                </p>
              </div>
              {!loadingClasses && (
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {classList.length} kelas
                </span>
              )}
            </div>

            {loadingClasses ? (
              <div className="divide-y divide-gray-100">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-5 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-1/4 mb-4" />
                    <div className="grid grid-cols-4 gap-3">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="h-14 bg-gray-100 rounded-lg" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : classList.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Tidak ada data kelas</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {classList.map((kelas, index) => {
                  const pct = kelas.persentaseKehadiran;
                  const pctColor =
                    pct >= 80
                      ? "text-emerald-600"
                      : pct >= 60
                        ? "text-amber-600"
                        : "text-red-600";
                  return (
                    <motion.div
                      key={kelas.id_kelas}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">
                            {kelas.namaKelas}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Wali Kelas: {kelas.waliKelas || "–"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${pctColor}`}>
                            {pct}%
                          </p>
                          <p className="text-xs text-gray-400">Kehadiran</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{
                            duration: 0.7,
                            ease: "easeOut",
                            delay: index * 0.04,
                          }}
                          className={`h-full rounded-full ${
                            pct >= 80
                              ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                              : pct >= 60
                                ? "bg-gradient-to-r from-amber-400 to-amber-600"
                                : "bg-gradient-to-r from-red-400 to-red-600"
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {[
                          {
                            label: "Hadir",
                            value: kelas.stats.hadir,
                            cls: "bg-emerald-50 text-emerald-700",
                          },
                          {
                            label: "Sakit",
                            value: kelas.stats.sakit,
                            cls: "bg-blue-50 text-blue-700",
                          },
                          {
                            label: "Izin",
                            value: kelas.stats.izin,
                            cls: "bg-amber-50 text-amber-700",
                          },
                          {
                            label: "Alpha",
                            value: kelas.stats.alpha,
                            cls: "bg-red-50 text-red-700",
                          },
                        ].map((s) => (
                          <div
                            key={s.label}
                            className={`text-center p-2.5 rounded-lg ${s.cls}`}>
                            <p className="text-lg font-bold">{s.value}</p>
                            <p className="text-xs">{s.label}</p>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-gray-400 mt-2">
                        {kelas.stats.sudahAbsen}/{kelas.stats.totalSiswa} siswa
                        sudah absen · {kelas.stats.belumAbsen} belum
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ============================================================
            TAB: GURU MENGAJAR
        ============================================================ */}
        {selectedTab === "teachers" && (
          <motion.div
            key="teachers"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Guru Mengajar Hari Ini
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Status pertemuan per guru
                </p>
              </div>
              {!loadingGuru && (
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {guruList.length} guru
                </span>
              )}
            </div>

            {loadingGuru ? (
              <div className="divide-y divide-gray-100">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-5 animate-pulse">
                    <div className="flex gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : guruList.length === 0 ? (
              <div className="p-12 text-center">
                <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  Tidak ada guru yang mengajar hari ini
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {guruList.map((item, index) => (
                  <motion.div
                    key={item.guru.id_guru}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {item.guru.nama.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">
                          {item.guru.nama}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.guru.nip || "NIP tidak tersedia"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {item.jadwal.map((j) => (
                        <div
                          key={j.jadwal.id_jadwal}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {j.mapel} – Kelas {j.kelas}
                            </p>
                            <p className="text-xs text-gray-500">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {j.jadwal.jamMulai} – {j.jadwal.jamSelesai}
                              {j.jadwal.ruangan && ` · ${j.jadwal.ruangan}`}
                            </p>
                            {j.pertemuan?.materi && (
                              <p className="text-xs text-indigo-600 mt-0.5 truncate">
                                📖 {j.pertemuan.materi}
                              </p>
                            )}
                          </div>
                          <div className="ml-3 flex-shrink-0">
                            {j.pertemuan ? (
                              <div>
                                <span
                                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold whitespace-nowrap ${STATUS_COLOR[j.pertemuan.statusPertemuan] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                                  {STATUS_LABEL[j.pertemuan.statusPertemuan] ||
                                    j.pertemuan.statusPertemuan}
                                </span>
                                <p className="text-xs text-gray-400 text-right mt-1">
                                  {j.pertemuan.sudahAbsen}/{j.totalSiswa} siswa
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs px-2.5 py-1 rounded-lg border bg-gray-100 text-gray-500 border-gray-200 font-semibold">
                                Belum Input
                              </span>
                            )}
                             <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadExcel(j.jadwal.guruMapelId);
                              }}
                              className="ml-2 p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Download Excel Rekap Mapel"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
