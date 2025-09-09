import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Swal from "sweetalert2";
import apiClient from "@/config/axios";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export default function TambahGuruModal({ isOpen, onClose, onAdded }: Props) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    nama: "",
    nip: "",
    noHP: "",
    jenisKelamin: "",
    alamat: "",
    jabatan: "",
    fotoProfil: null as File | null,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectGender = (value: string) => {
    setForm({ ...form, jenisKelamin: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, fotoProfil: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null) formData.append(key, value as any);
    });

    try {
      Swal.fire({
        title: "Menyimpan...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      await apiClient.post("/guru", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.close();
      Swal.fire("Berhasil!", "Data guru berhasil ditambahkan.", "success");
      onAdded();
      onClose();
    } catch (error: any) {
      Swal.close();
      Swal.fire(
        "Gagal!",
        error.response?.data?.message || "Gagal menambahkan guru",
        "error"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Tambah Guru</DialogTitle>
          <DialogDescription>Isi data guru dengan lengkap.</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
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

          <div className="grid gap-2">
            <Label>Nama</Label>
            <Input
              type="text"
              placeholder="Nama"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>NIP</Label>
            <Input
              type="text"
              placeholder="NIP"
              name="nip"
              value={form.nip}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label>No HP</Label>
            <Input
              type="text"
              placeholder="08xxxxxxxxx"
              name="noHP"
              value={form.noHP}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label>Jenis Kelamin</Label>
            <Select
              onValueChange={handleSelectGender}
              value={form.jenisKelamin}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Jenis Kelamin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                <SelectItem value="Perempuan">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Alamat</Label>
            <Input
              type="text"
              placeholder="Alamat"
              name="alamat"
              value={form.alamat}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label>Jabatan</Label>
            <Input
              type="text"
              placeholder="Guru Mapel / Staff Sekolah"
              name="jabatan"
              value={form.jabatan}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label>Foto Profil</Label>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          <Button type="submit" className="mt-4">
            Simpan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
