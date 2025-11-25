import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import apiClient from "@/config/axios";
import { useEffect, useState } from "react";
import {
  Calendar,
  GraduationCap,
  Users,
  BookOpen,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Clock,
} from "lucide-react";
import TambahTahunAjaranModal from "./components/TambahTahunAjaranModal";
import TahunAjaranCard from "./components/TahunAjaranCard";

interface TahunAjaran {
  id_tahun: number;
  namaTahun: string;
  kelasRel: {
    isActive: boolean;
    kelas: {
      id_kelas: number;
      namaKelas: string;
      tingkat: string;
    };
  }[];
}

export default function TahunAjaranPage() {
  const [tahunAjaran, setTahunAjaran] = useState<TahunAjaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get("/tahun-ajaran");
      setTahunAjaran(res.data.data.data || []);
    } catch (error: any) {
      console.error("Error fetching tahun ajaran:", error);
      setError(
        error.response?.data?.message ||
          "Gagal memuat data tahun ajaran. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate statistics
  const totalTahunAjaran = tahunAjaran.length;
  const totalKelas = tahunAjaran.reduce(
    (sum, item) => sum + item.kelasRel.length,
    0
  );
  const kelasAktif = tahunAjaran.reduce(
    (sum, item) => sum + item.kelasRel.filter((rel) => rel.isActive).length,
    0
  );
  const tahunOperasional = tahunAjaran.filter((item) =>
    item.kelasRel.some((rel) => rel.isActive)
  ).length;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Professional Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              Manajemen Tahun Ajaran
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Kelola periode akademik dan status kelas dengan mudah
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={fetchData}
              disabled={loading}
              className="shadow-sm">
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <TambahTahunAjaranModal onSuccess={fetchData} />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="shadow-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={fetchData}>
                Coba Lagi
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Professional Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm border-0 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Total Tahun Ajaran
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                    {loading ? "..." : totalTahunAjaran}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Kelas Aktif
                  </p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">
                    {loading ? "..." : kelasAktif}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-400">
                    Total Kelas
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                    {loading ? "..." : totalKelas}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Tahun Operasional
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-300">
                    {loading ? "..." : tahunOperasional}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="shadow-sm">
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Memuat data tahun ajaran...
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && tahunAjaran.length === 0 && (
          <Card className="shadow-sm">
            <CardContent className="text-center py-12">
              <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Belum ada tahun ajaran
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Mulai dengan menambahkan tahun ajaran pertama untuk mengelola
                sistem pendaftaran siswa
              </p>
              <TambahTahunAjaranModal onSuccess={fetchData} />
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {!loading && !error && tahunAjaran.length > 0 && (
          <>
            {/* Summary Card */}
            <Card className="shadow-sm border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        Ringkasan Sistem
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {totalTahunAjaran} tahun ajaran • {kelasAktif} kelas
                        aktif dari {totalKelas} total
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      kelasAktif > 0
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                    {kelasAktif > 0 ? "Operasional" : "Standby"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Tahun Ajaran Grid */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {tahunAjaran.map((item) => (
                <TahunAjaranCard key={item.id_tahun} data={item} />
              ))}
            </div>

            {/* Helpful Tips */}
            {kelasAktif === 0 && (
              <Card className="shadow-sm border-l-4 border-l-amber-400 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-900/10">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mt-0.5">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                        Sistem dalam Mode Standby
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Aktifkan minimal satu kelas di tahun ajaran yang
                        diinginkan untuk memulai proses pendaftaran siswa baru.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
