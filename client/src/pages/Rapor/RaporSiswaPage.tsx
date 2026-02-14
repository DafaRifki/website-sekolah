import { useState, useEffect } from "react";
import apiClient from "@/config/axios";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  BookOpen,
  TrendingUp,
  Lock,
  Loader2,
  FileDown,
} from "lucide-react";

interface MapelNilai {
  id_nilai: number;
  namaMapel: string;
  nilai: number;
  nilaiTugas: number | null;
  nilaiUTS: number | null;
  nilaiUAS: number | null;
}

interface RaporDetail {
  id_rapor: number;
  status: string;
  totalHadir: number;
  totalSakit: number;
  totalIzin: number;
  totalAlpha: number;
  sikapSpritual: string | null;
  sikapSosial: string | null;
  naik: boolean | null;
  kelas: string | null;
}

interface TahunAjaran {
  id_tahun: number;
  namaTahun: string;
  isActive: boolean;
  semester: number;
  startDate: string;
  endDate: string;
}

export default function RaporSiswaPage() {
  const { user } = useAuth();
  const [tahunAjaran, setTahunAjaran] = useState<TahunAjaran[]>([]);
  const [selectedTahunId, setSelectedTahunId] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [raporData, setRaporData] = useState<{
    rapor: RaporDetail;
    nilai: Record<string, MapelNilai[]>;
    rataRata: number;
    totalMapel: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRapor, setLoadingRapor] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // ✅ UPDATED: Fetch Tahun Ajaran
  useEffect(() => {
    const fetchTahun = async () => {
      try {
        const { data } = await apiClient.get("/tahun-ajaran", {
          params: { limit: 100 }, // Get all without pagination
        });

        const tahunList: TahunAjaran[] = data.data || [];
        setTahunAjaran(tahunList);

        // ✅ Auto-select active tahun ajaran
        const active = tahunList.find((t) => t.isActive);

        if (active) {
          console.log("📅 Setting active tahun:", active);
          setSelectedTahunId(active.id_tahun.toString());
          setSelectedSemester(active.semester.toString());
        } else if (tahunList.length > 0) {
          // Fallback to first tahun if no active
          console.log("📅 No active tahun, using first:", tahunList[0]);
          setSelectedTahunId(tahunList[0].id_tahun.toString());
          setSelectedSemester(tahunList[0].semester.toString());
        }
      } catch (error) {
        console.error("Failed to fetch tahun ajaran:", error);
        toast.error("Gagal mengambil data tahun ajaran");
      } finally {
        setLoading(false);
      }
    };

    fetchTahun();
  }, []);

  // Fetch Rapor
  useEffect(() => {
    const fetchRapor = async () => {
      if (!selectedTahunId || !selectedSemester) {
        console.warn("⚠️ Missing tahunId or semester, skipping fetch");
        return;
      }

      try {
        setLoadingRapor(true);
        console.log("📊 Fetching rapor:", {
          selectedTahunId,
          selectedSemester,
        });

        const { data } = await apiClient.get("/rapor/siswa/me", {
          params: {
            tahunId: selectedTahunId,
            semester: selectedSemester,
          },
        });

        console.log("📊 Rapor data received:", data);
        setRaporData(data.data);
      } catch (error: any) {
        console.error("Gagal load rapor:", error);

        // Handle 404 gracefully (rapor not found)
        if (error.response?.status === 404) {
          setRaporData(null);
        } else {
          toast.error("Gagal mengambil data rapor");
        }
      } finally {
        setLoadingRapor(false);
      }
    };

    if (selectedTahunId && selectedSemester) {
      fetchRapor();
    }
  }, [selectedTahunId, selectedSemester]);

  const handleDownload = async () => {
    if (!raporData?.rapor) return;
    try {
      setDownloading(true);
      const response = await apiClient.get(
        `/rapor/${raporData.rapor.id_rapor}/export-pdf`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const filename = `rapor-${user?.name?.replace(/\s+/g, "-") || "siswa"}-${currentTahun?.namaTahun.replace(/\//g, "-")}-Semester-${selectedSemester}.pdf`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Berhasil mengunduh rapor PDF");
    } catch (error: any) {
      console.error("Error downloading PDF:", error);
      toast.error("Gagal mengunduh rapor PDF");
    } finally {
      setDownloading(false);
    }
  };

  // Handle tahun ajaran change dengan sinkronisasi semester
  const handleTahunChange = (tahunId: string) => {
    console.log("📅 Tahun changed to:", tahunId);
    setSelectedTahunId(tahunId);

    // ✅ Auto-update semester based on selected tahun
    const selected = tahunAjaran.find((t) => t.id_tahun.toString() === tahunId);
    if (selected) {
      console.log("📅 Auto-setting semester to:", selected.semester);
      setSelectedSemester(selected.semester.toString());
    }
  };

  // Loading States
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-slate-500 animate-pulse">Memuat data rapor...</p>
      </div>
    );
  }

  const rapor = raporData?.rapor;
  const nilai = raporData?.nilai || {};
  const stats = {
    rataRata: raporData?.rataRata || 0,
    totalMapel: raporData?.totalMapel || 0,
  };

  // Get current tahun info for display
  const currentTahun = tahunAjaran.find(
    (t) => t.id_tahun.toString() === selectedTahunId,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Rapor Saya
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {user?.name || "Siswa"} • NIS: {user?.email?.split("@")[0]}
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Tahun Ajaran Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Tahun Ajaran & Semester
                </label>
                <Select
                  value={selectedTahunId}
                  onValueChange={handleTahunChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tahun ajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {tahunAjaran.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        Tidak ada tahun ajaran
                      </div>
                    ) : (
                      tahunAjaran.map((ta) => (
                        <SelectItem
                          key={ta.id_tahun}
                          value={ta.id_tahun.toString()}>
                          {ta.namaTahun} - Semester {ta.semester}
                          {ta.isActive && (
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

              {/* Semester Display (Read-only, auto from tahun) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Periode Aktif</label>
                <div className="flex items-center h-10 px-3 py-2 border border-input rounded-md bg-muted">
                  <span className="text-sm font-medium">
                    {currentTahun
                      ? `${currentTahun.namaTahun} - Semester ${currentTahun.semester}`
                      : "Pilih tahun ajaran"}
                  </span>
                  {currentTahun?.isActive && (
                    <Badge className="ml-auto" variant="outline">
                      Aktif
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Info text */}
            {currentTahun && (
              <p className="text-xs text-muted-foreground mt-2">
                Periode:{" "}
                {new Date(currentTahun.startDate).toLocaleDateString("id-ID")} -{" "}
                {new Date(currentTahun.endDate).toLocaleDateString("id-ID")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Loading state for rapor */}
        {loadingRapor ? (
          <div className="h-64 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-muted-foreground">
              Memuat data rapor...
            </span>
          </div>
        ) : rapor && rapor.status === "PUBLISHED" ? (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">Rata-rata Nilai</p>
                      <p className="text-4xl font-bold mt-2">
                        {stats.rataRata.toFixed(1)}
                      </p>
                    </div>
                    <TrendingUp className="h-12 w-12 text-white/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">Mata Pelajaran</p>
                      <p className="text-4xl font-bold mt-2">
                        {stats.totalMapel}
                      </p>
                    </div>
                    <BookOpen className="h-12 w-12 text-white/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">Total Hadir</p>
                      <p className="text-4xl font-bold mt-2">
                        {rapor.totalHadir}
                      </p>
                    </div>
                    <FileText className="h-12 w-12 text-white/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Download Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="gap-2">
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                Download Rapor PDF
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Sidebar */}
              <div className="space-y-6">
                {/* Kehadiran */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Kehadiran</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Hadir</span>
                      <Badge className="bg-green-100 text-green-800">
                        {rapor.totalHadir}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sakit</span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {rapor.totalSakit}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Izin</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {rapor.totalIzin}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Alpha</span>
                      <Badge className="bg-red-100 text-red-800">
                        {rapor.totalAlpha}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Penilaian Sikap */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Penilaian Sikap</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Spiritual</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {rapor.sikapSpritual || "-"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sosial</span>
                      <Badge className="bg-green-100 text-green-800">
                        {rapor.sikapSosial || "-"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Kenaikan */}
                {rapor.naik !== null && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Kenaikan Kelas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {rapor.naik ? (
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="text-4xl mb-2">🎉</div>
                          <p className="font-semibold text-green-700">
                            Naik Kelas
                          </p>
                          <p className="text-sm text-green-600 mt-1">
                            Ke: {rapor.kelas || "Tingkat Selanjutnya"}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="text-4xl mb-2">📚</div>
                          <p className="font-semibold text-amber-700">
                            Mengulang
                          </p>
                          <p className="text-sm text-amber-600 mt-1">
                            Tetap semangat!
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Main Content - Nilai */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Nilai Mata Pelajaran</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {Object.entries(nilai).map(([kelompok, mapels]) => (
                        <div key={kelompok}>
                          <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">
                            {kelompok}
                          </h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Mata Pelajaran</TableHead>
                                <TableHead className="text-center">
                                  Nilai
                                </TableHead>
                                <TableHead className="text-center">
                                  Predikat
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(mapels as MapelNilai[]).map((m, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium">
                                    {m.namaMapel}
                                  </TableCell>
                                  <TableCell className="text-center font-semibold">
                                    {m.nilai}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge
                                      variant={
                                        m.nilai >= 90
                                          ? "default"
                                          : m.nilai >= 80
                                            ? "secondary"
                                            : m.nilai >= 70
                                              ? "outline"
                                              : "destructive"
                                      }>
                                      {m.nilai >= 90
                                        ? "A"
                                        : m.nilai >= 80
                                          ? "B"
                                          : m.nilai >= 70
                                            ? "C"
                                            : "D"}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : rapor ? (
          // Rapor exists but not published
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Lock className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Rapor Belum Dipublish
                </h3>
                <p className="text-slate-600">
                  Rapor untuk periode ini sudah dibuat tetapi belum dipublish
                  oleh wali kelas.
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Status: <Badge variant="outline">{rapor.status}</Badge>
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Silakan hubungi wali kelas untuk informasi lebih lanjut.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          // No rapor data found
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Data Rapor Tidak Ditemukan
                </h3>
                <p className="text-slate-600">
                  Belum ada data rapor untuk periode yang dipilih.
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Periode: {currentTahun?.namaTahun || "-"} Semester{" "}
                  {selectedSemester || "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
