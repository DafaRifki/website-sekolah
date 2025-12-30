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
import { Trash2, Pencil, X } from "lucide-react";

// --- INTERFACES ---
export interface User {
  email: string;
  role: string;
}

export interface WaliKelas {
  id_kelas: number;
  namaKelas: string;
  tingkat: string;
}

export interface Guru {
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
  guruData: Guru | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (id: number) => void;
  onEdit: (guru: Guru) => void;
}

// [PERBAIKAN 1] Definisikan URL Backend yang benar (Port 5000)
const BACKEND_URL = import.meta.env.VITE_URL_API || "http://localhost:5000";

export default function DetailGuruModal({
  guruData,
  isOpen,
  onClose,
  onDeleted,
  onEdit
}: Props) {
  const [guru, setGuru] = useState<Guru | null>(guruData);

  useEffect(() => {
    setGuru(guruData);
  }, [guruData]);

  const handleDelete = () => {
    const targetId = guru?.id_guru;
    const targetNama = guru?.nama;

    if (!targetId) return;

    onClose();

    setTimeout(async () => {
        const result = await Swal.fire({
            title: "Yakin hapus?",
            text: `Data guru ${targetNama} akan dihapus permanen.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
            try {
                Swal.fire({
                    title: "Menghapus...",
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading(),
                });

                await apiClient.delete(`/guru/${targetId}`);
                
                Swal.close();
                onDeleted(targetId); 

                Swal.fire({
                    title: "Terhapus!",
                    text: "Data guru berhasil dihapus.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
                
            } catch (err: any) {
                Swal.close();
                Swal.fire({
                    title: "Gagal!",
                    text: err.response?.data?.message || "Terjadi kesalahan saat menghapus.",
                    icon: "error"
                });
            }
        }
    }, 200);
  };

  const InfoField = ({ label, value }: { label: string; value: string }) => (
    <div className="space-y-1">
      <div className="text-sm font-medium text-gray-700">{label}</div>
      <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200 min-h-[40px] flex items-center">
        {value || "-"}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col max-w-3xl h-[90vh] p-0 overflow-hidden bg-white gap-0 outline-none border-0 z-50">
        
        {/* HEADER */}
        <DialogHeader className="flex-none px-6 py-4 border-b flex flex-row items-center justify-between space-y-0 bg-white z-20">
          <div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
                Detail Guru
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
                Informasi lengkap data guru
            </DialogDescription>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer z-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </DialogHeader>

        {/* CONTENT */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 bg-white relative z-10">
            {!guru ? (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="text-gray-500 text-sm">Tidak ada data dipilih.</div>
            </div>
            ) : (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b">
                  
                  {/* [PERBAIKAN 2] Gunakan BACKEND_URL, bukan localhost:3000 */}
                  <img
                      src={guru.fotoProfil ? `${BACKEND_URL}/uploads/guru/${guru.fotoProfil}` : defaultAvatar}
                      alt={guru.nama}
                      className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-gray-100 flex-shrink-0"
                      onError={(e) => (e.currentTarget.src = defaultAvatar)}
                  />

                  <div className="flex-1 text-center sm:text-left space-y-2">
                      <h3 className="text-2xl font-bold text-gray-900">{guru.nama}</h3>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      <Badge variant="secondary" className="px-3 py-1">{guru.user?.role || "Guru"}</Badge>
                      {guru.jabatan && <Badge variant="outline" className="px-3 py-1 border-blue-200 text-blue-700 bg-blue-50">{guru.jabatan}</Badge>}
                      </div>
                      
                      {guru.waliKelas && guru.waliKelas.length > 0 && (
                          <div className="mt-2 text-sm text-gray-600">
                              <span className="font-semibold">Wali Kelas: </span>
                              {guru.waliKelas.map(k => `${k.namaKelas} (${k.tingkat})`).join(", ")}
                          </div>
                      )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <InfoField label="NIP" value={guru.nip || ""} />
                  <InfoField label="Email" value={guru.user?.email || ""} />
                  <InfoField label="No. Handphone" value={guru.noHP || ""} />
                  <InfoField 
                      label="Jenis Kelamin" 
                      value={guru.jenisKelamin === "L" ? "Laki-laki" : guru.jenisKelamin === "P" ? "Perempuan" : guru.jenisKelamin || ""} 
                  />
                  <div className="md:col-span-2">
                      <InfoField label="Alamat" value={guru.alamat || ""} />
                  </div>
                </div>
                <div className="h-4"></div>
            </div>
            )}
        </div>

        {/* FOOTER */}
        <div className="flex-none px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="cursor-pointer relative z-50"
            >
                Tutup
           </Button>
            
           {guru && (
                <>
                    <Button 
                        type="button"
                        variant="secondary" 
                        onClick={() => onEdit(guru)}
                        className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 gap-2 cursor-pointer relative z-50">
                        <Pencil className="w-4 h-4" />
                        Edit
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        className="gap-2 cursor-pointer relative z-50 hover:bg-red-600">
                        <Trash2 className="w-4 h-4" />
                        Hapus
                    </Button>
                </>
           )}
        </div>

      </DialogContent>
    </Dialog>
  );
}