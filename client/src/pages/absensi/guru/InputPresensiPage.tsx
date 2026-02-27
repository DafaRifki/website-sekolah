// src/pages/guru/absensi/InputPresensiPage.tsx
// Halaman input presensi siswa

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Save,
  Users,
  Clock,
  BookOpen,
  AlertCircle,
} from "lucide-react";

interface Siswa {
  id_siswa: number;
  nis: string;
  nama: string;
  status: string | null;
  keterangan: string | null;
  waktuCheckIn: string | null;
  id_detail: number | null;
}

interface Pertemuan {
  id: number;
  pertemuanKe: number;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  materi: string | null;
  keteranganGuru: string | null;
  statusPertemuan: string;
  guru: string;
  mapel: string;
  kelas: string;
}

export default function InputPresensiPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pertemuan, setPertemuan] = useState<Pertemuan | null>(null);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPertemuan();
  }, [id]);

  const fetchPertemuan = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL_API}/api/absensi/guru/pertemuan/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        setPertemuan(data.data.pertemuan);
        setSiswaList(data.data.siswaList);
        setStats(data.data.stats);
      } else {
        toast.error("Gagal memuat data pertemuan");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = (siswaId: number, status: string) => {
    setSiswaList((prev) =>
      prev.map((s) => (s.id_siswa === siswaId ? { ...s, status } : s)),
    );
  };

  const handleSetAllHadir = () => {
    setSiswaList((prev) =>
      prev.map((s) => ({ ...s, status: "HADIR", keterangan: null })),
    );
    toast.success("Semua siswa diset HADIR");
  };

  const handleSavePresensi = async () => {
    // Validasi: semua siswa harus punya status
    const belumIsi = siswaList.filter((s) => !s.status);
    if (belumIsi.length > 0) {
      toast.error(
        `Masih ada ${belumIsi.length} siswa yang belum diisi statusnya`,
      );
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL_API}/api/absensi/guru/input-presensi-bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            pertemuanId: parseInt(id!),
            detailAbsensi: siswaList.map((s) => ({
              siswaId: s.id_siswa,
              status: s.status,
              keterangan: s.keterangan || undefined,
            })),
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Presensi berhasil disimpan!");
        fetchPertemuan(); // Refresh data
      } else {
        toast.error(data.message || "Gagal menyimpan presensi");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const handleSelesaikan = async () => {
    // Validasi: semua sudah diisi
    const belumIsi = siswaList.filter((s) => !s.status);
    if (belumIsi.length > 0) {
      toast.error(
        `Lengkapi presensi terlebih dahulu (${belumIsi.length} siswa belum diisi)`,
      );
      return;
    }

    if (
      !confirm(
        "Selesaikan pertemuan? Status akan menjadi COMPLETED dan tidak bisa diubah lagi.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL_API}/api/absensi/guru/selesaikan-pertemuan/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Pertemuan selesai!");
        navigate("/guru/absensi/jadwal");
      } else {
        toast.error(data.message || "Gagal menyelesaikan pertemuan");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "HADIR":
        return "bg-emerald-500 text-white";
      case "SAKIT":
        return "bg-blue-500 text-white";
      case "IZIN":
        return "bg-amber-500 text-white";
      case "TIDAK_HADIR":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!pertemuan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Pertemuan tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const isCompleted = pertemuan.statusPertemuan === "COMPLETED";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6">
          <button
            onClick={() => navigate("/guru/absensi/jadwal")}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali ke Jadwal</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Input Presensi</h1>
          <p className="text-gray-600 mt-1">
            {pertemuan.mapel} - Kelas {pertemuan.kelas}
          </p>
        </motion.div>

        {/* Pertemuan Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    Pertemuan ke-{pertemuan.pertemuanKe}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                    {isCompleted ? "Selesai" : "Berlangsung"}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">📖 {pertemuan.materi}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {pertemuan.jamMulai} - {pertemuan.jamSelesai}
                    </span>
                  </span>
                  <span>
                    {new Date(pertemuan.tanggal).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Kehadiran</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.sudahAbsen}/{stats.totalSiswa}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.belumAbsen} belum diisi
                </p>
              </div>
            )}
          </div>

          {/* Stats Bar */}
          {stats && (
            <div className="mt-6 grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.hadir}
                </p>
                <p className="text-xs text-gray-600">Hadir</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.sakit}
                </p>
                <p className="text-xs text-gray-600">Sakit</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">
                  {stats.izin}
                </p>
                <p className="text-xs text-gray-600">Izin</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{stats.alpha}</p>
                <p className="text-xs text-gray-600">Alpha</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Alert if completed */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <p className="text-sm font-medium text-emerald-900">
                Pertemuan sudah selesai. Data hanya bisa dilihat, tidak bisa
                diubah.
              </p>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        {!isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex space-x-3">
            <button
              onClick={handleSetAllHadir}
              className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Semua Hadir</span>
            </button>
            <button
              onClick={handleSavePresensi}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50">
              <Save className="w-5 h-5" />
              <span>{saving ? "Menyimpan..." : "Simpan Presensi"}</span>
            </button>
          </motion.div>
        )}

        {/* Siswa List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Daftar Siswa</h3>
              <p className="text-sm text-gray-600 mt-1">
                Klik status untuk mengubah kehadiran
              </p>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-5 h-5" />
              <span className="font-semibold">{siswaList.length} Siswa</span>
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {siswaList.map((siswa, index) => (
              <div key={siswa.id_siswa} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {siswa.nama}
                      </p>
                      <p className="text-sm text-gray-500">{siswa.nis}</p>
                    </div>
                  </div>
                  {siswa.waktuCheckIn && (
                    <span className="text-xs text-gray-500">
                      Check-in:{" "}
                      {new Date(siswa.waktuCheckIn).toLocaleTimeString(
                        "id-ID",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {["HADIR", "SAKIT", "IZIN", "TIDAK_HADIR"].map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        !isCompleted &&
                        handleChangeStatus(siswa.id_siswa, status)
                      }
                      disabled={isCompleted}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        siswa.status === status
                          ? getStatusColor(status)
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      } ${isCompleted ? "cursor-not-allowed opacity-60" : ""}`}>
                      {status === "TIDAK_HADIR" ? "Alpha" : status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Actions */}
        {!isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6">
            <button
              onClick={handleSelesaikan}
              className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2">
              <CheckCircle className="w-6 h-6" />
              <span>Selesaikan Pertemuan</span>
            </button>
            <p className="text-center text-sm text-gray-500 mt-3">
              Pertemuan yang sudah selesai tidak bisa diubah lagi
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
