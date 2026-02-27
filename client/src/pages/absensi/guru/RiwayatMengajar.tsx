// src/pages/guru/absensi/RiwayatMengajar.tsx

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  BookOpen,
  Users,
  Clock,
  ChevronRight,
  Filter,
  CheckCircle,
} from "lucide-react";

interface RiwayatItem {
  id: number;
  pertemuanKe: number;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  mapel: string;
  kelas: string;
  materi: string | null;
  statusPertemuan: string;
  stats: {
    total: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
  };
}

export default function RiwayatMengajar() {
  const [riwayatList, setRiwayatList] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRiwayat();
  }, [page]);

  const fetchRiwayat = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const guruId = user.guruId;

      const response = await fetch(
        `${import.meta.env.VITE_URL_API}/api/absensi/guru/${guruId}/riwayat?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        setRiwayatList(data.data.riwayat);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal memuat riwayat");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "COMPLETED") {
      return "bg-emerald-100 text-emerald-700";
    }
    return "bg-gray-100 text-gray-600";
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Riwayat Mengajar
          </h1>
          <p className="text-gray-600">
            Daftar pertemuan yang sudah Anda laksanakan
          </p>
        </motion.div>

        {/* Riwayat List */}
        <div className="space-y-4">
          {riwayatList.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
              <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Belum ada riwayat mengajar</p>
            </div>
          ) : (
            riwayatList.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/absensi/guru/pertemuan/${item.id}`)}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {item.mapel} - Pertemuan {item.pertemuanKe}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusBadge(item.statusPertemuan)}`}>
                          {item.statusPertemuan === "COMPLETED"
                            ? "Selesai"
                            : item.statusPertemuan}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">Kelas {item.kelas}</p>
                      {item.materi && (
                        <p className="text-sm text-gray-600 mb-3">
                          📖 {item.materi}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(item.tanggal).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {item.jamMulai} - {item.jamSelesai}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-4 gap-3">
                  <div className="text-center p-2 bg-emerald-50 rounded-lg">
                    <p className="text-lg font-bold text-emerald-600">
                      {item.stats.hadir}
                    </p>
                    <p className="text-xs text-gray-600">Hadir</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <p className="text-lg font-bold text-blue-600">
                      {item.stats.sakit}
                    </p>
                    <p className="text-xs text-gray-600">Sakit</p>
                  </div>
                  <div className="text-center p-2 bg-amber-50 rounded-lg">
                    <p className="text-lg font-bold text-amber-600">
                      {item.stats.izin}
                    </p>
                    <p className="text-xs text-gray-600">Izin</p>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <p className="text-lg font-bold text-red-600">
                      {item.stats.alpha}
                    </p>
                    <p className="text-xs text-gray-600">Alpha</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  page === p
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
