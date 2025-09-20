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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Plus,
  X,
  Users,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  Clock,
  Power,
} from "lucide-react";
import apiClient from "@/config/axios";

interface Kelas {
  id_kelas: number;
  namaKelas: string;
  tingkat: string;
}

interface TambahKelasBulkModalProps {
  tahunAjaranId: number;
  onSuccess: () => void;
}

export default function TambahKelasBulkModal({
  tahunAjaranId,
  onSuccess,
}: TambahKelasBulkModalProps) {
  const [kelasOptions, setKelasOptions] = useState<Kelas[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<
    { id: number; isActive: boolean }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Ambil daftar kelas dari endpoint /kelas
  useEffect(() => {
    const fetchKelas = async () => {
      if (!open) return;

      try {
        setFetchLoading(true);
        setError(null);
        const res = await apiClient.get("/kelas");
        setKelasOptions(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (error: any) {
        console.error("Gagal fetch kelas:", error);
        setError("Gagal memuat data kelas. Silakan coba lagi.");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchKelas();
  }, [open]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Format data sesuai dengan backend API yang ada
      const kelasIds = selectedKelas.map((item) => item.id);
      const activeKelasId =
        selectedKelas.find((item) => item.isActive)?.id || null;

      await apiClient.post("/tahun-ajaran/kelas/bulk", {
        id_tahun: tahunAjaranId,
        kelasIds: kelasIds,
        activeKelasId: activeKelasId,
      });

      setSelectedKelas([]);
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error("Gagal tambah kelas:", error);
      setError(
        error.response?.data?.message ||
          "Terjadi kesalahan saat menambahkan kelas"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveKelas = (id: number) => {
    setSelectedKelas(selectedKelas.filter((k) => k.id !== id));
  };

  const handleToggleKelasStatus = (id: number) => {
    setSelectedKelas(
      selectedKelas.map((kelas) =>
        kelas.id === id ? { ...kelas, isActive: !kelas.isActive } : kelas
      )
    );
  };

  // Group kelas by tingkat for better organization
  const kelasByTingkat = kelasOptions.reduce((acc, kelas) => {
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

  const availableKelas = kelasOptions.filter(
    (kelas) => !selectedKelas.some((selected) => selected.id === kelas.id_kelas)
  );

  const kelasAktif = selectedKelas.filter((kelas) => kelas.isActive).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs shadow-sm">
          <Plus className="h-3 w-3 mr-1" />
          Tambah Kelas
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Tambah Kelas ke Tahun Ajaran
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Pilih satu atau beberapa kelas yang sudah tersedia untuk ditambahkan
            ke tahun ajaran ini
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
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Memuat daftar kelas...
                </span>
              </div>
            </CardContent>
          </Card>
        ) : kelasOptions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Tidak ada kelas tersedia
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Buat kelas baru terlebih dahulu sebelum menambahkannya
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Class Selection */}
            <Card className="border-0 shadow-sm bg-slate-50/50 dark:bg-slate-800/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  Pilih Kelas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  onValueChange={(value) => {
                    const id = parseInt(value);
                    if (!selectedKelas.some((selected) => selected.id === id)) {
                      setSelectedKelas([
                        ...selectedKelas,
                        { id, isActive: false },
                      ]);
                    }
                  }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kelas untuk ditambahkan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedTingkat.map((tingkat) => (
                      <div key={tingkat}>
                        <div className="px-2 py-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Tingkat {tingkat}
                        </div>
                        {kelasByTingkat[tingkat]
                          .filter(
                            (kelas) =>
                              !selectedKelas.some(
                                (selected) => selected.id === kelas.id_kelas
                              )
                          )
                          .map((kelas) => (
                            <SelectItem
                              key={kelas.id_kelas}
                              value={String(kelas.id_kelas)}
                              className="pl-6">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                {kelas.namaKelas}
                              </div>
                            </SelectItem>
                          ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>

                {availableKelas.length === 0 && selectedKelas.length > 0 && (
                  <div className="text-center py-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Semua kelas sudah dipilih
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Classes */}
            {selectedKelas.length > 0 && (
              <Card className="border-0 shadow-sm bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2 text-green-800 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      Kelas Terpilih
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white/70">
                        {selectedKelas.length} kelas
                      </Badge>
                      {kelasAktif > 0 && (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          <Power className="h-3 w-3 mr-1" />
                          {kelasAktif} aktif
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedKelas.map((selectedItem) => {
                      const kelas = kelasOptions.find(
                        (k) => k.id_kelas === selectedItem.id
                      );
                      if (!kelas) return null;

                      return (
                        <div
                          key={selectedItem.id}
                          className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-800/50 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className={`w-3 h-3 rounded-full transition-colors ${
                                selectedItem.isActive
                                  ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                                  : "bg-slate-400"
                              }`}></div>
                            <div className="flex-1">
                              <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                                {kelas.namaKelas}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                Tingkat {kelas.tingkat} •{" "}
                                {selectedItem.isActive
                                  ? "Akan aktif"
                                  : "Tidak aktif"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Status Toggle Switch */}
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-700">
                              <Label
                                htmlFor={`status-${selectedItem.id}`}
                                className={`text-xs font-medium cursor-pointer transition-colors ${
                                  selectedItem.isActive
                                    ? "text-emerald-600"
                                    : "text-slate-500"
                                }`}>
                                {selectedItem.isActive ? "Aktif" : "Nonaktif"}
                              </Label>
                              <Switch
                                id={`status-${selectedItem.id}`}
                                checked={selectedItem.isActive}
                                onCheckedChange={() =>
                                  handleToggleKelasStatus(selectedItem.id)
                                }
                                className="scale-90"
                              />
                            </div>

                            {/* Remove Button */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveKelas(selectedItem.id)}
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 rounded-full">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Summary with Backend Logic Explanation */}
            {selectedKelas.length > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>
                      <strong>Ringkasan:</strong> {selectedKelas.length} kelas
                      akan ditambahkan ke tahun ajaran ini.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Power className="h-3 w-3 text-emerald-600" />
                        {kelasAktif} kelas aktif
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {selectedKelas.length - kelasAktif} kelas nonaktif
                      </span>
                    </div>
                    {kelasAktif > 1 && (
                      <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/10 rounded border border-amber-200 dark:border-amber-800">
                        <p className="text-xs text-amber-800 dark:text-amber-400">
                          <strong>Catatan:</strong> Hanya satu kelas yang dapat
                          aktif pada saat yang bersamaan. Sistem akan
                          menggunakan kelas aktif pertama yang dipilih.
                        </p>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter className="gap-3 pt-6">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedKelas([]);
              setOpen(false);
              setError(null);
            }}
            disabled={loading}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || selectedKelas.length === 0}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Menyimpan...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Tambah {selectedKelas.length} Kelas
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
