import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getSiswaForNilai, inputNilaiBulk } from "@/services/nilai.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import type { SiswaWithNilai } from "@/types/nilai.types";

interface NilaiRow {
  id_siswa: number;
  nis: string;
  nama: string;
  nilaiTugas: string;
  nilaiUTS: string;
  nilaiUAS: string;
  nilaiAkhir: number;
}

export default function NilaiInputBulkPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get params from URL
  const kelasId = searchParams.get("kelasId") || "";
  const mapelId = searchParams.get("mapelId") || "";
  const tahunId = searchParams.get("tahunId") || "1";
  const semester = searchParams.get("semester") || "1";

  const [nilaiData, setNilaiData] = useState<NilaiRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!kelasId || !mapelId) {
      toast.error("Parameter tidak lengkap");
      navigate("/guru/nilai");
      return;
    }

    fetchSiswa();
  }, [kelasId, mapelId, tahunId]);

  const fetchSiswa = async () => {
    setLoading(true);
    try {
      const response = await getSiswaForNilai(
        Number(kelasId),
        Number(mapelId),
        Number(tahunId),
      );
      const siswaList: SiswaWithNilai[] = response.data || [];

      const initialData: NilaiRow[] = siswaList.map((s) => ({
        id_siswa: s.id_siswa,
        nis: s.nis,
        nama: s.nama,
        nilaiTugas: s.nilai?.nilaiTugas?.toString() || "",
        nilaiUTS: s.nilai?.nilaiUTS?.toString() || "",
        nilaiUAS: s.nilai?.nilaiUAS?.toString() || "",
        nilaiAkhir: s.nilai?.nilai || 0,
      }));

      setNilaiData(initialData);
    } catch (error) {
      console.error("Gagal memuat siswa", error);
      toast.error("Gagal memuat data siswa");
    } finally {
      setLoading(false);
    }
  };

  const calculateNilaiAkhir = (
    tugas: string,
    uts: string,
    uas: string,
  ): number => {
    const t = parseFloat(tugas) || 0;
    const u = parseFloat(uts) || 0;
    const a = parseFloat(uas) || 0;

    const final = t * 0.3 + u * 0.3 + a * 0.4;
    return Math.round(final * 10) / 10;
  };

  const handleInputChange = (
    index: number,
    field: "nilaiTugas" | "nilaiUTS" | "nilaiUAS",
    value: string,
  ) => {
    const newData = [...nilaiData];
    newData[index][field] = value;

    // Recalculate nilai akhir
    newData[index].nilaiAkhir = calculateNilaiAkhir(
      newData[index].nilaiTugas,
      newData[index].nilaiUTS,
      newData[index].nilaiUAS,
    );

    setNilaiData(newData);
  };

  const handleSaveAll = async () => {
    // Validate
    const hasEmpty = nilaiData.some(
      (row) => !row.nilaiTugas || !row.nilaiUTS || !row.nilaiUAS,
    );

    if (hasEmpty) {
      toast.error("Semua nilai harus diisi");
      return;
    }

    setSaving(true);
    try {
      const nilaiList = nilaiData.map((row) => ({
        id_siswa: row.id_siswa,
        nilaiTugas: parseFloat(row.nilaiTugas),
        nilaiUTS: parseFloat(row.nilaiUTS),
        nilaiUAS: parseFloat(row.nilaiUAS),
      }));

      const response = await inputNilaiBulk({
        kelasId: Number(kelasId),
        mapelId: Number(mapelId),
        tahunAjaranId: Number(tahunId),
        semester,
        nilaiList,
      });

      toast.success(
        `Berhasil input ${response.data.successCount} nilai, gagal ${response.data.errorCount}`,
      );

      // Back to input page
      setTimeout(() => {
        navigate("/guru/nilai");
      }, 1500);
    } catch (error: any) {
      console.error("Error saving bulk nilai:", error);
      toast.error(error.response?.data?.message || "Gagal menyimpan nilai");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Input Bulk Nilai</h1>
          <p className="text-muted-foreground">
            Input nilai untuk semua siswa sekaligus
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate("/guru/nilai")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Nilai Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>NIS</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead className="text-center">Tugas (30%)</TableHead>
                  <TableHead className="text-center">UTS (30%)</TableHead>
                  <TableHead className="text-center">UAS (40%)</TableHead>
                  <TableHead className="text-center">Nilai Akhir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nilaiData.map((row, index) => (
                  <TableRow key={row.id_siswa}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.nis}</TableCell>
                    <TableCell className="font-medium">{row.nama}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={row.nilaiTugas}
                        onChange={(e) =>
                          handleInputChange(index, "nilaiTugas", e.target.value)
                        }
                        className="w-20 text-center"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={row.nilaiUTS}
                        onChange={(e) =>
                          handleInputChange(index, "nilaiUTS", e.target.value)
                        }
                        className="w-20 text-center"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={row.nilaiUAS}
                        onChange={(e) =>
                          handleInputChange(index, "nilaiUAS", e.target.value)
                        }
                        className="w-20 text-center"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-lg">
                        {row.nilaiAkhir || "-"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveAll} disabled={saving} size="lg">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Semua
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
