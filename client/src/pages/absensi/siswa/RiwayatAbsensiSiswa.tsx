// src/pages/absensi/siswa/RiwayatAbsensiSiswa.tsx
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Award,
  BarChart3,
  ChevronDown,
  TrendingUp,
} from "lucide-react";
import { AbsensiService } from "@/services/absensi.service";
import type { SiswaRiwayat } from "@/types/absensi.types";

type ViewMode = "harian" | "mapel";

interface RekapMapelItem {
  siswa: { id_siswa: number; nis: string; nama: string };
  mataPelajaran: {
    id: number;
    namaMapel: string;
    guru: string;
    kelas: string;
  };
  pertemuanList: Array<{
    id_absensi_pertemuan: number;
    pertemuanKe: number;
    tanggal: string;
    jamMulai: string;
    jamSelesai: string;
    materi: string | null;
    status: string | null;
    keterangan: string | null;
  }>;
  stats: {
    totalPertemuan: number;
    sudahAbsen: number;
    belumAbsen: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
  };
  persentaseKehadiran: number;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType; iconColor: string }
> = {
  HADIR: {
    label: "Hadir",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
    iconColor: "text-emerald-500",
  },
  SAKIT: {
    label: "Sakit",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: AlertCircle,
    iconColor: "text-blue-500",
  },
  IZIN: {
    label: "Izin",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock,
    iconColor: "text-amber-500",
  },
  TIDAK_HADIR: {
    label: "Alpha",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
    iconColor: "text-red-500",
  },
};

export default function RiwayatAbsensiSiswa() {
  const [riwayat, setRiwayat] = useState<SiswaRiwayat | null>(null);
  const [rekapMapel] = useState<RekapMapelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMapel, setLoadingMapel] = useState(false);
  const [selectedView, setSelectedView] = useState<ViewMode>("harian");
  const [expandedMapel, setExpandedMapel] = useState<number | null>(null);

  const getSiswaId = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user.siswaId as number | null;
  };

  const fetchRiwayatHarian = useCallback(async () => {
    const siswaId = getSiswaId();
    if (!siswaId) {
      toast.error("Sesi habis, silakan login ulang");
      setLoading(false);
      return;
    }
    try {
      const res = await AbsensiService.getSiswaAbsensi(siswaId);
      if (res.success) setRiwayat(res.data);
    } catch {
      toast.error("Gagal memuat data absensi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiwayatHarian();
  }, [fetchRiwayatHarian]);

  const handleSwitchView = async (view: ViewMode) => {
    setSelectedView(view);
    if (view === "mapel" && rekapMapel.length === 0) {
      // Belum ada data, ambil rekap per mapel
      // Untuk ini kita butuh guruMapelId per siswa — endpoint yang tersedia adalah
      // /absensi/pertemuan/siswa/:siswaId/mapel/:guruMapelId
      // Kita gunakan getAbsensiByGuruMapel per guruMapel yang diikuti siswa
      // Namun karena tidak ada endpoint "list guruMapel yang diikuti siswa",
      // kita perlu menggunakan data dari riwayat harian sebagai fallback
      // dan menampilkan pesan bahwa fitur ini memerlukan data dari guru.
      setLoadingMapel(false);
      // Tampilkan placeholder — rekap per mapel memerlukan endpoint khusus
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Memuat data absensi...</p>
        </div>
      </div>
    );
  }

  if (!riwayat) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Data absensi tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const { stats, persentaseKehadiran, siswa } = riwayat;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900">Riwayat Kehadiran</h1>
        <p className="text-gray-500 mt-1">
          {siswa.nama} ·{" "}
          <span className="font-mono text-purple-600">{siswa.nis}</span>
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            icon: CheckCircle,
            label: "Hadir",
            value: stats.hadir,
            gradient: "from-emerald-500 to-green-600",
            sub: `${persentaseKehadiran}% kehadiran`,
          },
          {
            icon: AlertCircle,
            label: "Sakit",
            value: stats.sakit,
            gradient: "from-blue-500 to-indigo-600",
            sub: "Hari tidak masuk",
          },
          {
            icon: Clock,
            label: "Izin",
            value: stats.izin,
            gradient: "from-amber-500 to-orange-600",
            sub: "Kali izin",
          },
          {
            icon: XCircle,
            label: "Alpha",
            value: stats.alpha,
            gradient: "from-red-500 to-rose-600",
            sub: "Tanpa keterangan",
          },
        ].map(({ icon: Icon, label, value, gradient, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -3, boxShadow: "0 12px 24px rgba(0,0,0,0.15)" }}
            className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 text-white shadow-md relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-5 -mt-5" />
            <div className="relative">
              <Icon className="w-6 h-6 mb-2 opacity-90" />
              <p className="text-white/80 text-xs font-medium mb-0.5">{label}</p>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-white/70 text-xs mt-1">{sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Achievement Banner */}
      {persentaseKehadiran >= 90 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-5 mb-6 text-white shadow-lg"
        >
          <div className="flex items-center gap-4">
            <Award className="w-10 h-10 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold">🎉 Prestasi Luar Biasa!</h3>
              <p className="text-white/90 text-sm">
                Kehadiran mencapai{" "}
                <strong>{persentaseKehadiran}%</strong> — Terus pertahankan!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Toggle View */}
      <div className="flex gap-1.5 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 mb-5">
        {(["harian", "mapel"] as ViewMode[]).map((view) => (
          <button
            key={view}
            onClick={() => handleSwitchView(view)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              selectedView === view
                ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {view === "harian" ? (
              <>
                <Calendar className="w-4 h-4" />
                Riwayat Harian
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                Per Mata Pelajaran
              </>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ============================================================
            VIEW: HARIAN
        ============================================================ */}
        {selectedView === "harian" && (
          <motion.div
            key="harian"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Riwayat Absensi Harian
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {riwayat.absensi.length} catatan kehadiran
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="font-bold text-purple-600">{persentaseKehadiran}%</span>
              </div>
            </div>

            {riwayat.absensi.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada catatan absensi</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {riwayat.absensi.map((absensi, index) => {
                  const cfg = STATUS_CONFIG[absensi.status] || STATUS_CONFIG.TIDAK_HADIR;
                  const StatusIcon = cfg.icon;
                  return (
                    <motion.div
                      key={absensi.id_absensi}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`w-5 h-5 flex-shrink-0 ${cfg.iconColor}`} />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {new Date(absensi.tanggal).toLocaleDateString(
                              "id-ID",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                          {absensi.keterangan && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {absensi.keterangan}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex-shrink-0 ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ============================================================
            VIEW: PER MATA PELAJARAN
        ============================================================ */}
        {selectedView === "mapel" && (
          <motion.div
            key="mapel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {loadingMapel ? (
              <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
                <div className="w-10 h-10 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500">Memuat rekap per mata pelajaran...</p>
              </div>
            ) : rekapMapel.length === 0 ? (
              /* ---------- Rekap dari absensi harian dikelompokkan per "hari" ---------- */
              /* Karena tidak ada endpoint list guruMapel siswa, tampilkan ringkasan
                 absensi harian yang sudah ada dalam format yang lebih kaya */
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-sm text-purple-700">
                  <p className="font-semibold mb-1">ℹ️ Rekap Ringkasan Kehadiran</p>
                  <p className="text-purple-600">
                    Data rekap per mata pelajaran dihitung dari absensi harian.
                    Untuk detail per mapel, minta konfirmasi kepada wali kelas.
                  </p>
                </div>

                {/* Ringkasan visual dari stats yang ada */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Ringkasan Kehadiran Keseluruhan
                  </h3>

                  {/* Progress bar kehadiran */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Persentase Kehadiran</span>
                      <span className="text-sm font-bold text-purple-600">{persentaseKehadiran}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${persentaseKehadiran}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {stats.hadir} hadir dari {stats.total} total catatan
                    </p>
                  </div>

                  {/* Detail stats */}
                  <div className="space-y-3">
                    {[
                      { label: "Hadir", value: stats.hadir, total: stats.total, color: "emerald" },
                      { label: "Sakit", value: stats.sakit, total: stats.total, color: "blue" },
                      { label: "Izin", value: stats.izin, total: stats.total, color: "amber" },
                      { label: "Alpha", value: stats.alpha, total: stats.total, color: "red" },
                    ].map((item) => {
                      const pct = item.total > 0 ? (item.value / item.total) * 100 : 0;
                      return (
                        <div key={item.label}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                            <span className={`text-sm font-bold text-${item.color}-600`}>
                              {item.value} hari
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
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

                {/* Catatan bulanan dari riwayat */}
                {(() => {
                  // Kelompokkan absensi per bulan
                  const byMonth: Record<string, typeof riwayat.absensi> = {};
                  riwayat.absensi.forEach((a) => {
                    const key = new Date(a.tanggal).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                    });
                    if (!byMonth[key]) byMonth[key] = [];
                    byMonth[key].push(a);
                  });

                  return Object.entries(byMonth).map(([bulan, records]) => {
                    const hadir = records.filter((r) => r.status === "HADIR").length;
                    const pct = records.length > 0 ? Math.round((hadir / records.length) * 100) : 0;
                    return (
                      <motion.div
                        key={bulan}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            setExpandedMapel(
                              expandedMapel === bulan.length ? null : bulan.length,
                            )
                          }
                          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="text-left">
                              <p className="font-semibold text-gray-900">{bulan}</p>
                              <p className="text-xs text-gray-500">{records.length} catatan</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-bold ${pct >= 80 ? "text-emerald-600" : pct >= 60 ? "text-amber-600" : "text-red-600"}`}>
                              {pct}%
                            </span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          </div>
                        </button>

                        <div className="px-4 pb-3">
                          <div className="grid grid-cols-4 gap-2 text-center text-xs">
                            {[
                              { label: "Hadir", value: hadir, cls: "text-emerald-600" },
                              { label: "Sakit", value: records.filter((r) => r.status === "SAKIT").length, cls: "text-blue-600" },
                              { label: "Izin", value: records.filter((r) => r.status === "IZIN").length, cls: "text-amber-600" },
                              { label: "Alpha", value: records.filter((r) => r.status === "TIDAK_HADIR").length, cls: "text-red-600" },
                            ].map((s) => (
                              <div key={s.label} className="bg-gray-50 rounded-lg p-2">
                                <p className={`font-bold text-base ${s.cls}`}>{s.value}</p>
                                <p className="text-gray-500">{s.label}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  });
                })()}
              </div>
            ) : (
              /* Rekap dari API per guruMapel */
              rekapMapel.map((item, index) => (
                <motion.div
                  key={item.mataPelajaran.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900">{item.mataPelajaran.namaMapel}</p>
                        <p className="text-sm text-gray-500">
                          {item.mataPelajaran.guru} · Kelas {item.mataPelajaran.kelas}
                        </p>
                      </div>
                      <span className={`text-lg font-bold ${item.persentaseKehadiran >= 80 ? "text-emerald-600" : item.persentaseKehadiran >= 60 ? "text-amber-600" : "text-red-600"}`}>
                        {item.persentaseKehadiran}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                      <div
                        className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all"
                        style={{ width: `${item.persentaseKehadiran}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      {[
                        { label: "Hadir", value: item.stats.hadir, cls: "text-emerald-600" },
                        { label: "Sakit", value: item.stats.sakit, cls: "text-blue-600" },
                        { label: "Izin", value: item.stats.izin, cls: "text-amber-600" },
                        { label: "Alpha", value: item.stats.alpha, cls: "text-red-600" },
                      ].map((s) => (
                        <div key={s.label} className="bg-gray-50 rounded-lg p-2">
                          <p className={`font-bold text-base ${s.cls}`}>{s.value}</p>
                          <p className="text-gray-500">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {item.stats.sudahAbsen}/{item.stats.totalPertemuan} pertemuan
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
