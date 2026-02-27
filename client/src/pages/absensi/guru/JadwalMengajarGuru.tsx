// src/pages/guru/absensi/JadwalMengajarGuru.tsx
// Guru: Jadwal mengajar hari ini dengan validasi jam

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  Play,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Jadwal {
  id_jadwal: number;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan: string | null;
  guruMapel: {
    id: number;
    mapel: string;
    kelas: string;
    totalSiswa: number;
    tahunAjaran: string;
  };
  status: {
    canStart: boolean;
    reason: string;
    pertemuan: {
      id: number;
      pertemuanKe: number;
      statusPertemuan: string;
      materi: string | null;
      sudahAbsen: number;
      belumAbsen: number;
    } | null;
  };
}

export default function JadwalMengajarGuru() {
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchJadwal();

    // Update current time every minute
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toTimeString().substring(0, 5));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchJadwal = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const guruId = user.guruId;

      const response = await fetch(
        `${import.meta.env.VITE_URL_API}/api/absensi/guru/${guruId}/jadwal-hari-ini`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        setJadwalList(data.data.jadwal);
        setCurrentTime(data.data.waktuSekarang);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Gagal memuat jadwal");
    } finally {
      setLoading(false);
    }
  };

  const handleStartPertemuan = (jadwal: Jadwal) => {
    // Navigate to form input presensi
    navigate(`/guru/absensi/mulai-pertemuan`, {
      state: { jadwal },
    });
  };

  const handleContinuePertemuan = (jadwal: Jadwal) => {
    // Navigate to pertemuan yang sudah dibuat
    navigate(`/guru/absensi/pertemuan/${jadwal.status.pertemuan?.id}`);
  };

  const getStatusBadge = (status: Jadwal["status"]) => {
    if (status.pertemuan) {
      const { statusPertemuan } = status.pertemuan;
      if (statusPertemuan === "COMPLETED") {
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>Selesai</span>
          </div>
        );
      }
      if (statusPertemuan === "ONGOING") {
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium">
            <Clock className="w-4 h-4" />
            <span>Berlangsung</span>
          </div>
        );
      }
    }

    if (!status.canStart) {
      return (
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
          <XCircle className="w-4 h-4" />
          <span>{status.reason}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
        <Play className="w-4 h-4" />
        <span>Siap Dimulai</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Jadwal Mengajar Hari Ini
            </h1>
            <p className="text-gray-600 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </p>
          </div>

          <div className="text-right">
            <div className="flex items-center space-x-2 text-gray-600 mb-2">
              <Clock className="w-5 h-5" />
              <span className="text-2xl font-bold">{currentTime}</span>
            </div>
            <button
              onClick={fetchJadwal}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Alert Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">
              Anda dapat memulai pertemuan <strong>15 menit sebelum</strong> jam
              mulai sampai jam selesai.
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Pastikan Anda mengisi presensi siswa dan menyelesaikan pertemuan
              sebelum jam berakhir.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Jadwal List */}
      <div className="space-y-4">
        {jadwalList.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg font-medium">
              Tidak ada jadwal mengajar hari ini
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Silakan cek jadwal di hari lain atau hubungi admin
            </p>
          </div>
        ) : (
          jadwalList.map((jadwal, index) => (
            <motion.div
              key={jadwal.id_jadwal}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {jadwal.guruMapel.mapel}
                    </h3>
                    <p className="text-gray-600">
                      Kelas {jadwal.guruMapel.kelas}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
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

                {getStatusBadge(jadwal.status)}
              </div>

              {/* Pertemuan Info (if exists) */}
              {jadwal.status.pertemuan && (
                <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Pertemuan ke-{jadwal.status.pertemuan.pertemuanKe}
                      </p>
                      {jadwal.status.pertemuan.materi && (
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          📖 {jadwal.status.pertemuan.materi}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Presensi</p>
                      <p className="text-lg font-bold text-gray-900">
                        {jadwal.status.pertemuan.sudahAbsen} /{" "}
                        {jadwal.guruMapel.totalSiswa}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {jadwal.status.pertemuan?.statusPertemuan === "COMPLETED" ? (
                  <button
                    onClick={() => handleContinuePertemuan(jadwal)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                    Lihat Detail
                  </button>
                ) : jadwal.status.pertemuan?.statusPertemuan === "ONGOING" ? (
                  <button
                    onClick={() => handleContinuePertemuan(jadwal)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                    Lanjutkan Mengajar
                  </button>
                ) : jadwal.status.canStart ? (
                  <button
                    onClick={() => handleStartPertemuan(jadwal)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center space-x-2">
                    <Play className="w-5 h-5" />
                    <span>Mulai Pertemuan</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-400 rounded-xl font-medium cursor-not-allowed">
                    {jadwal.status.reason}
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
