// src/pages/guru/absensi/MulaiPertemuanForm.tsx
// Form untuk mulai pertemuan baru

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Users, Clock, Save } from "lucide-react";

export default function MulaiPertemuanForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const jadwal = location.state?.jadwal;

  const [pertemuanKe, setPertemuanKe] = useState(1);
  const [materi, setMateri] = useState("");
  const [keteranganGuru, setKeteranganGuru] = useState("");
  const [loading, setLoading] = useState(false);

  if (!jadwal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Data jadwal tidak ditemukan</p>
          <button
            onClick={() => navigate("/absensi/guru/jadwal")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg">
            Kembali ke Jadwal
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!materi.trim()) {
      toast.error("Materi pembelajaran wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL_API}/api/absensi/guru/mulai-pertemuan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            guruMapelId: jadwal.guruMapel.id,
            jadwalId: jadwal.id_jadwal,
            pertemuanKe,
            materi,
            keteranganGuru: keteranganGuru || undefined,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        // Navigate to input presensi page
        navigate(
          `/absensi/guru/pertemuan/${data.data.pertemuan.id_absensi_pertemuan}`,
        );
      } else {
        toast.error(data.message || "Gagal memulai pertemuan");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan saat memulai pertemuan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6">
          <button
            onClick={() => navigate("/absensi/guru/jadwal")}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali ke Jadwal</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Mulai Pertemuan</h1>
          <p className="text-gray-600 mt-1">
            Isi informasi pertemuan sebelum input presensi siswa
          </p>
        </motion.div>

        {/* Jadwal Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {jadwal.guruMapel.mapel}
              </h2>
              <p className="text-gray-600">Kelas {jadwal.guruMapel.kelas}</p>
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {jadwal.jamMulai} - {jadwal.jamSelesai}
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{jadwal.guruMapel.totalSiswa} Siswa</span>
                </span>
                {jadwal.ruangan && <span>📍 {jadwal.ruangan}</span>}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              {/* Pertemuan Ke */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pertemuan Ke- <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={pertemuanKe}
                  onChange={(e) => setPertemuanKe(parseInt(e.target.value))}
                  min="1"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan nomor pertemuan"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nomor urut pertemuan untuk mata pelajaran ini
                </p>
              </div>

              {/* Materi */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Materi Pembelajaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={materi}
                  onChange={(e) => setMateri(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: Persamaan Linear Dua Variabel"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Topik atau materi yang akan diajarkan hari ini
                </p>
              </div>

              {/* Keterangan */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Keterangan (Opsional)
                </label>
                <textarea
                  value={keteranganGuru}
                  onChange={(e) => setKeteranganGuru(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Catatan tambahan untuk pertemuan ini..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Catatan khusus atau informasi tambahan tentang pertemuan
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memulai Pertemuan...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Mulai Pertemuan & Input Presensi</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div className="flex-1 text-sm text-blue-900">
              <p className="font-medium mb-1">Informasi:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>
                  Setelah klik "Mulai Pertemuan", Anda akan diarahkan ke halaman
                  input presensi
                </li>
                <li>
                  Semua siswa akan ditampilkan untuk diisi status kehadirannya
                </li>
                <li>
                  Status pertemuan akan otomatis menjadi "ONGOING" dan dapat
                  diedit sampai Anda klik "Selesaikan Pertemuan"
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
