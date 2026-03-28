import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Edit,
  CheckCircle,
  User,
  Calendar,
  BookOpen,
  TrendingUp,
  Loader2,
  Heart,
  Star,
  Trophy,
  ShieldCheck,
  FileDown,
  FileSpreadsheet,
  XCircle,
} from "lucide-react";
import apiClient from "@/config/axios";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getPredikat(nilai: number) {
  if (nilai >= 90) return "A";
  if (nilai >= 80) return "B";
  if (nilai >= 70) return "C";
  return "D";
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionTitle({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-slate-500" />
      <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
        {label}
      </h2>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">
        {value || "—"}
      </span>
    </div>
  );
}

function AttendanceRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{value ?? 0}</span>
    </div>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl p-4 ${className}`}>
      {children}
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <p className="text-sm text-slate-400 italic text-center py-4">{text}</p>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RaporDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/rapor/${id}`);
        setData(response.data.data);
      } catch (error: any) {
        toast.error(
          `Gagal memuat rapor: ${error.response?.data?.message || "Error"}`,
        );
        navigate("/e-rapor");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id, navigate]);

  const handleDownload = async (type: "pdf" | "excel") => {
    try {
      setDownloading(type);
      const response = await apiClient.get(`/rapor/${id}/export-${type}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `rapor-${data.rapor.siswa.nama.replace(/\s+/g, "-")}-${data.rapor.tahunAjaran.namaTahun.replace(/\//g, "-")}-${data.rapor.semester}.${type === "pdf" ? "pdf" : "xlsx"}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Berhasil mengunduh ${type.toUpperCase()}`);
    } catch {
      toast.error(`Gagal mengunduh ${type.toUpperCase()}`);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen gap-3 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-sm">Memuat data rapor...</span>
      </div>
    );
  }

  if (!data) return null;

  const { rapor, nilai, rataRata } = data;
  const isGuru = user?.role !== "SISWA";
  const totalAbsensi =
    (rapor.totalSakit || 0) + (rapor.totalIzin || 0) + (rapor.totalAlpha || 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full px-6 py-8 space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Detail Rapor</h1>
              <p className="text-sm text-slate-500">
                {rapor.siswa?.nama} · {rapor.tahunAjaran?.namaTahun} Semester{" "}
                {rapor.semester}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status */}
            {rapor.status === "PUBLISHED" ? (
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none">
                <CheckCircle className="h-3 w-3 mr-1" /> Published
              </Badge>
            ) : (
              <Badge className="bg-amber-50 text-amber-700 border border-amber-200 shadow-none">
                Draft
              </Badge>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload("pdf")}
              disabled={downloading !== null}>
              {downloading === "pdf" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4 mr-1.5" />
              )}
              PDF
            </Button>

            {isGuru && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload("excel")}
                disabled={downloading !== null}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                {downloading === "excel" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 mr-1.5" />
                )}
                Excel
              </Button>
            )}

            {isGuru && (
              <Button size="sm" asChild>
                <Link to={`/e-rapor/${id}/edit`}>
                  <Edit className="h-4 w-4 mr-1.5" /> Edit
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left: Info Siswa + Kehadiran */}
          <div className="space-y-4">
            {/* Info Siswa */}
            <Panel>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    {rapor.siswa?.nama}
                  </p>
                  <p className="text-xs text-slate-400">
                    NIS: {rapor.siswa?.nis}
                  </p>
                </div>
              </div>
              <InfoRow label="Kelas" value={rapor.siswa?.kelas?.namaKelas} />
              <InfoRow
                label="Jenis Kelamin"
                value={
                  rapor.siswa?.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"
                }
              />
              <InfoRow
                label="Tahun Ajaran"
                value={rapor.tahunAjaran?.namaTahun}
              />
              <InfoRow
                label="Wali Kelas"
                value={rapor.siswa?.kelas?.guru?.nama}
              />
            </Panel>

            {/* Kehadiran */}
            <Panel>
              <SectionTitle icon={Calendar} label="Kehadiran" />
              <AttendanceRow
                label="Hadir"
                value={rapor.totalHadir}
                color="text-emerald-600"
              />
              <AttendanceRow
                label="Sakit"
                value={rapor.totalSakit}
                color="text-amber-600"
              />
              <AttendanceRow
                label="Izin"
                value={rapor.totalIzin}
                color="text-blue-600"
              />
              <AttendanceRow
                label="Alpha"
                value={rapor.totalAlpha}
                color="text-red-600"
              />
              <div className="flex items-center justify-between pt-3 mt-1">
                <span className="text-sm font-semibold text-slate-700">
                  Total Absensi
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {totalAbsensi} Hari
                </span>
              </div>
            </Panel>
          </div>

          {/* Right: Nilai + Sikap + Catatan */}
          <div className="lg:col-span-2 space-y-4">
            {/* Rata-rata */}
            <Panel className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                  Nilai Rata-rata
                </p>
                <p className="text-5xl font-black text-slate-900 mt-1 tabular-nums">
                  {rataRata}
                </p>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl">
                <TrendingUp className="h-7 w-7 text-slate-500" />
              </div>
            </Panel>

            {/* Nilai Mata Pelajaran */}
            <Panel>
              <SectionTitle icon={BookOpen} label="Nilai Mata Pelajaran" />
              <div className="space-y-6">
                {Object.entries(nilai).map(
                  ([kelompok, mapels]: [string, any]) => (
                    <div key={kelompok}>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        {kelompok}
                      </p>
                      <div className="rounded-lg border border-slate-200 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50">
                              <TableHead className="text-xs">
                                Mata Pelajaran
                              </TableHead>
                              <TableHead className="text-center text-xs">
                                Tugas
                              </TableHead>
                              <TableHead className="text-center text-xs">
                                UTS
                              </TableHead>
                              <TableHead className="text-center text-xs">
                                UAS
                              </TableHead>
                              <TableHead className="text-center text-xs">
                                Akhir
                              </TableHead>
                              <TableHead className="text-center text-xs">
                                Predikat
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mapels.map((m: any) => (
                              <TableRow
                                key={m.id_nilai}
                                className="hover:bg-slate-50">
                                <TableCell className="font-medium text-sm">
                                  {m.namaMapel}
                                </TableCell>
                                <TableCell className="text-center text-sm text-slate-500">
                                  {m.nilaiTugas ?? "—"}
                                </TableCell>
                                <TableCell className="text-center text-sm text-slate-500">
                                  {m.nilaiUTS ?? "—"}
                                </TableCell>
                                <TableCell className="text-center text-sm text-slate-500">
                                  {m.nilaiUAS ?? "—"}
                                </TableCell>
                                <TableCell className="text-center text-sm font-bold text-slate-800">
                                  {m.nilai}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge
                                    className={`text-xs shadow-none border ${
                                      m.nilai >= 75
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-red-50 text-red-600 border-red-200"
                                    }`}>
                                    {getPredikat(m.nilai)}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </Panel>

            {/* Sikap & Karakter */}
            <Panel>
              <SectionTitle icon={ShieldCheck} label="Sikap & Karakter" />
              <div className="grid sm:grid-cols-2 gap-3">
                {/* Spiritual */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-semibold text-slate-700">
                        Spiritual
                      </span>
                    </div>
                    <Badge className="bg-slate-100 text-slate-700 border border-slate-200 shadow-none">
                      {rapor.sikapSpritual || "—"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 italic leading-relaxed">
                    {rapor.deskripsiSpritual || "Belum ada deskripsi."}
                  </p>
                </div>

                {/* Sosial */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-semibold text-slate-700">
                        Sosial
                      </span>
                    </div>
                    <Badge className="bg-slate-100 text-slate-700 border border-slate-200 shadow-none">
                      {rapor.sikapSosial || "—"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 italic leading-relaxed">
                    {rapor.deskripsiSosial || "Belum ada deskripsi."}
                  </p>
                </div>
              </div>
            </Panel>

            {/* Catatan & Status Kenaikan */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Panel>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Catatan Wali Kelas
                </p>
                <p className="text-sm text-slate-600 italic leading-relaxed">
                  {rapor.catatanWaliKelas || "Belum ada catatan."}
                </p>
              </Panel>

              <Panel>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Status Kenaikan
                </p>
                {rapor.naik !== null ? (
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${rapor.naik ? "bg-emerald-100" : "bg-red-100"}`}>
                      {rapor.naik ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">
                        {rapor.naik ? "Naik Kelas" : "Tinggal Kelas"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {rapor.naik
                          ? `Tujuan: ${rapor.kelas || "—"}`
                          : "Mengulang"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Belum ditentukan</p>
                )}
              </Panel>
            </div>

            {/* Ekstrakurikuler & Prestasi */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Panel>
                <SectionTitle icon={Star} label="Ekstrakurikuler" />
                <div className="space-y-2">
                  {rapor.ekstrakurikuler?.length > 0 ? (
                    rapor.ekstrakurikuler.map((ekskul: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {ekskul.nama}
                          </p>
                          {ekskul.keterangan && (
                            <p className="text-xs text-slate-400">
                              {ekskul.keterangan}
                            </p>
                          )}
                        </div>
                        <Badge className="bg-white border border-slate-200 text-slate-700 shadow-none text-xs">
                          {ekskul.nilai}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <EmptyNote text="Tidak ada data ekstrakurikuler" />
                  )}
                </div>
              </Panel>

              <Panel>
                <SectionTitle icon={Trophy} label="Prestasi" />
                <div className="space-y-2">
                  {rapor.prestasi?.length > 0 ? (
                    rapor.prestasi.map((p: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {p.nama}
                          </p>
                          {p.keterangan && (
                            <p className="text-xs text-slate-400">
                              {p.keterangan}
                            </p>
                          )}
                        </div>
                        <Badge className="bg-white border border-slate-200 text-slate-700 shadow-none text-xs">
                          {p.tingkat}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <EmptyNote text="Tidak ada data prestasi" />
                  )}
                </div>
              </Panel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
