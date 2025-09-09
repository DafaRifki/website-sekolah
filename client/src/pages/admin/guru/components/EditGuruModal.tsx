import React, { useState, useEffect } from "react";
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

interface Guru {
  id_guru: number;
  nama: string;
  nip?: string;
  noHP?: string;
  jenisKelamin?: string;
  alamat?: string;
  jabatan?: string;
  fotoProfil?: string;
  user?: { email: string; role: string };
}

interface Props {
  guru: Guru | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (guru: Guru) => void;
}

export default function EditGuruModal({
  guru,
  isOpen,
  onClose,
  onUpdated,
}: Props) {
  const [form, setForm] = useState({
    email: "",
    nama: "",
    nip: "",
    noHP: "",
    jenisKelamin: "",
    alamat: "",
    jabatan: "",
    fotoProfil: null as File | null,
    role: "GURU",
  });

  useEffect(() => {
    if (guru) {
      setForm({
        email: guru.user?.email || "",
        nama: guru.nama || "",
        nip: guru.nip || "",
        noHP: guru.noHP || "",
        jenisKelamin: guru.jenisKelamin || "",
        alamat: guru.alamat || "",
        jabatan: guru.jabatan || "",
        fotoProfil: null,
        role: guru.user?.role || "GURU",
      });
    }
  }, [guru]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, fotoProfil: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guru) return;

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

      const res = await apiClient.patch(`/guru/${guru.id_guru}`, formData);

      Swal.close();
      Swal.fire("Berhasil!", "Data guru berhasil diperbarui.", "success");

      // 🔹 update langsung ke parent
      onUpdated(res.data.data);

      onClose?.();
    } catch (error: any) {
      Swal.close();
      Swal.fire(
        "Gagal!",
        error.response?.data?.message || error.message,
        "error"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Edit Guru</DialogTitle>
          <DialogDescription>
            Perbarui data guru dengan benar.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Nama</Label>
            <Input
              type="text"
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
              name="nip"
              value={form.nip}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label>No HP</Label>
            <Input
              type="text"
              name="noHP"
              value={form.noHP}
              onChange={handleChange}
            />
          </div>

          {/* Jenis Kelamin dan Role bersebelahan */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Jenis Kelamin</Label>
              <Select
                onValueChange={(value) =>
                  setForm({ ...form, jenisKelamin: value })
                }
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
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(value) => setForm({ ...form, role: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="GURU">Guru</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Alamat</Label>
            <Input
              type="text"
              name="alamat"
              value={form.alamat}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label>Jabatan</Label>
            <Input
              type="text"
              name="jabatan"
              value={form.jabatan}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label>Foto Profil</Label>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {guru?.fotoProfil && (
              <img
                src={`http://localhost:3000/uploads/${guru.fotoProfil}`}
                alt={guru.nama}
                className="w-20 h-20 rounded-full mt-2 object-cover border"
              />
            )}
          </div>

          <Button type="submit" className="mt-4">
            Simpan Perubahan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
