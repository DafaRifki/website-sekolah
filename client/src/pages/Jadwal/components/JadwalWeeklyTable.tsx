import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus } from "lucide-react";
import type { Jadwal, Hari } from "@/types/jadwal.types";

interface TimeSlot {
  jamMulai: string;
  jamSelesai: string;
}

interface JadwalWeeklyTableProps {
  jadwalList: Jadwal[];
  onEdit?: (jadwal: Jadwal) => void;
  onDelete?: (jadwal: Jadwal) => void;
  onAddJadwal?: (hari: Hari, timeSlot?: TimeSlot) => void;
  readOnly?: boolean;
  showGuru?: boolean;
  showKelas?: boolean;
}

const HARI_LIST: Hari[] = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export default function JadwalWeeklyTable({
  jadwalList,
  onEdit,
  onDelete,
  onAddJadwal,
  readOnly = false,
  showGuru = false,
  showKelas = false,
}: JadwalWeeklyTableProps) {
  // Group jadwal by time slots
  const getTimeSlots = (): TimeSlot[] => {
    const slots = new Set<string>();

    jadwalList.forEach((j) => {
      slots.add(`${j.jamMulai}-${j.jamSelesai}`);
    });

    return Array.from(slots)
      .map((slot) => {
        const [jamMulai, jamSelesai] = slot.split("-");
        return { jamMulai, jamSelesai };
      })
      .sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));
  };

  const timeSlots = getTimeSlots();

  // Get jadwal for specific hari and time slot
  const getJadwalForSlot = (hari: Hari, timeSlot: TimeSlot): Jadwal | null => {
    return (
      jadwalList.find(
        (j) =>
          j.hari === hari &&
          j.jamMulai === timeSlot.jamMulai &&
          j.jamSelesai === timeSlot.jamSelesai,
      ) || null
    );
  };

  // Get color based on kelompok mapel
  const getKelompokColor = (kelompok?: string): string => {
    if (!kelompok) return "bg-gray-100 border-gray-300";

    const kelompokLower = kelompok.toLowerCase();

    const colorMap: Record<string, string> = {
      // Wajib/Umum
      umum: "bg-blue-50 border-blue-200 text-blue-900",
      wajib: "bg-blue-50 border-blue-200 text-blue-900",

      // Peminatan
      peminatan: "bg-green-50 border-green-200 text-green-900",
      "peminatan mipa": "bg-green-50 border-green-200 text-green-900",
      "peminatan ipa": "bg-green-50 border-green-200 text-green-900",
      "peminatan ips": "bg-purple-50 border-purple-200 text-purple-900",

      // Lintas Minat
      "lintas minat": "bg-indigo-50 border-indigo-200 text-indigo-900",

      // Muatan Lokal
      "muatan lokal": "bg-orange-50 border-orange-200 text-orange-900",

      // Pengembangan Diri
      "pengembangan diri": "bg-pink-50 border-pink-200 text-pink-900",
    };

    //Try exact match
    if (colorMap[kelompokLower]) {
      return colorMap[kelompokLower];
    }

    // Try partial match
    for (const [key, value] of Object.entries(colorMap)) {
      if (kelompokLower.includes(key) || key.includes(kelompokLower)) {
        return value;
      }
    }
    return "bg-gray-100 border-gray-300";
  };

  const getKelompokShorthand = (kelompok?: string): string => {
    if (!kelompok) return "";

    const kelompokLower = kelompok.toLowerCase();

    const map: Record<string, string> = {
      umum: "U",
      wajib: "W",
      peminatan: "P",
      "peminatan mipa": "PM",
      "peminatan ipa": "PI",
      "peminatan ips": "PS",
      "lintas minat": "LM",
      "muatan lokal": "ML",
      "pengembangan diri": "PD",
    };

    // Try exact match
    if (map[kelompokLower]) {
      return map[kelompokLower];
    }

    // Try partial match
    for (const [key, value] of Object.entries(map)) {
      if (kelompokLower.includes(key) || key.includes(kelompokLower)) {
        return value;
      }
    }

    return "";
  };

  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="mb-4">Belum ada jadwal untuk periode ini</p>
        {!readOnly && onAddJadwal && (
          <Button onClick={() => onAddJadwal("Senin")}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Jadwal Pertama
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        {/* Header */}
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-3 text-left font-semibold min-w-[100px]">
              Jam
            </th>
            {HARI_LIST.map((hari) => (
              <th
                key={hari}
                className="border border-gray-300 p-3 text-center font-semibold min-w-[150px]">
                {hari}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {timeSlots.map((slot, slotIndex) => (
            <tr key={slotIndex}>
              {/* Time Column */}
              <td className="border border-gray-300 p-3 bg-gray-50 text-sm font-medium">
                {slot.jamMulai}
                <br />-<br />
                {slot.jamSelesai}
              </td>

              {/* Day Columns */}
              {HARI_LIST.map((hari) => {
                const jadwal = getJadwalForSlot(hari, slot);

                return (
                  <td
                    key={hari}
                    className={`border border-gray-300 p-2 ${
                      jadwal
                        ? getKelompokColor(jadwal.guruMapel.mapel.kelompokMapel)
                        : "bg-white hover:bg-gray-50"
                    }`}>
                    {jadwal ? (
                      <div className="space-y-1">
                        {/* Mapel */}
                        <div className="flex items-start justify-between gap-1">
                          <p className="font-bold text-sm leading-tight">
                            {jadwal.guruMapel.mapel.namaMapel}
                          </p>
                          {jadwal.guruMapel.mapel.kelompokMapel && (
                            <span className="text-[10px] font-black px-1 rounded bg-white/50 border border-black/5 opacity-70">
                              {getKelompokShorthand(
                                jadwal.guruMapel.mapel.kelompokMapel,
                              )}
                            </span>
                          )}
                        </div>

                        {/* Guru (conditional) */}
                        {showGuru && (
                          <p className="text-xs text-muted-foreground">
                            {jadwal.guruMapel.guru.nama}
                          </p>
                        )}

                        {/* Kelas (conditional) */}
                        {showKelas && (
                          <Badge variant="outline" className="text-xs">
                            {jadwal.guruMapel.kelas.namaKelas}
                          </Badge>
                        )}

                        {/* Ruangan */}
                        {jadwal.ruangan && (
                          <p className="text-xs text-muted-foreground">
                            📍 {jadwal.ruangan}
                          </p>
                        )}

                        {/* Actions */}
                        {!readOnly && (onEdit || onDelete) && (
                          <div className="flex gap-1 mt-2">
                            {onEdit && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onEdit(jadwal)}
                                className="h-6 px-2 text-xs">
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onDelete(jadwal)}
                                className="h-6 px-2 text-xs">
                                <Trash2 className="h-3 w-3 mr-1" />
                                Hapus
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Empty slot - show add button
                      !readOnly &&
                      onAddJadwal && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onAddJadwal(hari, slot)}
                          className="w-full h-full min-h-[60px] text-muted-foreground hover:bg-blue-50">
                          <Plus className="h-4 w-4 mr-1" />
                          Tambah
                        </Button>
                      )
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded-sm"></div>
          <span>Wajib/Umum</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 border border-green-300 rounded-sm"></div>
          <span>Peminatan MIPA/IPA</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-50 border border-purple-300 rounded-sm"></div>
          <span>Peminatan IPS</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-indigo-50 border border-indigo-300 rounded-sm"></div>
          <span>Lintas Minat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-50 border border-orange-300 rounded-sm"></div>
          <span>Muatan Lokal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-pink-50 border border-pink-300 rounded-sm"></div>
          <span>Pengembangan Diri</span>
        </div>
      </div>
    </div>
  );
}
