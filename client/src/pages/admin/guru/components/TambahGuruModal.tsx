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
import { Eye, EyeOff, UserPlus, Camera, Plus } from "lucide-react";
import defaultAvatar from "../../../../assets/avatar.png";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

// Komponen Helper untuk Form Field
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
  const [previewImage, setPreviewImage] = useState<string>(defaultAvatar);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectGender = (value: string) => {
    setForm({ ...form, jenisKelamin: value });
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

  const resetForm = () => {
    setForm({
      email: "",
      password: "",
      nama: "",
      nip: "",
      noHP: "",
      jenisKelamin: "",
      alamat: "",
      jabatan: "",
      fotoProfil: null,
    });
    setPreviewImage(defaultAvatar);
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    // --- LOGIKA PEMBERSIHAN DATA (Agar tidak Validation Error) ---
    Object.entries(form).forEach(([key, value]) => {
      // 1. Abaikan null/undefined
      if (value === null || value === undefined) return;

      // 2. Handle Foto
      if (key === "fotoProfil") {
        if (value instanceof File) {
          formData.append(key, value);
        }
        return;
      }

      // 3. Handle String (Sangat Penting untuk NIP/Jabatan)
      if (typeof value === "string") {
        const cleanValue = value.trim();
        // Hanya kirim jika string TIDAK kosong
        // Backend sering error jika field unik (NIP) dikirim ""
        if (cleanValue !== "") {
          formData.append(key, cleanValue);
        }
        return;
      }

      // 4. Handle tipe lain
      formData.append(key, String(value));
    });

    // Debugging: Cek di console apa yang dikirim
    // for (let pair of formData.entries()) {
    //   console.log(pair[0] + ': ' + pair[1]);
    // }

    try {
      Swal.fire({
        title: "Menyimpan...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // PERBAIKAN: Hapus headers manual, biarkan Axios handle multipart
      await apiClient.post("/guru", formData);

      Swal.close();
      Swal.fire("Berhasil!", "Data guru berhasil ditambahkan.", "success");

      resetForm();
      onAdded();
      onClose();
    } catch (error: any) {
      Swal.close();
      console.error("Add error detail:", error.response?.data);
      
      const pesanError = error.response?.data?.message || "Gagal menambahkan guru (Validation Error)";
      
      Swal.fire(
        "Gagal!",
        pesanError,
        "error"
      );
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Tambah Guru Baru
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Lengkapi form di bawah untuk menambahkan data guru baru
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form className="py-4 space-y-6" onSubmit={handleSubmit}>
          {/* Photo Upload Section */}
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

          {/* Account Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">
              Informasi Akun
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Email" required>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="contoh@sekolah.com"
                  required
                />
              </FormField>

              <FormField label="Password" required>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimal 6 karakter"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormField>
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
                  onValueChange={handleSelectGender}
                  value={form.jenisKelamin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* PERBAIKAN PENTING: Gunakan Value 'L' dan 'P' */}
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
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
                placeholder="Contoh: Guru Matematika"
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
            <Button type="button" variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button type="submit" className="gap-2">
              <Plus className="w-4 h-4" />
              Simpan Data
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}