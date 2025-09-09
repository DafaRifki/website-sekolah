import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import apiClient from "@/config/axios";
import defaultAvatar from "../../../../assets/avatar.png";
import Swal from "sweetalert2";

interface User {
  email: string;
  role: string;
}

interface WaliKelas {
  id_kelas: number;
  namaKelas: string;
  tingkat: string;
}

interface Guru {
  id_guru: number;
  nama: string;
  nip?: string;
  noHP?: string;
  jenisKelamin?: string;
  alamat?: string;
  jabatan?: string;
  fotoProfil?: string;
  user?: User | null;
  waliKelas?: WaliKelas[];
}

interface Props {
  idGuru: number | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (id: number) => void;
}

export default function GuruDetailModal({
  idGuru,
  isOpen,
  onClose,
  onDeleted,
}: Props) {
  const [guru, setGuru] = useState<Guru | null>(null);

  useEffect(() => {
    if (!idGuru) return;
    const fetchGuru = async () => {
      try {
        const res = await apiClient.get(`/guru/${idGuru}`);
        setGuru(res.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchGuru();
  }, [idGuru]);

  const handleDelete = async () => {
    if (!idGuru) return;

    const confirm = await Swal.fire({
      title: "Yakin hapus?",
      text: `Guru ${guru?.nama || ""} akan dihapus permanen`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      await apiClient.delete(`/guru/${idGuru}`);
      Swal.fire("Berhasil!", "Data guru berhasil dihapus.", "success");

      onDeleted(idGuru); // 🔥 trigger ke parent (GuruGrid)
      onClose(); // 🔥 tutup modal
    } catch (err: any) {
      Swal.fire("Gagal!", err.response?.data?.message || err.message, "error");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail Guru</DialogTitle>
          <DialogDescription>Informasi lengkap tentang guru.</DialogDescription>
        </DialogHeader>

        {!guru ? (
          <p className="text-center py-4">Memuat data guru...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            {/* Foto profil */}
            <div className="flex flex-col items-center">
              <img
                src={
                  guru.fotoProfil
                    ? `http://localhost:3000/uploads/${guru.fotoProfil}`
                    : defaultAvatar
                }
                alt={guru.nama}
                className="w-28 h-28 rounded-full border object-cover"
                onError={(e) => (e.currentTarget.src = defaultAvatar)}
              />
              <p className="mt-2 font-semibold">{guru.nama}</p>
              <p className="text-sm text-gray-500">{guru.jabatan || "-"}</p>
            </div>

            {/* Info detail */}
            <div className="md:col-span-2 space-y-2 text-sm">
              <p>
                <strong>Email:</strong> {guru.user?.email || "-"}
              </p>
              <p>
                <strong>Role:</strong> {guru.user?.role || "-"}
              </p>
              <p>
                <strong>NIP:</strong> {guru.nip || "-"}
              </p>
              <p>
                <strong>No HP:</strong> {guru.noHP || "-"}
              </p>
              <p>
                <strong>Jenis Kelamin:</strong> {guru.jenisKelamin || "-"}
              </p>
              <p>
                <strong>Alamat:</strong> {guru.alamat || "-"}
              </p>
              <p>
                <strong>Jabatan:</strong> {guru.jabatan || "-"}
              </p>

              {/* Wali kelas */}
              <div>
                <strong>Wali Kelas:</strong>{" "}
                {guru.waliKelas && guru.waliKelas.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {guru.waliKelas.map((k) => (
                      <Badge key={k.id_kelas} variant="secondary">
                        {k.namaKelas} ({k.tingkat})
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500">Bukan wali kelas</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Hapus Guru
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
