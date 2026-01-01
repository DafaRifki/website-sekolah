"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreditCard,
  RefreshCw,
  Receipt,
  Calendar,
  Banknote,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import apiClient from "@/config/axios";
import TambahPembayaranModal from "./components/TambahPembayaranModal";

interface Pembayaran {
  id_pembayaran: number;
  tagihanId: number;
  siswa?: {
    nama: string;
  };
  namaTagihan: string;
  nominalTagihan: number;
  jumlahBayar: number;
  metode: string;
  tanggal: string;
  keterangan?: string;
  tahunAjaran?: {
    namaTahun: string;
  };
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function PembayaranPage() {
  const [pembayaran, setPembayaran] = useState<Pembayaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [stats, setStats] = useState({
    total: 0,
    totalBayar: 0,
    rataRataBayar: 0,
    byMetode: [] as { metode: string; count: number }[],
  });

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      const res = await apiClient.get("/pembayaran", {
        params: {
          page,
          limit: pagination.limit,
        },
      });

      setPembayaran(res.data.data || []);
      setPagination({
        page: res.data.pagination.page,
        limit: res.data.pagination.limit,
        total: res.data.pagination.total,
        totalPages: res.data.pagination.totalPages,
      });
    } catch (error: any) {
      console.error(error);
      toast.error("Gagal memuat data pembayaran", {
        description: error.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiClient.get("/pembayaran/stats");
      setStats(res.data.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStats();
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchData(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CreditCard className="h-7 w-7 text-blue-600" />
              Riwayat Pembayaran
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              {stats.total} transaksi • Rp
              {stats.totalBayar.toLocaleString("id-ID")} total
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchData(pagination.page);
                fetchStats();
              }}
              disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            <TambahPembayaranModal
              onSuccess={() => {
                fetchData(1);
                fetchStats();
              }}
            />
          </div>
        </div>

        {/* Summary Cards */}
        {!loading && stats.total > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Receipt className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Total Transaksi
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.total}
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
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    Rp {stats.totalBayar.toLocaleString("id-ID")}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Rata-rata
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    Rp {Math.round(stats.rataRataBayar).toLocaleString("id-ID")}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Metode Populer
                  </p>
                  <p className="text-lg font-bold text-orange-600">
                    {stats.byMetode.length > 0
                      ? stats.byMetode.sort((a, b) => b.count - a.count)[0]
                          .metode
                      : "-"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabel Pembayaran */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900 dark:text-slate-100">
              Daftar Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                <span className="ml-3 text-slate-600 dark:text-slate-400">
                  Memuat data...
                </span>
              </div>
            ) : pembayaran.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                <p className="text-slate-600 dark:text-slate-400">
                  Belum ada pembayaran
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No.</TableHead>
                        <TableHead>Nama Siswa</TableHead>
                        <TableHead>Jenis Tagihan</TableHead>
                        <TableHead>Nominal Tagihan</TableHead>
                        <TableHead>Jumlah Bayar</TableHead>
                        <TableHead>Metode</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Tahun Ajaran</TableHead>
                        <TableHead>Keterangan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pembayaran.map((item, idx) => (
                        <TableRow key={item.id_pembayaran}>
                          <TableCell className="font-medium">
                            {(pagination.page - 1) * pagination.limit + idx + 1}
                          </TableCell>
                          <TableCell>{item.siswa?.nama || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {item.namaTagihan}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            Rp{item.nominalTagihan.toLocaleString("id-ID")}
                          </TableCell>
                          <TableCell className="font-semibold text-green-600">
                            Rp{item.jumlahBayar.toLocaleString("id-ID")}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-700">
                              {item.metode}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(item.tanggal).toLocaleDateString("id-ID")}
                          </TableCell>
                          <TableCell>
                            {item.tahunAjaran?.namaTahun || "-"}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {item.keterangan || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    dari {pagination.total} data
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1 || loading}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          let pageNum = i + 1;
                          if (pagination.totalPages > 5) {
                            if (pagination.page > 3) {
                              pageNum = pagination.page - 2 + i;
                            }
                            if (pageNum > pagination.totalPages) {
                              pageNum = pagination.totalPages - (4 - i);
                            }
                          }

                          if (pageNum > 0 && pageNum <= pagination.totalPages) {
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
                          return null;
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
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
