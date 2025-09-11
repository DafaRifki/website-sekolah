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
import { Search, UserPlus } from "lucide-react";
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

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Hapus kelas ini?",
      text: "Data kelas yang dihapus tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      await apiClient.delete(`/kelas/${id}`);
      // console.log("widih mau dihapus");

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

  // daftar nama kelas unik untuk dropdown
  const uniqueNamaKelas = Array.from(new Set(kelas.map((k) => k.namaKelas)));

  // filter logic
  const filteredKelas = kelas.filter((k) => {
    const bySearch = k.namaKelas
      .toLowerCase()
      .includes(searchNamaKelas.toLowerCase());

    const bySelect = selectedFilter === "all" || k.namaKelas === selectedFilter;

    return bySearch && bySelect;
  });

  useEffect(() => {
    fetchKelas();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <Card className="shadow-md rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Judul kiri */}
          <CardTitle className="text-xl">Daftar Kelas</CardTitle>

          {/* Kontrol kanan */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
            {/* Input Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari nama kelas..."
                value={searchNamaKelas}
                onChange={(e) => setSearchNamaKelas(e.target.value)}
                className="w-full md:w-[250px] pl-9"
              />
            </div>

            {/* Dropdown Select */}
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {uniqueNamaKelas.map((nama) => (
                  <SelectItem key={nama} value={nama}>
                    {nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tombol tambah data kelas */}
            <Button
              onClick={() => setIsTambahOpen(true)}
              className="w-full md:w-auto">
              <UserPlus className="w-5 h-5 mr-1" /> Tambah Kelas
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama Kelas</TableHead>
                <TableHead>Tingkat</TableHead>
                <TableHead>Wali Kelas</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKelas.length > 0 ? (
                filteredKelas.map((k, idx) => (
                  <TableRow key={k.id_kelas}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{k.namaKelas}</TableCell>
                    <TableCell>{k.tingkat}</TableCell>
                    <TableCell>{k.guru?.nama || "-"}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDetail(k)}>
                        Detail
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleEdit(k)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(k.id_kelas)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    Tidak ada data kelas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
