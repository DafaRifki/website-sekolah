import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { jadwalService } from "@/services/jadwal-service";
import apiClient from "@/config/axios";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Calendar, School, Search, X } from "lucide-react";
import type { Jadwal, Hari } from "@/types/jadwal.types";
import JadwalWeeklyTable from "./components/JadwalWeeklyTable";

interface TahunAjaran {
  id_tahun: number;
  namaTahun: string;
  semester: number;
  isActive: boolean;
}

interface Kelas {
  id_kelas: number;
  namaKelas: string;
  tingkat: string;
}

export default function JadwalPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();

  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tahunAjaranId, setTahunAjaranId] = useState<string>("");
  const [kelasId, setKelasId] = useState<string>("");

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState<Jadwal | null>(null);

  // Dropdown options
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);

  // Permission check
  useEffect(() => {
    if (authLoading) return;

    if (!user || !isAdmin) {
      navigate("/dashboard");
      toast.error("Akses ditolak. Halaman ini hanya untuk Admin.");
    }
  }, [user, authLoading, isAdmin, navigate]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch dropdown options
  useEffect(() => {
    fetchTahunAjaran();
    fetchKelas();
  }, []);

  // Fetch jadwal when filters change
  useEffect(() => {
    if (user && isAdmin && kelasId && tahunAjaranId) {
      fetchJadwal();
    } else {
      setJadwalList([]);
      setLoading(false);
      setInitialLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin, kelasId, tahunAjaranId, debouncedSearch]);

  const fetchTahunAjaran = async () => {
    try {
      const { data } = await apiClient.get("/tahun-ajaran", {
        params: { limit: 100 },
      });

      // Handle different response structures
      // Inconsistent backend behavior: handle direct and nested data
      const tData = data.data;
      const tahunList = Array.isArray(tData) ? tData : tData?.data || [];

      setTahunAjaranList(tahunList);

      // Auto-select active
      const active = tahunList.find((t: TahunAjaran) => t.isActive);
      if (active) {
        setTahunAjaranId(active.id_tahun.toString());
      } else if (tahunList.length > 0) {
        // Fallback to first item if no active
        setTahunAjaranId(tahunList[0].id_tahun.toString());
      }
    } catch (error) {
      console.error("Failed to fetch tahun ajaran:", error);
      setTahunAjaranList([]); // Ensure it's always an array
    }
  };

  const fetchKelas = async () => {
    try {
      const { data } = await apiClient.get("/kelas", {
        params: { limit: 100 },
      });

      // Debug: Log the response structure
      console.log("📊 Kelas API Response:", data);

      // Handle different response structures
      // Inconsistent backend behavior: handle direct and nested data
      const kData = data.data;
      const list = Array.isArray(kData) ? kData : kData?.data || [];
      
      setKelasList(list);
    } catch (error) {
      console.error("Failed to fetch kelas:", error);
      setKelasList([]); // Ensure it's always an array
    }
  };

  const fetchJadwal = useCallback(async () => {
    if (!kelasId || !tahunAjaranId) return;

    setLoading(true);
    try {
      const response = await jadwalService.getByKelas(
        parseInt(kelasId),
        parseInt(tahunAjaranId),
      );

      // Backend getByKelas returns { success: true, data: [...] }
      // So response.data is the array
      let filteredData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.data || [];

      // Apply search filter if search term exists
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        filteredData = filteredData.filter(
          (jadwal: Jadwal) =>
            jadwal.guruMapel?.mapel?.namaMapel
              ?.toLowerCase()
              .includes(searchLower) ||
            jadwal.guruMapel?.guru?.nama?.toLowerCase().includes(searchLower) ||
            jadwal.hari?.toLowerCase().includes(searchLower),
        );
      }

      setJadwalList(filteredData);
    } catch (error) {
      console.error("Failed to fetch jadwal:", error);
      toast.error("Gagal memuat jadwal");
      setJadwalList([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [kelasId, tahunAjaranId, debouncedSearch]);

  const handleDelete = async () => {
    if (!selectedJadwal) return;

    setDeleting(true);
    try {
      await jadwalService.delete(selectedJadwal.id_jadwal);
      toast.success("Jadwal berhasil dihapus");
      setDeleteDialog(false);
      setSelectedJadwal(null);
      fetchJadwal();
    } catch (error: unknown) {
      console.error("Failed to delete:", error);
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message 
        : "Gagal menghapus jadwal";
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (jadwal: Jadwal) => {
    navigate(`/jadwal/${jadwal.id_jadwal}/edit`);
  };

  const handleAddJadwal = (hari?: Hari, timeSlot?: { jamMulai: string; jamSelesai: string }) => {
    const params = new URLSearchParams();
    if (kelasId) params.append("kelasId", kelasId);
    if (tahunAjaranId) params.append("tahunAjaranId", tahunAjaranId);
    if (hari) params.append("hari", hari);
    if (timeSlot) {
      params.append("jamMulai", timeSlot.jamMulai);
      params.append("jamSelesai", timeSlot.jamSelesai);
    }

    navigate(`/jadwal/create?${params.toString()}`);
  };

  const openDeleteDialog = (jadwal: Jadwal) => {
    setSelectedJadwal(jadwal);
    setDeleteDialog(true);
  };

  if (authLoading || initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentTahun = tahunAjaranList.find(
    (t) => t.id_tahun.toString() === tahunAjaranId,
  );
  const currentKelas = kelasList.find((k) => k.id_kelas.toString() === kelasId);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jadwal Pelajaran</h1>
          <p className="text-muted-foreground">
            Kelola jadwal pelajaran untuk semua kelas
          </p>
        </div>
        <Button
          onClick={() => handleAddJadwal()}
          disabled={!kelasId || !tahunAjaranId}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Jadwal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jadwal</p>
                <p className="text-3xl font-bold">{jadwalList.length}</p>
              </div>
              <Calendar className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kelas Dipilih</p>
                <p className="text-lg font-semibold">
                  {currentKelas?.namaKelas || "Pilih kelas"}
                </p>
              </div>
              <School className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tahun Ajaran</p>
                <p className="text-lg font-semibold">
                  {currentTahun?.namaTahun || "Pilih tahun"}
                </p>
              </div>
              <Calendar className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Jadwal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari mata pelajaran, guru, atau hari..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tahun Ajaran */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tahun Ajaran</label>
                <Select value={tahunAjaranId} onValueChange={setTahunAjaranId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tahun Ajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {tahunAjaranList.map((ta) => (
                      <SelectItem
                        key={ta.id_tahun}
                        value={ta.id_tahun.toString()}>
                        {ta.namaTahun} - Semester {ta.semester}
                        {ta.isActive && " (Aktif)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Kelas */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Kelas</label>
                <Select value={kelasId} onValueChange={setKelasId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {kelasList.map((k) => (
                      <SelectItem
                        key={k.id_kelas}
                        value={k.id_kelas.toString()}>
                        {k.namaKelas}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {!kelasId || !tahunAjaranId ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Pilih tahun ajaran dan kelas untuk melihat jadwal
            </p>
          ) : null}
        </CardContent>
      </Card>

      {/* Weekly Schedule Table */}
      {kelasId && tahunAjaranId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Jadwal {currentKelas?.namaKelas} - {currentTahun?.namaTahun}
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
                onEdit={handleEdit}
                onDelete={openDeleteDialog}
                onAddJadwal={handleAddJadwal}
                showGuru={true}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jadwal</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus jadwal{" "}
              <strong>{selectedJadwal?.guruMapel.mapel.namaMapel}</strong> pada{" "}
              <strong>{selectedJadwal?.hari}</strong> jam{" "}
              <strong>
                {selectedJadwal?.jamMulai} - {selectedJadwal?.jamSelesai}
              </strong>
              ? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
