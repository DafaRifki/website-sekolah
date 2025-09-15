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
import { Trash2 } from "lucide-react";

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

      onDeleted(idGuru);
      onClose();
    } catch (err: any) {
      Swal.fire("Gagal!", err.response?.data?.message || err.message, "error");
    }
  };

  const InfoField = ({ label, value }: { label: string; value: string }) => (
    <div className="space-y-1">
      <div className="text-sm font-medium text-gray-700">{label}</div>
      <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">
        {value || "-"}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Detail Guru
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Informasi lengkap data guru
          </DialogDescription>
        </DialogHeader>

        {!guru ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-b-blue-600 border-gray-300"></div>
              <span className="text-gray-600">Memuat data...</span>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-6">
            {/* Profile Header */}
            <div className="flex items-start gap-6 pb-6 border-b">
              <img
                src={
                  guru.fotoProfil
                    ? `http://localhost:3000/uploads/${guru.fotoProfil}`
                    : defaultAvatar
                }
                alt={guru.nama}
                className="w-20 h-20 rounded-full border-2 border-gray-200 object-cover"
                onError={(e) => (e.currentTarget.src = defaultAvatar)}
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {guru.nama}
                </h3>
                <div className="flex gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {guru.user?.role || "Guru"}
                  </Badge>
                  {guru.jabatan && (
                    <Badge variant="outline" className="text-xs">
                      {guru.jabatan}
                    </Badge>
                  )}
                </div>
                {guru.waliKelas && guru.waliKelas.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Wali Kelas
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {guru.waliKelas.map((k) => (
                        <Badge
                          key={k.id_kelas}
                          className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {k.namaKelas} ({k.tingkat})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Information Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="Email" value={guru.user?.email || ""} />
              <InfoField label="NIP" value={guru.nip || ""} />
              <InfoField label="No. Handphone" value={guru.noHP || ""} />
              <InfoField
                label="Jenis Kelamin"
                value={guru.jenisKelamin || ""}
              />
              <div className="md:col-span-2">
                <InfoField label="Alamat" value={guru.alamat || ""} />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="gap-2">
            <Trash2 className="w-4 h-4" />
            Hapus
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
