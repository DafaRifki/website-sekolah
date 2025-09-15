import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import apiClient from "@/config/axios";
import Swal from "sweetalert2";

interface Guru {
  id_guru: number;
  nama: string;
}

interface TahunAjaran {
  id_tahun: number;
  namaTahun: string;
  isActive: boolean;
}

interface Kelas {
  id_kelas: number;
  namaKelas: string;
  tingkat: string;
  guru?: Guru | null;
  tahunRel?: {
    tahunAjaran: TahunAjaran;
    isActive: boolean;
  }[];
}

interface EditKelasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  kelas: Kelas | null;
}

export default function EditKelasModal({
  isOpen,
  onClose,
  onSuccess,
  kelas,
}: EditKelasModalProps) {
  const [namaKelas, setNamaKelas] = useState("");
  const [tingkat, setTingkat] = useState("");
  const [waliId, setWaliId] = useState<string>("none");
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [tahunAjaranId, setTahunAjaranId] = useState<string>("none");
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [setActive, setSetActive] = useState(false);

  useEffect(() => {
    if (kelas) {
      setNamaKelas(kelas.namaKelas);
      setTingkat(kelas.tingkat);
      setWaliId(kelas.guru ? kelas.guru.id_guru.toString() : "none");

      if (kelas.tahunRel && kelas.tahunRel.length > 0) {
        const activeTahun = kelas.tahunRel[0].tahunAjaran;
        setTahunAjaranId(activeTahun.id_tahun.toString());
      } else {
        setTahunAjaranId("none");
      }

      setSetActive(false);
    }
  }, [kelas]);

  useEffect(() => {
    if (isOpen) {
      apiClient
        .get("/guru")
        .then((res) => setGuruList(res.data.data))
        .catch((err) => console.error("Gagal fetch guru:", err));

      apiClient
        .get("/tahun-ajaran")
        .then((res) => setTahunAjaranList(res.data.data))
        .catch((err) => console.error("Gagal fetch tahun ajaran:", err));
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!kelas) return;

    try {
      if (!namaKelas || !tingkat || tahunAjaranId === "none") {
        Swal.fire(
          "Error",
          "Nama kelas, tingkat, dan tahun ajaran wajib diisi",
          "error"
        );
        return;
      }

      await apiClient.patch(`/kelas/${kelas.id_kelas}`, {
        namaKelas,
        tingkat,
        waliId: waliId === "none" ? null : parseInt(waliId),
        tahunAjaranId: parseInt(tahunAjaranId),
        isActive: setActive,
      });

      Swal.fire("Berhasil", "Kelas berhasil diperbarui", "success");
      onSuccess();
      onClose();
    } catch (error: any) {
      Swal.fire(
        "Gagal",
        error.response?.data?.message || error.message,
        "error"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Kelas</DialogTitle>
          <DialogDescription>Perbarui informasi kelas</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nama Kelas */}
          <div className="space-y-2">
            <Label htmlFor="namaKelas">Nama Kelas</Label>
            <Input
              id="namaKelas"
              value={namaKelas}
              onChange={(e) => setNamaKelas(e.target.value)}
              placeholder="Masukkan nama kelas"
            />
          </div>

          {/* Tingkat */}
          <div className="space-y-2">
            <Label htmlFor="tingkat">Tingkat</Label>
            <Input
              id="tingkat"
              value={tingkat}
              onChange={(e) => setTingkat(e.target.value)}
              placeholder="Masukkan tingkat"
            />
          </div>

          {/* Wali Kelas */}
          <div className="space-y-2">
            <Label>Wali Kelas</Label>
            <Select value={waliId} onValueChange={setWaliId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih wali kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak ada wali kelas</SelectItem>
                {guruList.map((g) => (
                  <SelectItem key={g.id_guru} value={g.id_guru.toString()}>
                    {g.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tahun Ajaran */}
          <div className="space-y-2">
            <Label>Tahun Ajaran</Label>
            <Select value={tahunAjaranId} onValueChange={setTahunAjaranId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tahun ajaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Belum ada tahun ajaran</SelectItem>
                {tahunAjaranList.map((t) => (
                  <SelectItem key={t.id_tahun} value={t.id_tahun.toString()}>
                    {t.namaTahun} {t.isActive && "(aktif)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Checkbox Aktif */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="setActive"
              checked={setActive}
              onCheckedChange={setSetActive}
            />
            <Label htmlFor="setActive" className="text-sm">
              Jadikan tahun ajaran ini aktif
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSubmit}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
