import React from "react";
//import GuruCard from "./GuruCard"; 
interface Guru {
  id_guru: number;
  nama: string;
  jabatan?: string;
  noHP?: string;
  fotoProfil?: string;
  user?: { email: string; role: string } | null; // Tambahkan | null
}
interface Props {
  data: Guru[];
  onItemClick: (id: number) => void; // <--- Props wajib untuk trigger Modal
}

const GuruGrid: React.FC<Props> = ({ data, onItemClick }) => {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
      {data.length > 0 ? (
        data.map((g) => (
          <div
            key={g.id_guru}
            onClick={() => onItemClick(g.id_guru)} // Panggil fungsi dari Parent
            className="group relative flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            {/* Tampilan Card Guru Langsung di sini (Lebih Aman) */}
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100">
                {g.fotoProfil ? (
                  <img
                    src={g.fotoProfil}
                    alt={g.nama}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-gray-400">
                    {g.nama.charAt(0)}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {g.nama}
                </h3>
                <p className="text-sm text-gray-500">
                  {g.jabatan || "Guru Pengajar"}
                </p>
              </div>
            </div>

            {g.noHP && (
              <div className="mt-auto border-t pt-4">
                <p className="text-xs text-gray-400">Kontak</p>
                <p className="text-sm font-medium text-gray-700">{g.noHP}</p>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-gray-500 border-2 border-dashed rounded-xl">
          <p>Tidak ada data guru ditemukan</p>
        </div>
      )}
    </div>
  );
};

export default GuruGrid;