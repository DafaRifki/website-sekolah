import { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { getMapelByGuru } from "@/services/nilai.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { MapelKelas } from "@/types/nilai.types";

interface Props {
  tahunAjaranId: string;
  onSelectionChange: (mapelId: string, kelasId: string, mapelName: string) => void;
  onBulkInput?: () => void;
}

export default function MapelKelasSelector({
  tahunAjaranId,
  onSelectionChange,
  onBulkInput,
}: Props) {
  const [mapelKelasList, setMapelKelasList] = useState<MapelKelas[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMapelKelas, setSelectedMapelKelas] = useState("");

  const fetchMapelKelas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMapelByGuru(Number(tahunAjaranId));
      const data = response.data || [];
      setMapelKelasList(data);
    } catch (error) {
      console.error("Gagal memuat mapel", error);
      toast.error("Gagal memuat mata pelajaran");
    } finally {
      setLoading(false);
    }
  }, [tahunAjaranId]);

  useEffect(() => {
    if (tahunAjaranId) {
      fetchMapelKelas();
    }
  }, [tahunAjaranId, fetchMapelKelas]);

  const handleSelectionChange = (value: string) => {
    setSelectedMapelKelas(value);
    const [mapelId, kelasId] = value.split("-");
    const selected = mapelKelasList.find(
      (mk) => mk.id_mapel === Number(mapelId) && mk.kelas.id_kelas === Number(kelasId)
    );
    onSelectionChange(mapelId, kelasId, selected?.namaMapel || "");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">
            Memuat mata pelajaran...
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <Label>Pilih Mata Pelajaran & Kelas</Label>
            <Select
              value={selectedMapelKelas}
              onValueChange={handleSelectionChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih mata pelajaran dan kelas" />
              </SelectTrigger>
              <SelectContent>
                {mapelKelasList.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    Tidak ada mata pelajaran yang diajar
                  </div>
                ) : (
                  mapelKelasList.map((mk) => (
                    <SelectItem
                      key={`${mk.id_mapel}-${mk.kelas.id_kelas}`}
                      value={`${mk.id_mapel}-${mk.kelas.id_kelas}`}>
                      {mk.namaMapel} - {mk.kelas.namaKelas}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            {onBulkInput && (
              <Button
                variant="outline"
                onClick={onBulkInput}
                disabled={!selectedMapelKelas}>
                Input Bulk
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
