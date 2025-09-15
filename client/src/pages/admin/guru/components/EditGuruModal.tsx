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
import { User, Camera, Save } from "lucide-react";
import defaultAvatar from "../../../../assets/avatar.png";

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

  const [previewImage, setPreviewImage] = useState<string>("");

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

      // Set preview image
      if (guru.fotoProfil) {
        setPreviewImage(`http://localhost:3000/uploads/${guru.fotoProfil}`);
      } else {
        setPreviewImage(defaultAvatar);
      }
    }
  }, [guru]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm({ ...form, fotoProfil: file });

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guru) return;

    const formData = new FormData();

    // Append data dengan pengecekan yang lebih ketat
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        if (key === "fotoProfil" && value instanceof File) {
          formData.append(key, value);
          // console.log("File appended:", value.name, value.size);
        } else if (key !== "fotoProfil") {
          formData.append(key, value as string);
        }
      }
    });

    // // Debug: Log formData contents
    // console.log("FormData contents:");
    // for (let [key, value] of formData.entries()) {
    //   console.log(key, value);
    // }

    try {
      Swal.fire({
        title: "Menyimpan...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // Coba gunakan PUT atau POST jika PATCH tidak work
      const res = await apiClient.patch(`/guru/${guru.id_guru}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.close();
      Swal.fire("Berhasil!", "Data guru berhasil diperbarui.", "success");

      onUpdated(res.data.data);
      onClose?.();
    } catch (error: any) {
      Swal.close();
      console.error("Update error:", error.response?.data);
      Swal.fire(
        "Gagal!",
        error.response?.data?.message || error.message,
        "error"
      );
    }
  };

  const FormField = ({
    label,
    children,
    required = false,
  }: {
    label: string;
    children: React.ReactNode;
    required?: boolean;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Edit Data Guru
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Perbarui informasi guru dengan lengkap dan benar
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form className="py-4 space-y-6" onSubmit={handleSubmit}>
          {/* Photo Section */}
          <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
            <div className="relative">
              <img
                src={previewImage}
                alt="Preview"
                className="w-20 h-20 rounded-full border-2 border-gray-200 object-cover"
                onError={(e) => (e.currentTarget.src = defaultAvatar)}
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Camera className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Foto Profil
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: JPG, PNG. Maksimal 2MB
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">
              Informasi Pribadi
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Nama Lengkap" required>
                <Input
                  type="text"
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </FormField>

              <FormField label="NIP">
                <Input
                  type="text"
                  name="nip"
                  value={form.nip}
                  onChange={handleChange}
                  placeholder="Nomor Induk Pegawai"
                />
              </FormField>

              <FormField label="Email" required>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="contoh@email.com"
                  required
                />
              </FormField>

              <FormField label="No. Handphone">
                <Input
                  type="text"
                  name="noHP"
                  value={form.noHP}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                />
              </FormField>

              <FormField label="Jenis Kelamin">
                <Select
                  onValueChange={(value) =>
                    setForm({ ...form, jenisKelamin: value })
                  }
                  value={form.jenisKelamin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Role">
                <Select
                  value={form.role}
                  onValueChange={(value) => setForm({ ...form, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="GURU">Guru</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <FormField label="Jabatan">
              <Input
                type="text"
                name="jabatan"
                value={form.jabatan}
                onChange={handleChange}
                placeholder="Jabatan di sekolah"
              />
            </FormField>

            <FormField label="Alamat">
              <Input
                type="text"
                name="alamat"
                value={form.alamat}
                onChange={handleChange}
                placeholder="Alamat lengkap"
              />
            </FormField>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
