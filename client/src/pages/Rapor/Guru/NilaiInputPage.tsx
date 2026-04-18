import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { getNilaiStatistics, getSiswaForNilai } from "@/services/nilai.service";
import type { NilaiStatistics, SiswaWithNilai } from "@/types/nilai.types";
import {
  CheckCircle2,
  Edit,
  Loader2,
  Plus,
  Users,
  BarChart2,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import MapelKelasSelector from "../components/MapelKelasSelector";
import NilaiInputModal from "../components/NilaiInputModal";
import TahunSemesterSelector from "../components/TahunSemesterSelector";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  color = "default",
}: {
  label: string;
  value?: number | string;
  icon: React.ElementType;
  color?: "default" | "green" | "orange";
}) {
  const colorMap = {
    default: "text-slate-600 bg-slate-100",
    green: "text-emerald-600 bg-emerald-50",
    orange: "text-amber-600 bg-amber-50",
  };

  const valueColorMap = {
    default: "text-slate-800",
    green: "text-emerald-700",
    orange: "text-amber-700",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
      <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${valueColorMap[color]}`}>
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressSection({
  mapelName,
  done,
  total,
}: {
  mapelName: string;
  done: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-slate-700">
          Progress penilaian —{" "}
          <span className="text-slate-500">{mapelName}</span>
        </span>
        <span className="font-semibold text-slate-800">
          {done}{" "}
          <span className="font-normal text-slate-400">/ {total} siswa</span>
        </span>
      </div>

      {/* Bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 text-right">{pct}% selesai</p>
    </div>
  );
}

// ─── Score Badge ──────────────────────────────────────────────────────────────
function ScoreBadge({ nilai }: { nilai?: number | null }) {
  if (nilai == null) return <span className="text-slate-300 text-lg">—</span>;

  const passed = nilai >= 75;
  return (
    <span
      className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-base font-bold border ${
        passed
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-red-50 text-red-600 border-red-200"
      }`}>
      {nilai}
    </span>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
      <AlertCircle className="h-8 w-8" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NilaiInputPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [tahunAjaranId, setTahunAjaranId] = useState("");
  const [semester, setSemester] = useState("");
  const [selectedMapel, setSelectedMapel] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedMapelName, setSelectedMapelName] = useState("");
  const [siswaList, setSiswaList] = useState<SiswaWithNilai[]>([]);
  const [statistics, setStatistics] = useState<NilaiStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<SiswaWithNilai | null>(
    null,
  );

  // Auth guard
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (!isAdmin && user.role !== "GURU") {
      navigate("/dashboard");
      toast.error("Akses ditolak. Halaman ini khusus untuk guru.");
    }
  }, [user, authLoading, isAdmin, navigate]);

  const fetchSiswaList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSiswaForNilai(
        Number(selectedKelas),
        Number(selectedMapel),
        Number(tahunAjaranId),
        semester, // ✅ Pass semester
      );
      setSiswaList(res.data || []);
    } catch {
      toast.error("Gagal memuat data siswa");
    } finally {
      setLoading(false);
    }
  }, [selectedKelas, selectedMapel, tahunAjaranId, semester]);


  const fetchStatistics = useCallback(async () => {
    try {
      const res = await getNilaiStatistics(Number(tahunAjaranId), semester);
      setStatistics(res.data);
    } catch {
      console.error("Gagal memuat statistik");
    }
  }, [tahunAjaranId, semester]);

  useEffect(() => {
    if (selectedMapel && selectedKelas) fetchSiswaList();
  }, [selectedMapel, selectedKelas, fetchSiswaList]);

  useEffect(() => {
    if (tahunAjaranId && semester) fetchStatistics();
  }, [tahunAjaranId, semester, fetchStatistics]);

  const getCurrentNilai = (siswa: SiswaWithNilai) =>
    semester === "1" ? siswa.semester1 : siswa.semester2;

  const handleOpenModal = (siswa: SiswaWithNilai) => {
    setSelectedSiswa(siswa);
    setModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchSiswaList();
    fetchStatistics();
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }
  if (!user) return null;

  const showTable = selectedMapel && selectedKelas;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full px-6 py-8 space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Input Nilai Siswa
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Pilih tahun ajaran, semester, mata pelajaran, dan kelas untuk
              mulai menilai.
            </p>
          </div>

          {showTable && (
            <Button
              onClick={() =>
                navigate(
                  `/guru/nilai-bulk?kelasId=${selectedKelas}&mapelId=${selectedMapel}&tahunId=${tahunAjaranId}&semester=${semester}`,
                )
              }
              className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Input Masal (Bulk)
            </Button>
          )}
        </div>

        {/* ── Step 1 & 2 dalam satu baris ── */}
        <div className="flex flex-col md:flex-row gap-4">
          <section className="flex-1 space-y-2">
            <StepLabel step={1} label="Pilih Tahun Ajaran & Semester" />
            <TahunSemesterSelector
              onSelectionChange={(tahunId, sem) => {
                setTahunAjaranId(tahunId);
                setSemester(sem);
                setSelectedMapel("");
                setSelectedKelas("");
              }}
            />
          </section>

          <section className="flex-1 space-y-2">
            <StepLabel step={2} label="Pilih Mata Pelajaran & Kelas" />
            <MapelKelasSelector
              tahunAjaranId={tahunAjaranId}
              onSelectionChange={(mapelId, kelasId, mapelName) => {
                setSelectedMapel(mapelId);
                setSelectedKelas(kelasId);
                setSelectedMapelName(mapelName);
              }}
              onBulkInput={() => {
                if (selectedMapel && selectedKelas) {
                  navigate(
                    `/guru/nilai-bulk?kelasId=${selectedKelas}&mapelId=${selectedMapel}&tahunId=${tahunAjaranId}&semester=${semester}`,
                  );
                }
              }}
            />
          </section>
        </div>

        {/* ── Stat Cards ── */}
        {statistics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Total Siswa"
              value={statistics.totalSiswa}
              icon={Users}
            />
            <StatCard
              label="Sudah Dinilai"
              value={statistics.siswaWithNilai}
              icon={CheckCircle2}
              color="green"
            />
            <StatCard
              label="Belum Dinilai"
              value={statistics.siswaWithoutNilai}
              icon={AlertCircle}
              color="orange"
            />
            <StatCard
              label="Rata-rata"
              value={statistics.rataRata}
              icon={BarChart2}
            />
          </div>
        )}

        {/* ── Progress ── */}
        {showTable && statistics && (
          <ProgressSection
            mapelName={selectedMapelName}
            done={statistics.siswaWithNilai}
            total={statistics.totalSiswa}
          />
        )}

        {/* ── Step 3: Tabel Siswa ── */}
        {showTable && (
          <section className="space-y-2">
            <StepLabel step={3} label="Input Nilai Per Siswa" />
            <Card className="border-slate-200 shadow-none">
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                ) : siswaList.length === 0 ? (
                  <EmptyState message="Tidak ada siswa ditemukan di kelas ini." />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 border-b border-slate-200">
                        <TableHead className="w-10 text-center text-xs text-slate-500 font-semibold">
                          No
                        </TableHead>
                        <TableHead className="text-xs text-slate-500 font-semibold">
                          Siswa
                        </TableHead>
                        <TableHead className="text-center text-xs text-slate-500 font-semibold">
                          Nilai
                        </TableHead>
                        <TableHead className="text-center text-xs text-slate-500 font-semibold">
                          Status
                        </TableHead>
                        <TableHead className="text-right text-xs text-slate-500 font-semibold">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {siswaList.map((siswa, index) => {
                        const currentNilai = getCurrentNilai(siswa);
                        const sudahDinilai = !!currentNilai;

                        return (
                          <TableRow
                            key={siswa.id_siswa}
                            className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                            {/* No */}
                            <TableCell className="text-center text-sm text-slate-400">
                              {index + 1}
                            </TableCell>

                            {/* Siswa */}
                            <TableCell>
                              <p className="font-medium text-slate-800">
                                {siswa.nama}
                              </p>
                              <p className="text-xs text-slate-400">
                                {siswa.nis}
                              </p>
                            </TableCell>

                            {/* Nilai */}
                            <TableCell className="text-center">
                              <ScoreBadge nilai={currentNilai?.nilai} />
                            </TableCell>

                            {/* Status */}
                            <TableCell className="text-center">
                              {sudahDinilai ? (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border text-xs font-medium shadow-none hover:bg-emerald-50">
                                  Selesai
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-50 text-amber-600 border-amber-200 border text-xs font-medium shadow-none hover:bg-amber-50">
                                  Belum
                                </Badge>
                              )}
                            </TableCell>

                            {/* Aksi */}
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant={sudahDinilai ? "outline" : "default"}
                                onClick={() => handleOpenModal(siswa)}
                                className="text-xs h-8">
                                {sudahDinilai ? (
                                  <>
                                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                                    Edit
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                                    Input
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </section>
        )}
      </div>

      {/* ── Modal ── */}
      {selectedSiswa && (
        <NilaiInputModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={handleModalSuccess}
          siswa={selectedSiswa}
          mapel={{
            id_mapel: Number(selectedMapel),
            namaMapel: selectedMapelName || "Mata Pelajaran",
          }}
          tahunAjaranId={Number(tahunAjaranId)}
          semester={semester}
          existingNilai={getCurrentNilai(selectedSiswa) || undefined}
        />
      )}
    </div>
  );
}

// ─── Step Label ───────────────────────────────────────────────────────────────
function StepLabel({ step, label }: { step: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-white text-xs font-bold">
        {step}
      </span>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </div>
  );
}
