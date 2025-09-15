import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "@/config/axios";
import AvatarDefault from "@/assets/avatar.png";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ChevronDown, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import PrintPreview from "./PrintPreview"; // sesuaikan path

interface Siswa {
  id_siswa: number;
  nis: string;
  nama: string;
  alamat?: string;
  jenisKelamin?: string;
  tanggalLahir?: string;
  fotoProfil?: string;
  user?: { email: string; role: string };
  kelas?: {
    namaKelas: string;
    guru?: { nama: string };
    tahunRel?: { tahunAjaran: { namaTahun: string }; isActive: boolean }[];
  };
  Siswa_Orangtua?: {
    orangtua: { nama: string; hubungan: string; noHp: string };
  }[];
  nilaiRapor?: {
    semester: string;
    nilai: number;
    mapel: { namaMapel: string };
  }[];
}

export default function DetailSiswaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [siswa, setSiswa] = useState<Siswa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [semesterFilter, setSemesterFilter] = useState<"Ganjil" | "Genap">(
    "Ganjil"
  );

  const printRef = useRef<HTMLDivElement>(null);

  // Helper function untuk mendapatkan URL foto profil
  const getProfileImageUrl = (fotoProfil: string | undefined) => {
    if (!fotoProfil || !fotoProfil.trim()) {
      return AvatarDefault;
    }

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/uploads/";
    return `${baseUrl}${fotoProfil}`;
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      apiClient
        .get(`/siswa/${id}`)
        .then((res) => setSiswa(res.data.data ?? res.data))
        .catch(() => setError("Gagal memuat data siswa."))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
          <span className="text-gray-600">Memuat data siswa...</span>
        </div>
      </div>
    );
  }

  if (error || !siswa) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-12">
            <p className="text-red-600 font-medium mb-4">
              {error || "Data siswa tidak ditemukan."}
            </p>
            <Button onClick={() => navigate("/buku-induk")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Siswa
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredNilaiRapor = (siswa.nilaiRapor || []).filter((n) =>
    n.semester.toLowerCase().includes(semesterFilter.toLowerCase())
  );

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Detail Siswa</h1>
          <p className="text-sm text-gray-600 mt-1">
            Informasi lengkap data siswa dan akademik
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePrint} className="h-9">
            <Printer className="w-4 h-4 mr-2" />
            Cetak
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/buku-induk")}
            className="h-9">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Biodata Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="text-lg font-semibold">
              Biodata Siswa
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-8">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <img
                  src={getProfileImageUrl(siswa.fotoProfil)}
                  alt={siswa.nama}
                  className="w-32 h-32 rounded-lg border-2 border-gray-200 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = AvatarDefault;
                  }}
                />
              </div>

              {/* Student Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {siswa.nama}
                  </h2>
                  <p className="text-gray-600">NIS: {siswa.nis}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-2">{siswa.user?.email || "-"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tanggal Lahir:</span>
                      <span className="ml-2">
                        {siswa.tanggalLahir
                          ? new Date(siswa.tanggalLahir).toLocaleDateString(
                              "id-ID"
                            )
                          : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Alamat:</span>
                      <span className="ml-2">{siswa.alamat || "-"}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-500">Kelas:</span>
                      <span className="ml-2">
                        {siswa.kelas?.namaKelas || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Wali Kelas:</span>
                      <span className="ml-2">
                        {siswa.kelas?.guru?.nama || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tahun Ajaran:</span>
                      <span className="ml-2">
                        {siswa.kelas?.tahunRel?.some((tr) => tr.isActive)
                          ? siswa.kelas.tahunRel
                              .filter((tr) => tr.isActive)
                              .map((tr) => tr.tahunAjaran.namaTahun)
                              .join(", ")
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary">
                    {siswa.jenisKelamin || "Tidak diketahui"}
                  </Badge>
                  <Badge variant="outline">{siswa.user?.role || "Siswa"}</Badge>
                  {siswa.kelas?.namaKelas && (
                    <Badge variant="default">{siswa.kelas.namaKelas}</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Orang Tua Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="text-lg font-semibold">
              Data Orang Tua
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {siswa.Siswa_Orangtua?.length ? (
              <div className="space-y-3">
                {siswa.Siswa_Orangtua.map((rel, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4 border rounded-lg bg-gray-50/50">
                    <div>
                      <p className="font-medium">{rel.orangtua.nama}</p>
                      <p className="text-sm text-gray-600">
                        {rel.orangtua.hubungan}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">{rel.orangtua.noHp}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Belum ada data orang tua
              </p>
            )}
          </CardContent>
        </Card>

        {/* Nilai Rapor Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-gray-50/50">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">
                Nilai Rapor
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-32">
                    {semesterFilter}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSemesterFilter("Ganjil")}>
                    Semester Ganjil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSemesterFilter("Genap")}>
                    Semester Genap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {filteredNilaiRapor.length ? (
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Semester</TableHead>
                      <TableHead className="font-semibold">
                        Mata Pelajaran
                      </TableHead>
                      <TableHead className="font-semibold text-center">
                        Nilai
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNilaiRapor.map((n, i) => (
                      <TableRow key={i} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {n.semester}
                        </TableCell>
                        <TableCell>{n.mapel.namaMapel}</TableCell>
                        <TableCell className="text-center font-medium">
                          {n.nilai}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Belum ada nilai untuk semester {semesterFilter.toLowerCase()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Print Preview Component */}
      <div className="hidden">
        <PrintPreview
          siswa={siswa}
          semesterFilter={semesterFilter}
          ref={printRef}
        />
      </div>
    </div>
  );
}
