import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/config/axios";
import delay from "@/lib/delay";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Camera, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

interface Kelas {
  id_kelas: number;
  namaKelas: string;
}

export default function EditSiswaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [currentFotoUrl, setCurrentFotoUrl] = useState<string>("");

  const [siswa, setSiswa] = useState({
    nama: "",
    nis: "",
    email: "",
    password: "",
    alamat: "",
    tanggalLahir: "",
    jenisKelamin: "",
    kelasId: "",
  });

  const [orangtua, setOrangtua] = useState<{
    id_orangtua?: number;
    nama: string;
    hubungan: string;
    pekerjaan: string;
    alamat: string;
    noHp: string;
  }>({
    id_orangtua: undefined,
    nama: "",
    hubungan: "",
    pekerjaan: "",
    alamat: "",
    noHp: "",
  });

  // -----------------------
  // Fetch data siswa & kelas
  // -----------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSiswa, resKelas] = await Promise.all([
          apiClient.get(`/siswa/${id}`),
          apiClient.get(`/kelas`),
        ]);

        const siswaData = resSiswa.data.data;

        setSiswa({
          nama: siswaData.nama || "",
          nis: siswaData.nis || "",
          email: siswaData.user?.email || "",
          password: "",
          alamat: siswaData.alamat || "",
          tanggalLahir: siswaData.tanggalLahir
            ? siswaData.tanggalLahir.split("T")[0]
            : "",
          jenisKelamin: siswaData.jenisKelamin || "",
          kelasId: siswaData.kelasId?.toString() || "",
        });

        // Set foto profil saat ini
        if (siswaData.fotoProfil) {
          const baseUrl =
            import.meta.env.VITE_API_BASE_URL ||
            "http://localhost:3000/uploads/";
          setCurrentFotoUrl(`${baseUrl}${siswaData.fotoProfil}`);
          setPreviewUrl(`${baseUrl}${siswaData.fotoProfil}`);
        }

        if (siswaData.Siswa_Orangtua?.length > 0) {
          const ortu = siswaData.Siswa_Orangtua[0].orangtua;
          setOrangtua({
            id_orangtua: ortu.id_orangtua,
            nama: ortu.nama || "",
            hubungan: ortu.hubungan || "",
            pekerjaan: ortu.pekerjaan || "",
            alamat: ortu.alamat || "",
            noHp: ortu.noHp || "",
          });
        }

        setKelasList(resKelas.data.data);
      } catch (error: any) {
        console.error(error.response?.data || error.message);
        toast.error("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setSiswa({ ...siswa, [e.target.name]: e.target.value });
  };

  const handleChangeOrangtua = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setOrangtua({ ...orangtua, [e.target.name]: e.target.value });
  };

  // -----------------------
  // Handle foto profil
  // -----------------------
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
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(currentFotoUrl || "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // -----------------------
  // Submit update
  // -----------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await delay(500);

    try {
      // Buat FormData untuk mengirim file
      const formData = new FormData();

      // Tambahkan data siswa
      if (siswa.nama) formData.append("nama", siswa.nama);
      if (siswa.nis) formData.append("nis", siswa.nis);
      if (siswa.alamat) formData.append("alamat", siswa.alamat);
      if (siswa.tanggalLahir)
        formData.append("tanggalLahir", siswa.tanggalLahir);
      if (siswa.jenisKelamin)
        formData.append("jenisKelamin", siswa.jenisKelamin);
      if (siswa.kelasId) formData.append("kelasId", siswa.kelasId);
      if (siswa.email) formData.append("email", siswa.email);
      if (siswa.password) formData.append("password", siswa.password);

      // Tambahkan file foto jika ada
      if (selectedFile) {
        formData.append("foto", selectedFile);
      }

      // Tambahkan data orangtua jika ada
      if (
        orangtua.nama ||
        orangtua.hubungan ||
        orangtua.pekerjaan ||
        orangtua.alamat ||
        orangtua.noHp
      ) {
        if (orangtua.id_orangtua)
          formData.append("orangtuaId", orangtua.id_orangtua.toString());
        if (orangtua.nama) formData.append("orangtuaNama", orangtua.nama);
        if (orangtua.hubungan)
          formData.append("orangtuaHubungan", orangtua.hubungan);
        if (orangtua.pekerjaan)
          formData.append("orangtuaPekerjaan", orangtua.pekerjaan);
        if (orangtua.alamat) formData.append("orangtuaAlamat", orangtua.alamat);
        if (orangtua.noHp) formData.append("orangtuaNoHp", orangtua.noHp);
      }

      await apiClient.patch(`/siswa/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Data siswa berhasil diupdate", {
        onAutoClose: () => navigate("/siswa"),
      });
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-10">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center justify-center">
            Edit Data Siswa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto Profil */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="text-lg font-semibold">Foto Profil</h3>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Foto Profil"
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
                    <Camera className="w-4 h-4" />
                    {previewUrl ? "Ubah Foto" : "Pilih Foto"}
                  </Button>

                  {previewUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="flex items-center gap-2">
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
                  Format yang didukung: JPG, JPEG, PNG, GIF
                  <br />
                  Ukuran maksimal: 5MB
                </p>
              </div>
            </div>

            {/* Data Siswa */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="text-lg font-semibold">Data Siswa</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2">Nama Siswa</Label>
                  <Input
                    name="nama"
                    value={siswa.nama}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label className="mb-2">NIS</Label>
                  <Input name="nis" value={siswa.nis} onChange={handleChange} />
                </div>
              </div>

              <div>
                <Label className="mb-2">Alamat</Label>
                <Input
                  name="alamat"
                  value={siswa.alamat}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2">Tanggal Lahir</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal">
                        {siswa.tanggalLahir
                          ? format(new Date(siswa.tanggalLahir), "dd MMMM yyyy")
                          : "Pilih tanggal lahir"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          siswa.tanggalLahir
                            ? new Date(siswa.tanggalLahir)
                            : undefined
                        }
                        onSelect={(date) =>
                          setSiswa({
                            ...siswa,
                            tanggalLahir: date
                              ? date.toISOString().split("T")[0]
                              : "",
                          })
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="mb-2">Jenis Kelamin</Label>
                  <Select
                    value={siswa.jenisKelamin}
                    onValueChange={(value) =>
                      setSiswa({ ...siswa, jenisKelamin: value })
                    }>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="mb-2">Kelas</Label>
                <Select
                  value={siswa.kelasId?.toString()}
                  onValueChange={(value) =>
                    setSiswa({ ...siswa, kelasId: value })
                  }>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {kelasList.map((k) => (
                      <SelectItem
                        key={k.id_kelas}
                        value={k.id_kelas.toString()}>
                        {k.namaKelas}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Akun User */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="text-lg font-semibold">Akun User</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2">Email</Label>
                  <Input
                    type="email"
                    name="email"
                    value={siswa.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label className="mb-2">Password (Opsional)</Label>
                  <Input
                    type="password"
                    name="password"
                    value={siswa.password}
                    onChange={handleChange}
                    placeholder="Kosongkan jika tidak ingin diubah"
                  />
                </div>
              </div>
            </div>

            {/* Data Orang Tua */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Data Orang Tua</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2">Nama Orang Tua</Label>
                  <Input
                    name="nama"
                    placeholder="Nama Orang Tua"
                    value={orangtua.nama}
                    onChange={handleChangeOrangtua}
                  />
                </div>
                <div>
                  <Label className="mb-2">Hubungan</Label>
                  <Input
                    name="hubungan"
                    placeholder="Ayah / Ibu / Wali"
                    value={orangtua.hubungan}
                    onChange={handleChangeOrangtua}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2">Pekerjaan</Label>
                  <Input
                    name="pekerjaan"
                    placeholder="Pekerjaan Orang Tua"
                    value={orangtua.pekerjaan}
                    onChange={handleChangeOrangtua}
                  />
                </div>
                <div>
                  <Label className="mb-2">No HP</Label>
                  <Input
                    name="noHp"
                    placeholder="08xxxxxxxx"
                    value={orangtua.noHp}
                    onChange={handleChangeOrangtua}
                  />
                </div>
              </div>
              <div>
                <Label className="mb-2">Alamat</Label>
                <Input
                  name="alamat"
                  placeholder="Alamat Orang tua"
                  value={orangtua.alamat}
                  onChange={handleChangeOrangtua}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/siswa")}>
                Batal
              </Button>

              <Button type="submit" disabled={saving}>
                {saving ? <>Menyimpan...</> : "Simpan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
