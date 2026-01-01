// src/pages/tagihan/TagihanPage.tsx
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import apiClient from "@/config/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Receipt,
  RefreshCw,
  Users,
  Search,
  Banknote,
  DollarSign,
  TrendingUp,
  X,
} from "lucide-react";
import TambahTagihanModal from "./components/TambahTagihanModal";
import GenerateBulkModal from "./components/GenerateBulkModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Tagihan {
  id_tagihan: number;
  siswa: {
    id_siswa: number;
    nama: string;
    kelas?: {
      id_kelas: number;
      namaKelas: string;
    };
  };
  tarif: {
    id_tarif: number;
    namaTagihan: string;
    nominal: number;
  };
  tahunAjaran: {
    id_tahun: number;
    namaTahun: string;
    semester: number;
  };
  bulan?: string;
  status: "BELUM_BAYAR" | "CICIL" | "LUNAS";
  totalBayar: number;
  sisaPembayaran: number;
  jumlahPembayaran: number;
}

interface Stats {
  total: number;
  byStatus: { status: string; count: number }[];
  totalTagihan: number;
  totalBayar: number;
  sisaPembayaran: number;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function TagihanPage() {
  const [tagihanList, setTagihanList] = useState<Tagihan[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    byStatus: [],
    totalTagihan: 0,
    totalBayar: 0,
    sisaPembayaran: 0,
  });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    tahunAjaranId: "all",
    status: "all",
  });
  const [searchInput, setSearchInput] = useState("");
  const [tahunAjaranList, setTahunAjaranList] = useState<
    { id_tahun: number; namaTahun: string; semester: number }[]
  >([]);

  const fetchTagihan = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filters.search) params.search = filters.search;
      if (filters.tahunAjaranId !== "all")
        params.tahunAjaranId = Number(filters.tahunAjaranId);
      if (filters.status !== "all") params.status = filters.status;

      const res = await apiClient.get("/tagihan", { params });
      setTagihanList(res.data.data || []);

      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (error: any) {
      toast.error("Gagal memuat data tagihan", {
        description: error.response?.data?.message || "Cek koneksi internet",
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const params: any = {};
      if (filters.tahunAjaranId !== "all")
        params.tahunAjaranId = Number(filters.tahunAjaranId);

      const res = await apiClient.get("/tagihan/stats", { params });
      setStats(res.data.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, [filters.tahunAjaranId]);

  const fetchTahunAjaran = async () => {
    try {
      const res = await apiClient.get("/tahun-ajaran");
      setTahunAjaranList(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch tahun ajaran:", error);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset pagination to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [filters.tahunAjaranId, filters.status, filters.search]);

  useEffect(() => {
    fetchTahunAjaran();
  }, []);

  useEffect(() => {
    fetchTagihan();
    fetchStats();
  }, [fetchTagihan, fetchStats]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setFilters({ search: "", tahunAjaranId: "all", status: "all" });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters =
    filters.search ||
    filters.tahunAjaranId !== "all" ||
    filters.status !== "all";

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      BELUM_BAYAR: { color: "bg-red-100 text-red-800", label: "Belum Bayar" },
      CICIL: { color: "bg-yellow-100 text-yellow-800", label: "Cicil" },
      LUNAS: { color: "bg-green-100 text-green-800", label: "Lunas" },
    };
    const cfg = config[status as keyof typeof config] || config.BELUM_BAYAR;
    return <Badge className={cfg.color}>{cfg.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <Receipt className="h-8 w-8 text-indigo-600" />
              Manajemen Tagihan
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 max-w-md">
              Kelola tagihan siswa • {stats.total} tagihan •{" "}
              <span className="font-semibold text-green-600">
                {formatRupiah(stats.totalBayar)}
              </span>{" "}
              terkumpul
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleResetFilters();
                fetchTagihan();
                fetchStats();
              }}
              disabled={loading}
              className="flex items-center gap-2">
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <GenerateBulkModal
              onSuccess={() => {
                toast.success("Bulk tagihan berhasil dibuat! 🎉");
                fetchTagihan();
                fetchStats();
              }}
            />
            <TambahTagihanModal
              onSuccess={() => {
                toast.success("Tagihan berhasil dibuat! ✅");
                fetchTagihan();
                fetchStats();
              }}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Total Tagihan
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.total}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Total Nominal
                </p>
                <p className="text-xl font-bold text-indigo-600">
                  {formatRupiah(stats.totalTagihan)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Banknote className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Total Bayar
                </p>
                <p className="text-xl font-bold text-green-600">
                  {formatRupiah(stats.totalBayar)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Sisa Pembayaran
                </p>
                <p className="text-xl font-bold text-orange-600">
                  {formatRupiah(stats.sisaPembayaran)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Belum Bayar
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.byStatus.find((s) => s.status === "BELUM_BAYAR")
                    ?.count || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Filter & Pencarian
                </h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                    <X className="h-3 w-3 mr-1" />
                    Reset Filter
                  </Button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Cari nama siswa atau jenis tagihan..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                <div className="flex gap-2 flex-1 sm:flex-none sm:w-auto">
                  <div className="flex-1 sm:w-56">
                    <Select
                      value={filters.tahunAjaranId}
                      onValueChange={(value) =>
                        setFilters({ ...filters, tahunAjaranId: value })
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder="Semua Tahun Ajaran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Tahun Ajaran</SelectItem>
                        {tahunAjaranList.map((tahun) => (
                          <SelectItem
                            key={tahun.id_tahun}
                            value={String(tahun.id_tahun)}>
                            {tahun.namaTahun} - Semester {tahun.semester}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:w-40">
                    <Select
                      value={filters.status}
                      onValueChange={(value) =>
                        setFilters({ ...filters, status: value })
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder="Semua Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="BELUM_BAYAR">Belum Bayar</SelectItem>
                        <SelectItem value="CICIL">Cicil</SelectItem>
                        <SelectItem value="LUNAS">Lunas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Table */}
        <Card className="border-0 shadow-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Daftar Tagihan Siswa
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
                <span className="ml-3 text-lg text-slate-600 dark:text-slate-400">
                  Memuat tagihan...
                </span>
              </div>
            ) : tagihanList.length === 0 ? (
              <div className="text-center py-20">
                <Receipt className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Belum ada tagihan
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Buat tagihan pertama atau generate bulk tagihan untuk semua
                  siswa
                </p>
                <div className="flex gap-3 justify-center">
                  <TambahTagihanModal
                    onSuccess={() => {
                      fetchTagihan();
                      fetchStats();
                    }}
                  />
                  <GenerateBulkModal
                    onSuccess={() => {
                      fetchTagihan();
                      fetchStats();
                    }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b-2 border-slate-200">
                        <TableHead className="w-12">#</TableHead>
                        <TableHead className="w-48">Siswa</TableHead>
                        <TableHead>Jenis Tagihan</TableHead>
                        <TableHead className="text-right">Nominal</TableHead>
                        <TableHead className="text-right">
                          Sudah Bayar
                        </TableHead>
                        <TableHead className="text-right">Sisa</TableHead>
                        <TableHead className="w-32 text-center">
                          Status
                        </TableHead>
                        <TableHead className="w-28">Bulan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tagihanList.map((tagihan, idx) => (
                        <TableRow key={tagihan.id_tagihan}>
                          <TableCell>
                            {(pagination.page - 1) * pagination.limit + idx + 1}
                          </TableCell>
                          <TableCell>{tagihan.siswa.nama}</TableCell>
                          <TableCell>{tagihan.tarif.namaTagihan}</TableCell>
                          <TableCell className="text-right">
                            {formatRupiah(tagihan.tarif.nominal)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatRupiah(tagihan.totalBayar)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatRupiah(tagihan.sisaPembayaran)}
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(tagihan.status)}
                          </TableCell>
                          <TableCell>{tagihan.bulan || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Menampilkan {(pagination.page - 1) * pagination.limit + 1}{" "}
                      -{" "}
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}{" "}
                      dari {pagination.total} tagihan
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1 || loading}>
                        Previous
                      </Button>
                      <div className="flex gap-1">
                        {Array.from(
                          { length: Math.min(5, pagination.totalPages) },
                          (_, i) => {
                            let pageNum = i + 1;
                            if (
                              pagination.totalPages > 5 &&
                              pagination.page > 3
                            ) {
                              pageNum = pagination.page - 2 + i;
                              if (pageNum > pagination.totalPages)
                                pageNum = pagination.totalPages;
                            }
                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  pagination.page === pageNum
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                disabled={loading}>
                                {pageNum}
                              </Button>
                            );
                          }
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={
                          pagination.page === pagination.totalPages || loading
                        }>
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
