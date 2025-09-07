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
import { Loader2, ArrowLeft, ChevronDown } from "lucide-react";
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
  kelas?: { namaKelas: string; guru?: { nama: string } };
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
        <span className="ml-2 text-gray-600">Memuat data...</span>
      </div>
    );
  }

  if (error || !siswa) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 font-medium">
          {error || "Data siswa tidak ditemukan."}
        </p>
        <Button onClick={() => navigate("/buku-induk")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke daftar
        </Button>
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
      window.location.reload(); // reset state setelah print
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Detail Siswa</h1>
        <Button variant="outline" onClick={() => navigate("/buku-induk")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>
      </div>

      <Button onClick={handlePrint} className="mb-4">
        Print Preview
      </Button>

      {/* Biodata */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Biodata</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-6 items-center">
          <img
            src={siswa.fotoProfil?.trim() ? siswa.fotoProfil : AvatarDefault}
            alt={siswa.nama}
            className="w-28 h-28 rounded-full border shadow"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="font-bold text-xl">{siswa.nama}</p>
              <p className="text-gray-500 text-sm">NIS: {siswa.nis}</p>
              <p>Email: {siswa.user?.email || "-"}</p>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge>{siswa.jenisKelamin || "Tidak diketahui"}</Badge>
                <Badge variant="secondary">
                  {siswa.kelas?.namaKelas || "Belum ada kelas"}
                </Badge>
                <Badge variant="outline">{siswa.user?.role || "Siswa"}</Badge>
              </div>
              <p className="text-sm mt-2">
                Tanggal Lahir:{" "}
                {siswa.tanggalLahir
                  ? new Date(siswa.tanggalLahir).toLocaleDateString("id-ID")
                  : "-"}
              </p>
              <p className="text-sm">Alamat: {siswa.alamat || "-"}</p>
              <p className="text-sm">
                Wali Kelas: {siswa.kelas?.guru?.nama || "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orang Tua */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Data Orang Tua</CardTitle>
        </CardHeader>
        <CardContent>
          {siswa.Siswa_Orangtua?.length ? (
            <ul className="space-y-2">
              {siswa.Siswa_Orangtua.map((rel, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center p-2 border rounded-md">
                  <span>
                    <span className="font-medium">{rel.orangtua.nama}</span>{" "}
                    <span className="text-gray-500">
                      ({rel.orangtua.hubungan})
                    </span>
                  </span>
                  <span className="text-sm text-gray-600">
                    {rel.orangtua.noHp}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Belum ada data orang tua.</p>
          )}
        </CardContent>
      </Card>

      {/* Nilai Rapor */}
      <Card className="shadow-md">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Nilai Rapor</CardTitle>

          {/* Dropdown Semester */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-40 justify-between">
                {semesterFilter}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-0 w-40">
              <DropdownMenuItem onClick={() => setSemesterFilter("Ganjil")}>
                Ganjil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSemesterFilter("Genap")}>
                Genap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          {filteredNilaiRapor.length ? (
            <div className="overflow-x-auto">
              <Table className="border rounded-md">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead>Semester</TableHead>
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead>Nilai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNilaiRapor.map((n, i) => (
                    <TableRow
                      key={i}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <TableCell>{n.semester}</TableCell>
                      <TableCell>{n.mapel.namaMapel}</TableCell>
                      <TableCell>{n.nilai}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-gray-500 mt-2">
              Belum ada nilai untuk semester {semesterFilter}.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Komponen Print Preview */}
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
