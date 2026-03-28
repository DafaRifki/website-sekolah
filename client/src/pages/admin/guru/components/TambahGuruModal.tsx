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
import { Eye, EyeOff, UserPlus, Camera, Plus } from "lucide-react";
import defaultAvatar from "../../../../assets/avatar.png";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
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
  <div className="space-y-2 relative">
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
    tempatLahir: "", // Tambahan
    tanggalLahir: "", // Tambahan
    pendidikan: "",   // Tambahan
    statusKepegawaian: "", // Tambahan
    alamat: "",
    jabatan: "",
    fotoProfil: null as File | null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(defaultAvatar);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<UserOption[]>([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          const res = await apiClient.get("/users");
          const users = res.data.data || [];
          setUserOptions(users);
          setFilteredEmails(users);
        } catch (error) {
          console.error("Gagal ambil user:", error);
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm({ ...form, email: value });
    const filtered = userOptions.filter((u) =>
      u.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredEmails(filtered);
    setShowEmailSuggestions(true);
  };

  const handleSelectEmail = (email: string) => {
    setForm({ ...form, email: email });
    setShowEmailSuggestions(false);
  };

  const resetForm = () => {
    setForm({
      email: "",
      password: "",
      nama: "",
      nip: "",
      noHP: "",
      jenisKelamin: "",
      tempatLahir: "",
      tanggalLahir: "",
      pendidikan: "",
      statusKepegawaian: "",
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

    Object.entries(form).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (key === "fotoProfil") {
        if (value instanceof File) formData.append(key, value);
        return;
      }
      const cleanValue = typeof value === "string" ? value.trim() : String(value);
      if (cleanValue !== "") formData.append(key, cleanValue);
    });

    try {
      Swal.fire({
        title: "Menyimpan...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await apiClient.post("/guru", formData);
      Swal.close();
      Swal.fire("Berhasil!", "Data guru berhasil ditambahkan.", "success");
      resetForm();
      onAdded();
      onClose();
    } catch (error: any) {
      Swal.close();
      const pesanError = error.response?.data?.message || "Gagal menambahkan guru";
      Swal.fire("Gagal!", pesanError, "error");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { resetForm(); onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Tambah Guru Baru
          </DialogTitle>
          <DialogDescription>Lengkapi form untuk data guru baru</DialogDescription>
        </DialogHeader>

        <form className="py-4 space-y-6" onSubmit={handleSubmit}>
          {/* Foto Profil */}
          <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
            <div className="relative">
              <img src={previewImage} className="w-20 h-20 rounded-full border-2 object-cover" alt="Preview" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Camera className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium mb-2 block">Foto Profil</Label>
              <Input type="file" accept="image/*" onChange={(e) => {
                if (e.target.files?.[0]) {
                  const file = e.target.files[0];
                  setForm({...form, fotoProfil: file});
                  setPreviewImage(URL.createObjectURL(file));
                }
              }} />
            </div>
          </div>

          {/* Informasi Akun */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold border-b pb-2">Informasi Akun</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Email" required>
                <Input value={form.email} onChange={handleEmailChange} placeholder="Email..." />
                {showEmailSuggestions && filteredEmails.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {filteredEmails.map((u) => (
                      <div key={u.id} onMouseDown={() => handleSelectEmail(u.email)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                        {u.email} <span className="text-xs text-gray-400">({u.role})</span>
                      </div>
                    ))}
                  </div>
                )}
              </FormField>
              <FormField label="Password" required>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormField>
            </div>
          </div>

          {/* Informasi Pribadi */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold border-b pb-2">Informasi Pribadi & Kepegawaian</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Nama Lengkap" required>
                <Input name="nama" value={form.nama} onChange={handleChange} />
              </FormField>
              <FormField label="NIP">
                <Input name="nip" value={form.nip} onChange={handleChange} />
              </FormField>
              
              {/* ROW 2: Tempat & Tanggal Lahir */}
              <FormField label="Tempat Lahir">
                <Input name="tempatLahir" value={form.tempatLahir} onChange={handleChange} placeholder="Kota Kelahiran" />
              </FormField>
              <FormField label="Tanggal Lahir">
                <Input type="date" name="tanggalLahir" value={form.tanggalLahir} onChange={handleChange} />
              </FormField>

              {/* ROW 3: Kelamin & No HP */}
              <FormField label="Jenis Kelamin">
                <Select onValueChange={(v) => setForm({...form, jenisKelamin: v})} value={form.jenisKelamin}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="No. Handphone">
                <Input name="noHP" value={form.noHP} onChange={handleChange} />
              </FormField>

              {/* ROW 4: Pendidikan & Status */}
              <FormField label="Pendidikan Terakhir">
                <Input name="pendidikan" value={form.pendidikan} onChange={handleChange} placeholder="Contoh: S1 Pendidikan Biologi" />
              </FormField>
              <FormField label="Status Kepegawaian">
                <Select onValueChange={(v) => setForm({...form, statusKepegawaian: v})} value={form.statusKepegawaian}>
                  <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GTY">GTY (Guru Tetap Yayasan)</SelectItem>
                    <SelectItem value="GTT">GTT (Guru Tidak Tetap)</SelectItem>
                    <SelectItem value="PNS">PNS</SelectItem>
                    <SelectItem value="PPPK">PPPK</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField label="Jabatan">
                <Input name="jabatan" value={form.jabatan} onChange={handleChange} />
              </FormField>
              <FormField label="Alamat">
                <Input name="alamat" value={form.alamat} onChange={handleChange} />
              </FormField>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => { resetForm(); onClose(); }}>Batal</Button>
            <Button type="submit" className="gap-2"><Plus className="w-4 h-4" /> Simpan Data</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}