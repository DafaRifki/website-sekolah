import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { guruMapelService } from "@/services/guru-mapel-service";
import apiClient from "@/config/axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft, Save } from "lucide-react";

interface Guru {
  id_guru: number;
  nip: string;
  nama: string;
}

interface MataPelajaran {
  id_mapel: number;
  namaMapel: string;
  kelompokMapel?: string;
}

interface Kelas {
  id_kelas: number;
  namaKelas: string;
  tingkat: string;
}

interface TahunAjaran {
  id_tahun: number;
  namaTahun: string;
  semester: number;
  isActive: boolean;
}

export default function GuruMapelFormPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [guruId, setGuruId] = useState("");
  const [mapelId, setMapelId] = useState("");
  const [kelasId, setKelasId] = useState("");
  const [tahunAjaranId, setTahunAjaranId] = useState("");

  // Dropdown options
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);

  // Permission check
  useEffect(() => {
    if (authLoading) return;

    if (!user || !isAdmin) {
      navigate("/dashboard");
      toast.error("Akses ditolak. Halaman ini hanya untuk Admin.");
    }
  }, [user, authLoading, isAdmin, navigate]);

  // Fetch dropdown options
  useEffect(() => {
    if (user && isAdmin) {
      fetchDropdownData();
    }
  }, [user, isAdmin]);

  const fetchDropdownData = async () => {
    setLoading(true);
    try {
      const [guruRes, mapelRes, kelasRes, tahunRes] = await Promise.all([
        apiClient.get("/guru", { params: { limit: 1000 } }),
        apiClient.get("/mata-pelajaran", { params: { limit: 1000 } }),
        apiClient.get("/kelas", { params: { limit: 1000 } }),
        apiClient.get("/tahun-ajaran", { params: { limit: 100 } }),
      ]);

      // Inconsistent backend behavior: some return Array directly in 'data', others nest it as { data: Array }
      const gData = guruRes.data.data;
      setGuruList(Array.isArray(gData) ? gData : gData?.data || []);

      const mData = mapelRes.data.data;
      setMapelList(Array.isArray(mData) ? mData : mData?.data || []);

      const kData = kelasRes.data.data;
      setKelasList(Array.isArray(kData) ? kData : kData?.data || []);

      const tData = tahunRes.data.data;
      const tahunList = Array.isArray(tData) ? tData : tData?.data || [];
      setTahunAjaranList(tahunList);

      // Auto-select active tahun ajaran
      const active = tahunList.find((t: TahunAjaran) => t.isActive);
      if (active) {
        setTahunAjaranId(active.id_tahun.toString());
      }
    } catch (error) {
      console.error("Failed to fetch dropdown data:", error);
      toast.error("Gagal memuat data. Silakan refresh halaman.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!guruId || !mapelId || !kelasId || !tahunAjaranId) {
      toast.error("Semua field wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id_guru: parseInt(guruId),
        id_mapel: parseInt(mapelId),
        id_kelas: parseInt(kelasId),
        tahunAjaranId: parseInt(tahunAjaranId),
      };

      await guruMapelService.create(payload);
      toast.success("Penugasan guru berhasil ditambahkan");
      navigate("/guru-mapel");
    } catch (error: any) {
      console.error("Failed to save:", error);
      toast.error(
        error.response?.data?.message || "Gagal menambahkan penugasan guru",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/guru-mapel")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Tambah Penugasan Guru</h1>
          <p className="text-muted-foreground">
            Tugaskan guru untuk mengajar mata pelajaran di kelas tertentu
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Form Penugasan</CardTitle>
          <CardDescription>
            Pilih guru, mata pelajaran, kelas, dan tahun ajaran
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Guru */}
            <div className="space-y-2">
              <Label htmlFor="guru">
                Guru <span className="text-red-500">*</span>
              </Label>
              <Select value={guruId} onValueChange={setGuruId}>
                <SelectTrigger id="guru">
                  <SelectValue placeholder="Pilih Guru" />
                </SelectTrigger>
                <SelectContent>
                  {guruList.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      Tidak ada guru tersedia
                    </div>
                  ) : (
                    guruList.map((guru) => (
                      <SelectItem
                        key={guru.id_guru}
                        value={guru.id_guru.toString()}>
                        {guru.nama} (NIP: {guru.nip})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Mata Pelajaran */}
            <div className="space-y-2">
              <Label htmlFor="mapel">
                Mata Pelajaran <span className="text-red-500">*</span>
              </Label>
              <Select value={mapelId} onValueChange={setMapelId}>
                <SelectTrigger id="mapel">
                  <SelectValue placeholder="Pilih Mata Pelajaran" />
                </SelectTrigger>
                <SelectContent>
                  {mapelList.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      Tidak ada mata pelajaran tersedia
                    </div>
                  ) : (
                    mapelList.map((mapel) => (
                      <SelectItem
                        key={mapel.id_mapel}
                        value={mapel.id_mapel.toString()}>
                        {mapel.namaMapel}
                        {mapel.kelompokMapel && ` (${mapel.kelompokMapel})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Kelas */}
            <div className="space-y-2">
              <Label htmlFor="kelas">
                Kelas <span className="text-red-500">*</span>
              </Label>
              <Select value={kelasId} onValueChange={setKelasId}>
                <SelectTrigger id="kelas">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  {kelasList.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      Tidak ada kelas tersedia
                    </div>
                  ) : (
                    kelasList.map((kelas) => (
                      <SelectItem
                        key={kelas.id_kelas}
                        value={kelas.id_kelas.toString()}>
                        {kelas.namaKelas} (Tingkat {kelas.tingkat})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Tahun Ajaran */}
            <div className="space-y-2">
              <Label htmlFor="tahunAjaran">
                Tahun Ajaran <span className="text-red-500">*</span>
              </Label>
              <Select value={tahunAjaranId} onValueChange={setTahunAjaranId}>
                <SelectTrigger id="tahunAjaran">
                  <SelectValue placeholder="Pilih Tahun Ajaran" />
                </SelectTrigger>
                <SelectContent>
                  {tahunAjaranList.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      Tidak ada tahun ajaran tersedia
                    </div>
                  ) : (
                    tahunAjaranList.map((tahun) => (
                      <SelectItem
                        key={tahun.id_tahun}
                        value={tahun.id_tahun.toString()}>
                        {tahun.namaTahun} - Semester {tahun.semester}
                        {tahun.isActive && " (Aktif)"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Catatan:</strong> Pastikan kombinasi guru, mata
                pelajaran, kelas, dan tahun ajaran belum ada. Sistem akan
                menolak penugasan yang duplikat.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/guru-mapel")}
                disabled={submitting}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Penugasan
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
