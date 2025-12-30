import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, User as UserIcon } from "lucide-react";
import defaultAvatar from "../../../../assets/avatar.png"; 
import type { Guru } from "./DetailGuruModal"; 

interface GuruCardProps {
  guru: Guru;
  onClick: (id: number) => void;
}

// --- KONFIGURASI URL BACKEND ---
// 1. Tambahkan Fallback: Jika VITE_URL_API kosong/undefined, pakai localhost:5000
const ENV_URL = import.meta.env.VITE_URL_API || "http://localhost:5000";

// 2. Bersihkan Trailing Slash: Hapus tanda '/' di akhir jika ada, biar tidak double (//)
const BACKEND_URL = ENV_URL.replace(/\/+$/, "");

export default function GuruCard({ guru, onClick }: GuruCardProps) {
  
  // Logika URL Gambar
  const imageUrl = guru.fotoProfil
    // URL Final: http://localhost:5000/uploads/guru/namafile.jpg
    ? `${BACKEND_URL}/uploads/guru/${guru.fotoProfil}`
    : defaultAvatar;

  return (
    <Card 
      onClick={() => onClick(guru.id_guru)}
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500"
    >
      <CardContent className="p-4 flex items-center space-x-4">
        {/* FOTO PROFIL */}
        <div className="flex-shrink-0">
          <img
            src={imageUrl}
            alt={guru.nama}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 bg-gray-50"
            onError={(e) => {
              // Jika gambar gagal dimuat, ganti ke avatar default
              e.currentTarget.src = defaultAvatar;
            }}
          />
        </div>

        {/* INFORMASI GURU */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-semibold text-gray-900 truncate pr-2">
              {guru.nama}
            </h3>
            {guru.user?.role && (
               <Badge variant={guru.user.role === 'ADMIN' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 h-5">
                 {guru.user.role}
               </Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-500 truncate mb-2">
            {guru.jabatan || "Guru Pengajar"}
          </p>

          <div className="flex items-center text-xs text-gray-400 gap-3">
             {guru.noHP ? (
                <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{guru.noHP}</span>
                </div>
             ) : (
                <div className="flex items-center gap-1">
                    <UserIcon className="w-3 h-3" />
                    <span>-</span>
                </div>
             )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}