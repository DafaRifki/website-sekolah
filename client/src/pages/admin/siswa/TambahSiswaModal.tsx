/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
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
import { Eye, EyeOff, Camera, Upload, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // <--- Tambahkan baris ini

interface Kelas {
  id_kelas: number;
  namaKelas: string;
}

interface UserOption {
  id: number;
  email: string;
  role: string;
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
  
  // State untuk Email Suggestion
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<UserOption[]>([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    nis: "",
    nisn: "",
    noHpSiswa: "",
    alamat: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "",
    agama: "",
    kelasId: "",
    email: "",
    password: "",
    namaAyah: "",
    pekerjaanAyah: "",
    namaIbu: "",
    pekerjaanIbu: "",
    noHpOrangtua: "",
    alamatOrangtua: "",
  });

  const [fotoProfil, setFotoProfil] = useState<File | null>(null);

  // Fetch data awal
  const fetchData = async () => {
    try {
      const [resKelas, resUsers] = await Promise.all([
        apiClient.get("/kelas"),
        apiClient.get("/users"), // Biasanya endpoint list user ada di /users
      ]);

      // PERBAIKAN: Cek struktur data console.log(resKelas.data) jika masih kosong
      const dataKelas = resKelas.data.data || [];
      const dataUsers = resUsers.data.data || [];

      setKelasList(Array.isArray(dataKelas) ? dataKelas : dataKelas.data || []);
      setUserOptions(Array.isArray(dataUsers) ? dataUsers : dataUsers.data || []);
    } catch (error) {
      console.error("Gagal ambil data:", error);
      toast.error("Gagal mengambil data kelas atau user");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      // Reset form saat buka
      setPreviewUrl("");
      setFotoProfil(null);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Logic Email Suggestion
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    
    if (value.length > 0) {
      const filtered = userOptions.filter(u => 
        u.email.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredEmails(filtered);
      setShowEmailSuggestions(true);
    } else {
      setFilteredEmails([]);
      setShowEmailSuggestions(false);
    }
  };

  const handleSelectEmail = (email: string) => {
    setFormData({ ...formData, email: email });
    setShowEmailSuggestions(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });
      if (fotoProfil) payload.append("fotoProfil", fotoProfil);

      const { data } = await apiClient.post("/siswa", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Siswa berhasil ditambahkan");
      onAdded(data.data);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal simpan data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <DialogContent className="bg-white rounded-xl max-w-4xl mx-auto p-0 max-h-[95vh] overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 border-b bg-white sticky top-0 z-10">
          <DialogTitle className="text-2xl font-bold text-slate-900">Tambah Siswa Baru</DialogTitle>
        </DialogHeader>

        <div className="p-8 overflow-y-auto max-h-[calc(95vh-130px)] space-y-10">
          
          {/* FOTO PROFIL */}
          <div className="flex flex-col items-center gap-4 bg-slate-50 p-6 rounded-xl border-2 border-dashed border-slate-200">
             <div className="relative w-28 h-28 rounded-full overflow-hidden bg-white shadow-md border-4 border-white">
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300"><Camera size={40} /></div>
                )}
             </div>
             <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4"/> Pilih Foto Profil
             </Button>
             <input type="file" ref={fileInputRef} onChange={(e) => {
               const file = e.target.files?.[0];
               if(file) {
                 setFotoProfil(file);
                 setPreviewUrl(URL.createObjectURL(file));
               }
             }} className="hidden" accept="image/*" />
          </div>

          {/* SECTION: DATA SISWA */}
          <section className="space-y-6">
            <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3 text-slate-800">Data Siswa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Label>Nama Siswa</Label><Input name="nama" value={formData.nama} onChange={handleChange} placeholder="Nama Lengkap" /></div>
              <div className="space-y-2"><Label>NIS</Label><Input name="nis" value={formData.nis} onChange={handleChange} placeholder="Nomor Induk Siswa" /></div>
              <div className="space-y-2"><Label>NISN</Label><Input name="nisn" value={formData.nisn} onChange={handleChange} placeholder="NISN" /></div>
              <div className="space-y-2"><Label>No. HP Siswa</Label><Input name="noHpSiswa" value={formData.noHpSiswa} onChange={handleChange} placeholder="08..." /></div>
              <div className="md:col-span-2 space-y-2"><Label>Alamat</Label><Input name="alamat" value={formData.alamat} onChange={handleChange} placeholder="Alamat Lengkap" /></div>
              <div className="space-y-2"><Label>Tempat Lahir</Label><Input name="tempatLahir" value={formData.tempatLahir} onChange={handleChange} placeholder="Tempat Lahir" /></div>
              <DateOfBirthPicker value={formData.tanggalLahir} onChange={(v) => setFormData({...formData, tanggalLahir: v})} />
              
              <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                <Select value={formData.jenisKelamin} onValueChange={(v) => setFormData({...formData, jenisKelamin: v})}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Jenis Kelamin" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2"><Label>Agama</Label><Input name="agama" value={formData.agama} onChange={handleChange} placeholder="Agama" /></div>
              
              <div className="md:col-span-2 space-y-2">
                <Label>Kelas</Label>
                <Select value={formData.kelasId} onValueChange={(v) => setFormData({...formData, kelasId: v})}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={kelasList.length > 0 ? "Pilih Kelas" : "Memuat data kelas..."} />
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
            </div>
          </section>

          {/* SECTION: AKUN USER */}
          <section className="space-y-6">
            <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3 text-slate-800">Akun User</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 relative">
                <Label>Email</Label>
                <div className="relative">
                  <div className="relative flex items-center">
                    <Input 
                      name="email" 
                      value={formData.email} 
                      onChange={handleEmailChange} 
                      onFocus={() => setShowEmailSuggestions(true)}
                      // Gunakan delay sedikit agar klik pada item tidak terputus oleh onBlur
                      onBlur={() => setTimeout(() => setShowEmailSuggestions(false), 200)}
                      placeholder="Cari email user..." 
                      className="pr-10"
                      autoComplete="off"
                    />
                    <Mail className="absolute right-3 h-4 w-4 text-slate-400" />
                  </div>
                  
                  {/* Dropdown Suggestions - Sesuai Gambar */}
                  {showEmailSuggestions && filteredEmails.length > 0 && (
                    <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[100] bg-white border border-slate-200 rounded-lg shadow-xl max-h-56 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-100">
                      {filteredEmails.map((user) => (
                        <div 
                          key={user.id} 
                          onMouseDown={(e) => {
                            e.preventDefault(); // Mencegah onBlur input sebelum klik selesai
                            handleSelectEmail(user.email);
                          }} 
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center group transition-colors"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">
                              {user.email}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold bg-slate-50 text-slate-500 border-slate-200 group-hover:border-blue-200 group-hover:text-blue-600">
                            {user.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notifikasi jika email baru */}
                  {showEmailSuggestions && formData.email && filteredEmails.length === 0 && (
                    <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[100] bg-amber-50 border border-amber-100 rounded-lg p-3 shadow-md animate-in slide-in-from-top-1">
                      <p className="text-xs text-amber-700 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Email belum terdaftar. Akun baru akan dibuat otomatis.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="Minimal 6 karakter" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: DATA ORANG TUA */}
          <section className="space-y-6 pb-10">
            <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3 text-slate-800">Data Orang Tua</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Label>Nama Ayah</Label><Input name="namaAyah" value={formData.namaAyah} onChange={handleChange} placeholder="Nama Lengkap Ayah" /></div>
              <div className="space-y-2"><Label>Pekerjaan Ayah</Label><Input name="pekerjaanAyah" value={formData.pekerjaanAyah} onChange={handleChange} placeholder="Contoh: PNS, Wiraswasta" /></div>
              <div className="space-y-2"><Label>Nama Ibu</Label><Input name="namaIbu" value={formData.namaIbu} onChange={handleChange} placeholder="Nama Lengkap Ibu" /></div>
              <div className="space-y-2"><Label>Pekerjaan Ibu</Label><Input name="pekerjaanIbu" value={formData.pekerjaanIbu} onChange={handleChange} placeholder="Pekerjaan Ibu" /></div>
              <div className="space-y-2"><Label>No. Telepon Orang Tua</Label><Input name="noHpOrangtua" value={formData.noHpOrangtua} onChange={handleChange} placeholder="08..." /></div>
              <div className="md:col-span-2 space-y-2"><Label>Alamat Orang Tua/Wali</Label><Input name="alamatOrangtua" value={formData.alamatOrangtua} onChange={handleChange} placeholder="Alamat Lengkap Orang Tua" /></div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t bg-slate-50 flex justify-end gap-3 sticky bottom-0 z-10">
          <Button variant="outline" onClick={onClose} disabled={loading} className="border-slate-300">Batal</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-8 shadow-lg shadow-blue-200">
            {loading ? "Menyimpan..." : "Simpan Data Siswa"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TambahSiswaModal;