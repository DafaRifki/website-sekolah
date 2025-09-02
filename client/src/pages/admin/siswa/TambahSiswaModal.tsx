import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import apiClient from "@/config/axios";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import DateOfBirthPicker from "@/components/DateOfBirthPicker";

interface Kelas {
  id_kelas: number;
  namaKelas: string;
}

interface TambahSiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: (newSiswa: any) => void;
}

const TambahSiswaModal: React.FC<TambahSiswaModalProps> = ({
  isOpen,
  onClose,
  onAdded,
}) => {
  const [loading, setLoading] = useState(false);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [formData, setFormData] = useState({
    nama: "",
    nis: "",
    email: "",
    password: "",
    alamat: "",
    tanggalLahir: "",
    jenisKelamin: "",
    kelasId: "",
  });

  // ambil daftar kelas dari backend
  const fetchKelas = async () => {
    try {
      const { data } = await apiClient.get("/kelas");
      setKelasList(data.data); // asumsi API return { data: [...] }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchKelas();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        nama: formData.nama,
        nis: formData.nis,
        email: formData.email,
        password: formData.password,
        alamat: formData.alamat,
        tanggalLahir: formData.tanggalLahir,
        jenisKelamin: formData.jenisKelamin,
        kelasId: formData.kelasId ? parseInt(formData.kelasId) : null,
      };

      const { data } = await apiClient.post("/siswa", payload, {
        withCredentials: true,
      });

      toast.success("Siswa berhasil ditambahkan");
      onAdded(data.data); // karena di controller return `data: siswa`
      setFormData({
        nama: "",
        nis: "",
        email: "",
        password: "",
        alamat: "",
        tanggalLahir: "",
        jenisKelamin: "",
        kelasId: "",
      });
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menambahkan siswa");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
      <DialogContent className="bg-white rounded-2xl max-w-md mx-auto p-6">
        <DialogHeader>
          <DialogTitle>Tambah Siswa</DialogTitle>
          <DialogDescription>
            Silahkan isi dengan data yang benar
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <Label className="mb-2">Nama siswa</Label>
          <Input
            placeholder="Nama"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
          />
          <Label className="mb-2">NIS</Label>
          <Input
            placeholder="NIS"
            name="nis"
            value={formData.nis}
            onChange={handleChange}
          />
          <Label className="mb-2">Email siswa</Label>
          <Input
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <Label className="mb-2">Alamat siswa</Label>
          <Input
            placeholder="Alamat"
            name="alamat"
            value={formData.alamat}
            onChange={handleChange}
          />

          <Label className="mb-2">Password</Label>
          <Input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          {/* 🔥 Ganti dengan DateOfBirthPicker */}
          <DateOfBirthPicker
            value={formData.tanggalLahir}
            onChange={(val) => setFormData({ ...formData, tanggalLahir: val })}
          />

          <Label className="mb-2">Jenis Kelamin</Label>
          <Select
            value={formData.jenisKelamin}
            onValueChange={(val) =>
              setFormData({ ...formData, jenisKelamin: val })
            }>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Jenis Kelamin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Laki-laki">Laki-laki</SelectItem>
              <SelectItem value="Perempuan">Perempuan</SelectItem>
            </SelectContent>
          </Select>

          {/* Dropdown Kelas */}
          <Label className="mb-2">Kelas siswa</Label>
          <Select
            value={formData.kelasId}
            onValueChange={(val) => setFormData({ ...formData, kelasId: val })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Kelas" />
            </SelectTrigger>
            <SelectContent>
              {kelasList.map((k) => (
                <SelectItem key={k.id_kelas} value={String(k.id_kelas)}>
                  {k.namaKelas}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={onClose}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TambahSiswaModal;
