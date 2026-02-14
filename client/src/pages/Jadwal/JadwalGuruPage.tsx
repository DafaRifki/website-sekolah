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
import { Loader2, Calendar, BookOpen, Clock } from "lucide-react";
import type { Jadwal } from "@/types/jadwal.types";
import JadwalWeeklyTable from "./components/JadwalWeeklyTable";

interface TahunAjaran {
  id_tahun: number;
  namaTahun: string;
  semester: number;
  isActive: boolean;
}

export default function JadwalGuruPage() {
  const { user, loading: authLoading } = useAuth();

  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [tahunAjaranId, setTahunAjaranId] = useState<string>("");
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);

  // Fetch tahun ajaran
  useEffect(() => {
    fetchTahunAjaran();
  }, []);

  // Fetch jadwal when tahun ajaran changes
  useEffect(() => {
    if (user?.guruId && tahunAjaranId) {
      fetchJadwal();
    }
  }, [user, tahunAjaranId]);

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
    if (!user?.guruId) {
      toast.error("User bukan guru");
      return;
    }

    setLoading(true);
    try {
      const response = await jadwalService.getByGuru(
        user.guruId,
        parseInt(tahunAjaranId),
      );

      setJadwalList(response.data || []);
    } catch (error: any) {
      console.error("Failed to fetch jadwal:", error);
      toast.error("Gagal memuat jadwal mengajar");
      setJadwalList([]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user?.guruId) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Akses ditolak. Halaman ini hanya untuk Guru.
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
  const uniqueKelas = new Set(
    jadwalList.map((j) => j.guruMapel.kelas.namaKelas),
  ).size;
  const uniqueMapel = new Set(
    jadwalList.map((j) => j.guruMapel.mapel.namaMapel),
  ).size;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Jadwal Mengajar Saya</h1>
        <p className="text-muted-foreground">
          Lihat jadwal mengajar Anda untuk semester ini
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jadwal</p>
                <p className="text-3xl font-bold">{totalJadwal}</p>
              </div>
              <Clock className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kelas Diajar</p>
                <p className="text-3xl font-bold">{uniqueKelas}</p>
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
            Jadwal Mengajar - {currentTahun?.namaTahun || ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <JadwalWeeklyTable
              jadwalList={jadwalList}
              readOnly={true}
              showKelas={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Info:</strong> Jadwal ini adalah jadwal mengajar Anda.
              Jika ada perubahan atau kesalahan, hubungi admin untuk melakukan
              perubahan.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
