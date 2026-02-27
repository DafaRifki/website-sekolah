// src/pages/laporan/LaporanPage.tsx
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import apiClient from "@/config/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileSpreadsheet,
  FileText,
  Download,
  Archive,
  FileCheck,
  TrendingUp,
  Users,
  DollarSign,
  RotateCcw,
} from "lucide-react";

interface TahunAjaran {
  id_tahun: number;
  namaTahun: string;
  semester: number;
  isActive: boolean;
}

interface LaporanStats {
  totalSiswa: number;
  totalTagihan: number;
  totalBayar: number;
  sisaPembayaran: number;
  persentaseLunas: number;
  totalTransaksi: number;
}

export default function LaporanPage() {
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<number | null>(
    null,
  );
  const [stats, setStats] = useState<LaporanStats>({
    totalSiswa: 0,
    totalTagihan: 0,
    totalBayar: 0,
    sisaPembayaran: 0,
    persentaseLunas: 0,
    totalTransaksi: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTahunAjaran();
  }, []);

  useEffect(() => {
    if (selectedTahunAjaran) {
      fetchStats(selectedTahunAjaran);
    }
  }, [selectedTahunAjaran]);

  const fetchTahunAjaran = async () => {
    try {
      const response = await apiClient.get("/tahun-ajaran");
      if (response.data.success) {
        setTahunAjaranList(response.data.data);
        // Auto select active tahun ajaran HANYA jika belum ada yang terpilih
        if (!selectedTahunAjaran) {
          const active = response.data.data.find(
            (ta: TahunAjaran) => ta.isActive,
          );
          if (active) {
            setSelectedTahunAjaran(active.id_tahun);
          }
        }
      }
    } catch (error) {
      toast.error("Gagal memuat tahun ajaran");
      console.error(error);
    }
  };

  const fetchStats = async (tahunAjaranId: number) => {
    try {
      const response = await apiClient.get(`/laporan/stats/${tahunAjaranId}`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  // Download Laporan Tagihan Excel
  const handleDownloadTagihanExcel = async () => {
    if (!selectedTahunAjaran) {
      toast.error("Pilih tahun ajaran terlebih dahulu");
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(
        `/laporan/tagihan/excel/${selectedTahunAjaran}`,
        {
          responseType: "blob",
        },
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const tahun = tahunAjaranList.find(
        (t) => t.id_tahun === selectedTahunAjaran,
      );
      const namaTahunClean = tahun?.namaTahun.replace(/\//g, "-") || "";
      const filename = `Laporan_Tagihan_${namaTahunClean}_Sem${tahun?.semester}.xlsx`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Laporan berhasil diunduh!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengunduh laporan");
    } finally {
      setLoading(false);
    }
  };

  // Download Laporan Pembayaran Excel
  const handleDownloadPembayaranExcel = async () => {
    if (!selectedTahunAjaran) {
      toast.error("Pilih tahun ajaran terlebih dahulu");
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(
        `/laporan/pembayaran/excel/${selectedTahunAjaran}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const tahun = tahunAjaranList.find(
        (t) => t.id_tahun === selectedTahunAjaran,
      );
      const namaTahunClean = tahun?.namaTahun.replace(/\//g, "-") || "";
      const filename = `Laporan_Pembayaran_${namaTahunClean}_Sem${tahun?.semester}.xlsx`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Laporan berhasil diunduh!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengunduh laporan");
    } finally {
      setLoading(false);
    }
  };

  // Download CSV
  const handleDownloadCSV = async (type: "tagihan" | "pembayaran") => {
    if (!selectedTahunAjaran) {
      toast.error("Pilih tahun ajaran terlebih dahulu");
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(
        `/laporan/${type}/csv/${selectedTahunAjaran}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const tahun = tahunAjaranList.find(
        (t) => t.id_tahun === selectedTahunAjaran,
      );
      const namaTahunClean = tahun?.namaTahun.replace(/\//g, "-") || "";
      const filename = `Laporan_${type}_${namaTahunClean}_Sem${tahun?.semester}.csv`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Laporan CSV berhasil diunduh!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal mengunduh laporan CSV",
      );
    } finally {
      setLoading(false);
    }
  };

  // Download Archived CSV
  const handleDownloadArchivedCSV = async () => {
    if (!selectedTahunAjaran) {
      toast.error("Pilih tahun ajaran terlebih dahulu");
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(
        `/laporan/arsip/csv/${selectedTahunAjaran}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const tahun = tahunAjaranList.find(
        (t) => t.id_tahun === selectedTahunAjaran,
      );
      const namaTahunClean = tahun?.namaTahun.replace(/\//g, "-") || "";
      const filename = `Arsip_${namaTahunClean}_Sem${tahun?.semester}.csv`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Arsip CSV berhasil diunduh!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengunduh arsip CSV");
    } finally {
      setLoading(false);
    }
  };

  // Arsip Data dengan SweetAlert2 - Alur Baru (Single Request)
  const handleArsipData = async () => {
    if (!selectedTahunAjaran) {
      toast.error("Pilih tahun ajaran terlebih dahulu");
      return;
    }

    const tahun = tahunAjaranList.find(
      (t) => t.id_tahun === selectedTahunAjaran,
    );

    const result = await Swal.fire({
      title: "Arsipkan Data Laporan",
      html: `
        <div class="text-left space-y-4">
          <p>Anda akan mengarsipkan data untuk:</p>
          <p class="font-bold text-lg text-center bg-slate-100 p-2 rounded">
            ${tahun?.namaTahun} - Semester ${tahun?.semester}
          </p>
          
          <div class="space-y-3 mt-4">
            <p class="font-medium">Pilih Aksi:</p>
            <div class="flex flex-col gap-2">
              <label class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input type="radio" name="arsip-action" value="keep" checked />
                <div>
                  <p class="font-bold text-sm">Arsipkan & Simpan</p>
                  <p class="text-xs text-slate-500">Buat backup tetapi simpan data di database.</p>
                </div>
              </label>
              <label class="flex items-center gap-3 p-3 border border-red-200 rounded-lg cursor-pointer hover:bg-red-50">
                <input type="radio" name="arsip-action" value="delete" />
                <div>
                  <p class="font-bold text-sm text-red-600">Arsipkan & Hapus</p>
                  <p class="text-xs text-slate-500">Buat backup kemudian hapus data dari database.</p>
                </div>
              </label>
            </div>
          </div>

          <div class="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-xs text-yellow-800">
            <strong>Peringatan:</strong> Pastikan Anda telah mengunduh laporan Excel/CSV terbaru sebelum mengarsipkan.
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Proses Sekarang",
      cancelButtonText: "Batal",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          // Ambil nilai radio yang dipilih
          const action = (
            document.querySelector(
              'input[name="arsip-action"]:checked',
            ) as HTMLInputElement
          )?.value;
          const shouldDelete = action === "delete";

          const response = await apiClient.post(
            `/laporan/arsip/${selectedTahunAjaran}${shouldDelete ? "?delete=true" : ""}`,
          );
          return response.data;
        } catch (error: any) {
          const isConnectionError =
            error.code === "ERR_NETWORK" ||
            error.code === "ERR_CONNECTION_REFUSED" ||
            !error.response;

          Swal.showValidationMessage(
            isConnectionError
              ? "Koneksi terputus. Hal ini mungkin karena server sedang merestart. Tunggu sejenak dan coba lagi."
              : `Gagal: ${error.response?.data?.message || error.message}`,
          );
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (result.isConfirmed && result.value?.success) {
      const data = result.value.data;

      await Swal.fire({
        title: "Berhasil!",
        text: result.value.message,
        icon: "success",
      });

      fetchTahunAjaran();

      if (data?.deletedFromDB) {
        // Reset stats jika data dihapus
        setStats({
          totalSiswa: 0,
          totalTagihan: 0,
          totalBayar: 0,
          sisaPembayaran: 0,
          persentaseLunas: 0,
          totalTransaksi: 0,
        });
      } else {
        fetchStats(selectedTahunAjaran);
      }
    }
  };

  const handleRestoreData = async () => {
    if (!selectedTahunAjaran) {
      toast.error("Pilih tahun ajaran terlebih dahulu");
      return;
    }

    const tahun = tahunAjaranList.find(
      (t) => t.id_tahun === selectedTahunAjaran,
    );

    const result = await Swal.fire({
      title: "Restore Data?",
      html: `
      <p>Anda akan merestore data arsip untuk:</p>
      <p class="font-bold text-lg mt-2">
        ${tahun?.namaTahun} - Semester ${tahun?.semester}
      </p>
      <div class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p class="text-sm text-blue-800">
          Data yang sudah ada di database tidak akan digandakan (aman dijalankan
          meski data belum dihapus sebelumnya).
        </p>
      </div>
    `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Restore!",
      cancelButtonText: "Batal",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await apiClient.post(
            `/laporan/arsip/${selectedTahunAjaran}/restore`,
          );
          return response.data;
        } catch (error: any) {
          const isConnectionError =
            error.code === "ERR_NETWORK" ||
            error.code === "ERR_CONNECTION_REFUSED" ||
            error.message?.includes("Network Error") ||
            error.message?.includes("ERR_CONNECTION_REFUSED") ||
            !error.response;

          Swal.showValidationMessage(
            isConnectionError
              ? "Tidak dapat terhubung ke server. Pastikan server berjalan dan coba lagi."
              : `Gagal: ${error.response?.data?.message || error.message}`,
          );
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (result.isConfirmed && result.value?.success) {
      const d = result.value.data;
      Swal.fire({
        title: "Restore Berhasil!",
        html: `
        <div class="text-left space-y-1">
          <p>✅ Tagihan direstore: <strong>${d.tagihanRestored}</strong></p>
          <p>⏭️ Tagihan dilewati (sudah ada): <strong>${d.tagihanSkipped}</strong></p>
          <p>✅ Pembayaran direstore: <strong>${d.pembayaranRestored}</strong></p>
          <p>⏭️ Pembayaran dilewati (sudah ada): <strong>${d.pembayaranSkipped}</strong></p>
        </div>
      `,
        icon: "success",
      });

      // Refresh stats
      fetchStats(selectedTahunAjaran);
      fetchTahunAjaran();
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Laporan Keuangan
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Download laporan dan arsipkan data tahun ajaran
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
      </div>

      {/* Filter Tahun Ajaran */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Pilih Tahun Ajaran</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedTahunAjaran?.toString() ?? ""}
            onValueChange={(value) => setSelectedTahunAjaran(parseInt(value))}>
            <SelectTrigger className="w-full sm:w-96">
              <SelectValue placeholder="Pilih tahun ajaran" />
            </SelectTrigger>
            <SelectContent>
              {tahunAjaranList.map((ta) => (
                <SelectItem key={ta.id_tahun} value={ta.id_tahun.toString()}>
                  <div className="flex items-center gap-2">
                    <span>
                      {ta.namaTahun} - Semester {ta.semester}
                    </span>
                    {ta.isActive && (
                      <Badge variant="default" className="text-xs">
                        Aktif
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {selectedTahunAjaran && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Total Siswa
                </p>
                <p className="text-2xl font-bold">{stats.totalSiswa}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Total Tagihan
                </p>
                <p className="text-xl font-bold text-indigo-600">
                  {formatRupiah(stats.totalTagihan)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Total Terbayar
                </p>
                <p className="text-xl font-bold text-green-600">
                  {formatRupiah(stats.totalBayar)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <FileCheck className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Persentase Lunas
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.persentaseLunas.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Download Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Laporan Tagihan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              Laporan Tagihan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Download laporan tagihan siswa dalam format Excel atau CSV
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleDownloadTagihanExcel}
                disabled={!selectedTahunAjaran || loading}
                className="flex-1 bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button
                onClick={() => handleDownloadCSV("tagihan")}
                disabled={!selectedTahunAjaran || loading}
                variant="outline"
                className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Laporan Pembayaran */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              Laporan Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Download laporan pembayaran siswa dalam format Excel atau CSV
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleDownloadPembayaranExcel}
                disabled={!selectedTahunAjaran || loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button
                onClick={() => handleDownloadCSV("pembayaran")}
                disabled={!selectedTahunAjaran || loading}
                variant="outline"
                className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Arsip Data */}
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <Archive className="h-5 w-5" />
            Arsipkan Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              <strong>Catatan:</strong> Fitur arsip akan membuat backup semua
              data tagihan dan pembayaran untuk tahun ajaran yang dipilih.
              Setelah diarsipkan, Anda dapat memilih untuk menghapus data dari
              database atau menyimpannya.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleArsipData}
              disabled={!selectedTahunAjaran || loading}
              className="flex-1 bg-orange-600 hover:bg-orange-700 dark:border-orange-400 dark:text-orange-400">
              <Archive className="h-4 w-4 mr-2" />
              Arsipkan Data Tahun Ajaran
            </Button>
            <Button
              onClick={handleDownloadArchivedCSV}
              disabled={!selectedTahunAjaran || loading}
              className="flex-1 bg-orange-600 hover:bg-orange-700">
              <Download className="h-4 w-4 mr-2" />
              Unduh Arsip CSV
            </Button>
            <Button
              onClick={handleRestoreData}
              disabled={!selectedTahunAjaran || loading}
              variant={"outline"}
              className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400">
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
