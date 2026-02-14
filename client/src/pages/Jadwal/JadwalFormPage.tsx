import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { jadwalService } from "@/services/jadwal-service";
import { guruMapelService } from "@/services/guru-mapel-service";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { HARI_OPTIONS } from "@/types/jadwal.types";

interface GuruMapel {
  id: number;
  guru: { nama: string };
  mapel: { namaMapel: string };
  kelas: { namaKelas: string };
  tahunAjaran: { namaTahun: string; semester: number };
}

export default function JadwalFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading, isAdmin } = useAuth();

  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [guruMapelId, setGuruMapelId] = useState("");
  const [hari, setHari] = useState<string>("");
  const [jamMulai, setJamMulai] = useState("");
  const [jamSelesai, setJamSelesai] = useState("");
  const [ruangan, setRuangan] = useState("");
  const [keterangan, setKeterangan] = useState("");

  // Dropdown options
  const [guruMapelList, setGuruMapelList] = useState<GuruMapel[]>([]);

  // Filter params from URL
  const urlKelasId = searchParams.get("kelasId");
  const urlTahunAjaranId = searchParams.get("tahunAjaranId");
  const urlHari = searchParams.get("hari");
  const urlJamMulai = searchParams.get("jamMulai");
  const urlJamSelesai = searchParams.get("jamSelesai");

  // Permission check
  useEffect(() => {
    if (authLoading) return;

    if (!user || !isAdmin) {
      navigate("/dashboard");
      toast.error("Akses ditolak. Halaman ini hanya untuk Admin.");
    }
  }, [user, authLoading, isAdmin, navigate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Guru Mapel list - ideally filtered by class/year from URL if present
      const filters = { 
        limit: 1000,
        ...(urlKelasId && { kelasId: parseInt(urlKelasId) }),
        ...(urlTahunAjaranId && { tahunAjaranId: parseInt(urlTahunAjaranId) })
      };

      const gmRes = await guruMapelService.getAll(filters);
      const gmData = gmRes.data;
      setGuruMapelList(Array.isArray(gmData) ? gmData : gmData?.data || []);

      if (isEdit && id) {
        const response = await jadwalService.getById(parseInt(id));
        const jadwal = response.data;
        if (jadwal) {
          setGuruMapelId(jadwal.guruMapelId.toString());
          setHari(jadwal.hari);
          setJamMulai(jadwal.jamMulai);
          setJamSelesai(jadwal.jamSelesai);
          setRuangan(jadwal.ruangan || "");
          setKeterangan(jadwal.keterangan || "");
        }
      } else {
        // Pre-fill from URL
        if (urlHari) setHari(urlHari);
        if (urlJamMulai) setJamMulai(urlJamMulai);
        if (urlJamSelesai) setJamSelesai(urlJamSelesai);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [id, isEdit, urlHari, urlJamMulai, urlJamSelesai, urlKelasId, urlTahunAjaranId]);

  // Fetch data
  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin, fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guruMapelId || !hari || !jamMulai || !jamSelesai) {
      toast.error("Mohon isi semua field yang wajib");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        guruMapelId: parseInt(guruMapelId),
        hari,
        jamMulai,
        jamSelesai,
        ruangan,
        keterangan,
      };

      if (isEdit && id) {
        await jadwalService.update(parseInt(id), payload);
        toast.success("Jadwal berhasil diperbarui");
      } else {
        await jadwalService.create(payload);
        toast.success("Jadwal berhasil ditambahkan");
      }

      // Navigate back with filters if they exist
      const backParams = new URLSearchParams();
      if (urlKelasId) backParams.append("kelasId", urlKelasId);
      if (urlTahunAjaranId) backParams.append("tahunAjaranId", urlTahunAjaranId);
      
      navigate(`/jadwal?${backParams.toString()}`);
    } catch (error: any) {
      console.error("Failed to save jadwal:", error);
      toast.error(error.response?.data?.message || "Gagal menyimpan jadwal");
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
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit Jadwal" : "Tambah Jadwal"}
          </h1>
          <p className="text-muted-foreground">
            Kelola waktu kegiatan belajar mengajar
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Jadwal</CardTitle>
          <CardDescription>
            Tentukan guru, mata pelajaran, dan waktu mengajar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Guru Mapel */}
            <div className="space-y-2">
              <Label htmlFor="guruMapel">
                Penugasan Guru Mapel <span className="text-red-500">*</span>
              </Label>
              <Select value={guruMapelId} onValueChange={setGuruMapelId}>
                <SelectTrigger id="guruMapel">
                  <SelectValue placeholder="Pilih Penugasan Guru" />
                </SelectTrigger>
                <SelectContent>
                  {guruMapelList.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      Tidak ada penugasan guru ditemukan
                    </div>
                  ) : (
                    guruMapelList.map((gm) => (
                      <SelectItem key={gm.id} value={gm.id.toString()}>
                        {gm.guru.nama} - {gm.mapel.namaMapel} ({gm.kelas.namaKelas})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Jika guru/mapel tidak ada, tambahkan dulu di menu Penugasan Guru Mapel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hari */}
              <div className="space-y-2">
                <Label htmlFor="hari">
                  Hari <span className="text-red-500">*</span>
                </Label>
                <Select value={hari} onValueChange={setHari}>
                  <SelectTrigger id="hari">
                    <SelectValue placeholder="Pilih Hari" />
                  </SelectTrigger>
                  <SelectContent>
                    {HARI_OPTIONS.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ruangan */}
              <div className="space-y-2">
                <Label htmlFor="ruangan">Ruangan</Label>
                <Input
                  id="ruangan"
                  placeholder="Contoh: R. Kelas A, Lab Komputer"
                  value={ruangan}
                  onChange={(e) => setRuangan(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Jam Mulai */}
              <div className="space-y-2">
                <Label htmlFor="jamMulai">
                  Jam Mulai <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="jamMulai"
                  type="time"
                  value={jamMulai}
                  onChange={(e) => setJamMulai(e.target.value)}
                />
              </div>

              {/* Jam Selesai */}
              <div className="space-y-2">
                <Label htmlFor="jamSelesai">
                  Jam Selesai <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="jamSelesai"
                  type="time"
                  value={jamSelesai}
                  onChange={(e) => setJamSelesai(e.target.value)}
                />
              </div>
            </div>

            {/* Keterangan */}
            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
              <Input
                id="keterangan"
                placeholder="Contoh: Pertemuan daring, Praktikum"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
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
                    {isEdit ? "Update Jadwal" : "Simpan Jadwal"}
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
