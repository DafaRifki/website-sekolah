// src/pages/absensi/guru/DashboardAbsensiGuru.tsx
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  BookOpen,
  Save,
  ChevronLeft,
  AlertCircle,
  XCircle,
  RefreshCw,
  MapPin,
  Pencil,
  BarChart3,
} from "lucide-react";
import { AbsensiService } from "@/services/absensi.service";
import type { GuruJadwal, StatusAbsensi, SiswaAbsensi } from "@/types/absensi.types";

export default function DashboardAbsensiGuru() {
  const [jadwalList, setJadwalList] = useState<GuruJadwal[]>([]);
  const [selectedJadwal, setSelectedJadwal] = useState<GuruJadwal | null>(null);
  const [siswaList, setSiswaList] = useState<SiswaAbsensi[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSiswa, setLoadingSiswa] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pertemuanKe, setPertemuanKe] = useState(1);
  const [materi, setMateri] = useState("");
  const [keteranganGuru, setKeteranganGuru] = useState("");
  const [guruInfo, setGuruInfo] = useState<{ nama: string; guruId: number } | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setGuruInfo({ nama: user.nama || "Guru", guruId: user.guruId });
    }
    fetchJadwalHariIni();
  }, []);

  const fetchJadwalHariIni = useCallback(async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        toast.error("Sesi tidak ditemukan, silakan login ulang");
        return;
      }

      const user = JSON.parse(userStr);
      const guruId = user.guruId;

      if (!guruId) {
        toast.error("ID Guru tidak ditemukan");
        return;
      }

      const response = await AbsensiService.getJadwalGuru(guruId);
      if (response.success) {
        setJadwalList(response.data.jadwal || []);
      }
    } catch (error: any) {
      console.error("Gagal memuat jadwal:", error);
      toast.error("Gagal memuat jadwal mengajar");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectJadwal = async (jadwal: GuruJadwal) => {
    setSelectedJadwal(jadwal);
    setLoadingSiswa(true);
    setSiswaList([]);

    try {
      if (jadwal.absensi?.id_absensi_pertemuan) {
        // ── CASE 1: Pertemuan sudah ada hari ini → ambil detail + status siswa
        const res = await AbsensiService.getPertemuanDetail(
          jadwal.absensi.id_absensi_pertemuan,
        );
        if (res.success && res.data.siswaList) {
          setSiswaList(res.data.siswaList);
          setPertemuanKe(res.data.pertemuan.pertemuanKe);
          setMateri(res.data.pertemuan.materi || "");
          setKeteranganGuru(res.data.pertemuan.keteranganGuru || "");
          setIsEditMode(true);
        } else {
          toast.error("Gagal mengambil data pertemuan");
        }
      } else {
        // ── CASE 2: Belum ada pertemuan hari ini → ambil daftar siswa kelas (fresh)
        const res = await AbsensiService.getAbsensiByGuruMapel(jadwal.guruMapelId);
        if (res.success) {
          // siswaKelas: daftar siswa dengan status null (pertemuan baru)
          const siswaFresh: SiswaAbsensi[] = res.data.siswaKelas || [];
          setSiswaList(siswaFresh);
          // Tentukan nomor pertemuan berikutnya
          const totalPertemuan = res.data.stats?.totalPertemuan ?? 0;
          setPertemuanKe(totalPertemuan + 1);
          setIsEditMode(false);
        } else {
          toast.error("Gagal mengambil daftar siswa");
        }
      }
    } catch (error: any) {
      console.error("Gagal memuat data siswa:", error);
      toast.error(error?.response?.data?.message || "Gagal memuat daftar siswa");
    } finally {
      setLoadingSiswa(false);
    }
  };

  const handleChangeStatus = (siswaId: number, status: StatusAbsensi) => {
    setSiswaList((prev) =>
      prev.map((s) => (s.id_siswa === siswaId ? { ...s, status } : s)),
    );
  };

  const handleChangeKeterangan = (siswaId: number, keterangan: string) => {
    setSiswaList((prev) =>
      prev.map((s) => (s.id_siswa === siswaId ? { ...s, keterangan } : s)),
    );
  };

  const handleSetAllHadir = () => {
    setSiswaList((prev) =>
      prev.map((s) => ({ ...s, status: "HADIR" as StatusAbsensi })),
    );
  };

  const handleSaveAbsensi = async () => {
    if (!selectedJadwal) return;

    const belumDiisi = siswaList.filter((s) => s.status === null);
    if (belumDiisi.length > 0) {
      toast.warning(
        `${belumDiisi.length} siswa belum diisi statusnya. Lanjutkan menyimpan yang sudah diisi?`,
        {
          action: {
            label: "Simpan",
            onClick: () => doSave(),
          },
        },
      );
      return;
    }

    await doSave();
  };

  const doSave = async () => {
    if (!selectedJadwal) return;
    setSaving(true);
    try {
      const detailAbsensi = siswaList
        .filter((s) => s.status !== null)
        .map((s) => ({
          siswaId: s.id_siswa,
          status: s.status!,
          keterangan: s.keterangan || undefined,
        }));

      if (detailAbsensi.length === 0) {
        toast.error("Tidak ada data absensi yang bisa disimpan");
        return;
      }

      await AbsensiService.bulkCreateAbsensi({
        guruMapelId: selectedJadwal.guruMapelId,
        pertemuanKe,
        tanggal: new Date().toISOString(),
        jamMulai: selectedJadwal.jadwal.jamMulai,
        jamSelesai: selectedJadwal.jadwal.jamSelesai,
        materi: materi || undefined,
        keteranganGuru: keteranganGuru || undefined,
        detailAbsensi,
      });

      toast.success(
        `Absensi berhasil disimpan! (${detailAbsensi.length} siswa)`,
      );
      handleBack();
      fetchJadwalHariIni();
    } catch (error: any) {
      console.error("Gagal menyimpan absensi:", error);
      toast.error(
        error.response?.data?.message || "Gagal menyimpan absensi",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    setSelectedJadwal(null);
    setSiswaList([]);
    setMateri("");
    setKeteranganGuru("");
    setIsEditMode(false);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "ONGOING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "COMPLETED":
        return "✓ Selesai";
      case "ONGOING":
        return "⏳ Berlangsung";
      case "SCHEDULED":
        return "📅 Dijadwalkan";
      default:
        return "Belum Input";
    }
  };

  const getSiswaStatusColors = (status: StatusAbsensi | null, target: StatusAbsensi) => {
    if (status !== target) return "bg-gray-100 text-gray-500 hover:bg-gray-200";
    switch (target) {
      case "HADIR":
        return "bg-emerald-500 text-white shadow-md";
      case "SAKIT":
        return "bg-blue-500 text-white shadow-md";
      case "IZIN":
        return "bg-amber-500 text-white shadow-md";
      case "TIDAK_HADIR":
        return "bg-red-500 text-white shadow-md";
    }
  };

  const statsAbsensi = {
    hadir: siswaList.filter((s) => s.status === "HADIR").length,
    sakit: siswaList.filter((s) => s.status === "SAKIT").length,
    izin: siswaList.filter((s) => s.status === "IZIN").length,
    alpha: siswaList.filter((s) => s.status === "TIDAK_HADIR").length,
    belumDiisi: siswaList.filter((s) => s.status === null).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Memuat jadwal mengajar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/20 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Absensi Mengajar
            </h1>
            <p className="text-gray-500 flex items-center gap-1.5 mt-1">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              {guruInfo && (
                <span className="ml-2 text-blue-600 font-medium">
                  · {guruInfo.nama}
                </span>
              )}
            </p>
          </div>
          {!selectedJadwal && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchJadwalHariIni}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-600 rounded-xl font-medium shadow-sm transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!selectedJadwal ? (
          /* ============================================================
             DAFTAR JADWAL HARI INI
          ============================================================ */
          <motion.div
            key="jadwal-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                Jadwal Mengajar Hari Ini
              </h2>
              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                {jadwalList.length} jadwal
              </span>
            </div>

            {jadwalList.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100"
              >
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-blue-300" />
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  Tidak ada jadwal mengajar hari ini
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Periksa kembali jadwal Anda di sistem
                </p>
              </motion.div>
            ) : (
              jadwalList.map((jadwal, index) => (
                <motion.div
                  key={jadwal.guruMapelId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
                  onClick={() => handleSelectJadwal(jadwal)}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {jadwal.namaMapel}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">
                          Kelas {jadwal.namaKelas}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                          <span className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {jadwal.jadwal.jamMulai} – {jadwal.jadwal.jamSelesai}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Users className="w-4 h-4 text-gray-400" />
                            {jadwal.totalSiswa} Siswa
                          </span>
                          {jadwal.jadwal.ruangan && (
                            <span className="flex items-center gap-1.5 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {jadwal.jadwal.ruangan}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap ${
                          jadwal.absensi
                            ? getStatusColor(jadwal.absensi.statusPertemuan)
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        {jadwal.absensi
                          ? getStatusLabel(jadwal.absensi.statusPertemuan)
                          : "Belum Input"}
                      </span>
                      {jadwal.absensi && (
                        <span className="text-xs text-gray-400">
                          {jadwal.absensi.sudahAbsen}/{jadwal.totalSiswa} siswa
                        </span>
                      )}
                    </div>
                  </div>

                  {jadwal.absensi && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all"
                            style={{
                              width: `${(jadwal.absensi.sudahAbsen / jadwal.totalSiswa) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          Pertemuan ke-{jadwal.absensi.pertemuanKe}
                        </span>
                        <Pencil className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        ) : (
          /* ============================================================
             FORM INPUT ABSENSI
          ============================================================ */
          <motion.div
            key="form-absensi"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {/* Tombol Kembali + Info Jadwal */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Kembali ke Jadwal</span>
              </button>

              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedJadwal.namaMapel}
                    </h2>
                    {isEditMode && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200">
                        Edit
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500">
                    Kelas {selectedJadwal.namaKelas} ·{" "}
                    {selectedJadwal.jadwal.jamMulai} –{" "}
                    {selectedJadwal.jadwal.jamSelesai}
                    {selectedJadwal.jadwal.ruangan && (
                      <span> · {selectedJadwal.jadwal.ruangan}</span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Siswa</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {selectedJadwal.totalSiswa}
                  </p>
                </div>
              </div>

              {/* Input Pertemuan & Materi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Pertemuan Ke-
                  </label>
                  <input
                    type="number"
                    value={pertemuanKe}
                    onChange={(e) => setPertemuanKe(parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Materi Pelajaran
                  </label>
                  <input
                    type="text"
                    value={materi}
                    onChange={(e) => setMateri(e.target.value)}
                    placeholder="Contoh: Persamaan Linear, Fotosintesis..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Catatan Guru (Opsional)
                </label>
                <textarea
                  value={keteranganGuru}
                  onChange={(e) => setKeteranganGuru(e.target.value)}
                  placeholder="Catatan atau keterangan tambahan untuk sesi ini..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
                />
              </div>
            </div>

            {/* Loading Siswa */}
            {loadingSiswa ? (
              <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
                <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  Memuat daftar siswa...
                </p>
              </div>
            ) : (
              <>
                {/* Statistik Absensi Real-time */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { label: "Hadir", count: statsAbsensi.hadir, color: "emerald", icon: CheckCircle },
                    { label: "Sakit", count: statsAbsensi.sakit, color: "blue", icon: AlertCircle },
                    { label: "Izin", count: statsAbsensi.izin, color: "amber", icon: Clock },
                    { label: "Alpha", count: statsAbsensi.alpha, color: "red", icon: XCircle },
                    { label: "Belum Diisi", count: statsAbsensi.belumDiisi, color: "gray", icon: BarChart3 },
                  ].map(({ label, count, color, icon: Icon }) => (
                    <div
                      key={label}
                      className={`bg-${color}-50 border border-${color}-100 rounded-xl p-3 text-center`}
                    >
                      <Icon className={`w-5 h-5 text-${color}-500 mx-auto mb-1`} />
                      <p className={`text-2xl font-bold text-${color}-600`}>{count}</p>
                      <p className={`text-xs text-${color}-600 font-medium`}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* Quick Action */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSetAllHadir}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Semua Hadir
                  </button>
                  <button
                    onClick={() =>
                      setSiswaList((prev) => prev.map((s) => ({ ...s, status: null, keterangan: null })))
                    }
                    className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-xl font-semibold transition-colors"
                  >
                    Reset
                  </button>
                </div>

                {/* Daftar Siswa */}
                {siswaList.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      Data siswa tidak tersedia
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Pastikan kelas ini memiliki siswa terdaftar
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">
                        Daftar Kehadiran Siswa
                      </h3>
                      <span className="text-sm text-gray-500">
                        {siswaList.length} siswa
                      </span>
                    </div>

                    <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                      {siswaList.map((siswa, index) => (
                        <motion.div
                          key={siswa.id_siswa}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                          className="p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-blue-700">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">
                                {siswa.nama}
                              </p>
                              <p className="text-xs text-gray-400">{siswa.nis}</p>
                            </div>
                            {/* Status badge */}
                            {siswa.status && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-lg font-medium flex-shrink-0 ${
                                  siswa.status === "HADIR"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : siswa.status === "SAKIT"
                                      ? "bg-blue-100 text-blue-700"
                                      : siswa.status === "IZIN"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                              >
                                {siswa.status === "TIDAK_HADIR" ? "Alpha" : siswa.status}
                              </span>
                            )}
                          </div>

                          {/* Status Buttons */}
                          <div className="grid grid-cols-4 gap-2 mb-2">
                            {(["HADIR", "SAKIT", "IZIN", "TIDAK_HADIR"] as StatusAbsensi[]).map(
                              (status) => (
                                <button
                                  key={status}
                                  onClick={() =>
                                    handleChangeStatus(siswa.id_siswa, status)
                                  }
                                  className={`py-2 rounded-lg text-xs font-semibold transition-all ${getSiswaStatusColors(siswa.status, status)}`}
                                >
                                  {status === "TIDAK_HADIR" ? "Alpha" : status}
                                </button>
                              ),
                            )}
                          </div>

                          {/* Keterangan per siswa (muncul jika bukan Hadir) */}
                          {siswa.status && siswa.status !== "HADIR" && (
                            <input
                              type="text"
                              value={siswa.keterangan || ""}
                              onChange={(e) =>
                                handleChangeKeterangan(siswa.id_siswa, e.target.value)
                              }
                              placeholder={`Keterangan ${siswa.status === "SAKIT" ? "sakit" : siswa.status === "IZIN" ? "izin" : "alpha"}...`}
                              className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tombol Simpan */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSaveAbsensi}
                  disabled={saving || siswaList.length === 0}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>
                        {isEditMode ? "Perbarui Absensi" : "Simpan Absensi"}
                      </span>
                      {statsAbsensi.belumDiisi > 0 && (
                        <span className="bg-white/20 px-2 py-0.5 rounded-lg text-sm">
                          {siswaList.length - statsAbsensi.belumDiisi}/{siswaList.length}
                        </span>
                      )}
                    </>
                  )}
                </motion.button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
