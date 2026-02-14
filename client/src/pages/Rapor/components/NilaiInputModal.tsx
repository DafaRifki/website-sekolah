import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { inputNilai, updateNilai } from "@/services/nilai.service";
import type { NilaiInput } from "@/types/nilai.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  siswa: {
    id_siswa: number;
    nis: string;
    nama: string;
  };
  mapel: {
    id_mapel: number;
    namaMapel: string;
  };
  tahunAjaranId: number;
  semester: string;
  existingNilai?: {
    id_nilai: number;
    nilai: number;
    nilaiTugas?: number;
    nilaiUTS?: number;
    nilaiUAS?: number;
  };
}

type InputMode = "final" | "breakdown";

export default function NilaiInputModal({
  isOpen,
  onClose,
  onSuccess,
  siswa,
  mapel,
  tahunAjaranId,
  semester,
  existingNilai,
}: Props) {
  const [mode, setMode] = useState<InputMode>("breakdown");
  const [nilai, setNilai] = useState("");
  const [nilaiTugas, setNilaiTugas] = useState("");
  const [nilaiUTS, setNilaiUTS] = useState("");
  const [nilaiUAS, setNilaiUAS] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && existingNilai) {
      setNilai(existingNilai.nilai?.toString() || "");
      setNilaiTugas(existingNilai.nilaiTugas?.toString() || "");
      setNilaiUTS(existingNilai.nilaiUTS?.toString() || "");
      setNilaiUAS(existingNilai.nilaiUAS?.toString() || "");

      if (
        existingNilai.nilaiTugas &&
        existingNilai.nilaiUTS &&
        existingNilai.nilaiUAS
      ) {
        setMode("breakdown");
      } else {
        setMode("final");
      }
    } else if (isOpen && !existingNilai) {
      resetForm();
    }
  }, [isOpen, existingNilai]);

  const calculateNilaiAkhir = (): number => {
    const tugas = parseFloat(nilaiTugas) || 0;
    const uts = parseFloat(nilaiUTS) || 0;
    const uas = parseFloat(nilaiUAS) || 0;

    const final = tugas * 0.3 + uts * 0.3 + uas * 0.4;
    return Math.round(final * 10) / 10;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: any = {
        id_siswa: siswa.id_siswa,
        id_mapel: mapel.id_mapel,
        tahunAjaranId,
        semester,
      };

      if (mode === "final") {
        if (!nilai) {
          toast.error("Nilai harus diisi");
          setLoading(false);
          return;
        }
        payload.nilai = parseFloat(nilai);
      } else {
        if (!nilaiTugas || !nilaiUTS || !nilaiUAS) {
          toast.error("Semua komponen nilai harus diisi");
          setLoading(false);
          return;
        }
        payload.nilaiTugas = parseFloat(nilaiTugas);
        payload.nilaiUTS = parseFloat(nilaiUTS);
        payload.nilaiUAS = parseFloat(nilaiUAS);
      }

      if (existingNilai) {
        await updateNilai(existingNilai.id_nilai, payload);
        toast.success("Nilai berhasil diupdate");
      } else {
        await inputNilai(payload);
        toast.success("Nilai berhasil diinput");
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error("Error saving nilai:", error);
      toast.error(error.response?.data?.message || "Gagal menyimpan nilai");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMode("breakdown");
    setNilai("");
    setNilaiTugas("");
    setNilaiUTS("");
    setNilaiUAS("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingNilai ? "Edit" : "Input"} Nilai - {siswa.nama}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Siswa Info */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">NIS</p>
              <p className="font-medium">{siswa.nis}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Mata Pelajaran</p>
              <p className="font-medium">{mapel.namaMapel}</p>
            </div>
          </div>

          {/* Input Mode Selector */}
          <div className="space-y-2">
            <Label>Mode Input</Label>
            <RadioGroup
              value={mode}
              onValueChange={(v) => setMode(v as InputMode)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="final" id="final" />
                <Label htmlFor="final" className="cursor-pointer">
                  Nilai Final
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="breakdown" id="breakdown" />
                <Label htmlFor="breakdown" className="cursor-pointer">
                  Breakdown Nilai
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Input Fields */}
          {mode === "final" ? (
            <div className="space-y-2">
              <Label>Nilai Akhir</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={nilai}
                onChange={(e) => setNilai(e.target.value)}
                placeholder="0-100"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Tugas (30%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={nilaiTugas}
                    onChange={(e) => setNilaiTugas(e.target.value)}
                    placeholder="0-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>UTS (30%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={nilaiUTS}
                    onChange={(e) => setNilaiUTS(e.target.value)}
                    placeholder="0-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>UAS (40%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={nilaiUAS}
                    onChange={(e) => setNilaiUAS(e.target.value)}
                    placeholder="0-100"
                  />
                </div>
              </div>

              {/* Calculated Final */}
              {nilaiTugas && nilaiUTS && nilaiUAS && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    Nilai Akhir (Otomatis):{" "}
                    <span className="font-bold text-lg">
                      {calculateNilaiAkhir()}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
