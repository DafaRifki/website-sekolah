import React from "react";
import defaultAvatar from "../../../../assets/avatar.png"; 

// Pastikan Interface Guru sama dengan yang ada di Modal
interface Guru {
  id_guru: number;
  nama: string;
  jabatan?: string;
  noHP?: string;
  fotoProfil?: string;
  user?: { email: string; role: string } | null;
}

interface Props {
  data: Guru[];
  onItemClick: (id: number) => void;
}

// --- LOGIK KONFIGURASI IDENTIK DENGAN MODAL ---
const ENV_URL = import.meta.env.VITE_URL_API || "http://localhost:5000";
const BACKEND_URL = ENV_URL.replace(/\/+$/, "");

const GuruGrid: React.FC<Props> = ({ data, onItemClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
      {data.length > 0 ? (
        data.map((g) => {
          // --- LOGIK PEMANGGILAN GAMBAR IDENTIK DENGAN MODAL ---
          const imageUrl = g.fotoProfil
            ? `${BACKEND_URL}/uploads/guru/${g.fotoProfil}`
            : defaultAvatar;

          return (
            <div
              key={g.id_guru}
              onClick={() => onItemClick(g.id_guru)}
              className="group relative flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100 border border-gray-100">
                  <img
                    src={imageUrl}
                    alt={g.nama}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = defaultAvatar;
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {g.nama}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {g.jabatan || "Guru Pengajar"}
                  </p>
                </div>
              </div>

              {g.noHP && (
                <div className="mt-auto border-t pt-4">
                  <p className="text-xs text-gray-400">Kontak</p>
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {g.noHP}
                  </p>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-gray-500 border-2 border-dashed rounded-xl">
          <p>Tidak ada data guru ditemukan</p>
        </div>
      )}
    </div>
  );
};

export default GuruGrid;