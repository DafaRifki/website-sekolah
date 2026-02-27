// src/pages/siswa/absensi/KehadiranSiswa.tsx

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  TrendingUp,
  BookOpen,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Award,
} from "lucide-react";

interface MapelKehadiran {
  mapel: string;
  guru: string;
  stats: {
    total: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
  };
  persentaseKehadiran: number;
  riwayat: Array<{
    pertemuanKe: number;
    tanggal: string;
    jamMulai: string;
    jamSelesai: string;
    materi: string | null;
    status: string;
    keterangan: string | null;
    waktuCheckIn: string | null;
  }>;
}

export default function KehadiranSiswa() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMapel, setSelectedMapel] = useState<MapelKehadiran | null>(
    null,
  );

  useEffect(() => {
    fetchKehadiran();
  }, []);

  const fetchKehadiran = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const siswaId = user.siswaId;

      const response = await fetch(
        `${import.meta.env.VITE_URL_API}/api/absensi/siswa/${siswaId}/kehadiranku`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal memuat data kehadiran");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "HADIR":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "SAKIT":
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case "IZIN":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "TIDAK_HADIR":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (selectedMapel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedMapel(null)}
            className="text-purple-600 hover:text-purple-700 mb-6 flex items-center space-x-2">
            <span>←</span>
            <span>Kembali</span>
          </button>

          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {selectedMapel.mapel}
          </h2>

          <div className="space-y-4">
            {selectedMapel.riwayat.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(item.status)}
                    <div>
                      <p className="font-semibold text-gray-900">
                        Pertemuan {item.pertemuanKe}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(item.tanggal).toLocaleDateString("id-ID")} •{" "}
                        {item.jamMulai}-{item.jamSelesai}
                      </p>
                      {item.materi && (
                        <p className="text-sm text-gray-600 mt-1">
                          📖 {item.materi}
                        </p>
                      )}
                      {item.waktuCheckIn && (
                        <p className="text-xs text-gray-500 mt-1">
                          Check-in:{" "}
                          {new Date(item.waktuCheckIn).toLocaleTimeString(
                            "id-ID",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      item.status === "HADIR"
                        ? "bg-emerald-100 text-emerald-700"
                        : item.status === "SAKIT"
                          ? "bg-blue-100 text-blue-700"
                          : item.status === "IZIN"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                    }`}>
                    {item.status === "TIDAK_HADIR" ? "Alpha" : item.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Kehadiranku</h1>
          <p className="text-gray-600">
            Statistik kehadiran per mata pelajaran
          </p>
        </motion.div>

        {/* Overall Stats */}
        {data && (
          <>
            {/* Achievement Badge */}
            {data.overall.persentaseKehadiran >= 90 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-6 mb-8 text-white shadow-lg">
                <div className="flex items-center space-x-4">
                  <Award className="w-12 h-12" />
                  <div>
                    <h3 className="text-2xl font-bold">
                      🎉 Prestasi Luar Biasa!
                    </h3>
                    <p className="text-white/90">
                      Kehadiran Anda mencapai {data.overall.persentaseKehadiran}
                      %! Terus pertahankan!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Overall Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">
                    Kehadiran Keseluruhan
                  </p>
                  <p className="text-5xl font-bold">
                    {data.overall.persentaseKehadiran}%
                  </p>
                </div>
                <TrendingUp className="w-16 h-16 text-white/30" />
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-sm text-purple-100">
                  {data.overall.totalHadir} hadir dari{" "}
                  {data.overall.totalPertemuan} pertemuan
                </p>
              </div>
            </motion.div>

            {/* Per Mapel */}
            <div className="space-y-4">
              {data.perMapel.map((mapel: MapelKehadiran, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedMapel(mapel)}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {mapel.mapel}
                        </h3>
                        <p className="text-sm text-gray-600">{mapel.guru}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-600">
                        {mapel.persentaseKehadiran}%
                      </div>
                      <p className="text-xs text-gray-500">Kehadiran</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <p className="text-lg font-bold text-emerald-600">
                        {mapel.stats.hadir}
                      </p>
                      <p className="text-xs text-gray-600">Hadir</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-lg font-bold text-blue-600">
                        {mapel.stats.sakit}
                      </p>
                      <p className="text-xs text-gray-600">Sakit</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <p className="text-lg font-bold text-amber-600">
                        {mapel.stats.izin}
                      </p>
                      <p className="text-xs text-gray-600">Izin</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-lg font-bold text-red-600">
                        {mapel.stats.alpha}
                      </p>
                      <p className="text-xs text-gray-600">Alpha</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mt-4">
                    {mapel.stats.total} pertemuan tercatat
                  </p>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
