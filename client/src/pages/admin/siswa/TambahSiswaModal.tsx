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
import { Eye, EyeOff } from "lucide-react";

interface Kelas {
  id_kelas: number;
  namaKelas: string;
}

interface Orangtua {
  id_orangtua: number;
  nama: string;
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
  // const [orangtuaList, setOrangtuaList] = useState<Orangtua[]>([]);

  const [formData, setFormData] = useState({
    nama: "",
    nis: "",
    email: "",
    password: "",
    alamat: "",
    tanggalLahir: "",
    jenisKelamin: "",
    kelasId: "",
    orangtuaNama: "",
    orangtuaHubungan: "",
    orangtuaPekerjaan: "",
    orangtuaAlamat: "",
    orangtuaNoHp: "",
  });

  const [fotoProfil, setFotoProfil] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // ambil daftar kelas dari backend
  const fetchKelas = async () => {
    try {
      const { data } = await apiClient.get("/kelas");
      setKelasList(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  // ambil daftar orangtua dari backend
  // const fetchOrangtua = async () => {
  //   try {
  //     const { data } = await apiClient.get("/orangtua");
  //     setOrangtuaList(data.data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  useEffect(() => {
    if (isOpen) {
      fetchKelas();
      // fetchOrangtua();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("nama", formData.nama);
      payload.append("nis", formData.nis);
      payload.append("email", formData.email);
      payload.append("password", formData.password);
      payload.append("alamat", formData.alamat);
      payload.append("tanggalLahir", formData.tanggalLahir);
      payload.append("jenisKelamin", formData.jenisKelamin);
      if (formData.kelasId) payload.append("kelasId", formData.kelasId);
      if (formData.orangtuaNama)
        payload.append("orangtuaNama", formData.orangtuaNama);
      if (formData.orangtuaHubungan)
        payload.append("orangtuaHubungan", formData.orangtuaHubungan);
      if (formData.orangtuaNoHp)
        payload.append("orangtuaNoHp", formData.orangtuaNoHp);

      if (fotoProfil) payload.append("fotoProfil", fotoProfil); // ✅ samakan dengan BE

      const { data } = await apiClient.post("/siswa", payload, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Siswa berhasil ditambahkan");
      onAdded(data.data);

      // ✅ reset sesuai state awal
      setFormData({
        nama: "",
        nis: "",
        email: "",
        password: "",
        alamat: "",
        tanggalLahir: "",
        jenisKelamin: "",
        kelasId: "",
        orangtuaNama: "",
        orangtuaHubungan: "",
        orangtuaPekerjaan: "",
        orangtuaAlamat: "",
        orangtuaNoHp: "",
      });
      setFotoProfil(null);
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
      <DialogContent className="bg-white rounded-2xl max-w-2xl mx-auto p-6">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle>Tambah Siswa</DialogTitle>
          <DialogDescription>
            Silahkan isi dengan data yang benar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Nama & NIS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2">Nama siswa</Label>
              <Input
                placeholder="Nama"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label className="mb-2">NIS</Label>
              <Input
                placeholder="NIS"
                name="nis"
                value={formData.nis}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email & Password */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2">Email siswa</Label>
              <Input
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label className="mb-2">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700">
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Alamat */}
          <div>
            <Label className="mb-2">Alamat siswa</Label>
            <Input
              placeholder="Alamat"
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
            />
          </div>

          {/* Tanggal Lahir & Jenis Kelamin */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <DateOfBirthPicker
                value={formData.tanggalLahir}
                onChange={(val) =>
                  setFormData({ ...formData, tanggalLahir: val })
                }
              />
            </div>
            <div>
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
            </div>
          </div>

          {/* Kelas & Orangtua */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2">Kelas siswa</Label>
              <Select
                value={formData.kelasId}
                onValueChange={(val) =>
                  setFormData({ ...formData, kelasId: val })
                }>
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
            </div>
            <div>
              <Label className="mb-2">Nama Orang Tua</Label>
              <Input
                placeholder="Nama Orang Tua"
                name="orangtuaNama"
                value={formData.orangtuaNama}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label className="mb-2">Hubungan</Label>
              <Input
                placeholder="Ayah / Ibu / Wali"
                name="orangtuaHubungan"
                value={formData.orangtuaHubungan}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label className="mb-2">Pekerjaan</Label>
              <Input
                placeholder="Pekerjaan Orang Tua"
                name="orangtuaPekerjaan"
                value={formData.orangtuaPekerjaan}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label className="mb-2">Alamat Orang Tua</Label>
              <Input
                placeholder="Alamat Orang Tua"
                name="orangtuaAlamat"
                value={formData.orangtuaAlamat}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label className="mb-2">No. HP</Label>
              <Input
                placeholder="08xxxxxxxx"
                name="orangtuaNoHp"
                value={formData.orangtuaNoHp}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Upload Foto */}
          <div>
            <Label className="mb-2">Foto Profil</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setFotoProfil(e.target.files?.[0] || null)}
            />
          </div>

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
