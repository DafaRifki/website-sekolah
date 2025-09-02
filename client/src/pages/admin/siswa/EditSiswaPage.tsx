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
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

interface Kelas {
  id_kelas: string;
  namaKelas: string;
}

export default function EditSiswaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);

  const [siswa, setSiswa] = useState({
    nama: "",
    nis: "",
    email: "",
    password: "", // opsional
    alamat: "",
    tanggalLahir: "",
    jenisKelamin: "",
    kelasId: "",
  });

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
          kelasId: siswaData.kelasId || "",
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await delay(500);
    try {
      const payload: any = {
        nama: siswa.nama || undefined,
        nis: siswa.nis || undefined,
        alamat: siswa.alamat || undefined,
        tanggalLahir: siswa.tanggalLahir || undefined,
        jenisKelamin: siswa.jenisKelamin || undefined,
        kelasId: siswa.kelasId ? parseInt(siswa.kelasId) : undefined,
      };

      // Email update kalau diizinkan
      if (siswa.email) payload.email = siswa.email;
      // Password hanya dikirim kalau diisi
      if (siswa.password) payload.password = siswa.password;

      await apiClient.patch(`/siswa/${id}`, payload);
      toast.success("Data siswa berhasil diupdate", {
        onAutoClose: () => {
          navigate("/siswa");
        },
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
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle>Edit Data Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="mb-2">Nama Siswa</Label>
              <Input
                name="nama"
                value={siswa.nama}
                onChange={handleChange}
                placeholder="Masukkan nama siswa..."
              />
            </div>
            <div>
              <Label className="mb-2">NIS</Label>
              <Input
                name="nis"
                value={siswa.nis}
                onChange={handleChange}
                placeholder="Masukkan NIS"
              />
            </div>
            <div>
              <Label className="mb-2">Email</Label>
              <Input
                type="email"
                name="email"
                value={siswa.email}
                onChange={handleChange}
                placeholder="Masukkan email siswa"
              />
            </div>
            <div>
              <Label className="mb-2">Password (opsional)</Label>
              <Input
                type="password"
                name="password"
                value={siswa.password}
                onChange={handleChange}
                placeholder="Kosongkan jika tidak ingin diubah"
              />
            </div>
            <div>
              <Label className="mb-2">Alamat</Label>
              <Input
                name="alamat"
                value={siswa.alamat}
                onChange={handleChange}
                placeholder="Masukkan alamat siswa"
              />
            </div>
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
                    captionLayout="dropdown" // ✅ dropdown bulan & tahun
                    fromYear={1950} // ✅ batas tahun awal
                    toYear={new Date().getFullYear()} // ✅ batas tahun akhir
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
                    initialFocus
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
                    <SelectItem key={k.id_kelas} value={k.id_kelas.toString()}>
                      {k.namaKelas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/siswa")}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loading /> Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
