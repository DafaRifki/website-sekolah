import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  User,
  Receipt,
  AlertCircle,
  Users,
  Tag,
  Calendar,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import apiClient from "@/config/axios";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface Siswa {
  id_siswa: number;
  nama: string;
  kelas?: {
    id_kelas: number;
    namaKelas: string;
  };
}

interface Tarif {
  id_tarif: number;
  namaTagihan: string;
  nominal: number;
}

interface TahunAjaran {
  id_tahun: number;
  namaTahun: string;
  semester: number;
}

interface TambahTagihanModalProps {
  onSuccess: () => void;
}

export default function TambahTagihanModal({
  onSuccess,
}: TambahTagihanModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [tarifList, setTarifList] = useState<Tarif[]>([]);
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [form, setForm] = useState({
    id_siswa: "",
    tarifId: "",
    tahunAjaranId: "",
    bulan: "",
  });

  const bulanOptions = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          setFetchLoading(true);
          const [siswaRes, tarifRes, tahunRes] = await Promise.all([
            apiClient.get("/siswa"),
            apiClient.get("/tarif-pembayaran"),
            apiClient.get("/tahun-ajaran"),
          ]);
          setSiswaList(siswaRes.data.data || []);
          setTarifList(tarifRes.data.data || []);
          setTahunAjaranList(tahunRes.data.data || []);
        } catch (error: any) {
          toast.error("Gagal memuat data", {
            description:
              "Tidak dapat memuat data siswa, tarif, dan tahun ajaran",
          });
        } finally {
          setFetchLoading(false);
        }
      };
      fetchData();
    }
  }, [open]);

  const handleSelectChange = (value: string, name: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id_siswa || !form.tarifId || !form.tahunAjaranId) {
      toast.error("Lengkapi semua field!");
      return;
    }

    try {
      setLoading(true);

      await apiClient.post("/tagihan", {
        id_siswa: Number(form.id_siswa),
        tarifId: Number(form.tarifId),
        tahunAjaranId: Number(form.tahunAjaranId),
        bulan: form.bulan || undefined,
      });

      toast.success("Tagihan berhasil dibuat! 🎉");

      setForm({
        id_siswa: "",
        tarifId: "",
        tahunAjaranId: "",
        bulan: "",
      });

      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error("Gagal membuat tagihan", {
        description: error.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Tagihan
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-indigo-600" />
            Tambah Tagihan Baru
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Buat tagihan baru untuk siswa
          </DialogDescription>
          <Separator />
        </DialogHeader>

        {fetchLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
            <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
              Memuat data...
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Siswa Selection */}
            <Card className="bg-slate-50/50 dark:bg-slate-800/50 border-0">
              <CardContent className="p-4 space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  Pilih Siswa
                </h4>

                <div className="space-y-1">
                  <Label className="text-sm font-medium">Nama Siswa</Label>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        role="combobox"
                        className={cn(
                          "w-full justify-between font-normal",
                          !form.id_siswa && "text-muted-foreground",
                        )}>
                        {form.id_siswa
                          ? siswaList.find(
                              (s) => String(s.id_siswa) === form.id_siswa,
                            )?.nama
                          : "Cari nama siswa..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] p-0"
                      align="start">
                      <Command>
                        <CommandInput placeholder="Ketik nama siswa..." />
                        <CommandList className="max-h-[300px] overflow-y-auto">
                          <CommandEmpty>Siswa tidak ditemukan.</CommandEmpty>
                          <CommandGroup>
                            {siswaList.map((siswa) => (
                              <CommandItem
                                key={siswa.id_siswa}
                                value={siswa.nama}
                                onSelect={() => {
                                  handleSelectChange(
                                    String(siswa.id_siswa),
                                    "id_siswa",
                                  );
                                }}>
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    form.id_siswa === String(siswa.id_siswa)
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{siswa.nama}</span>
                                  {siswa.kelas && (
                                    <span className="text-xs text-slate-500">
                                      Kelas: {siswa.kelas.namaKelas}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {siswaList.length === 0 && !fetchLoading && (
                    <p className="text-xs text-amber-600">
                      Tidak ada data siswa tersedia
                    </p>
                  )}
                  {/* <Select
                    value={form.id_siswa}
                    onValueChange={(value) =>
                      handleSelectChange(value, "id_siswa")
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih siswa..." />
                    </SelectTrigger>
                    <SelectContent>
                      {siswaList.map((siswa) => (
                        <SelectItem
                          key={siswa.id_siswa}
                          value={String(siswa.id_siswa)}>
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            {siswa.nama}
                            {siswa.kelas && (
                              <Badge variant="outline" className="ml-2">
                                {siswa.kelas.namaKelas}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {siswaList.length === 0 && (
                    <p className="text-xs text-amber-600">
                      Tidak ada data siswa tersedia
                    </p>
                  )} */}
                </div>
              </CardContent>
            </Card>

            {/* Tarif Selection */}
            <Card className="bg-slate-50/50 dark:bg-slate-800/50 border-0">
              <CardContent className="p-4 space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  Pilih Tarif
                </h4>

                <div className="space-y-1">
                  <Label className="text-sm font-medium">Jenis Tarif</Label>
                  <Select
                    value={form.tarifId}
                    onValueChange={(value) =>
                      handleSelectChange(value, "tarifId")
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tarif..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tarifList.map((tarif) => (
                        <SelectItem
                          key={tarif.id_tarif}
                          value={String(tarif.id_tarif)}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {tarif.namaTagihan}
                            </span>
                            <span className="text-xs text-slate-500">
                              - Rp{tarif.nominal.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {tarifList.length === 0 && (
                    <p className="text-xs text-amber-600">
                      Tidak ada data tarif tersedia
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tahun Ajaran Selection */}
            <Card className="bg-slate-50/50 dark:bg-slate-800/50 border-0">
              <CardContent className="p-4 space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  Tahun Ajaran
                </h4>

                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    Pilih Tahun Ajaran
                  </Label>
                  <Select
                    value={form.tahunAjaranId}
                    onValueChange={(value) =>
                      handleSelectChange(value, "tahunAjaranId")
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tahun ajaran..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tahunAjaranList.map((tahun) => (
                        <SelectItem
                          key={tahun.id_tahun}
                          value={String(tahun.id_tahun)}>
                          {tahun.namaTahun} - Semester {tahun.semester}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Bulan Selection */}
            <div className="space-y-1">
              <Label className="text-sm font-medium">Bulan (Opsional)</Label>
              <Select
                value={form.bulan}
                onValueChange={(value) => handleSelectChange(value, "bulan")}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bulan jika relevan..." />
                </SelectTrigger>
                <SelectContent>
                  {bulanOptions.map((bulan) => (
                    <SelectItem key={bulan} value={bulan}>
                      {bulan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800">
                Tagihan akan dicek duplikasi secara otomatis
              </AlertDescription>
            </Alert>

            <DialogFooter className="gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={
                  loading ||
                  !form.id_siswa ||
                  !form.tarifId ||
                  !form.tahunAjaranId
                }
                className="bg-indigo-600 hover:bg-indigo-700">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menyimpan...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Buat Tagihan
                  </div>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
