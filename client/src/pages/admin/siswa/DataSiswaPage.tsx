import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
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
import apiClient from "@/config/axios";
import { Check, ChevronsUpDown, Search, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TambahSiswaModal from "./TambahSiswaModal";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

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
  const [kelasFilter, setKelasFilter] = useState<number | null>(null);
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
      .then((res) => setKelas(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  const filteredSiswa = siswa.filter((s) => {
    const matchesSearch = s.nama.toLowerCase().includes(search.toLowerCase());
    const matchesKelas = kelasFilter ? s.kelas?.id_kelas === kelasFilter : true;
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
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Menghapus...",
        text: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await apiClient.delete(`/siswa/${id}`, { withCredentials: true });
      setSiswa((prev) => prev.filter((s) => s.id_siswa !== id));

      Swal.fire({
        title: "Terhapus!",
        text: "Data siswa berhasil dihapus.",
        icon: "success",
        timer: 2000,
        showCancelButton: false,
      });
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        title: "Gagal!",
        text: error.response?.data?.message || "Gagal menghapus data siswa",
        icon: "error",
      });
    }
  };

  return (
    <div className="p-6">
      <Card className="shadow-md">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl">Data Siswa</CardTitle>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari data siswa..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1); // reset page saat search
                }}
                className="w-full sm:w-64 pl-9"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="checkbox"
                  className={cn(
                    "w-full sm:w-48 justify-between",
                    !kelasFilter && "text-muted-foreground"
                  )}>
                  {kelasFilter
                    ? kelas.find((k) => k.id_kelas === kelasFilter)?.namaKelas
                    : "Filter Kelas"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0">
                <Command>
                  <CommandInput placeholder="Cari kelas..." />
                  <CommandEmpty>Tidak ada kelas</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setKelasFilter(null);
                        setCurrentPage(1);
                      }}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !kelasFilter ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Semua Kelas
                    </CommandItem>
                    {kelas.map((k) => (
                      <CommandItem
                        key={k.id_kelas}
                        onSelect={() => {
                          setKelasFilter(k.id_kelas);
                          setCurrentPage(1);
                        }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            kelasFilter === k.id_kelas
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {k.namaKelas}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            <Button
              variant="default"
              className="w-full sm:w-auto"
              onClick={() => setIsAddOpenModal(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah Siswa
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">No</TableHead>
                  <TableHead className="whitespace-nowrap">
                    Nama Siswa
                  </TableHead>
                  <TableHead className="whitespace-nowrap hidden sm:table-cell">
                    Email
                  </TableHead>
                  <TableHead className="whitespace-nowrap hidden sm:table-cell">
                    Kelas
                  </TableHead>
                  <TableHead className="whitespace-nowrap">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((s, idx) => (
                  <TableRow key={s.id_siswa ?? idx}>
                    <TableCell>
                      {(currentPage - 1) * pageSize + idx + 1}
                    </TableCell>
                    <TableCell>{s.nama}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {s.user?.email}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {s.kelas?.namaKelas}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSiswa(s)}>
                          Detail
                        </Button>
                        <Link to={`/siswa/${s.id_siswa}/edit`}>
                          <Button variant="secondary" size="sm">
                            Edit
                          </Button>
                        </Link>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(s.id_siswa)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-4">
              <Button
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}>
                Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    size="sm"
                    variant={page === currentPage ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}>
                    {page}
                  </Button>
                )
              )}
              <Button
                size="sm"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((prev) => prev + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal detail siswa */}
      <Dialog
        open={!!selectedSiswa}
        onOpenChange={() => setSelectedSiswa(null)}>
        <DialogOverlay className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
        <DialogContent className="bg-white/95 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl max-w-2xl w-full">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-lg font-semibold">
              Detail Siswa
            </DialogTitle>
            <DialogDescription>
              Informasi lengkap mengenai siswa ditampilkan di sini.
            </DialogDescription>
          </DialogHeader>

          {selectedSiswa && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Nama Siswa</span>
                <span className="font-medium text-gray-900">
                  {selectedSiswa.nama}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-gray-500">NIS</span>
                <span className="font-medium text-gray-900">
                  {selectedSiswa.nis ?? "-"}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Email</span>
                <span className="font-medium text-gray-900">
                  {selectedSiswa.user?.email}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Kelas</span>
                <span className="font-medium text-gray-900">
                  {selectedSiswa.kelas?.namaKelas ?? "-"}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Alamat</span>
                <span className="font-medium text-gray-900">
                  {selectedSiswa.alamat ?? "-"}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Tanggal Lahir</span>
                <span className="font-medium text-gray-900">
                  {selectedSiswa.tanggalLahir
                    ? new Date(selectedSiswa.tanggalLahir).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )
                    : "-"}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Wali Kelas</span>
                <span className="font-medium text-gray-900">
                  {selectedSiswa.kelas?.guru?.nama ?? "-"}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Jenis Kelamin</span>
                <span className="font-medium text-gray-900">
                  {selectedSiswa.jenisKelamin ?? "-"}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal tambah data siswa */}
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
