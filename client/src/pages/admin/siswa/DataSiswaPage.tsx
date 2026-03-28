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
import { Search, UserPlus, Eye, Edit3, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TambahSiswaModal from "./TambahSiswaModal";
import Swal from "sweetalert2";
import Pagination from "./components/Pagination";

interface Siswa {
  id_siswa: number;
  nama: string;
  nis?: string;
  nisn?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  agama?: string;
  jenisKelamin?: string;
  noHP?: string;
  alamat?: string;
  namaAyah?: string;
  pekerjaanAyah?: string;
  namaIbu?: string;
  pekerjaanIbu?: string;
  noTeleponOrtu?: string;
  fotoProfil?: string;
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
  Siswa_Orangtua?: {
    orangtua: {
      nama: string;
      hubungan: string;
      pekerjaan: string;
      alamat: string;
      noHp: string;
    };
  }[];
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
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const fetchSiswa = () => {
    apiClient
      .get("/siswa", {
        params: {
          page: currentPage,
          limit: pageSize,
          search: search,
          kelasId: kelasFilter,
        },
      })
      .then((res) => {
        setSiswa(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSiswa();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [currentPage, search, kelasFilter]);

  useEffect(() => {
    apiClient
      .get("/kelas")
      .then((res) => setKelas(res.data.data.data))
      .catch((err) => console.error(err));
  }, []);

  const currentData = siswa;

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
      fetchSiswa();

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

  const handleViewDetail = async (id: number) => {
    try {
      Swal.fire({
        title: "Memuat data...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await apiClient.get(`/siswa/${id}`);
      
      Swal.close();
      setSelectedSiswa(res.data.data);
    } catch (error: any) {
      console.error(error);
      Swal.fire("Gagal", "Tidak dapat memuat detail data siswa", "error");
    }
  };

  const InfoField = ({ label, value }: { label: string; value: string }) => (
    <div className="space-y-1">
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-900">{value || "-"}</div>
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

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
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

              <Button onClick={() => setIsAddOpenModal(true)} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Tambah Siswa
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
                            onClick={() => handleViewDetail(s.id_siswa)} 
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog
        open={!!selectedSiswa}
        onOpenChange={() => setSelectedSiswa(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b shrink-0">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Detail Siswa
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Informasi lengkap mengenai data siswa
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            {selectedSiswa && (
              <div className="space-y-8">
               {/* Profile Section (Tengah / Centered) */}
                <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm">
                  <div className="w-28 h-28 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-md shrink-0 mb-4 relative group">
                    {selectedSiswa.fotoProfil ? (
                      <img 
                        src={(() => {
                          // 1. Ambil URL murni dari .env kamu (http://localhost:3000)
                          let baseUrl = import.meta.env.VITE_URL_API || "http://localhost:3000";
                          
                          // 2. Bersihkan jika di .env kamu ada tambahan "/api" di belakangnya
                          baseUrl = baseUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
                          
                          // 3. Ambil HANYA nama filenya saja (contoh: 1774664271734-911365222.jpg)
                          const fileName = selectedSiswa.fotoProfil.split('/').pop();
                          
                          // 4. Bentuk URL langsung ke folder uploads/siswa
                          return `${baseUrl}/uploads/siswa/${fileName}?t=${new Date().getTime()}`;
                        })()} 
                        alt={selectedSiswa.nama} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Jika gagal, langsung tampilkan inisial
                          const target = e.currentTarget;
                          target.style.display = 'none'; 
                          const initialFallback = target.nextElementSibling as HTMLElement;
                          if (initialFallback) initialFallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                  </div>
                  
                  {/* Nama dan Info (Rata Tengah) */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                      {selectedSiswa.nama}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {selectedSiswa.kelas?.namaKelas && (
                        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 px-3 py-1 text-sm shadow-sm">
                          Kelas {selectedSiswa.kelas.namaKelas}
                        </Badge>
                      )}
                      <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full border shadow-sm">
                        NIS: {selectedSiswa.nis || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Informasi Pribadi */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-4">
                    Informasi Pribadi
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                    <InfoField label="Nama Lengkap" value={selectedSiswa.nama} />
                    <InfoField label="NIS" value={selectedSiswa.nis || ""} />
                    <InfoField label="NISN" value={selectedSiswa.nisn || ""} />
                    <InfoField label="No. HP Siswa" value={selectedSiswa.noHP || ""} />
                    <InfoField label="Tempat Lahir" value={selectedSiswa.tempatLahir || ""} />
                    <InfoField
                      label="Tanggal Lahir"
                      value={
                        selectedSiswa.tanggalLahir
                          ? new Date(selectedSiswa.tanggalLahir).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : ""
                      }
                    />
                    <InfoField
                      label="Jenis Kelamin"
                      value={
                        selectedSiswa.jenisKelamin === "L" 
                          ? "Laki-laki" 
                          : selectedSiswa.jenisKelamin === "P" 
                            ? "Perempuan" 
                            : selectedSiswa.jenisKelamin || ""
                      }
                    />
                    <InfoField label="Agama" value={selectedSiswa.agama || ""} />
                  </div>
                  <div className="mt-4">
                    <InfoField label="Alamat" value={selectedSiswa.alamat || ""} />
                  </div>
                </div>

                {/* Informasi Akademik */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-4">
                    Informasi Akademik
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField label="Email" value={selectedSiswa.user?.email || ""} />
                    <InfoField label="Kelas" value={selectedSiswa.kelas?.namaKelas || ""} />
                    <InfoField label="Wali Kelas" value={selectedSiswa.kelas?.guru?.nama || ""} />
                  </div>
                </div>

                {/* Data Orang Tua */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-4">
                    Data Orang Tua
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                    <InfoField label="Nama Ayah" value={selectedSiswa.namaAyah || ""} />
                    <InfoField label="Pekerjaan Ayah" value={selectedSiswa.pekerjaanAyah || ""} />
                    <InfoField label="Nama Ibu" value={selectedSiswa.namaIbu || ""} />
                    <InfoField label="Pekerjaan Ibu" value={selectedSiswa.pekerjaanIbu || ""} />
                    <InfoField label="No. Telepon Orang Tua" value={selectedSiswa.noTeleponOrtu || ""} />
                  </div>
                  <div className="mt-4 pt-4 border-t border-dashed">
                    <InfoField 
                      label="Alamat Orang Tua/Wali" 
                      value={selectedSiswa.Siswa_Orangtua?.[0]?.orangtua?.alamat || "-"} 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 shrink-0">
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

      <TambahSiswaModal
        isOpen={isAddOpenModal}
        onClose={() => setIsAddOpenModal(false)}
        onAdded={() => {
          fetchSiswa();
        }}
      />
    </div>
  );
};

export default DataSiswaPage;