import { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMapelByGuru } from "@/services/nilai.service";
import { toast } from "sonner";
import { Loader2, BookOpen } from "lucide-react";
import type { MapelKelas } from "@/types/nilai.types";

interface Props {
  tahunAjaranId: string;
  onSelectionChange: (
    mapelId: string,
    kelasId: string,
    mapelName: string,
  ) => void;
  onBulkInput?: () => void;
}

export default function MapelKelasSelector({
  tahunAjaranId,
  onSelectionChange,
}: Props) {
  const [mapelKelasList, setMapelKelasList] = useState<MapelKelas[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMapelKelas, setSelectedMapelKelas] = useState("");

  const fetchMapelKelas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMapelByGuru(Number(tahunAjaranId));
      setMapelKelasList(response.data || []);
    } catch {
      toast.error("Gagal memuat mata pelajaran");
    } finally {
      setLoading(false);
    }
  }, [tahunAjaranId]);

  useEffect(() => {
    if (tahunAjaranId) fetchMapelKelas();
  }, [tahunAjaranId, fetchMapelKelas]);

  const handleSelectionChange = (value: string) => {
    setSelectedMapelKelas(value);
    const [mapelId, kelasId] = value.split("-");
    const selected = mapelKelasList.find(
      (mk) =>
        mk.id_mapel === Number(mapelId) &&
        mk.kelas.id_kelas === Number(kelasId),
    );
    onSelectionChange(mapelId, kelasId, selected?.namaMapel || "");
  };

  // Kelas dari mapel yang dipilih (untuk ditampilkan sebagai chip)
  const selectedItem = mapelKelasList.find(
    (mk) => `${mk.id_mapel}-${mk.kelas.id_kelas}` === selectedMapelKelas,
  );

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex items-center gap-2 h-10 text-sm text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat mata pelajaran...
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Icon */}
      <div className="p-2.5 bg-slate-100 rounded-lg self-start sm:self-center shrink-0">
        <BookOpen className="h-5 w-5 text-slate-600" />
      </div>

      {/* Mapel & Kelas Dropdown */}
      <div className="flex-1 space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Mata Pelajaran & Kelas
        </p>
        <Select
          value={selectedMapelKelas}
          onValueChange={handleSelectionChange}
          disabled={!tahunAjaranId}>
          <SelectTrigger className="h-9 text-sm border-slate-200 bg-slate-50 focus:bg-white">
            <SelectValue
              placeholder={
                tahunAjaranId
                  ? "Pilih mata pelajaran dan kelas"
                  : "Pilih tahun ajaran dulu"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {mapelKelasList.length === 0 ? (
              <div className="p-3 text-sm text-slate-400 text-center">
                Tidak ada mata pelajaran yang diajar
              </div>
            ) : (
              mapelKelasList.map((mk) => (
                <SelectItem
                  key={`${mk.id_mapel}-${mk.kelas.id_kelas}`}
                  value={`${mk.id_mapel}-${mk.kelas.id_kelas}`}>
                  {mk.namaMapel} — {mk.kelas.namaKelas}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Divider */}
      {selectedItem && (
        <div className="hidden sm:block w-px h-10 bg-slate-200" />
      )}

      {/* Kelas chip (read-only) */}
      {selectedItem && (
        <div className="space-y-1 shrink-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Kelas
          </p>
          <div className="h-9 px-3 flex items-center bg-slate-100 rounded-lg border border-slate-200">
            <span className="text-sm font-medium text-slate-700">
              {selectedItem.kelas.namaKelas}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
