import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  CheckCircle,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Plus,
  Users,
  BookOpen,
  FileDown,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import GenerateRaporModal from "./components/GenerateRaporModal";
import BulkGenerateModal from "./components/BulkGenerateModal";
import apiClient from "@/config/axios";
import { normalizeArray } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

// Interface tetap sama
interface Rapor {
  id_rapor: number;
  siswa: {
    id_siswa: number;
    nis: string;
    nama: string;
  };
  tahunAjaran: {
    namaTahun: string;
  };
  semester: string;
  status: string;
  publishedAt: string | null;
  rataRata: number;
  totalMapel: number;
}

interface TahunAjaran {
  id_tahun: number;
  namaTahun: string;
  semester: number;
  isActive: boolean;
}

interface Kelas {
  id_kelas: number;
  namaKelas: string;
}

export default function RaporPage() {
  const [rapor, setRapor] = useState<Rapor[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [listTahun, setListTahun] = useState<TahunAjaran[]>([]);
  const [listKelas, setListKelas] = useState<Kelas[]>([]);
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<string>("");
  const [selectedKelas, setSelectedKelas] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("1");
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [globalStats, setGlobalStats] = useState<{
    total: number;
    published: number;
    draft: number;
    avgScore?: number;
  } | null>(null);

  const { user, isWaliKelasOf, isPengajarOf } = useAuth();

  // 1. Fetch Master Data (Tahun & Kelas)
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [resTahun, resKelas] = await Promise.all([
          apiClient.get("/tahun-ajaran"),
          apiClient.get("/kelas"),
        ]);

        const dataTahun = normalizeArray<TahunAjaran>(resTahun.data);
        const dataKelasRaw = normalizeArray<Kelas>(resKelas.data);

        console.log("Data Tahun:", dataTahun);
        console.log("Data Kelas Raw:", dataKelasRaw);

        // Filter kelas based on user role
        let dataKelas = dataKelasRaw;
        if (user?.role === "GURU") {
          const allowedKelasIds = new Set([
            ...(user.kelasWali?.map((k: { id_kelas: number }) => k.id_kelas) ||
              []),
            ...(user.kelasAjar?.map((k: { id_kelas: number }) => k.id_kelas) ||
              []),
          ]);

          dataKelas = dataKelasRaw.filter((k) =>
            allowedKelasIds.has(k.id_kelas),
          );
          console.log("Filtered Kelas for Guru:", dataKelas);
        }

        setListTahun(dataTahun);
        setListKelas(dataKelas);

        // Auto-select tahun aktif atau yang pertama
        if (dataTahun.length > 0) {
          const activeYear = dataTahun.find((t: TahunAjaran) => t.isActive);
          setSelectedTahunAjaran(
            activeYear
              ? activeYear.id_tahun.toString()
              : dataTahun[0].id_tahun.toString(),
          );
        }

        if (dataKelas.length > 0) {
          setSelectedKelas(dataKelas[0].id_kelas.toString());
        }
      } catch (error) {
        console.error("Gagal load filter data:", error);
        toast.error("Gagal mengambil data master");
      }
    };
    if (user) {
      fetchMasterData();
    }
  }, [user]);

  // 1.5 Fetch Global Stats for Admin
  useEffect(() => {
    if (user?.role === "ADMIN" && selectedTahunAjaran && !selectedKelas) {
      const fetchGlobalStats = async () => {
        try {
          const response = await apiClient.get("/rapor/statistics", {
            params: { tahunId: selectedTahunAjaran },
          });
          setGlobalStats(response.data.data);
        } catch (error) {
          console.error("Gagal load global stats:", error);
        }
      };
      fetchGlobalStats();
    } else {
      setGlobalStats(null);
    }
  }, [user, selectedTahunAjaran, selectedKelas]);

  // 2. Fetch Data Rapor
  const fetchRaporData = useCallback(async () => {
    // Pastikan filter sudah terpilih sebelum fetch
    if (!selectedTahunAjaran || !selectedKelas || !selectedSemester) return;

    setLoading(true);
    try {
      const response = await apiClient.get("/rapor", {
        params: {
          tahunId: selectedTahunAjaran,
          kelasId: selectedKelas,
          semester: selectedSemester,
        },
      });

      console.log("Raw response dari /rapor:", response.data);
      // Pastikan data adalah array agar tidak error saat .map()
      // const dataRapor = response.data ? response.data.data : [];

      let dataRapor = [];
      if (Array.isArray(response.data)) {
        dataRapor = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        dataRapor = response.data.data;
      } else if (response.data?.rapor && Array.isArray(response.data.rapor)) {
        dataRapor = response.data.rapor;
      }

      console.log("Data yang akan di-set ke state rapor:", dataRapor);

      setRapor(dataRapor);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Gagal memuat data rapor");
      setRapor([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTahunAjaran, selectedKelas, selectedSemester]);

  useEffect(() => {
    fetchRaporData();
  }, [fetchRaporData]);

  // 3. Memoized Statistics (Mencegah perhitungan ulang yang berat & error undefined)
  const stats = useMemo(() => {
    const total = rapor.length;
    const published = rapor.filter((r) => r.status === "PUBLISHED").length;
    const draft = rapor.filter((r) => r.status === "DRAFT").length;
    const totalScore = rapor.reduce(
      (sum, r) => sum + (Number(r.rataRata) || 0),
      0,
    );
    const avgScore = total > 0 ? Math.round((totalScore / total) * 10) / 10 : 0;

    return { total, published, draft, avgScore };
  }, [rapor]);

  const handlePublish = async (id: number) => {
    try {
      await apiClient.patch(`/rapor/${id}/publish`);
      setRapor((prevArray) =>
        prevArray.map((r) =>
          r.id_rapor === id
            ? {
                ...r,
                status: "PUBLISHED",
                publishedAt: new Date().toISOString(),
              }
            : r,
        ),
      );
      toast.success("Rapor berhasil dipublish.");
    } catch {
      toast.error("Gagal publish rapor");
    }
  };

  const handleBulkPublish = async () => {
    if (!selectedTahunAjaran || !selectedKelas || !selectedSemester) return;

    if (
      !confirm(
        "Apakah Anda yakin ingin mempublikasikan SEMUA rapor draf di kelas ini?",
      )
    )
      return;

    try {
      const response = await apiClient.patch("/rapor/bulk-publish", {
        tahunId: selectedTahunAjaran,
        kelasId: selectedKelas,
        semester: selectedSemester,
      });

      toast.success(response.data.message || "Rapor kelas berhasil dipublish.");
      fetchRaporData();
    } catch (error: any) {
      const msg =
        error.response?.data?.message || "Gagal memproses publikasi massal";
      toast.error(msg);
    }
  };

  const handleGenerateSuccess = () => {
    toast.success("Operasi berhasil!");
    fetchRaporData();
  };

  const handleDownload = async (
    raporId: number,
    siswaName: string,
    type: "pdf" | "excel",
  ) => {
    try {
      setDownloading(`${raporId}-${type}`);
      const response = await apiClient.get(`/rapor/${raporId}/export-${type}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const filename = `rapor-${siswaName.replace(/\s+/g, "-")}-${getSelectedYearName().replace(/\//g, "-")}-Semester-${selectedSemester}.${type === "pdf" ? "pdf" : "xlsx"}`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Berhasil mengunduh ${type.toUpperCase()}`);
    } catch (error: any) {
      console.error(`Error downloading ${type}:`, error);
      toast.error(`Gagal mengunduh ${type.toUpperCase()}`);
    } finally {
      setDownloading(null);
    }
  };

  // Helper untuk mencari nama label agar aman (tidak blank putih)
  const getSelectedClassName = () => {
    const found = listKelas.find(
      (k) => k.id_kelas.toString() === selectedKelas,
    );
    return found ? found.namaKelas : "...";
  };

  const getSelectedYearName = () => {
    const found = listTahun.find(
      (t) => t.id_tahun.toString() === selectedTahunAjaran,
    );
    return found ? found.namaTahun : "...";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              E-Rapor Siswa
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Kelola dan generate rapor siswa per semester
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {user?.role === "ADMIN" && selectedKelas && stats.draft > 0 && (
              <Button
                variant="outline"
                onClick={handleBulkPublish}
                className="gap-2 border-green-600 text-green-600 hover:bg-green-50">
                <CheckCircle className="h-4 w-4" /> Publish Semua ({stats.draft}
                )
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setIsBulkModalOpen(true)}
              disabled={!selectedKelas || !selectedTahunAjaran}
              className="gap-2">
              <Users className="h-4 w-4" /> Bulk Generate
            </Button>
            <Button
              onClick={() => setIsGenerateModalOpen(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4" /> Generate Rapor
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-lg">Filter Rapor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tahun Ajaran</label>
                <Select
                  value={selectedTahunAjaran}
                  onValueChange={setSelectedTahunAjaran}>
                  <SelectTrigger className="bg-white dark:bg-slate-800">
                    <SelectValue placeholder="Pilih Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {listTahun.map((t) => (
                      <SelectItem
                        key={t.id_tahun}
                        value={t.id_tahun.toString()}>
                        {t.namaTahun.replace(/\s+/g, " ").trim()} - Semester{" "}
                        {t.semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Kelas</label>
                <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                  <SelectTrigger className="bg-white dark:bg-slate-800">
                    <SelectValue placeholder="Pilih Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {listKelas.map((k) => (
                      <SelectItem
                        key={k.id_kelas}
                        value={k.id_kelas.toString()}>
                        {k.namaKelas}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Semester</label>
                <Select
                  value={selectedSemester}
                  onValueChange={setSelectedSemester}>
                  <SelectTrigger className="bg-white dark:bg-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards - Menggunakan data dari stats yang sudah di-memoize */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title={globalStats ? "Total Rapor (Semua Kelas)" : "Total Rapor"}
            value={globalStats ? globalStats.total : stats.total}
            icon={<FileText className="text-blue-600" />}
            color="text-blue-600"
          />
          <StatCard
            title={globalStats ? "Published (Global)" : "Published"}
            value={globalStats ? globalStats.published : stats.published}
            icon={<CheckCircle className="text-green-600" />}
            color="text-green-600"
          />
          <StatCard
            title={globalStats ? "Draft (Global)" : "Draft"}
            value={globalStats ? globalStats.draft : stats.draft}
            icon={<Clock className="text-amber-600" />}
            color="text-amber-600"
          />
          <StatCard
            title={globalStats ? "Rata-rata Sekolah" : "Rata-rata Kelas"}
            value={globalStats ? globalStats.avgScore || 0 : stats.avgScore}
            icon={<FileText className="text-purple-600" />}
            color="text-purple-600"
          />
        </div>

        {/* Table */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
          <CardHeader>
            <CardTitle>Daftar Rapor</CardTitle>
            <CardDescription>
              {selectedKelas && selectedTahunAjaran
                ? `Rapor Kelas ${getSelectedClassName()} - ${getSelectedYearName()} Semester ${selectedSemester}`
                : "Silakan pilih filter terlebih dahulu"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingState />
            ) : rapor.length === 0 ? (
              <EmptyState onAdd={() => setIsGenerateModalOpen(true)} />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>NIS</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead className="text-center">Rata-rata</TableHead>
                      <TableHead className="text-center">
                        Mata Pelajaran
                      </TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rapor.map((r, idx) => (
                      <TableRow
                        key={r.id_rapor}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <TableCell className="font-medium">{idx + 1}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {r.siswa?.nis || "-"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {r.siswa?.nama || "Tidak Diketahui"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              r.rataRata >= 75 ? "default" : "destructive"
                            }
                            className="font-semibold">
                            {(Number(r.rataRata) || 0).toFixed(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {r.totalMapel} mapel
                        </TableCell>
                        <TableCell className="text-center">
                          {r.status === "PUBLISHED" ? (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" /> Published
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 border-amber-200">
                              <Clock className="h-3 w-3 mr-1" /> Draft
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <ActionButton
                              icon={<Eye className="h-4 w-4" />}
                              to={`/e-rapor/${r.id_rapor}`}
                              tooltip="Lihat Rapor"
                            />
                            {isWaliKelasOf(selectedKelas) && (
                              <ActionButton
                                icon={<Edit className="h-4 w-4" />}
                                to={`/e-rapor/${r.id_rapor}/edit`}
                                tooltip="Input Sikap & Catatan (Wali Kelas)"
                              />
                            )}
                            {isPengajarOf(selectedKelas) && (
                              <ActionButton
                                icon={
                                  <BookOpen className="h-4 w-4 text-indigo-600" />
                                }
                                to={`/guru/nilai?kelasId=${selectedKelas}&siswaId=${r.siswa.id_siswa}`}
                                tooltip="Input Nilai Mapel"
                              />
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={downloading !== null}
                                  className="h-8 w-8 p-0">
                                  {downloading?.startsWith(`${r.id_rapor}-`) ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Download className="h-4 w-4" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDownload(
                                      r.id_rapor,
                                      r.siswa?.nama,
                                      "pdf",
                                    )
                                  }
                                  className="gap-2">
                                  <FileDown className="h-4 w-4" /> Export PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDownload(
                                      r.id_rapor,
                                      r.siswa?.nama,
                                      "excel",
                                    )
                                  }
                                  className="gap-2">
                                  <FileSpreadsheet className="h-4 w-4" /> Export
                                  Excel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            {r.status === "DRAFT" &&
                              isWaliKelasOf(selectedKelas) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePublish(r.id_rapor)}
                                  className="h-8 w-8 p-0 text-green-600"
                                  title="Publish Rapor">
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <GenerateRaporModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onSuccess={handleGenerateSuccess}
        tahunAjaran={listTahun}
        selectedTahunAjaran={selectedTahunAjaran}
        selectedSemester={selectedSemester}
      />

      <BulkGenerateModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={handleGenerateSuccess}
        kelas={listKelas}
        selectedKelas={selectedKelas}
        selectedTahunAjaran={selectedTahunAjaran}
        selectedSemester={selectedSemester}
      />
    </div>
  );
}

// Sub-komponen agar kode bersih dan tidak mudah error
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: string;
}) {
  return (
    <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      <p className="text-sm text-slate-600">Memuat data...</p>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-12">
      <FileText className="h-16 w-16 mx-auto text-slate-300 mb-4" />
      <p className="text-slate-600 font-medium text-lg">
        Belum ada rapor untuk kelas ini
      </p>
      <Button onClick={onAdd} className="mt-6 gap-2">
        <Plus className="h-4 w-4" /> Generate Rapor Sekarang
      </Button>
    </div>
  );
}

function ActionButton({
  icon,
  to,
  tooltip,
}: {
  icon: ReactNode;
  to: string;
  tooltip: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className="h-8 w-8 p-0 hover:bg-slate-100">
      <Link to={to} title={tooltip}>
        {icon}
      </Link>
    </Button>
  );
}
