import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import SiswaSearch from "./components/SiswaSearch";
import apiClient from "@/config/axios";
import SiswaTable from "./components/SiswaTable";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Siswa {
  id_siswa: number;
  nis: string;
  nama: string;
  jenisKelamin?: string;
  fotoProfil?: string;
  kelas?: { namaKelas: string };
}

export default function BukuIndukPage() {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [loading, setLoading] = useState(false);
  const perPage = 10;
  const navigate = useNavigate();

  // Fetch when page changes (skip if triggered by search to avoid double fetch, controlled by check?)
  // Actually, easiest way is to separate the "fetch" function and call it from effects.
  // But due to the cleanup nature of debounce, it's a bit tricky to mix.
  // Let's use a simpler pattern:
  // 1. One effect for fetching that depends on [currentPage, debouncedSearch]
  // We need a debouncedSearch state.

  // Refactored approach in this block:
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [currentPage, debouncedSearch]);

  const fetchData = React.useCallback(() => {
    setLoading(true);
    apiClient
      .get("/siswa", {
        params: {
          page: currentPage,
          limit: perPage,
          // Only send search if it has value
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
        },
      })
      .then((res) => {
        setSiswaList(res.data.data);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages);
          setTotalData(res.data.pagination.total);
        }
      })
      .catch((err) => {
        console.error("Error fetching siswa:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentPage, debouncedSearch]);

  return (
    <div className="container mx-auto p-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="text-2xl font-semibold text-gray-900">
            Buku Induk Siswa
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Kelola data siswa dan informasi akademik
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Search Section */}
            <div>
              <SiswaSearch search={search} setSearch={setSearch} />
            </div>

            {/* Table Section */}
            <div>
              <SiswaTable
                siswaList={siswaList}
                onDetail={(id) => navigate(`/buku-induk/${id}`)}
              />
              {loading && (
                <div className="text-center py-4 text-gray-500">
                  Memuat data...
                </div>
              )}
              {!loading && siswaList.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Tidak ada data siswa ditemukan.
                </div>
              )}
            </div>

            {/* Pagination Section */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1 || loading}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="h-8 px-3">
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages || loading}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="h-8 px-3">
                    Selanjutnya
                  </Button>
                </div>

                <div className="text-sm text-gray-600">
                  Halaman {currentPage} dari {totalPages} ({totalData} total
                  data)
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
