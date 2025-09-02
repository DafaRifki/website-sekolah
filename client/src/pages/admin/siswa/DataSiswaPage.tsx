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
import { UserPlus } from "lucide-react";
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
    namaKelas: string;
  };
}

const DataSiswaPage: React.FC = () => {
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [isAddOpenModal, setIsAddOpenModal] = useState(false);

  useEffect(() => {
    apiClient
      .get("/siswa")
      .then((res) => setSiswa(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  const filteredSiswa = siswa.filter((s) =>
    s.nama.toLowerCase().includes(search.toLowerCase())
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
            <Input
              placeholder="Cari data siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64"
            />
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
                {filteredSiswa.map((s, idx) => (
                  <TableRow key={s.id_siswa ?? idx}>
                    <TableCell>{idx + 1}</TableCell>
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

              <div className="flex flex-col sm:col-span-2">
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
