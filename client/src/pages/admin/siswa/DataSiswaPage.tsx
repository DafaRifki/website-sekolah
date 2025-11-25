import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/config/axios";
import {
  Search,
  UserPlus,
  Eye,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TambahSiswaModal from "./TambahSiswaModal";
import Swal from "sweetalert2";

interface Siswa {
  id_siswa: number;
  nama: string;
  nis?: string;
  alamat?: string;
  tanggalLahir?: string;
  jenisKelamin?: string;
  user?: {
    email: string;
  };
  kelas?: {
    id_kelas: number;
    namaKelas: string;
    guru?: {
      nama: string;
    };
  };
}

interface Kelas {
  id_kelas: number;
  namaKelas: string;
}

const DataSiswaPage: React.FC = () => {
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [search, setSearch] = useState("");
  const [kelasFilter, setKelasFilter] = useState<string>("all");
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [isAddOpenModal, setIsAddOpenModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    apiClient
      .get("/siswa")
      .then((res) => setSiswa(res.data.data))
      .catch((err) => console.error(err));
    apiClient
      .get("/kelas")
      .then((res) => setKelas(res.data.data.data))
      .catch((err) => console.error(err));
  }, []);

  const filteredSiswa = siswa.filter((s) => {
    const matchesSearch = s.nama.toLowerCase().includes(search.toLowerCase());
    const matchesKelas =
      kelasFilter === "all" || s.kelas?.id_kelas === parseInt(kelasFilter);
    return matchesSearch && matchesKelas;
  });

  const totalPages = Math.ceil(filteredSiswa.length / pageSize);
  const currentData = filteredSiswa.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Yakin hapus?",
      text: "Data siswa yang dihapus tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Menghapus...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await apiClient.delete(`/siswa/${id}`, { withCredentials: true });
      setSiswa((prev) => prev.filter((s) => s.id_siswa !== id));

      Swal.fire("Berhasil!", "Data siswa berhasil dihapus.", "success");
    } catch (error: any) {
      console.error(error);
      Swal.fire(
        "Gagal!",
        error.response?.data?.message || "Gagal menghapus data siswa",
        "error"
      );
    }
  };

  const InfoField = ({ label, value }: { label: string; value: string }) => (
    <div className="space-y-1">
      <div className="text-sm font-medium text-gray-700">{label}</div>
      <div className="text-sm text-gray-900">{value || "-"}</div>
    </div>
  );

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="border-b bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Data Siswa
            </CardTitle>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari nama siswa..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-64 pl-9"
                />
              </div>

              {/* Filter */}
              <Select
                value={kelasFilter}
                onValueChange={(value) => {
                  setKelasFilter(value);
                  setCurrentPage(1);
                }}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {kelas.map((k) => (
                    <SelectItem key={k.id_kelas} value={k.id_kelas.toString()}>
                      {k.namaKelas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Add Button */}
              <Button onClick={() => setIsAddOpenModal(true)} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Tambah Siswa
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-16 text-center">No</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Kelas</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500">
                      {search || kelasFilter !== "all"
                        ? "Tidak ada data yang sesuai dengan filter"
                        : "Belum ada data siswa"}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((s, idx) => (
                    <TableRow key={s.id_siswa} className="hover:bg-gray-50">
                      <TableCell className="text-center font-medium">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">{s.nama}</TableCell>
                      <TableCell className="hidden md:table-cell text-gray-600">
                        {s.user?.email || "-"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {s.kelas?.namaKelas ? (
                          <Badge variant="secondary" className="text-xs">
                            {s.kelas.namaKelas}
                          </Badge>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSiswa(s)}
                            className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Link to={`/siswa/${s.id_siswa}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(s.id_siswa)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
              <div className="text-sm text-gray-700">
                Menampilkan {(currentPage - 1) * pageSize + 1} -{" "}
                {Math.min(currentPage * pageSize, filteredSiswa.length)} dari{" "}
                {filteredSiswa.length} data
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="gap-1">
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={
                          pageNumber === currentPage ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className="w-8 h-8 p-0">
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="gap-1">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog
        open={!!selectedSiswa}
        onOpenChange={() => setSelectedSiswa(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Detail Siswa
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Informasi lengkap mengenai data siswa
            </DialogDescription>
          </DialogHeader>

          {selectedSiswa && (
            <div className="py-6">
              {/* Profile Section */}
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-semibold text-blue-600">
                    {selectedSiswa.nama.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedSiswa.nama}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedSiswa.kelas?.namaKelas && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedSiswa.kelas.namaKelas}
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">
                      NIS: {selectedSiswa.nis || "Tidak ada"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Information Sections */}
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-4">
                    Informasi Pribadi
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField
                      label="Nama Lengkap"
                      value={selectedSiswa.nama}
                    />
                    <InfoField label="NIS" value={selectedSiswa.nis || ""} />
                    <InfoField
                      label="Jenis Kelamin"
                      value={selectedSiswa.jenisKelamin || ""}
                    />
                    <InfoField
                      label="Tanggal Lahir"
                      value={
                        selectedSiswa.tanggalLahir
                          ? new Date(
                              selectedSiswa.tanggalLahir
                            ).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : ""
                      }
                    />
                  </div>
                  <div className="mt-4">
                    <InfoField
                      label="Alamat"
                      value={selectedSiswa.alamat || ""}
                    />
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-4">
                    Informasi Akademik
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField
                      label="Email"
                      value={selectedSiswa.user?.email || ""}
                    />
                    <InfoField
                      label="Kelas"
                      value={selectedSiswa.kelas?.namaKelas || ""}
                    />
                    <InfoField
                      label="Wali Kelas"
                      value={selectedSiswa.kelas?.guru?.nama || ""}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setSelectedSiswa(null)}>
              Tutup
            </Button>
            {selectedSiswa && (
              <Link to={`/siswa/${selectedSiswa.id_siswa}/edit`}>
                <Button className="gap-2">
                  <Edit3 className="w-4 h-4" />
                  Edit Data
                </Button>
              </Link>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Modal */}
      <TambahSiswaModal
        isOpen={isAddOpenModal}
        onClose={() => setIsAddOpenModal(false)}
        onAdded={() => {
          apiClient.get("/siswa").then((res) => setSiswa(res.data.data));
        }}
      />
    </div>
  );
};

export default DataSiswaPage;
