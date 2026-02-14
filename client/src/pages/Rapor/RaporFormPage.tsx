import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "@/config/axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  User,
  FileText,
  CheckCircle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Ekskul {
  nama: string;
  nilai: string;
  keterangan: string;
}

interface Prestasi {
  nama: string;
  tingkat: string;
  keterangan: string;
}

interface Siswa {
  id_siswa: number;
  nama: string;
  nis: string;
  kelas?: {
    namaKelas: string;
  };
}

interface RaporDetail {
  id_rapor: number;
  catatanWaliKelas: string | null;
  sikapSpritual: string | null;
  sikapSosial: string | null;
  deskripsiSpritual: string | null;
  deskripsiSosial: string | null;
  ekstrakurikuler: Ekskul[] | null;
  prestasi: Prestasi[] | null;
  naik: boolean | null;
  kelas: string | null;
  siswa?: Siswa;
}

export default function RaporFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    catatanWaliKelas: "",
    sikapSpritual: "",
    sikapSosial: "",
    deskripsiSpritual: "",
    deskripsiSosial: "",
    naik: null as boolean | null,
    kelas: "",
  });

  const [ekstrakurikuler, setEkstrakurikuler] = useState<Ekskul[]>([]);

  const [prestasi, setPrestasi] = useState<Prestasi[]>([]);

  const [siswa, setSiswa] = useState<Siswa | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const { data } = await apiClient.get(`/rapor/${id}`);
        const detail = data.data;

        if (detail) {
          const r = detail.rapor as RaporDetail;
          setFormData({
            catatanWaliKelas: r.catatanWaliKelas || "",
            sikapSpritual: r.sikapSpritual || "",
            sikapSosial: r.sikapSosial || "",
            deskripsiSpritual: r.deskripsiSpritual || "",
            deskripsiSosial: r.deskripsiSosial || "",
            naik: r.naik,
            kelas: r.kelas || "",
          });

          setEkstrakurikuler(r.ekstrakurikuler || []);
          setPrestasi(r.prestasi || []);
          setSiswa(detail.siswa || r.siswa);
        }
      } catch (error) {
        console.error("Gagal load rapor:", error);
        toast.error("Gagal mengambil data rapor");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleAddEkstrakurikuler = () => {
    setEkstrakurikuler([
      ...ekstrakurikuler,
      { nama: "", nilai: "", keterangan: "" },
    ]);
  };

  const handleRemoveEkstrakurikuler = (index: number) => {
    setEkstrakurikuler(ekstrakurikuler.filter((_, i) => i !== index));
  };

  const handleAddPrestasi = () => {
    setPrestasi([...prestasi, { nama: "", tingkat: "", keterangan: "" }]);
  };

  const handleRemovePrestasi = (index: number) => {
    setPrestasi(prestasi.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const payload = {
        ...formData,
        ekstrakurikuler,
        prestasi,
      };

      await apiClient.put(`/rapor/${id}/catatan`, payload);
      toast.success("Rapor berhasil disimpan");
      navigate(-1);
    } catch (error: unknown) {
      console.error("Gagal simpan rapor:", error);
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || "Gagal menyimpan rapor";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !siswa) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-slate-500 animate-pulse">Memuat data rapor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Edit Rapor
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Lengkapi catatan dan penilaian rapor siswa
              </p>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {loading ? "Menyimpan..." : "Simpan Rapor"}
          </Button>
        </div>

        {/* Student Info */}
        {siswa ? (
          <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{siswa.nama}</h2>
                  <p className="text-white/80">
                    NIS: {siswa.nis} • Kelas: {siswa.kelas?.namaKelas || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="h-32 bg-slate-200 animate-pulse rounded-xl" />
        )}

        {/* Info Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <FileText className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900">Penilaian Wali Kelas</h3>
            <p className="text-sm text-amber-800">
              Bagian ini digunakan untuk menginput nilai sikap, catatan wali kelas, dan kenaikan kelas. 
              Mata pelajaran diinput secara terpisah oleh masing-masing guru pengajar.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Penilaian Sikap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Penilaian Sikap
              </CardTitle>
              <CardDescription>
                Nilai sikap spiritual dan sosial siswa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sikap Spiritual */}
              <div className="space-y-3">
                <Label>Sikap Spiritual</Label>
                <Select
                  value={formData.sikapSpritual}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sikapSpritual: value })
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A - Sangat Baik</SelectItem>
                    <SelectItem value="B">B - Baik</SelectItem>
                    <SelectItem value="C">C - Cukup</SelectItem>
                    <SelectItem value="D">D - Kurang</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Deskripsi sikap spiritual..."
                  value={formData.deskripsiSpritual}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deskripsiSpritual: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <Separator />

              {/* Sikap Sosial */}
              <div className="space-y-3">
                <Label>Sikap Sosial</Label>
                <Select
                  value={formData.sikapSosial}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sikapSosial: value })
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A - Sangat Baik</SelectItem>
                    <SelectItem value="B">B - Baik</SelectItem>
                    <SelectItem value="C">C - Cukup</SelectItem>
                    <SelectItem value="D">D - Kurang</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Deskripsi sikap sosial..."
                  value={formData.deskripsiSosial}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deskripsiSosial: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Catatan Wali Kelas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Catatan Wali Kelas
              </CardTitle>
              <CardDescription>Catatan dan saran untuk siswa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Tulis catatan wali kelas..."
                value={formData.catatanWaliKelas}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    catatanWaliKelas: e.target.value,
                  })
                }
                rows={10}
                className="resize-none"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Tips:</strong> Berikan catatan yang konstruktif dan
                  mendorong perkembangan siswa
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ekstrakurikuler */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Ekstrakurikuler</CardTitle>
                <CardDescription>
                  Kegiatan ekstrakurikuler yang diikuti siswa
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddEkstrakurikuler}
                className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ekstrakurikuler.map((ekskul, index) => (
                <div
                  key={index}
                  className="flex items-end gap-3 p-4 bg-slate-50 rounded-lg border">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Nama Kegiatan</Label>
                      <Input
                        value={ekskul.nama}
                        onChange={(e) => {
                          const newEkskul = [...ekstrakurikuler];
                          newEkskul[index].nama = e.target.value;
                          setEkstrakurikuler(newEkskul);
                        }}
                        placeholder="Nama kegiatan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Nilai</Label>
                      <Select
                        value={ekskul.nilai}
                        onValueChange={(value) => {
                          const newEkskul = [...ekstrakurikuler];
                          newEkskul[index].nilai = value;
                          setEkstrakurikuler(newEkskul);
                        }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Keterangan</Label>
                      <Input
                        value={ekskul.keterangan}
                        onChange={(e) => {
                          const newEkskul = [...ekstrakurikuler];
                          newEkskul[index].keterangan = e.target.value;
                          setEkstrakurikuler(newEkskul);
                        }}
                        placeholder="Keterangan"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveEkstrakurikuler(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {ekstrakurikuler.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-sm">Belum ada ekstrakurikuler</p>
                  <p className="text-xs mt-1">
                    Klik tombol "Tambah" untuk menambahkan
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Prestasi */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Prestasi</CardTitle>
                <CardDescription>Prestasi yang diraih siswa</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddPrestasi}
                className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prestasi.map((p, index) => (
                <div
                  key={index}
                  className="flex items-end gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Nama Prestasi</Label>
                      <Input
                        value={p.nama}
                        onChange={(e) => {
                          const newPrestasi = [...prestasi];
                          newPrestasi[index].nama = e.target.value;
                          setPrestasi(newPrestasi);
                        }}
                        placeholder="Nama prestasi"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Tingkat</Label>
                      <Select
                        value={p.tingkat}
                        onValueChange={(value) => {
                          const newPrestasi = [...prestasi];
                          newPrestasi[index].tingkat = value;
                          setPrestasi(newPrestasi);
                        }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sekolah">Sekolah</SelectItem>
                          <SelectItem value="Kecamatan">Kecamatan</SelectItem>
                          <SelectItem value="Kabupaten">Kabupaten</SelectItem>
                          <SelectItem value="Provinsi">Provinsi</SelectItem>
                          <SelectItem value="Nasional">Nasional</SelectItem>
                          <SelectItem value="Internasional">
                            Internasional
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Keterangan</Label>
                      <Input
                        value={p.keterangan}
                        onChange={(e) => {
                          const newPrestasi = [...prestasi];
                          newPrestasi[index].keterangan = e.target.value;
                          setPrestasi(newPrestasi);
                        }}
                        placeholder="Tahun/keterangan"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePrestasi(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {prestasi.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-sm">Belum ada prestasi</p>
                  <p className="text-xs mt-1">
                    Klik tombol "Tambah" untuk menambahkan
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Kenaikan Kelas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Kenaikan Kelas
            </CardTitle>
            <CardDescription>
              Tentukan status kenaikan kelas siswa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
              <div>
                <Label className="text-base">Status Naik Kelas</Label>
                <p className="text-sm text-slate-600 mt-1">
                  Aktifkan jika siswa naik ke kelas berikutnya
                </p>
              </div>
              <Switch
                checked={formData.naik === true}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, naik: checked })
                }
              />
            </div>

            {formData.naik && (
              <div className="space-y-2">
                <Label>Kelas Tujuan</Label>
                <Input
                  value={formData.kelas}
                  onChange={(e) =>
                    setFormData({ ...formData, kelas: e.target.value })
                  }
                  placeholder="Contoh: XI IPA 1"
                />
                <p className="text-xs text-slate-500">
                  Masukkan kelas tujuan untuk siswa yang naik kelas
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {loading ? "Menyimpan..." : "Simpan Rapor"}
          </Button>
        </div>
      </div>
    </div>
  );
}
