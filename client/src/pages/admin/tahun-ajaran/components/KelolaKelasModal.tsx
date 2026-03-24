"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  AlertCircle,
  Users,
  GraduationCap,
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
  initialKelasRel?: any[]; 
  onSuccess?: () => void;
}

export default function KelolaKelasModal({
  isOpen,
  onClose,
  tahunAjaranId,
  initialKelasRel = [], 
  onSuccess,
}: KelolaKelasModalProps) {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    const mapped = initialKelasRel.map((rel: any) => ({
      id_kelas: rel.kelas?.id_kelas || 0,
      namaKelas: rel.kelas?.namaKelas || "Tanpa Nama",
      tingkat: rel.kelas?.tingkat || "-",
      isActive: rel.isActive || false,
    }));
    
    setKelasList(mapped);
  }, [isOpen, initialKelasRel]);

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
          "Gagal menyimpan perubahan. Pastikan API backend berjalan dengan benar."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKelas = (kelas: Kelas) => {
    onClose();

    setTimeout(async () => {
      const result = await Swal.fire({
        title: "Konfirmasi Hapus Kelas",
        html: `
          <div class="text-left space-y-3">
            <p class="text-gray-700">
              Apakah Anda yakin ingin menghapus kelas <strong>${kelas.namaKelas}</strong> dari tahun ajaran ini?
            </p>
          </div>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Ya, Hapus Kelas",
        cancelButtonText: "Batal",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: "Menghapus...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        try {
          await apiClient.delete(
            `/tahun-ajaran/${tahunAjaranId}/kelas/${kelas.id_kelas}`
          );
          
          Swal.fire("Berhasil!", `Kelas ${kelas.namaKelas} berhasil dihapus`, "success");
          onSuccess?.();
        } catch (err: any) {
          Swal.fire("Gagal!", err.response?.data?.message || "Terjadi kesalahan", "error");
        }
      }
    }, 200);
  };

  // --- FITUR BARU: HAPUS TAHUN AJARAN ---
  const handleDeleteTahunAjaran = () => {
    onClose();

    setTimeout(async () => {
      const result = await Swal.fire({
        title: "Hapus Tahun Ajaran?",
        html: `
          <div class="text-left space-y-3">
            <p class="text-gray-700">
              Apakah Anda yakin ingin menghapus <strong>Tahun Ajaran</strong> ini?
            </p>
            <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
              <p class="text-red-800 text-sm">
                <strong>Catatan:</strong> Tahun ajaran tidak bisa dihapus jika masih ada kelas, siswa, atau absensi di dalamnya, atau jika masih berstatus aktif.
              </p>
            </div>
          </div>
        `,
        icon: "error", // Menggunakan icon error agar lebih terkesan destruktif/bahaya
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Ya, Hapus Permanen",
        cancelButtonText: "Batal",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: "Menghapus Tahun Ajaran...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        try {
          await apiClient.delete(`/tahun-ajaran/${tahunAjaranId}`);
          
          Swal.fire("Terhapus!", "Tahun ajaran berhasil dihapus permanen.", "success");
          onSuccess?.(); // Refresh tampilan luar agar tahun ajarannya hilang dari grid
        } catch (err: any) {
          Swal.fire(
            "Gagal Menghapus!", 
            err.response?.data?.message || "Tahun ajaran tidak dapat dihapus karena ada data yang terkait.", 
            "error"
          );
        }
      }
    }, 200);
  };
  // --------------------------------------

  const totalKelas = kelasList.length;
  const kelasAktif = kelasList.filter((k) => k.isActive).length;

  const kelasByTingkat = kelasList.reduce((acc, kelas) => {
    const tingkat = kelas.tingkat;
    if (!acc[tingkat]) acc[tingkat] = [];
    acc[tingkat].push(kelas);
    return acc;
  }, {} as Record<string, Kelas[]>);

  const sortedTingkat = Object.keys(kelasByTingkat).sort();

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

        <div className="space-y-6">
          <Card className="border-0 shadow-sm bg-blue-50/50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Status Kelas</h3>
                    <p className="text-sm text-slate-600">{kelasAktif} dari {totalKelas} kelas aktif</p>
                  </div>
                </div>
              </div>
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
              {totalKelas === 0 ? (
                 <p className="text-center text-gray-500 py-4">Tidak ada kelas di tahun ajaran ini.</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {sortedTingkat.map((tingkat) => (
                    <div key={tingkat} className="space-y-2">
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-700">Tingkat {tingkat}</h4>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {kelasByTingkat[tingkat].map((kelas) => (
                          <div key={kelas.id_kelas} className="flex items-center justify-between p-3 rounded-lg border bg-white">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{kelas.namaKelas}</p>
                                <p className="text-xs text-slate-600">{kelas.isActive ? "Aktif" : "Nonaktif"}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <Checkbox
                                checked={kelas.isActive}
                                onCheckedChange={() => toggleKelas(kelas.id_kelas)}
                                className="scale-110"
                              />
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteKelas(kelas)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* PERBAIKAN: DialogFooter sekarang dibagi dua (Kiri untuk Hapus, Kanan untuk Batal/Simpan) */}
        <DialogFooter className="gap-3 pt-6 border-t mt-2 flex flex-col sm:flex-row sm:justify-between items-center w-full">
          <Button 
            variant="destructive" 
            onClick={handleDeleteTahunAjaran} 
            disabled={loading}
            className="w-full sm:w-auto bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200 border"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus Tahun Ajaran
          </Button>

          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 sm:flex-none">
              Batal
            </Button>
            <Button onClick={handleSave} disabled={loading || totalKelas === 0} className="flex-1 sm:flex-none">
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}