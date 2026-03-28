import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, User as UserIcon } from "lucide-react";
import defaultAvatar from "../../../../assets/avatar.png"; 
import type { Guru } from "./DetailGuruModal"; 

interface GuruCardProps {
  guru: Guru;
  onClick: (id: number) => void;
}

export default function GuruCard({ guru, onClick }: GuruCardProps) {
  
  // 1. Ambil base URL dari ENV (biasanya http://localhost:3000)
  const baseEnv = import.meta.env.VITE_URL_API || "http://localhost:3000";

  /**
   * 2. LOGIC FIX PORT: 
   * Jika baseEnv mengandung port 3000 (frontend), kita ganti ke 5000 (backend).
   * Kita juga hapus '/' di akhir (trailing slash) agar URL tidak double slash.
   */
  const imageBaseUrl = baseEnv.replace(":3000", ":5000").replace(/\/+$/, "");

  // 3. Bentuk URL Gambar Lengkap
  const imageUrl = guru.fotoProfil
    ? `${imageBaseUrl}/uploads/guru/${guru.fotoProfil}`
    : defaultAvatar;

  return (
    <Card 
      onClick={() => onClick(guru.id_guru)}
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500 overflow-hidden"
    >
      <CardContent className="p-4 flex items-center space-x-4">
        {/* FOTO PROFIL */}
        <div className="flex-shrink-0">
          <img
            src={imageUrl}
            alt={guru.nama}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 bg-gray-50 shadow-sm"
            onError={(e) => {
              // Jika port 5000 tetap tidak ditemukan, balik ke default avatar
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
               <Badge 
                 variant={guru.user.role === 'ADMIN' ? 'destructive' : 'secondary'} 
                 className="text-[10px] px-1.5 h-5"
               >
                 {guru.user.role}
               </Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-500 truncate mb-1">
            {guru.jabatan || "Guru Pengajar"}
          </p>

          <div className="flex items-center text-xs text-gray-400 gap-3">
             {guru.noHP ? (
                <div className="flex-shrink-0 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span className="truncate">{guru.noHP}</span>
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