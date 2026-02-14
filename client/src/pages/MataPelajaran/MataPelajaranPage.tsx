import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/config/axios";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Edit,
  Trash2,
  BookOpen,
  X,
} from "lucide-react";

interface MataPelajaran {
  id_mapel: number;
  namaMapel: string;
  kelompokMapel: string | null;
  jumlahNilai: number;
}

export default function MataPelajaranPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();

  const [mataPelajaran, setMataPelajaran] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [kelompokFilter, setKelompokFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedMapel, setSelectedMapel] = useState<MataPelajaran | null>(
    null,
  );

  // Kelompok list
  const [kelompokList, setKelompokList] = useState<string[]>([]);

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

  // Fetch kelompok list
  const fetchKelompokList = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/mata-pelajaran/kelompok-list");
      setKelompokList(data.data || []);
    } catch (error) {
      console.error("Failed to fetch kelompok list:", error);
    }
  }, []);

  const fetchMataPelajaran = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        kelompokMapel: kelompokFilter !== "all" ? kelompokFilter : undefined,
      };

      const { data } = await apiClient.get("/mata-pelajaran", { params });

      setMataPelajaran(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.total || 0);
    } catch (error) {
      console.error("Failed to fetch mata pelajaran:", error);
      toast.error("Gagal memuat data mata pelajaran");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [page, debouncedSearch, kelompokFilter]);

  // Fetch kelompok list on mount
  useEffect(() => {
    fetchKelompokList();
  }, [fetchKelompokList]);

  // Fetch mata pelajaran
  useEffect(() => {
    if (user && isAdmin) {
      fetchMataPelajaran();
    }
  }, [user, isAdmin, fetchMataPelajaran]);

  const handleDelete = async () => {
    if (!selectedMapel) return;

    setDeleting(true);
    try {
      await apiClient.delete(`/mata-pelajaran/${selectedMapel.id_mapel}`);
      toast.success("Mata pelajaran berhasil dihapus");
      setDeleteDialog(false);
      setSelectedMapel(null);
      fetchMataPelajaran();
    } catch (error: any) {
      console.error("Failed to delete:", error);
      toast.error(
        error.response?.data?.message || "Gagal menghapus mata pelajaran",
      );
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (mapel: MataPelajaran) => {
    setSelectedMapel(mapel);
    setDeleteDialog(true);
  };

  if (authLoading || initialLoading) {
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
          <h1 className="text-3xl font-bold">Mata Pelajaran</h1>
          <p className="text-muted-foreground">
            Kelola mata pelajaran yang tersedia di sekolah
          </p>
        </div>
        <Button onClick={() => navigate("/mata-pelajaran/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Mata Pelajaran
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama mata pelajaran..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 pr-9"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Kelompok Filter */}
            <div>
              <Select
                value={kelompokFilter}
                onValueChange={(value) => {
                  setKelompokFilter(value);
                  setPage(1);
                }}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter Kelompok" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelompok</SelectItem>
                  {kelompokList.map((kelompok) => (
                    <SelectItem key={kelompok} value={kelompok}>
                      {kelompok}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Total: {totalItems} mata pelajaran</span>
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
          ) : mataPelajaran.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada mata pelajaran ditemukan</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Nama Mata Pelajaran</TableHead>
                    <TableHead>Kelompok</TableHead>
                    <TableHead className="text-center">Jumlah Nilai</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mataPelajaran.map((mapel, index) => (
                    <TableRow key={mapel.id_mapel}>
                      <TableCell>{(page - 1) * 10 + index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {mapel.namaMapel}
                      </TableCell>
                      <TableCell>
                        {mapel.kelompokMapel ? (
                          <Badge variant="outline">{mapel.kelompokMapel}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{mapel.jumlahNilai}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(`/mata-pelajaran/${mapel.id_mapel}/edit`)
                            }>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openDeleteDialog(mapel)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Hapus
                          </Button>
                        </div>
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
            <AlertDialogTitle>Hapus Mata Pelajaran</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus mata pelajaran{" "}
              <strong>{selectedMapel?.namaMapel}</strong>? Tindakan ini tidak
              dapat dibatalkan.
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
