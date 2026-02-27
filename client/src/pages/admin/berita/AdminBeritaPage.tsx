import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/config/axios";
import { Search, Plus, Edit3, Trash2, Newspaper } from "lucide-react";
import Swal from "sweetalert2";
import BeritaModal from "./BeritaModal";

const AdminBeritaPage: React.FC = () => {
  const [berita, setBerita] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBerita, setSelectedBerita] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBerita = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/berita");
      setBerita(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBerita();
  }, []);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus berita?",
      text: "Anda tidak dapat mengembalikan berita ini setelah dihapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await apiClient.delete(`/berita/${id}`);
      fetchBerita();
      Swal.fire("Berhasil!", "Berita telah dihapus.", "success");
    } catch (error: any) {
      Swal.fire("Gagal!", error.response?.data?.message || "Gagal menghapus berita", "error");
    }
  };

  const filteredBerita = berita.filter((b) =>
    b.judul.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="border-b bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Newspaper className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Pengelolaan Berita</CardTitle>
                <p className="text-sm text-slate-500">Kelola informasi dan pengumuman sekolah</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Cari berita..."
                  className="pl-9 w-full md:w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button onClick={() => { setSelectedBerita(null); setIsModalOpen(true); }} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4" />
                Tambah Berita
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-16 text-center">No</TableHead>
                <TableHead className="w-24">Gambar</TableHead>
                <TableHead>Judul & Tanggal</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Penulis</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                    Memuat data berita...
                  </TableCell>
                </TableRow>
              ) : filteredBerita.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                    Belum ada berita yang diterbitkan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBerita.map((b, idx) => (
                  <TableRow key={b.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                    <TableCell>
                      {b.gambar ? (
                        <img
                          src={`${import.meta.env.VITE_URL_API || "http://localhost:3000"}${b.gambar}`}
                          alt={b.judul}
                          className="w-16 h-12 object-cover rounded-md border"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-slate-100 rounded-md border flex items-center justify-center text-[10px] text-slate-400">
                          No Image
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900 line-clamp-1">{b.judul}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(b.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {b.kategori}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">{b.penulis}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedBerita(b); setIsModalOpen(true); }}
                          className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(b.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BeritaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchBerita()}
        editData={selectedBerita}
      />
    </div>
  );
};

export default AdminBeritaPage;
