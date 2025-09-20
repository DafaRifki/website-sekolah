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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Plus,
  GraduationCap,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Users,
} from "lucide-react";
import apiClient from "@/config/axios";

interface TambahTahunAjaranModalProps {
  onSuccess: () => void;
}

interface FormValues {
  namaTahun: string;
  kelasIds: number[];
  activeKelasId: number | null;
}

interface Kelas {
  id_kelas: number;
  namaKelas: string;
  tingkat: string;
}

export default function TambahTahunAjaranModal({
  onSuccess,
}: TambahTahunAjaranModalProps) {
  const [open, setOpen] = useState(false);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingKelas, setLoadingKelas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      namaTahun: "",
      kelasIds: [],
      activeKelasId: null,
    },
  });

  const selectedKelasIds = watch("kelasIds");
  const activeKelasId = watch("activeKelasId");

  // Fetch daftar kelas
  useEffect(() => {
    if (open) {
      fetchKelas();
    }
  }, [open]);

  const fetchKelas = async () => {
    setLoadingKelas(true);
    try {
      const res = await apiClient.get("/kelas"); // Sesuaikan dengan endpoint kelas Anda
      setKelasList(res.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data kelas", error);
      setError("Gagal memuat data kelas");
    } finally {
      setLoadingKelas(false);
    }
  };

  // Handle checkbox selection
  const handleKelasSelection = (kelasId: number, checked: boolean) => {
    const currentIds = selectedKelasIds || [];
    let newIds: number[];

    if (checked) {
      newIds = [...currentIds, kelasId];
    } else {
      newIds = currentIds.filter((id) => id !== kelasId);
      // If the removed kelas was the active one, reset active selection
      if (activeKelasId === kelasId) {
        setValue("activeKelasId", null);
      }
    }

    setValue("kelasIds", newIds);
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);

    try {
      // Format data sesuai dengan service: [namaTahun, kelasIds, activeKelasId]
      const payload = [values.namaTahun, values.kelasIds, values.activeKelasId];

      await apiClient.post("/tahun-ajaran", payload);

      reset();
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error("Gagal menambah tahun ajaran", error);
      setError(
        error.response?.data?.message ||
          "Terjadi kesalahan saat menambahkan tahun ajaran"
      );
    } finally {
      setLoading(false);
    }
  };

  // Group kelas by tingkat
  const kelasByTingkat = kelasList.reduce((acc, kelas) => {
    const tingkat = kelas.tingkat;
    if (!acc[tingkat]) {
      acc[tingkat] = [];
    }
    acc[tingkat].push(kelas);
    return acc;
  }, {} as Record<string, Kelas[]>);

  const tingkatOrder = ["X", "XI", "XII"];
  const sortedTingkat = Object.keys(kelasByTingkat).sort((a, b) => {
    const indexA = tingkatOrder.indexOf(a);
    const indexB = tingkatOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const selectedKelasCount = selectedKelasIds?.length || 0;
  const hasActiveKelas = activeKelasId !== null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Tahun Ajaran
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            Tambah Tahun Ajaran Baru
          </DialogTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Buat tahun ajaran baru dan pilih kelas yang akan aktif
          </p>
          <Separator />
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card className="border-0 shadow-sm bg-slate-50/50 dark:bg-slate-800/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Informasi Dasar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="namaTahun" className="text-sm font-medium">
                  Nama Tahun Ajaran *
                </Label>
                <Input
                  id="namaTahun"
                  placeholder="Contoh: 2024/2025"
                  {...register("namaTahun", {
                    required: "Nama tahun ajaran harus diisi",
                    minLength: { value: 3, message: "Minimal 3 karakter" },
                  })}
                  className={errors.namaTahun ? "border-red-500" : ""}
                />
                {errors.namaTahun && (
                  <p className="text-sm text-red-600">
                    {errors.namaTahun.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Class Selection */}
          <Card className="border-0 shadow-sm bg-slate-50/50 dark:bg-slate-800/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  Pilih Kelas
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Users className="h-4 w-4" />
                  {selectedKelasCount} kelas dipilih
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Pilih kelas yang akan tersedia untuk tahun ajaran ini
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingKelas ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-slate-600">
                    Memuat kelas...
                  </span>
                </div>
              ) : kelasList.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                  <p>Tidak ada kelas tersedia</p>
                  <p className="text-xs">Tambahkan kelas terlebih dahulu</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedTingkat.map((tingkat) => (
                    <div key={tingkat} className="space-y-2">
                      <div className="flex items-center gap-2 py-2">
                        <GraduationCap className="h-4 w-4 text-purple-600" />
                        <h4 className="font-medium text-slate-700 dark:text-slate-300">
                          Tingkat {tingkat}
                        </h4>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                        <span className="text-xs text-slate-500">
                          {kelasByTingkat[tingkat].length} kelas
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {kelasByTingkat[tingkat].map((kelas) => {
                          const isSelected = selectedKelasIds?.includes(
                            kelas.id_kelas
                          );
                          return (
                            <div
                              key={kelas.id_kelas}
                              className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                                isSelected
                                  ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                                  : "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                              }`}>
                              <Checkbox
                                id={`kelas-${kelas.id_kelas}`}
                                checked={isSelected}
                                onCheckedChange={(checked) =>
                                  handleKelasSelection(
                                    kelas.id_kelas,
                                    !!checked
                                  )
                                }
                              />
                              <label
                                htmlFor={`kelas-${kelas.id_kelas}`}
                                className="flex-1 cursor-pointer">
                                <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                                  {kelas.namaKelas}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  Kelas {kelas.tingkat}
                                </p>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Class Selection */}
          {selectedKelasCount > 0 && (
            <Card className="border-0 shadow-sm bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-green-800 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  Pilih Kelas Aktif Default
                </CardTitle>
                <p className="text-sm text-green-700 dark:text-green-500">
                  Pilih satu kelas yang akan aktif secara default (opsional)
                </p>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={activeKelasId?.toString() || ""}
                  onValueChange={(value) =>
                    setValue("activeKelasId", value ? parseInt(value) : null)
                  }>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="" id="no-active" />
                    <label
                      htmlFor="no-active"
                      className="text-sm text-slate-600 dark:text-slate-400">
                      Tidak ada kelas aktif default
                    </label>
                  </div>

                  {selectedKelasIds?.map((kelasId) => {
                    const kelas = kelasList.find((k) => k.id_kelas === kelasId);
                    if (!kelas) return null;

                    return (
                      <div
                        key={kelasId}
                        className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={kelasId.toString()}
                          id={`active-${kelasId}`}
                        />
                        <label
                          htmlFor={`active-${kelasId}`}
                          className="text-sm">
                          {kelas.namaKelas} (Tingkat {kelas.tingkat})
                        </label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          {selectedKelasCount > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Ringkasan:</strong> Tahun ajaran akan dibuat dengan{" "}
                {selectedKelasCount} kelas.
                {hasActiveKelas && (
                  <>
                    {" "}
                    Kelas{" "}
                    <strong>
                      {
                        kelasList.find((k) => k.id_kelas === activeKelasId)
                          ?.namaKelas
                      }
                    </strong>{" "}
                    akan aktif secara default.
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setOpen(false);
                setError(null);
              }}
              disabled={loading}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedKelasCount}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menyimpan...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Buat Tahun Ajaran
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
