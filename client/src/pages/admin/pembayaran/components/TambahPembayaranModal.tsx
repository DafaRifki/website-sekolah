import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  CreditCard,
  User,
  Receipt,
  Banknote,
  AlertCircle,
  Users,
  Tag,
} from "lucide-react";
import apiClient from "@/config/axios";

interface Siswa {
  id_siswa: number;
  nama: string;
}

interface Tarif {
  id_tarif: number;
  nominal: number;
  keterangan: string;
}

interface TambahPembayaranModalProps {
  onSuccess: () => void;
}

export default function TambahPembayaranModal({
  onSuccess,
}: TambahPembayaranModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [tarifList, setTarifList] = useState<Tarif[]>([]);
  const [form, setForm] = useState({
    siswaId: "",
    tarifId: "",
    jumlahBayar: "",
    metode: "",
    keterangan: "",
  });

  const metodePembayaran = ["Transfer Bank", "Cash", "Virtual Account"];

  // fetch siswa & tarif saat modal dibuka
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          setFetchLoading(true);
          setError(null);
          const [siswaRes, tarifRes] = await Promise.all([
            apiClient.get("/siswa"),
            apiClient.get("/tarif"),
          ]);
          setSiswaList(siswaRes.data.data || []);
          setTarifList(tarifRes.data.data || []);
        } catch (error: any) {
          console.error(error);
          setError("Gagal memuat data siswa dan tarif");
        } finally {
          setFetchLoading(false);
        }
      };
      fetchData();
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSelectChange = (value: string, name: string) => {
    setForm({ ...form, [name]: value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      await apiClient.post("/pembayaran", {
        ...form,
        siswaId: Number(form.siswaId),
        tarifId: Number(form.tarifId),
        jumlahBayar: Number(form.jumlahBayar),
      });

      // Reset form
      setForm({
        siswaId: "",
        tarifId: "",
        jumlahBayar: "",
        metode: "",
        keterangan: "",
      });

      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error(error);
      setError(
        error.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan pembayaran"
      );
    } finally {
      setLoading(false);
    }
  };

  // Get selected tarif info
  const selectedTarif = tarifList.find(
    (t) => t.id_tarif === Number(form.tarifId)
  );

  // Auto-fill jumlah bayar when tarif selected
  const handleTarifChange = (value: string) => {
    const tarif = tarifList.find((t) => t.id_tarif === Number(value));
    setForm({
      ...form,
      tarifId: value,
      jumlahBayar: tarif ? String(tarif.nominal) : form.jumlahBayar,
    });
    if (error) setError(null);
  };

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, "");
    return new Intl.NumberFormat("id-ID").format(Number(number));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setForm({ ...form, jumlahBayar: value });
    if (error) setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pembayaran
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Tambah Pembayaran Baru
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Pilih siswa dan tarif yang sesuai untuk mencatat pembayaran
          </DialogDescription>
          <Separator />
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {fetchLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
              Memuat data...
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Student Selection */}
            <Card className="bg-slate-50/50 dark:bg-slate-800/50 border-0">
              <CardContent className="p-4 space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Pilih Siswa
                </h4>

                <div className="space-y-1">
                  <Label className="text-sm font-medium">Nama Siswa</Label>
                  <Select
                    value={form.siswaId}
                    onValueChange={(value) =>
                      handleSelectChange(value, "siswaId")
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
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {siswaList.length === 0 && (
                    <p className="text-xs text-amber-600">
                      Tidak ada data siswa tersedia
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tariff Selection */}
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
                    onValueChange={handleTarifChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tarif..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tarifList.map((tarif) => (
                        <SelectItem
                          key={tarif.id_tarif}
                          value={String(tarif.id_tarif)}>
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">
                              Rp{tarif.nominal.toLocaleString("id-ID")}
                            </span>
                            <span className="text-xs text-slate-500 ml-2">
                              {tarif.keterangan}
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

                {selectedTarif && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/10 rounded border border-green-200">
                    <Badge
                      variant="outline"
                      className="bg-white text-green-700 border-green-300">
                      {selectedTarif.keterangan} - Rp
                      {selectedTarif.nominal.toLocaleString("id-ID")}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card className="bg-slate-50/50 dark:bg-slate-800/50 border-0">
              <CardContent className="p-4 space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-purple-600" />
                  Detail Pembayaran
                </h4>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Jumlah Bayar</Label>
                    <div className="relative">
                      <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="0"
                        value={
                          form.jumlahBayar
                            ? formatCurrency(form.jumlahBayar)
                            : ""
                        }
                        onChange={handleAmountChange}
                        required
                        className="pl-10 h-9"
                      />
                    </div>
                    {form.jumlahBayar && (
                      <p className="text-xs text-slate-500">
                        Total: Rp{formatCurrency(form.jumlahBayar)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      Metode Pembayaran
                    </Label>
                    <Select
                      value={form.metode}
                      onValueChange={(value) =>
                        handleSelectChange(value, "metode")
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih metode pembayaran..." />
                      </SelectTrigger>
                      <SelectContent>
                        {metodePembayaran.map((metode) => (
                          <SelectItem key={metode} value={metode}>
                            {metode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      Keterangan (Opsional)
                    </Label>
                    <Input
                      name="keterangan"
                      placeholder="Catatan pembayaran..."
                      value={form.keterangan}
                      onChange={handleChange}
                      className="h-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <DialogFooter className="gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForm({
                    siswaId: "",
                    tarifId: "",
                    jumlahBayar: "",
                    metode: "",
                    keterangan: "",
                  });
                  setError(null);
                  setOpen(false);
                }}
                disabled={loading}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={
                  loading ||
                  !form.siswaId ||
                  !form.tarifId ||
                  !form.jumlahBayar ||
                  !form.metode
                }
                className="bg-blue-600 hover:bg-blue-700">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menyimpan...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Simpan Pembayaran
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
