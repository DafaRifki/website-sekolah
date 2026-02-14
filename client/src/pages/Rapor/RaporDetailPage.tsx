import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import apiClient from "@/config/axios"; // Pastikan path benar
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { FileDown, FileSpreadsheet } from "lucide-react";

export default function RaporDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // useEffect(() => {
  //   const fetchDetail = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await apiClient.get(`/rapor/${id}`);
  //       console.log(response.data);

  //       setData(response.data.data);
  //     } catch (error: any) {
  //       console.error("Error fetch detail rapor:", error);
  //       toast.error("Gagal memuat detail rapor");
  //       navigate("/e-rapor");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (id) fetchDetail();
  // }, [id, navigate]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        console.log(`Fetching rapor with ID: ${id}`);
        const response = await apiClient.get(`/rapor/${id}`);
        console.log("Full response:", response);

        setData(response.data.data);
      } catch (error: any) {
        console.error("Full error:", error.response?.data);
        console.error("Status:", error.response?.status);
        console.error("URL yang diakses:", error.config?.url);
        toast.error(
          `Error: ${error.response?.status} - ${error.response?.data?.message || "Gagal"}`,
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
    } catch (error: any) {
      console.error(`Error downloading ${type}:`, error);
      toast.error(`Gagal mengunduh ${type.toUpperCase()}`);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-slate-500 animate-pulse">Memuat data rapor...</p>
      </div>
    );
  }

  if (!data) return null;

  const { rapor, nilai, rataRata } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Detail Rapor
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {rapor.siswa?.nama} — {rapor.tahunAjaran?.namaTahun} Semester{" "}
                {rapor.semester}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleDownload("pdf")}
              disabled={downloading !== null}>
              {downloading === "pdf" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              Download PDF
            </Button>

            {user?.role !== "SISWA" && (
              <Button
                variant="outline"
                className="gap-2 border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => handleDownload("excel")}
                disabled={downloading !== null}>
                {downloading === "excel" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                Download Excel
              </Button>
            )}

            {user?.role !== "SISWA" && (
              <Button asChild className="gap-2">
                <Link to={`/e-rapor/${id}/edit`}>
                  <Edit className="h-4 w-4" />
                  Edit Rapor
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {rapor.status === "PUBLISHED" ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Published
            </Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
              Draft
            </Badge>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Student Info */}
          <div className="space-y-6">
            <Card className="overflow-hidden border-0 shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <User className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-white">
                      {rapor.siswa?.nama}
                    </CardTitle>
                    <CardDescription className="text-white/80">
                      NIS: {rapor.siswa?.nis}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <InfoRow label="Kelas" value={rapor.siswa?.kelas?.namaKelas} />
                <Separator />
                <InfoRow
                  label="Jenis Kelamin"
                  value={
                    rapor.siswa?.jenisKelamin === "L"
                      ? "Laki-laki"
                      : "Perempuan"
                  }
                />
                <Separator />
                <InfoRow
                  label="Tahun Ajaran"
                  value={rapor.tahunAjaran?.namaTahun}
                />
                <Separator />
                <InfoRow
                  label="Wali Kelas"
                  value={rapor.siswa?.kelas?.guru?.nama || "-"}
                />
              </CardContent>
            </Card>

            {/* Kehadiran */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Kehadiran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <AttendanceRow
                  label="Hadir"
                  value={rapor.totalHadir}
                  color="bg-green-50 text-green-700"
                />
                <AttendanceRow
                  label="Sakit"
                  value={rapor.totalSakit}
                  color="bg-yellow-50 text-yellow-700"
                />
                <AttendanceRow
                  label="Izin"
                  value={rapor.totalIzin}
                  color="bg-blue-50 text-blue-700"
                />
                <AttendanceRow
                  label="Alpha"
                  value={rapor.totalAlpha}
                  color="bg-red-50 text-red-700"
                />
                <Separator />
                <div className="flex items-center justify-between font-bold">
                  <span>Total Absensi</span>
                  <span>
                    {(rapor.totalSakit || 0) +
                      (rapor.totalIzin || 0) +
                      (rapor.totalAlpha || 0)}{" "}
                    Hari
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Nilai */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Nilai Rata-rata</p>
                    <p className="text-5xl font-extrabold mt-2 tracking-tight">
                      {rataRata}
                    </p>
                  </div>
                  <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                    <TrendingUp className="h-10 w-10 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nilai Pelajaran */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Nilai Mata Pelajaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {Object.entries(nilai).map(
                    ([kelompok, mapels]: [string, any]) => (
                      <div key={kelompok} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
                          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">
                            {kelompok}
                          </h3>
                        </div>
                        <div className="rounded-lg border">
                          <Table>
                            <TableHeader className="bg-slate-50">
                              <TableRow>
                                <TableHead>Mata Pelajaran</TableHead>
                                <TableHead className="text-center">
                                  Tugas
                                </TableHead>
                                <TableHead className="text-center">
                                  UTS
                                </TableHead>
                                <TableHead className="text-center">
                                  UAS
                                </TableHead>
                                <TableHead className="text-center">
                                  Akhir
                                </TableHead>
                                <TableHead className="text-center">
                                  Predikat
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {mapels.map((m: any) => (
                                <TableRow key={m.id_nilai}>
                                  <TableCell className="font-medium">
                                    {m.namaMapel}
                                  </TableCell>
                                  <TableCell className="text-center text-slate-500">
                                    {m.nilaiTugas}
                                  </TableCell>
                                  <TableCell className="text-center text-slate-500">
                                    {m.nilaiUTS}
                                  </TableCell>
                                  <TableCell className="text-center text-slate-500">
                                    {m.nilaiUAS}
                                  </TableCell>
                                  <TableCell className="text-center font-bold text-blue-600">
                                    {m.nilai}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge
                                      variant={
                                        m.nilai >= 75
                                          ? "default"
                                          : "destructive"
                                      }>
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
              </CardContent>
            </Card>

            {/* Catatan & Kenaikan */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Catatan Wali Kelas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 italic">
                    "{rapor.catatanWaliKelas || "Belum ada catatan."}"
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status Kenaikan</CardTitle>
                </CardHeader>
                <CardContent>
                  {rapor.naik !== null ? (
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${rapor.naik ? "bg-green-100" : "bg-red-100"}`}>
                        <CheckCircle
                          className={`h-5 w-5 ${rapor.naik ? "text-green-600" : "text-red-600"}`}
                        />
                      </div>
                      <div>
                        <p className="font-bold">
                          {rapor.naik ? "Naik Kelas" : "Tinggal Kelas"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {rapor.naik
                            ? `Tujuan: ${rapor.kelas || "-"}`
                            : "Mengulang"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">Belum ditentukan</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value || "-"}</span>
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
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Badge variant="outline" className={color}>
        {value || 0}
      </Badge>
    </div>
  );
}

function getPredikat(nilai: number) {
  if (nilai >= 90) return "A";
  if (nilai >= 80) return "B";
  if (nilai >= 70) return "C";
  return "D";
}
