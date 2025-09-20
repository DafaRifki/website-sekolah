"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Settings,
  CheckCircle,
  AlertCircle,
  Users,
  GraduationCap,
  Power,
  Filter,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import Swal from "sweetalert2";
import apiClient from "@/config/axios";

interface Kelas {
  id_kelas: number;
  namaKelas: string;
  tingkat: string;
  isActive: boolean;
}

interface KelolaKelasModalProps {
  isOpen: boolean;
  onClose: () => void;
  tahunAjaranId: number;
  onSuccess?: () => void;
}

export default function KelolaKelasModal({
  isOpen,
  onClose,
  tahunAjaranId,
  onSuccess,
}: KelolaKelasModalProps) {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [filterTingkat, setFilterTingkat] = useState<string>("all-tingkat");

  useEffect(() => {
    if (!isOpen) return;

    const fetchKelas = async () => {
      try {
        setFetchLoading(true);
        setError(null);
        const res = await apiClient.get(`/tahun-ajaran/${tahunAjaranId}`);
        const mapped = res.data.data.kelasRel.map((rel: any) => ({
          id_kelas: rel.kelas.id_kelas,
          namaKelas: rel.kelas.namaKelas,
          tingkat: rel.kelas.tingkat,
          isActive: rel.isActive,
        }));
        setKelasList(mapped);
        setSelectAll(mapped.every((k: Kelas) => k.isActive));
      } catch (err: any) {
        console.error(err);
        setError("Gagal memuat data kelas. Silakan coba lagi.");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchKelas();
  }, [isOpen, tahunAjaranId]);

  const toggleKelas = (id: number) => {
    setKelasList((prev) =>
      prev.map((k) => (k.id_kelas === id ? { ...k, isActive: !k.isActive } : k))
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.put("/tahun-ajaran/kelas/bulk-update", {
        kelas: kelasList,
        tahunAjaranId,
      });
      onClose();
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan perubahan"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKelas = async (kelas: Kelas) => {
    // SweetAlert2 confirmation dialog
    const result = await Swal.fire({
      title: "Konfirmasi Hapus Kelas",
      html: `
        <div class="text-left space-y-3">
          <p class="text-gray-700">
            Apakah Anda yakin ingin menghapus kelas <strong>${kelas.namaKelas}</strong> dari tahun ajaran ini?
          </p>
          <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
            <div class="flex items-start gap-2">
              <div class="text-amber-600 mt-0.5">⚠️</div>
              <div>
                <p class="text-amber-800 font-medium text-sm">Peringatan:</p>
                <ul class="text-amber-700 text-sm mt-1 space-y-1">
                  <li>• Menghapus kelas dari tahun ajaran ini</li>
                  <li>• Menghapus semua data siswa yang terkait</li>
                  <li>• Tindakan ini tidak dapat dibatalkan</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "🗑️ Ya, Hapus Kelas",
      cancelButtonText: "Batal",
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: "rounded-xl border-0 shadow-xl",
        title: "text-xl font-bold text-gray-900",
        htmlContainer: "text-left",
        confirmButton: "rounded-lg px-6 py-2.5 font-medium",
        cancelButton: "rounded-lg px-6 py-2.5 font-medium",
      },
      didOpen: () => {
        // Add custom styling to make it more professional
        const popup = Swal.getPopup();
        if (popup) {
          popup.style.fontFamily = "Inter, system-ui, sans-serif";
        }
      },
    });

    if (result.isConfirmed) {
      // Show loading
      Swal.fire({
        title: "Menghapus Kelas...",
        text: "Mohon tunggu sebentar",
        icon: "info",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        customClass: {
          popup: "rounded-xl border-0 shadow-xl",
        },
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        // API call untuk hapus kelas dari tahun ajaran
        await apiClient.delete(
          `/tahun-ajaran/${tahunAjaranId}/kelas/${kelas.id_kelas}`
        );

        // Update local state
        setKelasList((prev) =>
          prev.filter((k) => k.id_kelas !== kelas.id_kelas)
        );

        // Success message
        await Swal.fire({
          title: "Berhasil!",
          text: `Kelas ${kelas.namaKelas} berhasil dihapus dari tahun ajaran`,
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#059669",
          customClass: {
            popup: "rounded-xl border-0 shadow-xl",
            title: "text-xl font-bold text-gray-900",
            confirmButton: "rounded-lg px-6 py-2.5 font-medium",
          },
          timer: 3000,
          timerProgressBar: true,
        });
      } catch (err: any) {
        console.error("Delete Error Details:", {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            params: err.config?.params,
          },
        });

        // Error message
        await Swal.fire({
          title: "Gagal Menghapus!",
          text:
            err.response?.data?.message ||
            "Terjadi kesalahan saat menghapus kelas",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#dc2626",
          customClass: {
            popup: "rounded-xl border-0 shadow-xl",
            title: "text-xl font-bold text-gray-900",
            confirmButton: "rounded-lg px-6 py-2.5 font-medium",
          },
        });

        setError(
          err.response?.data?.message ||
            "Terjadi kesalahan saat menghapus kelas"
        );
      }
    }
  };

  const handleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setKelasList((prev) =>
      prev.map((k) =>
        filterTingkat && filterTingkat !== "all-tingkat"
          ? k.tingkat === filterTingkat
            ? { ...k, isActive: newValue }
            : k
          : { ...k, isActive: newValue }
      )
    );
  };

  const filteredKelas =
    filterTingkat && filterTingkat !== "all-tingkat"
      ? kelasList.filter((k) => k.tingkat === filterTingkat)
      : kelasList;

  const tingkatOptions = Array.from(
    new Set(kelasList.map((k) => k.tingkat))
  ).sort((a, b) => {
    const order = ["X", "XI", "XII"];
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // Statistics
  const totalKelas = kelasList.length;
  const kelasAktif = kelasList.filter((k) => k.isActive).length;
  const filteredAktif = filteredKelas.filter((k) => k.isActive).length;

  // Group by tingkat for better organization
  const kelasByTingkat = filteredKelas.reduce((acc, kelas) => {
    const tingkat = kelas.tingkat;
    if (!acc[tingkat]) {
      acc[tingkat] = [];
    }
    acc[tingkat].push(kelas);
    return acc;
  }, {} as Record<string, Kelas[]>);

  const sortedTingkat = Object.keys(kelasByTingkat).sort((a, b) => {
    const order = ["X", "XI", "XII"];
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Kelola Status Kelas
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
            Atur status aktif/nonaktif untuk setiap kelas dalam tahun ajaran ini
          </DialogDescription>
          <Separator />
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {fetchLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Memuat data kelas...
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Statistics Card */}
            <Card className="border-0 shadow-sm bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        Status Kelas
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {kelasAktif} dari {totalKelas} kelas aktif
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      <Power className="h-3 w-3 mr-1" />
                      {kelasAktif} aktif
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filter and Controls */}
            <Card className="border-0 shadow-sm bg-slate-50/50 dark:bg-slate-800/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="h-4 w-4 text-purple-600" />
                  Filter dan Kontrol
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Select
                      value={filterTingkat}
                      onValueChange={setFilterTingkat}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter berdasarkan tingkat..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-tingkat">
                          Semua Tingkat
                        </SelectItem>
                        {tingkatOptions.map((tingkat) => (
                          <SelectItem key={tingkat} value={tingkat}>
                            Tingkat {tingkat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleSelectAll}
                    className="flex items-center gap-2">
                    {selectAll ? (
                      <>
                        <ToggleRight className="h-4 w-4" />
                        Nonaktifkan Semua
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-4 w-4" />
                        Aktifkan Semua
                      </>
                    )}
                  </Button>
                </div>

                {filterTingkat && filterTingkat !== "all-tingkat" && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Filter className="h-3 w-3" />
                    Menampilkan {filteredKelas.length} kelas tingkat{" "}
                    {filterTingkat}({filteredAktif} aktif)
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Class List */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-green-600" />
                  Daftar Kelas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {sortedTingkat.map((tingkat) => (
                    <div key={tingkat} className="space-y-2">
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-purple-500" />
                          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Tingkat {tingkat}
                          </h4>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {kelasByTingkat[tingkat].length} kelas
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {kelasByTingkat[tingkat].map((kelas) => (
                          <div
                            key={kelas.id_kelas}
                            className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  kelas.isActive
                                    ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                                    : "bg-slate-400"
                                }`}
                              />
                              <div className="flex-1">
                                <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                                  {kelas.namaKelas}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  Tingkat {kelas.tingkat} •{" "}
                                  {kelas.isActive ? "Aktif" : "Nonaktif"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  kelas.isActive ? "default" : "secondary"
                                }
                                className="text-xs">
                                {kelas.isActive ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Aktif
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Nonaktif
                                  </>
                                )}
                              </Badge>

                              <Checkbox
                                checked={kelas.isActive}
                                onCheckedChange={() =>
                                  toggleKelas(kelas.id_kelas)
                                }
                                className="scale-110"
                              />

                              {/* Delete Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteKelas(kelas)}
                                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 rounded-full">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary Alert */}
            {kelasList.length > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p>
                      <strong>Ringkasan perubahan:</strong> {kelasAktif} dari{" "}
                      {totalKelas} kelas akan aktif.
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Klik "Simpan Perubahan" untuk menerapkan perubahan status
                      kelas.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter className="gap-3 pt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="px-6">
            Batal
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || fetchLoading}
            className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Menyimpan...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Simpan Perubahan
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
