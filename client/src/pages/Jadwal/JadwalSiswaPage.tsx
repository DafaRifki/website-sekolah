import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { jadwalService } from "@/services/jadwal-service";
import apiClient from "@/config/axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Calendar, School, BookOpen } from "lucide-react";
import type { Jadwal } from "@/types/jadwal.types";
import JadwalWeeklyTable from "./components/JadwalWeeklyTable";

interface TahunAjaran {
  id_tahun: number;
  namaTahun: string;
  semester: number;
  isActive: boolean;
}

interface Siswa {
  id_siswa: number;
  nama: string;
  nis: string;
  kelasId: number;
  kelas: {
    id_kelas: number;
    namaKelas: string;
    tingkat: string;
  };
}

export default function JadwalSiswaPage() {
  const { user, loading: authLoading } = useAuth();

  const [siswaData, setSiswaData] = useState<Siswa | null>(null);
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingJadwal, setLoadingJadwal] = useState(false);

  // Filters
  const [tahunAjaranId, setTahunAjaranId] = useState<string>("");
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);

  // Fetch siswa data
  useEffect(() => {
    if (user?.siswaId) {
      fetchSiswaData();
    }
  }, [user]);

  // Fetch tahun ajaran
  useEffect(() => {
    fetchTahunAjaran();
  }, []);

  // Fetch jadwal when tahun ajaran changes
  useEffect(() => {
    if (siswaData?.kelasId && tahunAjaranId) {
      fetchJadwal();
    }
  }, [siswaData, tahunAjaranId]);

  const fetchSiswaData = async () => {
    if (!user?.siswaId) return;

    try {
      const { data } = await apiClient.get(`/siswa/${user.siswaId}`);
      setSiswaData(data.data);
    } catch (error) {
      console.error("Failed to fetch siswa data:", error);
      toast.error("Gagal memuat data siswa");
    } finally {
      setLoading(false);
    }
  };

  const fetchTahunAjaran = async () => {
    try {
      const { data } = await apiClient.get("/tahun-ajaran", {
        params: { limit: 100 },
      });
      const tahunList = data.data || [];
      setTahunAjaranList(tahunList);

      // Auto-select active
      const active = tahunList.find((t: TahunAjaran) => t.isActive);
      if (active) {
        setTahunAjaranId(active.id_tahun.toString());
      } else if (tahunList.length > 0) {
        setTahunAjaranId(tahunList[0].id_tahun.toString());
      }
    } catch (error) {
      console.error("Failed to fetch tahun ajaran:", error);
      toast.error("Gagal memuat tahun ajaran");
    }
  };

  const fetchJadwal = async () => {
    if (!siswaData?.kelasId) return;

    setLoadingJadwal(true);
    try {
      const response = await jadwalService.getByKelas(
        siswaData.kelasId,
        parseInt(tahunAjaranId),
      );

      setJadwalList(response.data || []);
    } catch (error: any) {
      console.error("Failed to fetch jadwal:", error);
      toast.error("Gagal memuat jadwal kelas");
      setJadwalList([]);
    } finally {
      setLoadingJadwal(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user?.siswaId || !siswaData) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Akses ditolak. Halaman ini hanya untuk Siswa.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentTahun = tahunAjaranList.find(
    (t) => t.id_tahun.toString() === tahunAjaranId,
  );

  // Calculate stats
  const totalJadwal = jadwalList.length;
  const uniqueMapel = new Set(
    jadwalList.map((j) => j.guruMapel.mapel.namaMapel),
  ).size;
  const uniqueGuru = new Set(jadwalList.map((j) => j.guruMapel.guru.nama)).size;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Jadwal Pelajaran Saya</h1>
        <p className="text-muted-foreground">
          Lihat jadwal pelajaran kelas Anda untuk semester ini
        </p>
      </div>

      {/* Siswa Info Card */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Informasi Siswa</p>
              <p className="text-2xl font-bold mt-1">{siswaData.nama}</p>
              <p className="text-white/90 text-sm mt-1">
                NIS: {siswaData.nis} • Kelas: {siswaData.kelas.namaKelas}
              </p>
            </div>
            <School className="h-16 w-16 text-white/30" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jadwal</p>
                <p className="text-3xl font-bold">{totalJadwal}</p>
              </div>
              <Calendar className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mata Pelajaran</p>
                <p className="text-3xl font-bold">{uniqueMapel}</p>
              </div>
              <BookOpen className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Guru Pengajar</p>
                <p className="text-3xl font-bold">{uniqueGuru}</p>
              </div>
              <School className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Tahun Ajaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Select value={tahunAjaranId} onValueChange={setTahunAjaranId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Tahun Ajaran" />
              </SelectTrigger>
              <SelectContent>
                {tahunAjaranList.map((ta) => (
                  <SelectItem key={ta.id_tahun} value={ta.id_tahun.toString()}>
                    {ta.namaTahun} - Semester {ta.semester}
                    {ta.isActive && " (Aktif)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>
            Jadwal Kelas {siswaData.kelas.namaKelas} -{" "}
            {currentTahun?.namaTahun || ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingJadwal ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <JadwalWeeklyTable
              jadwalList={jadwalList}
              readOnly={true}
              showGuru={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Info:</strong> Ini adalah jadwal pelajaran untuk kelas
              Anda. Pastikan untuk selalu mengecek jadwal untuk mempersiapkan
              materi pelajaran yang akan dipelajari.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
