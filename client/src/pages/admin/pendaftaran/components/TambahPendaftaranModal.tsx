"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
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
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import apiClient from "@/config/axios";

interface TambahPendaftaranModalProps {
  onSuccess: () => void;
}

interface FormValues {
  nama: string;
  alamat: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P";
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
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>();

  useEffect(() => {
    const fetchTahunAjaran = async () => {
      try {
        const res = await apiClient.get("/tahun-ajaran");
        setTahunAjaranList(res.data.data || []);
      } catch (err) {
        console.error("Gagal mengambil data tahun ajaran", err);
        setError("Gagal memuat data tahun ajaran");
      }
    };

    if (open) {
      fetchTahunAjaran();
      setError(""); // Reset error saat modal dibuka
    }
  }, [open]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError("");

    try {
      // Pastikan semua field required terisi
      if (!values.nama || !values.tahunAjaranId) {
        throw new Error("Nama dan Tahun Ajaran wajib diisi");
      }

      // Format data sesuai dengan backend validation schema
      const payload = {
        // Required fields
        nama: values.nama.trim(),
        tahunAjaranId: Number(values.tahunAjaranId),

        // Optional personal data
        alamat: values.alamat?.trim() || "",
        tanggalLahir: values.tanggalLahir || null,
        jenisKelamin: values.jenisKelamin || "",

        // Optional contact
        email: values.email?.trim() || "",
        noHp: values.noHp?.trim() || "",

        // Set default status values (backend akan menggunakan default jika tidak dikirim)
        // Tapi lebih baik eksplisit kirim untuk clarity
        statusDokumen: "BELUM_DITERIMA",
        statusPembayaran: "BELUM_BAYAR",
      };

      const response = await apiClient.post("/pendaftaran", payload);

      // Reset form dan tutup modal
      reset();
      setOpen(false);

      // Panggil callback success
      onSuccess();

      // Show success message (bisa diganti dengan toast notification)
      alert(`Pendaftaran berhasil ditambahkan untuk ${values.nama}!`);
    } catch (error) {
      console.error("Gagal menambah pendaftaran", error);

      // Handle error dengan lebih detail
      const axiosError = error as AxiosError<{
        error?: string;
        message?: string;
        details?: any;
      }>;

      let errorMessage = "Terjadi kesalahan saat menambahkan pendaftaran.";

      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        errorMessage = errorData.error || errorData.message || errorMessage;

        // Jika ada detail validasi error
        if (errorData.details) {
          console.error("Validation details:", errorData.details);
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      reset();
      setError("");
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
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

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
                    Nama Lengkap <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nama"
                    placeholder="Masukkan nama lengkap"
                    {...register("nama", { required: "Nama wajib diisi" })}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.nama && (
                    <p className="text-sm text-red-500">
                      {errors.nama.message}
                    </p>
                  )}
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
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Jenis Kelamin
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("jenisKelamin", value as "L" | "P")
                    }>
                    <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
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
                  Tahun Ajaran <span className="text-red-500">*</span>
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
                    {tahunAjaranList.length > 0 ? (
                      tahunAjaranList.map((tahun) => (
                        <SelectItem
                          key={tahun.id_tahun}
                          value={tahun.id_tahun.toString()}>
                          {tahun.namaTahun}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="0" disabled>
                        Tidak ada data tahun ajaran
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogClose(false)}
              disabled={loading}
              className="px-6">
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading || tahunAjaranList.length === 0}
              className="px-6 bg-blue-600 hover:bg-blue-700">
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
