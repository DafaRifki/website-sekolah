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
import { Trash2, Pencil } from "lucide-react";

// Interfaces
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
  // PERUBAHAN 1: Terima full object, bukan cuma ID
  guruData: Guru | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (id: number) => void;
  onEdit: (guru: Guru) => void;
}

export default function DetailGuruModal({
  guruData, // <--- Ganti idGuru jadi guruData
  isOpen,
  onClose,
  onDeleted,
  onEdit
}: Props) {
  // Inisialisasi state dengan data dari props
  const [guru, setGuru] = useState<Guru | null>(guruData);
  
  // Loading sebenarnya tidak diperlukan lagi karena data instan, 
  // tapi kita biarkan false default-nya.
  const [loading, setLoading] = useState(false);

  // PERUBAHAN 2: Ganti Logic Fetch dengan Sync Props
  // Kita tidak lagi mengambil data dari API detail (/guru/:id) 
  // karena API tersebut mengembalikan data user/email yang kosong.
  useEffect(() => {
    setGuru(guruData);
  }, [guruData]);

  const handleDelete = async () => {
    // PERUBAHAN 3: Ambil ID dari object guru
    if (!guru?.id_guru) return; 

    const result = await Swal.fire({
      title: "Yakin hapus?",
      text: `Data guru ${guru.nama} akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await apiClient.delete(`/guru/${guru.id_guru}`);
      
      onClose(); 
      // Panggil callback parent dengan ID yang dihapus
      onDeleted(guru.id_guru); 

      Swal.fire({
        title: "Terhapus!",
        text: "Data guru berhasil dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
      
    } catch (err: any) {
      Swal.fire("Gagal!", err.response?.data?.message || "Terjadi kesalahan saat menghapus.", "error");
    }
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Detail Guru
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Informasi lengkap data guru
          </DialogDescription>
        </DialogHeader>

        {/* Cek loading atau data null */}
        {loading || !guru ? (
          <div className="flex flex-col items-center justify-center py-12">
            {/* Jika guruData null, tampilkan pesan kosong atau loading */}
            <div className="text-gray-500 text-sm">Tidak ada data dipilih.</div>
          </div>
        ) : (
          <div className="py-4 space-y-6">
              {/* Profile Header */}
             <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b">
               <img
                 src={guru.fotoProfil ? `http://localhost:3000/uploads/${guru.fotoProfil}` : defaultAvatar}
                 alt={guru.nama}
                 className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-gray-100"
                 onError={(e) => (e.currentTarget.src = defaultAvatar)}
               />
               <div className="flex-1 text-center sm:text-left space-y-2">
                 <h3 className="text-2xl font-bold text-gray-900">{guru.nama}</h3>
                 <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                   <Badge variant="secondary" className="px-3 py-1">{guru.user?.role || "Guru"}</Badge>
                   {guru.jabatan && <Badge variant="outline" className="px-3 py-1 border-blue-200 text-blue-700 bg-blue-50">{guru.jabatan}</Badge>}
                 </div>
                 
                 {/* Tampilkan Wali Kelas jika ada datanya */}
                 {guru.waliKelas && guru.waliKelas.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                        <span className="font-semibold">Wali Kelas: </span>
                        {guru.waliKelas.map(k => `${k.namaKelas} (${k.tingkat})`).join(", ")}
                    </div>
                 )}
               </div>
             </div>

             {/* Info Fields */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
               <InfoField label="NIP" value={guru.nip || ""} />
               
               {/* Karena data dari parent lengkap, email harusnya muncul sekarang */}
               <InfoField label="Email" value={guru.user?.email || ""} />
               
               <InfoField label="No. Handphone" value={guru.noHP || ""} />
               <InfoField label="Jenis Kelamin" value={guru.jenisKelamin || ""} />
               <div className="md:col-span-2">
                 <InfoField label="Alamat" value={guru.alamat || ""} />
               </div>
             </div>
          </div>
        )}

        <div className="flex justify-between sm:justify-end gap-3 pt-4 border-t bg-white sticky bottom-0">
           <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
                Tutup
            </Button>
            
            {guru && (
                <>
                    <Button 
                        variant="secondary" 
                        onClick={() => onEdit(guru)} 
                        className="flex-1 sm:flex-none gap-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                        <Pencil className="w-4 h-4" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        className="flex-1 sm:flex-none gap-2">
                        <Trash2 className="w-4 h-4" />
                        Hapus
                    </Button>
                </>
            )}
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}