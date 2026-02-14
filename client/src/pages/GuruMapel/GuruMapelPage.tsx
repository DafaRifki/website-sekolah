import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { guruMapelService } from "@/services/guru-mapel-service";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Loader2,
  Plus,
  Search,
  Trash2,
  Users,
  BookOpen,
  School,
} from "lucide-react";
import type { GuruMapel } from "@/types/guru-mapel.types";
import apiClient from "@/config/axios";

interface TahunAjaran {
  id_tahun: number;
  namaTahun: string;
  semester: number;
  isActive: boolean;
}

export default function GuruMapelPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();

  const [guruMapel, setGuruMapel] = useState<GuruMapel[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [tahunAjaranId, setTahunAjaranId] = useState<string>("");
  const [kelasId, setKelasId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GuruMapel | null>(null);

  // Dropdown options
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [kelasList, setKelasList] = useState<{ id_kelas: number; namaKelas: string; tingkat: string }[]>([]);

  // Permission check
  useEffect(() => {
    if (authLoading) return;

    if (!user || !isAdmin) {
      navigate("/dashboard");
      toast.error("Akses ditolak. Halaman ini hanya untuk Admin.");
    }
  }, [user, authLoading, isAdmin, navigate]);

  const fetchTahunAjaran = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/tahun-ajaran", {
        params: { limit: 100 },
      });
      const tahunList = data.data?.data || data.data || [];
      setTahunAjaranList(tahunList);

      // Auto-select active
      const active = tahunList.find((t: TahunAjaran) => t.isActive);
      if (active) {
        setTahunAjaranId(active.id_tahun.toString());
      }
    } catch (error) {
      console.error("Failed to fetch tahun ajaran:", error);
    }
  }, []);

  const fetchKelas = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/kelas", {
        params: { limit: 100 },
      });
      // Handle the nested structure data: { data: [...], pagination: {...} }
      const list = data.data && Array.isArray(data.data.data) 
        ? data.data.data 
        : Array.isArray(data.data) 
          ? data.data 
          : [];
      setKelasList(list);
    } catch (error) {
      console.error("Failed to fetch kelas:", error);
    }
  }, []);

  // Fetch dropdown options
  useEffect(() => {
    fetchTahunAjaran();
    fetchKelas();
  }, [fetchTahunAjaran, fetchKelas]);

  const fetchGuruMapel = useCallback(async () => {
    setLoading(true);
    try {
      const filters: {
        page: number;
        limit: number;
        tahunAjaranId?: number;
        kelasId?: number;
        search?: string;
      } = {
        page,
        limit: 10,
        ...(tahunAjaranId && tahunAjaranId !== "all" && { tahunAjaranId: parseInt(tahunAjaranId) }),
        ...(kelasId && kelasId !== "all" && { kelasId: parseInt(kelasId) }),
        ...(search && { search }),
      };

      const response = await guruMapelService.getAll(filters);

      setGuruMapel(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.total || 0);
    } catch (error: unknown) {
      console.error("Failed to fetch guru mapel:", error);
      const errorMessage = error instanceof AxiosError
        ? error.response?.data?.message
        : "Gagal memuat data penugasan guru";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page, tahunAjaranId, kelasId, search]);

  // Fetch guru mapel when filters change
  useEffect(() => {
    if (user && isAdmin) {
      const timer = setTimeout(() => {
        fetchGuruMapel();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, isAdmin, fetchGuruMapel]);

  const handleDelete = async () => {
    if (!selectedItem) return;

    setDeleting(true);
    try {
      await guruMapelService.delete(selectedItem.id);
      toast.success("Penugasan guru berhasil dihapus");
      setDeleteDialog(false);
      setSelectedItem(null);
      fetchGuruMapel();
    } catch (error: unknown) {
      console.error("Failed to delete:", error);
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message 
        : "Gagal menghapus penugasan guru";
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (item: GuruMapel) => {
    setSelectedItem(item);
    setDeleteDialog(true);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Penugasan Guru Mapel</h1>
          <p className="text-muted-foreground">
            Kelola penugasan guru mengajar mata pelajaran di kelas
          </p>
        </div>
        <Button onClick={() => navigate("/guru-mapel/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Penugasan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Penugasan</p>
                <p className="text-3xl font-bold">{totalItems}</p>
              </div>
              <Users className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tahun Ajaran</p>
                <p className="text-lg font-semibold">
                  {tahunAjaranList.find(
                    (t) => t.id_tahun.toString() === tahunAjaranId,
                  )?.namaTahun || "-"}
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
                <p className="text-sm text-muted-foreground">Filter Aktif</p>
                <p className="text-lg font-semibold">
                  {kelasId ? "Ya" : "Semua Kelas"}
                </p>
              </div>
              <BookOpen className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari guru, mapel, atau kelas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Tahun Ajaran Filter */}
            <div>
              <Select value={tahunAjaranId} onValueChange={setTahunAjaranId}>
                <SelectTrigger>
                  <SelectValue placeholder="Tahun Ajaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {tahunAjaranList.map((ta) => (
                    <SelectItem
                      key={ta.id_tahun}
                      value={ta.id_tahun.toString()}>
                      {ta.namaTahun} - Sem {ta.semester}
                      {ta.isActive && " (Aktif)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Kelas Filter */}
            <div>
              <Select value={kelasId} onValueChange={setKelasId}>
                <SelectTrigger>
                  <SelectValue placeholder="Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {kelasList.map((k) => (
                    <SelectItem key={k.id_kelas} value={k.id_kelas.toString()}>
                      {k.namaKelas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : guruMapel.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada penugasan guru ditemukan</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Guru</TableHead>
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Tahun Ajaran</TableHead>
                    <TableHead className="text-center">Jadwal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guruMapel.map((gm, index) => (
                    <TableRow key={gm.id}>
                      <TableCell>{(page - 1) * 10 + index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{gm.guru.nama}</p>
                          <p className="text-sm text-muted-foreground">
                            NIP: {gm.guru.nip}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{gm.mapel.namaMapel}</p>
                          {gm.mapel.kelompokMapel && (
                            <Badge variant="outline" className="text-xs">
                              {gm.mapel.kelompokMapel}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{gm.kelas.namaKelas}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{gm.tahunAjaran.namaTahun}</p>
                          <p className="text-sm text-muted-foreground">
                            Semester {gm.tahunAjaran.semester}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {gm._count?.jadwal || 0} jadwal
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openDeleteDialog(gm)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Halaman {page} dari {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}>
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Penugasan Guru</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus penugasan{" "}
              <strong>{selectedItem?.guru.nama}</strong> mengajar{" "}
              <strong>{selectedItem?.mapel.namaMapel}</strong> di kelas{" "}
              <strong>{selectedItem?.kelas.namaKelas}</strong>?
              <br />
              <br />
              {selectedItem?._count?.jadwal &&
              selectedItem._count.jadwal > 0 ? (
                <span className="text-destructive font-semibold">
                  Peringatan: Penugasan ini memiliki{" "}
                  {selectedItem._count.jadwal} jadwal. Hapus jadwal terlebih
                  dahulu!
                </span>
              ) : (
                "Tindakan ini tidak dapat dibatalkan."
              )}
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
