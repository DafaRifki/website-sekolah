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

interface TambahKelasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // untuk refresh data di DataKelasPage
}

export default function TambahKelasModal({
  isOpen,
  onClose,
  onSuccess,
}: TambahKelasModalProps) {
  const [namaKelas, setNamaKelas] = useState("");
  const [tingkat, setTingkat] = useState("");
  const [waliId, setWaliId] = useState<string>("none");
  const [guruList, setGuruList] = useState<Guru[]>([]);

  // Fetch daftar guru
  useEffect(() => {
    if (isOpen) {
      apiClient
        .get("/guru")
        .then((res) => setGuruList(res.data.data))
        .catch((err) => console.error("Gagal fetch guru:", err));
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    try {
      if (!namaKelas || !tingkat) {
        Swal.fire("Error", "Nama kelas dan tingkat wajib diisi", "error");
        return;
      }

      await apiClient.post("/kelas", {
        namaKelas,
        tingkat,
        waliId: waliId === "none" ? null : parseInt(waliId),
      });

      Swal.fire("Berhasil", "Kelas berhasil ditambahkan", "success");
      onSuccess();
      onClose();
      setNamaKelas("");
      setTingkat("");
      setWaliId("none");
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
          <DialogTitle>Tambah Kelas</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan kelas baru.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nama Kelas */}
          <div>
            <label className="block text-sm font-medium">Nama Kelas</label>
            <Input
              value={namaKelas}
              onChange={(e) => setNamaKelas(e.target.value)}
              placeholder="contoh: X IPA 1"
            />
          </div>

          {/* Tingkat */}
          <div>
            <label className="block text-sm font-medium">Tingkat</label>
            <Input
              value={tingkat}
              onChange={(e) => setTingkat(e.target.value)}
              placeholder="contoh: X"
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
          <Button onClick={handleSubmit}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
