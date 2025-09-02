import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import apiClient from "@/config/axios";
import { Mail, Phone, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import defaultAvatar from "../../../assets/avatar.png";

interface User {
  email: string;
  role: string;
}

interface Guru {
  id_guru: number;
  nama: string;
  jabatan?: string;
  noHP?: string;
  fotoProfil?: string;
  user?: User | null;
}

export default function DataGuruPage() {
  const [guru, setGuru] = useState<Guru[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchGuru = async () => {
      try {
        const res = await apiClient.get("/guru");
        setGuru(res.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchGuru();
  }, []);

  // filter
  const filteredGuru = guru.filter((g) =>
    g.nama.toLowerCase().includes(search.toLowerCase())
  );

  // pagination logic
  const totalPages = Math.ceil(filteredGuru.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGuru = filteredGuru.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="p-6">
      <h2 className="mb-3 text-2xl font-semibold">Data Guru</h2>

      {/* Header (search & tambah data) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <Input
          placeholder="Cari data guru..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // reset ke halaman 1 saat search berubah
          }}
          className="w-full sm:w-64"
        />

        <Button
          variant="default"
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => console.log("Tambah data guru diklik")}>
          <UserPlus className="mr-2 w-4 h-4" /> Tambah Guru
        </Button>
      </div>

      {/* Grid Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedGuru.length > 0 ? (
          paginatedGuru.map((g) => (
            <Card key={g.id_guru} className="shadow-md rounded-2xl">
              <CardHeader className="flex flex-col items-center">
                <img
                  src={
                    g.fotoProfil
                      ? `http://localhost:5000${g.fotoProfil}`
                      : defaultAvatar
                  }
                  alt={g.nama}
                  onError={(e) => (e.currentTarget.src = defaultAvatar)}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                />
                <CardTitle className="mt-3 text-lg font-semibold">
                  {g.nama}
                </CardTitle>
                <Badge
                  variant={
                    g.user?.role === "ADMIN" ? "destructive" : "secondary"
                  }
                  className="mt-2">
                  {g.user?.role || "GURU"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-4 h-4" /> {g.user?.email || "-"}
                </p>
                <p className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4" /> {g.noHP || "-"}
                </p>
                <p className="text-gray-700">Jabatan: {g.jabatan || "-"}</p>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">
                    Detail
                  </Button>
                  <Button variant="default" size="sm">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            Tidak ada data guru ditemukan
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                  }}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              {totalPages > 5 && <PaginationEllipsis />}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
