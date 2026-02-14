// src/pages/Rapor/components/BulkGenerateModal.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface BulkGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  kelas: any[];
  selectedKelas: string;
  selectedTahunAjaran: string;
  selectedSemester: string;
}

export default function BulkGenerateModal({
  isOpen,
  onClose,
  onSuccess,
  kelas,
  selectedKelas,
  selectedTahunAjaran,
  selectedSemester,
}: BulkGenerateModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);

    // Simulate API call
    setTimeout(() => {
      setResult({
        success: 28,
        failed: 2,
        total: 30,
      });
      setLoading(false);

      // Auto close after showing result
      setTimeout(() => {
        onSuccess();
        onClose();
        setResult(null);
      }, 3000);
    }, 2000);
  };

  const selectedKelasName = kelas.find(
    (k) => k.id_kelas === parseInt(selectedKelas),
  )?.namaKelas;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Bulk Generate Rapor
          </DialogTitle>
          <DialogDescription>
            Generate rapor untuk semua siswa di kelas sekaligus
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!result ? (
            <>
              <div className="space-y-2">
                <Label>Kelas</Label>
                <div className="p-3 bg-slate-100 rounded-lg border">
                  <p className="font-medium text-slate-900">
                    {selectedKelasName || "Pilih kelas terlebih dahulu"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tahun Ajaran</Label>
                  <div className="p-2 bg-slate-100 rounded text-sm">
                    2024/2025
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <div className="p-2 bg-slate-100 rounded text-sm">
                    Semester {selectedSemester}
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Semua siswa di kelas <strong>{selectedKelasName}</strong> akan
                  dibuatkan rapor. Proses ini mungkin memakan waktu beberapa
                  menit.
                </AlertDescription>
              </Alert>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>Peringatan:</strong> Rapor yang sudah ada akan
                  di-update dengan data terbaru.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-4">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Bulk Generate Selesai!
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-600">
                    {result.success}
                  </p>
                  <p className="text-xs text-green-700">Berhasil</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-2xl font-bold text-red-600">
                    {result.failed}
                  </p>
                  <p className="text-xs text-red-700">Gagal</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-2xl font-bold text-blue-600">
                    {result.total}
                  </p>
                  <p className="text-xs text-blue-700">Total</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!result ? (
            <>
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Batal
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!selectedKelas || loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Semua"
                )}
              </Button>
            </>
          ) : (
            <Button onClick={onClose} className="w-full">
              Tutup
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
