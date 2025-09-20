"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Mail,
  Phone,
  User,
  MapPin,
  UserPlus,
  GraduationCap,
} from "lucide-react";
import apiClient from "@/config/axios";

interface TambahPendaftaranModalProps {
  onSuccess: () => void;
}

interface FormValues {
  nama: string;
  alamat: string;
  tanggalLahir: string;
  jenisKelamin: "Laki-laki" | "Perempuan";
  noHp: string;
  email: string;
  tahunAjaranId: number;
}

interface TahunAjaran {
  id_tahun: number;
  namaTahun: string;
}

export default function TambahPendaftaranModal({
  onSuccess,
}: TambahPendaftaranModalProps) {
  const [open, setOpen] = useState(false);
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<FormValues>();

  useEffect(() => {
    const fetchTahunAjaran = async () => {
      try {
        const res = await apiClient.get("/tahun-ajaran"); // ganti endpoint sesuai backend-mu
        setTahunAjaranList(res.data.data);
      } catch (err) {
        console.error("Gagal mengambil data tahun ajaran", err);
      }
    };

    fetchTahunAjaran();
  }, []);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await apiClient.post("/pendaftaran/admin", values);
      reset();
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Gagal menambah pendaftaran", error);
      alert("Terjadi kesalahan saat menambahkan pendaftaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
          <UserPlus className="h-4 w-4 mr-2" />
          Tambah Pendaftaran
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            Tambah Pendaftaran Siswa Baru
          </DialogTitle>
          <Separator />
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-0 shadow-sm bg-slate-50/50 dark:bg-slate-800/50">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Data Pribadi
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="nama"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Nama Lengkap
                  </Label>
                  <Input
                    id="nama"
                    placeholder="Masukkan nama lengkap"
                    {...register("nama")}
                    required
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="tanggalLahir"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Tanggal Lahir
                  </Label>
                  <Input
                    id="tanggalLahir"
                    type="date"
                    {...register("tanggalLahir")}
                    required
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="alamat"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Alamat
                  </Label>
                  <Input
                    id="alamat"
                    placeholder="Masukkan alamat lengkap"
                    {...register("alamat")}
                    required
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Jenis Kelamin
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setValue(
                        "jenisKelamin",
                        value as "Laki-laki" | "Perempuan"
                      )
                    }
                    required>
                    <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-slate-50/50 dark:bg-slate-800/50">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-600" />
                Informasi Kontak
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="noHp"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    No. HP
                  </Label>
                  <Input
                    id="noHp"
                    placeholder="Masukkan nomor HP"
                    {...register("noHp")}
                    required
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Masukkan alamat email"
                    {...register("email")}
                    required
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-slate-50/50 dark:bg-slate-800/50">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                Informasi Akademik
              </h3>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tahun Ajaran
                </Label>
                <Select
                  onValueChange={(value) =>
                    setValue("tahunAjaranId", parseInt(value))
                  }
                  required>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Pilih tahun ajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {tahunAjaranList.map((tahun) => (
                      <SelectItem
                        key={tahun.id_tahun}
                        value={tahun.id_tahun.toString()}>
                        {tahun.namaTahun}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setOpen(false);
              }}
              className="px-6">
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menyimpan...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Simpan
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
