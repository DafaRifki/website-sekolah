import React, { useEffect, useState, useRef } from "react";
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
import { Eye, EyeOff, Camera, X, Upload, Mail } from "lucide-react";

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

  // Fetch data awal (Kelas & User List untuk Suggestion)
  const fetchData = async () => {
    try {
      const [resKelas, resUsers] = await Promise.all([
        apiClient.get("/kelas"),
        apiClient.get("/users/list"), // Asumsi endpoint untuk list email user
      ]);
      setKelasList(resKelas.data.data.data || []);
      setUserOptions(resUsers.data.data || []);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    }
  };

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Logic Email Suggestion
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    
    const filtered = userOptions.filter(u => 
      u.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredEmails(filtered);
    setShowEmailSuggestions(true);
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
          <DialogTitle className="text-2xl font-bold">Tambah Siswa Baru</DialogTitle>
        </DialogHeader>

        <div className="p-8 overflow-y-auto max-h-[calc(95vh-130px)] space-y-10">
          
          {/* FOTO PROFIL */}
          <div className="flex flex-col items-center gap-4 bg-gray-50 p-6 rounded-xl border-2 border-dashed">
             <div className="relative w-28 h-28 rounded-full overflow-hidden bg-white shadow-md border-4 border-white">
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300"><Camera size={40} /></div>
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
            <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3">Data Siswa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Label>Nama Siswa</Label><Input name="nama" value={formData.nama} onChange={handleChange} placeholder="Nama Lengkap" /></div>
              <div className="space-y-2"><Label>NIS</Label><Input name="nis" value={formData.nis} onChange={handleChange} placeholder="NIS" /></div>
              <div className="space-y-2"><Label>NISN</Label><Input name="nisn" value={formData.nisn} onChange={handleChange} placeholder="NISN" /></div>
              <div className="space-y-2"><Label>No. HP Siswa</Label><Input name="noHpSiswa" value={formData.noHpSiswa} onChange={handleChange} placeholder="08..." /></div>
              <div className="md:col-span-2 space-y-2"><Label>Alamat</Label><Input name="alamat" value={formData.alamat} onChange={handleChange} placeholder="Alamat Lengkap" /></div>
              <div className="space-y-2"><Label>Tempat Lahir</Label><Input name="tempatLahir" value={formData.tempatLahir} onChange={handleChange} placeholder="Tempat Lahir" /></div>
              <DateOfBirthPicker value={formData.tanggalLahir} onChange={(v) => setFormData({...formData, tanggalLahir: v})} />
              <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                <Select value={formData.jenisKelamin} onValueChange={(v) => setFormData({...formData, jenisKelamin: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih Jenis Kelamin" /></SelectTrigger>
                  <SelectContent><SelectItem value="L">Laki-laki</SelectItem><SelectItem value="P">Perempuan</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Agama</Label><Input name="agama" value={formData.agama} onChange={handleChange} placeholder="Agama" /></div>
              <div className="md:col-span-2 space-y-2">
                <Label>Kelas</Label>
                <Select value={formData.kelasId} onValueChange={(v) => setFormData({...formData, kelasId: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                  <SelectContent>{kelasList.map((k) => (<SelectItem key={k.id_kelas} value={String(k.id_kelas)}>{k.namaKelas}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* SECTION: AKUN USER (DENGAN SUGGESTIONS) */}
          <section className="space-y-6">
            <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3">Akun User</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 relative">
                <Label>Email</Label>
                <div className="relative">
                  <Input 
                    name="email" 
                    value={formData.email} 
                    onChange={handleEmailChange} 
                    onFocus={() => setShowEmailSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowEmailSuggestions(false), 200)}
                    placeholder="Ketik email baru atau pilih..." 
                    autoComplete="off"
                  />
                  
                  {/* Dropdown Suggestions */}
                  {showEmailSuggestions && filteredEmails.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredEmails.map((user) => (
                        <div key={user.id} onMouseDown={() => handleSelectEmail(user.email)} className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex justify-between items-center">
                          <span>{user.email}</span>
                          <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded border">{user.role}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Info Email Baru */}
                  {showEmailSuggestions && filteredEmails.length === 0 && formData.email && (
                    <div className="absolute z-50 w-full mt-1 bg-blue-50 border border-blue-200 rounded-md shadow-sm p-2 text-xs text-blue-600 text-center font-medium">
                      Email baru (Akan dibuatkan akun otomatis)
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Password (Opsional)</Label>
                <div className="relative">
                  <Input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} placeholder="Password akun" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400">
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: DATA ORANG TUA */}
          <section className="space-y-6 pb-10">
            <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3">Data Orang Tua</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Label>Nama Ayah</Label><Input name="namaAyah" value={formData.namaAyah} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Pekerjaan Ayah</Label><Input name="pekerjaanAyah" value={formData.pekerjaanAyah} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Nama Ibu</Label><Input name="namaIbu" value={formData.namaIbu} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Pekerjaan Ibu</Label><Input name="pekerjaanIbu" value={formData.pekerjaanIbu} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>No. Telepon Orang Tua</Label><Input name="noHpOrangtua" value={formData.noHpOrangtua} onChange={handleChange} /></div>
              <div className="md:col-span-2 space-y-2"><Label>Alamat Orang Tua/Wali</Label><Input name="alamatOrangtua" value={formData.alamatOrangtua} onChange={handleChange} /></div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0 z-10">
          <Button variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-8">
            {loading ? "Menyimpan..." : "Simpan Data"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TambahSiswaModal;