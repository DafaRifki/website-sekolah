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
import { useEffect, useState } from "react";
import apiClient from "@/config/axios";
import Swal from "sweetalert2";

interface Guru {
  id_guru: number;
  nama: string;
}

interface Kelas {
  id_kelas: number;
  namaKelas: string;
  tingkat: string;
  guru?: Guru | null;
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

  // Sync state dengan kelas yang dipilih
  useEffect(() => {
    if (kelas) {
      setNamaKelas(kelas.namaKelas);
      setTingkat(kelas.tingkat);
      setWaliId(kelas.guru ? kelas.guru.id_guru.toString() : "none");
    }
  }, [kelas]);

  // Fetch guru hanya ketika modal dibuka
  useEffect(() => {
    if (isOpen) {
      apiClient
        .get("/guru")
        .then((res) => setGuruList(res.data.data))
        .catch((err) => console.error("Gagal fetch guru:", err));
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!kelas) return;

    try {
      if (!namaKelas || !tingkat) {
        Swal.fire("Error", "Nama kelas dan tingkat wajib diisi", "error");
        return;
      }

      await apiClient.patch(`/kelas/${kelas.id_kelas}`, {
        namaKelas,
        tingkat,
        waliId: waliId === "none" ? null : parseInt(waliId),
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Kelas</DialogTitle>
          <DialogDescription>
            Ubah data kelas di bawah, lalu simpan untuk memperbarui.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nama Kelas */}
          <div>
            <label className="block text-sm font-medium">Nama Kelas</label>
            <Input
              value={namaKelas}
              onChange={(e) => setNamaKelas(e.target.value)}
            />
          </div>

          {/* Tingkat */}
          <div>
            <label className="block text-sm font-medium">Tingkat</label>
            <Input
              value={tingkat}
              onChange={(e) => setTingkat(e.target.value)}
            />
          </div>

          {/* Wali Kelas */}
          <div>
            <label className="block text-sm font-medium">Wali Kelas</label>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSubmit}>Simpan Perubahan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
