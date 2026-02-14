import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  getTahunAjaranAktif,
  getAllTahunAjaran,
} from "@/services/nilai.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// ============================================================================
// TYPES - Sesuai dengan backend Anda
// ============================================================================

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
      // ✅ Get all tahun ajaran
      const allResponse = await getAllTahunAjaran();

      // ✅ Handle pagination response
      const allTahun: TahunAjaran[] = allResponse.data || [];

      console.log("📅 All Tahun Ajaran:", allTahun);

      setTahunAjaranList(allTahun);

      // ✅ Get active tahun ajaran
      try {
        const aktifResponse = await getTahunAjaranAktif();
        const aktif: TahunAjaran | null = aktifResponse.data;

        console.log("📅 Active Tahun Ajaran:", aktif);

        // ✅ Set default to active tahun
        if (aktif) {
          setSelectedTahun(aktif.id_tahun.toString());
          setSelectedSemester(aktif.semester.toString());
          onSelectionChange(
            aktif.id_tahun.toString(),
            aktif.semester.toString(),
          );
        } else if (allTahun.length > 0) {
          // Fallback to first tahun if no active
          setSelectedTahun(allTahun[0].id_tahun.toString());
          setSelectedSemester(allTahun[0].semester.toString());
          onSelectionChange(
            allTahun[0].id_tahun.toString(),
            allTahun[0].semester.toString(),
          );
        }
      } catch (activeError) {
        console.warn("No active tahun ajaran, using first available");

        // If no active, use first available
        if (allTahun.length > 0) {
          setSelectedTahun(allTahun[0].id_tahun.toString());
          setSelectedSemester(allTahun[0].semester.toString());
          onSelectionChange(
            allTahun[0].id_tahun.toString(),
            allTahun[0].semester.toString(),
          );
        }
      }
    } catch (error) {
      console.error("Gagal memuat tahun ajaran", error);
      toast.error("Gagal memuat tahun ajaran");
    } finally {
      setLoading(false);
    }
  };

  const handleTahunChange = (value: string) => {
    setSelectedTahun(value);

    // ✅ Find selected tahun to get its semester
    const selected = tahunAjaranList.find(
      (t) => t.id_tahun.toString() === value,
    );

    if (selected) {
      setSelectedSemester(selected.semester.toString());
      onSelectionChange(value, selected.semester.toString());
    }
  };

  const handleSemesterChange = (value: string) => {
    setSelectedSemester(value);
    if (selectedTahun) {
      onSelectionChange(selectedTahun, value);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">
            Memuat tahun ajaran...
          </span>
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // ✅ GROUP BY namaTahun untuk display yang lebih baik
  // ============================================================================

  // Get unique tahun (namaTahun)
  const uniqueTahun = Array.from(
    new Map(tahunAjaranList.map((t) => [t.namaTahun, t])).values(),
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tahun Ajaran Selector */}
          <div>
            <Label>Tahun Ajaran</Label>
            <Select value={selectedTahun} onValueChange={handleTahunChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tahun ajaran" />
              </SelectTrigger>
              <SelectContent>
                {tahunAjaranList.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    Tidak ada tahun ajaran
                  </div>
                ) : (
                  tahunAjaranList.map((tahun) => (
                    <SelectItem
                      key={tahun.id_tahun}
                      value={tahun.id_tahun.toString()}>
                      {tahun.namaTahun} - Semester {tahun.semester}
                      {tahun.isActive && (
                        <span className="ml-2 text-xs text-green-600 font-semibold">
                          (Aktif)
                        </span>
                      )}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Semester Info (Read-only, auto dari selection) */}
          <div>
            <Label>Semester</Label>
            <div className="flex items-center h-10 px-3 py-2 border border-input rounded-md bg-muted">
              <span className="text-sm">
                Semester {selectedSemester || "-"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Semester otomatis dari tahun ajaran yang dipilih
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
