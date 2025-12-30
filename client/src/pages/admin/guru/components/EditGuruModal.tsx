import React, { useState, useEffect, useRef } from "react";
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
import { User, Camera, Save } from "lucide-react";
import Swal from "sweetalert2";
import apiClient from "@/config/axios";
import defaultAvatar from "../../../../assets/avatar.png";
import type { Guru } from "./DetailGuruModal"; 

interface Props {
  guru: Guru | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (guru: Guru) => void;
}

interface UserOption {
  id: number;
  email: string;
  role: string;
}

const FormField = ({
  label,
  children,
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) => (
  <div className="space-y-2 relative"> {}
    <Label className="text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    {children}
  </div>
);

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
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const BACKEND_URL = import.meta.env.VITE_URL_API || "http://localhost:5000";
  // STATE UNTUK AUTOCOMPLETE
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const [filteredEmails, setFilteredEmails] = useState<UserOption[]>([]);

  // 1. FETCH DATA USERS
  useEffect(() => {
    if (isOpen) {
        const fetchUsers = async () => {
            try {
                const res = await apiClient.get("/users"); 
                const users = res.data.data || [];
                setUserOptions(users);
                setFilteredEmails(users); // Init filtered dengan semua user
            } catch (error) {
                console.error("Gagal mengambil daftar user:", error);
            }
        };
        fetchUsers();
    }
  }, [isOpen]);

  // 2. SET DATA FORM
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

      if (guru.fotoProfil) {
        setPreviewImage(`${BACKEND_URL}/uploads/guru/${guru.fotoProfil}`);
      } else {
        setPreviewImage(defaultAvatar);
      }
    }
  }, [guru]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // LOGIKA AUTOCOMPLETE EMAIL
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm({ ...form, email: value });
    
    const filtered = userOptions.filter(u => 
        u.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredEmails(filtered);
    setShowEmailSuggestions(true);
  };

  const handleSelectEmail = (email: string) => {
    setForm({ ...form, email: email });
    setShowEmailSuggestions(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm({ ...form, fotoProfil: file });

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
    Object.entries(form).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (key === "fotoProfil") {
        if (value instanceof File) {
          formData.append(key, value);
        }
        return; 
      }
      if (typeof value === "string") {
        const cleanValue = value.trim(); 
        if (cleanValue !== "") {
          formData.append(key, cleanValue);
        }
        return;
      }
      formData.append(key, String(value));
    });

    try {
      Swal.fire({
        title: "Menyimpan...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await apiClient.put(`/guru/${guru.id_guru}`, formData);

      Swal.close();
      Swal.fire("Berhasil!", "Data guru berhasil diperbarui.", "success");

      onUpdated(res.data.data);
      onClose?.();
    } catch (error: any) {
      Swal.close();
      console.error("Update error detail:", error.response?.data);
      Swal.fire("Gagal!", error.response?.data?.message || "Terjadi kesalahan.", "error");
    }
  };

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

              {/* --- BAGIAN AUTOCOMPLETE EMAIL --- */}
              <FormField label="Email Akun" required>
                <div className="relative">
                    <Input
                        type="text" 
                        name="email"
                        value={form.email}
                        onChange={handleEmailChange}
                        onFocus={() => {
                            const filtered = userOptions.filter(u => 
                                u.email.toLowerCase().includes(form.email.toLowerCase())
                            );
                            setFilteredEmails(filtered);
                            setShowEmailSuggestions(true);
                        }}
                        onBlur={() => setTimeout(() => setShowEmailSuggestions(false), 200)}
                        placeholder="Masukan Email"
                        autoComplete="off"
                    />
                    
                    {/* DROPDOWN CUSTOM */}
                    {showEmailSuggestions && filteredEmails.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {filteredEmails.map((user) => (
                                <div
                                    key={user.id}
                                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                                    onMouseDown={() => handleSelectEmail(user.email)}
                                >
                                    <span>{user.email}</span>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{user.role}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pesan jika input ada isinya tapi tidak cocok dengan data apapun */}
                    {showEmailSuggestions && filteredEmails.length === 0 && form.email && (
                         <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2 text-sm text-gray-500 text-center">
                            Email baru (belum terdaftar)
                        </div>
                    )}
                </div>
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
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
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