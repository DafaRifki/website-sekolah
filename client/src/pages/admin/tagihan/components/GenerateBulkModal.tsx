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
import { Input } from "@/components/ui/input";
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
// import { Badge } from "@/components/ui/badge";
import { AlertCircle, Users, Tag, Calendar } from "lucide-react";
import apiClient from "@/config/axios";

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

interface GenerateBulkModalProps {
  onSuccess: () => void;
}

export default function GenerateBulkModal({
  onSuccess,
}: GenerateBulkModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [tarifList, setTarifList] = useState<Tarif[]>([]);
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [form, setForm] = useState({
    tarifId: "",
    tahunAjaranId: "",
    bulan: "",
    siswaIds: "",
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
          const [tarifRes, tahunRes] = await Promise.all([
            apiClient.get("/tarif-pembayaran"),
            apiClient.get("/tahun-ajaran"),
          ]);
          setTarifList(tarifRes.data.data || []);
          setTahunAjaranList(tahunRes.data.data || []);
        } catch (error: any) {
          toast.error("Gagal memuat data", {
            description: "Tidak dapat memuat data tarif dan tahun ajaran",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tarifId || !form.tahunAjaranId) {
      toast.error("Lengkapi tarif dan tahun ajaran!");
      return;
    }

    try {
      setLoading(true);

      const siswaIds = form.siswaIds
        ? form.siswaIds
            .split(",")
            .map((id) => Number(id.trim()))
            .filter(Boolean)
        : undefined;

      await apiClient.post("/tagihan/generate-bulk", {
        tarifId: Number(form.tarifId),
        tahunAjaranId: Number(form.tahunAjaranId),
        bulan: form.bulan || undefined,
        siswaIds,
      });

      toast.success("Bulk tagihan berhasil dibuat! 🎉");

      setForm({
        tarifId: "",
        tahunAjaranId: "",
        bulan: "",
        siswaIds: "",
      });

      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error("Gagal generate bulk", {
        description: error.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-dashed border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50">
          <Users className="h-4 w-4 mr-2" />
          Generate Bulk
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Generate Bulk Tagihan
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Buat tagihan massal untuk semua atau sebagian siswa
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

            {/* Siswa IDs */}
            <div className="space-y-1">
              <Label className="text-sm font-medium">
                ID Siswa (Opsional - Pisah koma)
              </Label>
              <Input
                name="siswaIds"
                placeholder="Contoh: 1,2,3 (kosongkan untuk semua siswa)"
                value={form.siswaIds}
                onChange={handleChange}
              />
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800">
                Generate untuk semua siswa jika ID siswa dikosongkan
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
                disabled={loading || !form.tarifId || !form.tahunAjaranId}
                className="bg-indigo-600 hover:bg-indigo-700">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Generate Bulk
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
