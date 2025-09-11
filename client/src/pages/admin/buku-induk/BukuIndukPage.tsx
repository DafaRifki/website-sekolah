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
    <Card className="p-4 shadow-lg rounded-2xl">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-xl font-bold">Buku Induk Siswa</CardTitle>
      </CardHeader>
      <CardContent>
        <SiswaSearch search={search} setSearch={setSearch} />

        <SiswaTable
          siswaList={paginated}
          onDetail={(id) => navigate(`/buku-induk/${id}`)}
        />

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}>
            Prev
          </Button>
          <span>
            Halaman {currentPage} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
