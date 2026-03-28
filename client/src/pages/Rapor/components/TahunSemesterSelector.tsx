import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getTahunAjaranAktif,
  getAllTahunAjaran,
} from "@/services/nilai.service";
import { toast } from "sonner";
import { Loader2, CalendarDays } from "lucide-react";

interface TahunAjaran {
  id_tahun: number;
  namaTahun: string;
  semester: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

interface Props {
  onSelectionChange: (tahunId: string, semester: string) => void;
}

export default function TahunSemesterSelector({ onSelectionChange }: Props) {
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTahun, setSelectedTahun] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  useEffect(() => {
    fetchTahunAjaran();
  }, []);

  const fetchTahunAjaran = async () => {
    setLoading(true);
    try {
      const allResponse = await getAllTahunAjaran();
      const allTahun: TahunAjaran[] = allResponse.data || [];
      setTahunAjaranList(allTahun);

      try {
        const aktifResponse = await getTahunAjaranAktif();
        const aktif: TahunAjaran | null = aktifResponse.data;

        if (aktif) {
          setSelectedTahun(aktif.id_tahun.toString());
          setSelectedSemester(aktif.semester.toString());
          onSelectionChange(
            aktif.id_tahun.toString(),
            aktif.semester.toString(),
          );
        } else if (allTahun.length > 0) {
          setSelectedTahun(allTahun[0].id_tahun.toString());
          setSelectedSemester(allTahun[0].semester.toString());
          onSelectionChange(
            allTahun[0].id_tahun.toString(),
            allTahun[0].semester.toString(),
          );
        }
      } catch {
        if (allTahun.length > 0) {
          setSelectedTahun(allTahun[0].id_tahun.toString());
          setSelectedSemester(allTahun[0].semester.toString());
          onSelectionChange(
            allTahun[0].id_tahun.toString(),
            allTahun[0].semester.toString(),
          );
        }
      }
    } catch {
      toast.error("Gagal memuat tahun ajaran");
    } finally {
      setLoading(false);
    }
  };

  const handleTahunChange = (value: string) => {
    setSelectedTahun(value);
    const selected = tahunAjaranList.find(
      (t) => t.id_tahun.toString() === value,
    );
    if (selected) {
      setSelectedSemester(selected.semester.toString());
      onSelectionChange(value, selected.semester.toString());
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex items-center gap-2 h-10 text-sm text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat tahun ajaran...
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Icon */}
      <div className="p-2.5 bg-slate-100 rounded-lg self-start sm:self-center shrink-0">
        <CalendarDays className="h-5 w-5 text-slate-600" />
      </div>

      {/* Tahun Ajaran */}
      <div className="flex-1 space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Tahun Ajaran
        </p>
        <Select value={selectedTahun} onValueChange={handleTahunChange}>
          <SelectTrigger className="h-9 text-sm border-slate-200 bg-slate-50 focus:bg-white">
            <SelectValue placeholder="Pilih tahun ajaran" />
          </SelectTrigger>
          <SelectContent>
            {tahunAjaranList.length === 0 ? (
              <div className="p-3 text-sm text-slate-400 text-center">
                Tidak ada data
              </div>
            ) : (
              tahunAjaranList.map((tahun) => (
                <SelectItem
                  key={tahun.id_tahun}
                  value={tahun.id_tahun.toString()}>
                  <span>
                    {tahun.namaTahun} — Sem {tahun.semester}
                  </span>
                  {tahun.isActive && (
                    <span className="ml-2 text-xs text-emerald-600 font-semibold">
                      Aktif
                    </span>
                  )}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-10 bg-slate-200" />

      {/* Semester (read-only) */}
      <div className="space-y-1 shrink-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Semester
        </p>
        <div className="h-9 px-3 flex items-center bg-slate-100 rounded-lg border border-slate-200">
          <span className="text-sm font-medium text-slate-700">
            {selectedSemester ? `Semester ${selectedSemester}` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
