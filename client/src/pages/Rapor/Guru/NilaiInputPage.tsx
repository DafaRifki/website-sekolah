import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { getNilaiStatistics, getSiswaForNilai } from "@/services/nilai.service";
import type { NilaiStatistics, SiswaWithNilai } from "@/types/nilai.types";
import {
  CheckCircle2,
  Edit,
  Loader2,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import MapelKelasSelector from "../components/MapelKelasSelector";
import NilaiInputModal from "../components/NilaiInputModal";
import TahunSemesterSelector from "../components/TahunSemesterSelector";

export default function NilaiInputPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [tahunAjaranId, setTahunAjaranId] = useState("");
  const [semester, setSemester] = useState("");
  const [selectedMapel, setSelectedMapel] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedMapelName, setSelectedMapelName] = useState("");
  const [siswaList, setSiswaList] = useState<SiswaWithNilai[]>([]);
  const [statistics, setStatistics] = useState<NilaiStatistics | null>(null);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<SiswaWithNilai | null>(
    null,
  );

  // permission check
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    if (!isAdmin && user.role !== "GURU") {
      navigate("/dashboard");
      toast.error("Akses ditolak. Halaman ini khusus untuk guru.");
    }
  }, [user, authLoading, isAdmin, navigate]);

  const fetchSiswaList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSiswaForNilai(
        Number(selectedKelas),
        Number(selectedMapel),
        Number(tahunAjaranId),
      );
      setSiswaList(response.data || []);
    } catch (error) {
      console.error("Gagal memuat siswa", error);
      toast.error("Gagal memuat data siswa");
    } finally {
      setLoading(false);
    }
  }, [selectedKelas, selectedMapel, tahunAjaranId]);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await getNilaiStatistics(
        Number(tahunAjaranId),
        semester,
      );
      setStatistics(response.data);
    } catch (error) {
      console.error("Gagal memuat statistik", error);
    }
  }, [tahunAjaranId, semester]);

  // fetch siswa list when mapel & kelas selected
  useEffect(() => {
    if (selectedMapel && selectedKelas) {
      fetchSiswaList();
    }
  }, [selectedMapel, selectedKelas, fetchSiswaList]);

  // fetch statistics on page load
  useEffect(() => {
    if (tahunAjaranId && semester) {
      fetchStatistics();
    }
  }, [tahunAjaranId, semester, fetchStatistics]);

  const handleOpenModal = (siswa: SiswaWithNilai) => {
    setSelectedSiswa(siswa);
    setModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchSiswaList();
    fetchStatistics();
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // don`t render if no user
  if (!user) {
    return null;
  }
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Input Nilai Siswa</h1>
        <p className="text-muted-foreground">
          Input dan kelola nilai siswa untuk mata pelajaran yang Anda ajar
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.totalSiswa}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sudah Dinilai</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics?.siswaWithNilai}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Belum Dinilai</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statistics?.siswaWithoutNilai}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.rataRata}</div>
          </CardContent>
        </Card>
      </div>

      {/* Mapel & Kelas Selector */}
      <MapelKelasSelector
        tahunAjaranId={tahunAjaranId}
        onSelectionChange={(mapelId, kelasId, mapelName) => {
          setSelectedMapel(mapelId);
          setSelectedKelas(kelasId);
          setSelectedMapelName(mapelName);
        }}
      />

      <TahunSemesterSelector
        onSelectionChange={(tahunId, sem) => {
          setTahunAjaranId(tahunId);
          setSemester(sem);
          // Reset selections
          setSelectedMapel("");
          setSelectedKelas("");
        }}
      />

      {/* Siswa Table */}
      {selectedMapel && selectedKelas && (
        <Card>
          <CardHeader>
            <CardTitle>Daftar Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : siswaList.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Tidak ada siswa ditemukan
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>NIS</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead className="text-center">Nilai Akhir</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {siswaList.map((siswa, index) => (
                    <TableRow key={siswa.id_siswa}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{siswa.nis}</TableCell>
                      <TableCell className="font-medium">
                        {siswa.nama}
                      </TableCell>
                      <TableCell className="text-center">
                        {siswa.nilai ? (
                          <span className="font-semibold text-lg">
                            {siswa.nilai.nilai}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {siswa.nilai ? (
                          <Badge variant="default" className="bg-green-600">
                            Sudah
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Belum</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={siswa.nilai ? "outline" : "default"}
                          onClick={() => handleOpenModal(siswa)}>
                          {siswa.nilai ? (
                            <>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              Input
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Nilai Input Modal */}
      {selectedSiswa && (
        <NilaiInputModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={handleModalSuccess}
          siswa={selectedSiswa}
          mapel={{
            id_mapel: Number(selectedMapel),
            namaMapel: selectedMapelName || "Mata Pelajaran",
          }}
          tahunAjaranId={Number(tahunAjaranId)}
          semester={semester}
          existingNilai={selectedSiswa.nilai}
        />
      )}
    </div>
  );
}
