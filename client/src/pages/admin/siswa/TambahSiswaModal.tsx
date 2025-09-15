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
import { Eye, EyeOff, Camera, X, Upload } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

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

  useEffect(() => {
    if (isOpen) {
      fetchKelas();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi tipe file
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Hanya file gambar yang diperbolehkan (JPG, JPEG, PNG, GIF)"
        );
        return;
      }

      // Validasi ukuran file (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }

      setFotoProfil(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFotoProfil(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
      if (formData.orangtuaPekerjaan)
        payload.append("orangtuaPekerjaan", formData.orangtuaPekerjaan);
      if (formData.orangtuaAlamat)
        payload.append("orangtuaAlamat", formData.orangtuaAlamat);
      if (formData.orangtuaNoHp)
        payload.append("orangtuaNoHp", formData.orangtuaNoHp);

      if (fotoProfil) payload.append("fotoProfil", fotoProfil);

      const { data } = await apiClient.post("/siswa", payload, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Siswa berhasil ditambahkan");
      onAdded(data.data);

      // Reset form
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
      setPreviewUrl("");
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
      <DialogOverlay className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
      <DialogContent className="bg-white rounded-xl max-w-4xl mx-auto p-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Tambah Siswa Baru
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-1">
            Lengkapi formulir di bawah ini untuk menambahkan siswa baru
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Foto Profil Section */}
          <div className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Foto Profil
            </h3>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={triggerFileInput}
                  className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {previewUrl ? "Ubah Foto" : "Pilih Foto"}
                </Button>

                {previewUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700">
                    <X className="w-4 h-4" />
                    Hapus
                  </Button>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/jpg,image/png,image/gif"
                className="hidden"
              />

              <p className="text-xs text-gray-500 text-center">
                Format: JPG, JPEG, PNG, GIF (Maks. 5MB)
              </p>
            </div>
          </div>

          {/* Data Siswa Section */}
          <div className="mb-6 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Data Siswa
            </h3>
            <div className="space-y-4">
              {/* Nama & NIS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap *
                  </Label>
                  <Input
                    placeholder="Masukkan nama lengkap"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    NIS *
                  </Label>
                  <Input
                    placeholder="Nomor Induk Siswa"
                    name="nis"
                    value={formData.nis}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Alamat */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">
                  Alamat
                </Label>
                <Input
                  placeholder="Alamat lengkap siswa"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              {/* Tanggal Lahir & Jenis Kelamin */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <DateOfBirthPicker
                    value={formData.tanggalLahir}
                    onChange={(val) =>
                      setFormData({ ...formData, tanggalLahir: val })
                    }
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    Jenis Kelamin *
                  </Label>
                  <Select
                    value={formData.jenisKelamin}
                    onValueChange={(val) =>
                      setFormData({ ...formData, jenisKelamin: val })
                    }>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Kelas */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">
                  Kelas
                </Label>
                <Select
                  value={formData.kelasId}
                  onValueChange={(val) =>
                    setFormData({ ...formData, kelasId: val })
                  }>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Pilih kelas" />
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
          </div>

          {/* Data Orang Tua Section */}
          <div className="mb-6 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Data Orang Tua/Wali
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    Nama Orang Tua/Wali
                  </Label>
                  <Input
                    placeholder="Nama lengkap orang tua/wali"
                    name="orangtuaNama"
                    value={formData.orangtuaNama}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    Hubungan
                  </Label>
                  <Input
                    placeholder="Ayah / Ibu / Wali"
                    name="orangtuaHubungan"
                    value={formData.orangtuaHubungan}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    Pekerjaan
                  </Label>
                  <Input
                    placeholder="Pekerjaan orang tua/wali"
                    name="orangtuaPekerjaan"
                    value={formData.orangtuaPekerjaan}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    No. HP
                  </Label>
                  <Input
                    placeholder="08xxxxxxxxxx"
                    name="orangtuaNoHp"
                    value={formData.orangtuaNoHp}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">
                  Alamat Orang Tua
                </Label>
                <Input
                  placeholder="Alamat orang tua/wali"
                  name="orangtuaAlamat"
                  value={formData.orangtuaAlamat}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6"
              disabled={loading}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                "Simpan Data"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TambahSiswaModal;
