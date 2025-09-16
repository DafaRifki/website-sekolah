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
  const perPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get("/siswa").then((res) => setSiswaList(res.data.data));
  }, []);

  // Filter
  const filtered = siswaList.filter((s) =>
    s.nama.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filtered.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const paginated = filtered.slice(startIndex, startIndex + perPage);

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
                siswaList={paginated}
                onDetail={(id) => navigate(`/buku-induk/${id}`)}
              />
            </div>

            {/* Pagination Section */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="h-8 px-3">
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="h-8 px-3">
                    Selanjutnya
                  </Button>
                </div>

                <div className="text-sm text-gray-600">
                  Halaman {currentPage} dari {totalPages} ({filtered.length}{" "}
                  total data)
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
