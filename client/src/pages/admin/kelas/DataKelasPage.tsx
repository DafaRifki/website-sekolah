import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import apiClient from "@/config/axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import DetailKelasModal from "./components/DetailKelasModal";
import {
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Users,
  GraduationCap,
} from "lucide-react";
import TambahKelasModal from "./components/TambahKelasModal";
import EditKelasModal from "./components/EditKelasModal";

interface Guru {
  id_guru: number;
  nama: string;
  nip: string;
  email: string;
  noHP?: string;
}

interface Siswa {
  id_siswa: number;
  nama: string;
  nis: string;
  jenisKelamin?: string;
  alamat?: string;
}

interface Kelas {
  id_kelas: number;
  namaKelas: string;
  tingkat: string;
  guru?: Guru | null;
  siswa?: Siswa[];
  _count?: { siswa: number };
}

export default function DataKelasPage() {
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<Kelas | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isTambahOpen, setIsTambahOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [kelasEdit, setKelasEdit] = useState<Kelas | null>(null);

  // filter states
  const [searchNamaKelas, setSearchNamaKelas] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const fetchKelas = async () => {
    try {
      const res = await apiClient.get("/kelas");
      setKelas(res.data.data);
    } catch (error: any) {
      console.error("Gagal fetch kelas: ", error.message);
    }
  };

  const handleDetail = (kelasData: Kelas) => {
    setSelectedKelas(kelasData);
    setIsDetailOpen(true);
  };

  const handleEdit = (kelasData: Kelas) => {
    setKelasEdit(kelasData);
    setIsEditOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedKelas(null);
  };

  const handleDelete = async (id: number, namaKelas: string) => {
    const confirm = await Swal.fire({
      title: "Hapus kelas ini?",
      text: `Kelas "${namaKelas}" akan dihapus permanen!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!confirm.isConfirmed) return;

    try {
      Swal.fire({
        title: "Menghapus...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await apiClient.delete(`/kelas/${id}`);
      Swal.fire("Berhasil!", "Kelas berhasil dihapus.", "success");
      fetchKelas();
    } catch (error: any) {
      Swal.fire(
        "Gagal!",
        error.response?.data?.message || error.message,
        "error"
      );
    }
  };

  // daftar tingkat untuk dropdown filter
  const uniqueTingkat = Array.from(new Set(kelas.map((k) => k.tingkat)));

  // filter logic
  const filteredKelas = kelas.filter((k) => {
    const bySearch = k.namaKelas
      .toLowerCase()
      .includes(searchNamaKelas.toLowerCase());

    const bySelect = selectedFilter === "all" || k.tingkat === selectedFilter;

    return bySearch && bySelect;
  });

  useEffect(() => {
    fetchKelas();
  }, []);

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="border-b bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6" />
              Data Kelas
            </CardTitle>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari nama kelas..."
                  value={searchNamaKelas}
                  onChange={(e) => setSearchNamaKelas(e.target.value)}
                  className="w-full sm:w-64 pl-9"
                />
              </div>

              {/* Filter by Tingkat */}
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter Tingkat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tingkat</SelectItem>
                  {uniqueTingkat.map((tingkat) => (
                    <SelectItem key={tingkat} value={tingkat}>
                      Tingkat {tingkat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Add Button */}
              <Button onClick={() => setIsTambahOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Tambah Kelas
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-16 text-center">No</TableHead>
                  <TableHead>Nama Kelas</TableHead>
                  <TableHead className="text-center">Tingkat</TableHead>
                  <TableHead>Wali Kelas</TableHead>
                  <TableHead className="text-center">Jumlah Siswa</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKelas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-500">
                      {searchNamaKelas || selectedFilter !== "all"
                        ? "Tidak ada data yang sesuai dengan filter"
                        : "Belum ada data kelas"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredKelas.map((k, idx) => (
                    <TableRow key={k.id_kelas} className="hover:bg-gray-50">
                      <TableCell className="text-center font-medium">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {k.namaKelas}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs">
                          Tingkat {k.tingkat}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {k.guru ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600">
                                {k.guru.nama.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                {k.guru.nama}
                              </div>
                              <div className="text-xs text-gray-500">
                                {k.guru.nip}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">
                            Belum ditentukan
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">
                            {k._count?.siswa || k.siswa?.length || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDetail(k)}
                            className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(k)}
                            className="h-8 w-8 p-0">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDelete(k.id_kelas, k.namaKelas)
                            }
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
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <DetailKelasModal
        kelas={selectedKelas}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />

      {/* Tambah Data Modal */}
      <TambahKelasModal
        isOpen={isTambahOpen}
        onClose={() => setIsTambahOpen(false)}
        onSuccess={fetchKelas}
      />

      {/* Edit Data Modal */}
      <EditKelasModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={fetchKelas}
        kelas={kelasEdit}
      />
    </div>
  );
}
