import React, { forwardRef } from "react";
import AvatarDefault from "../../../../assets/avatar.png";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface PrintPreviewProps {
  siswa: {
    nama: string;
    nis: string;
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
  };
  semesterFilter: "Ganjil" | "Genap";
}

// forwardRef agar bisa diprint dari parent
const PrintPreview = forwardRef<HTMLDivElement, PrintPreviewProps>(
  ({ siswa, semesterFilter }, ref) => {
    const filteredNilaiRapor = (siswa.nilaiRapor || []).filter((n) =>
      n.semester.toLowerCase().includes(semesterFilter.toLowerCase())
    );

    return (
      <div ref={ref} className="p-6 text-black bg-white">
        <h1 className="text-2xl font-bold mb-4 text-center">Detail Siswa</h1>

        {/* Biodata */}
        <div className="border rounded-md p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">Biodata</h2>
          <div className="flex gap-4">
            <img
              src={siswa.fotoProfil?.trim() ? siswa.fotoProfil : AvatarDefault}
              alt={siswa.nama}
              className="w-24 h-24 rounded-full border"
            />
            <div className="flex flex-col gap-1">
              <p>
                <strong>Nama:</strong> {siswa.nama}
              </p>
              <p>
                <strong>NIS:</strong> {siswa.nis}
              </p>
              <p>
                <strong>Email:</strong> {siswa.user?.email || "-"}
              </p>
              <p>
                <strong>Jenis Kelamin:</strong> {siswa.jenisKelamin || "-"}{" "}
                <Badge variant="outline">{siswa.user?.role || "Siswa"}</Badge>{" "}
                <Badge variant="secondary">
                  {siswa.kelas?.namaKelas || "-"}
                </Badge>
              </p>
              <p>
                <strong>Tanggal Lahir:</strong>{" "}
                {siswa.tanggalLahir
                  ? new Date(siswa.tanggalLahir).toLocaleDateString("id-ID")
                  : "-"}
              </p>
              <p>
                <strong>Alamat:</strong> {siswa.alamat || "-"}
              </p>
              <p>
                <strong>Wali Kelas:</strong> {siswa.kelas?.guru?.nama || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Orang Tua */}
        <div className="border rounded-md p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">Data Orang Tua</h2>
          {siswa.Siswa_Orangtua?.length ? (
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-1">Nama</th>
                  <th className="border p-1">Hubungan</th>
                  <th className="border p-1">No HP</th>
                </tr>
              </thead>
              <tbody>
                {siswa.Siswa_Orangtua.map((rel, i) => (
                  <tr key={i}>
                    <td className="border p-1">{rel.orangtua.nama}</td>
                    <td className="border p-1">{rel.orangtua.hubungan}</td>
                    <td className="border p-1">{rel.orangtua.noHp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Belum ada data orang tua.</p>
          )}
        </div>

        {/* Nilai Rapor */}
        <div className="border rounded-md p-4">
          <h2 className="text-xl font-semibold mb-2">
            Nilai Rapor - Semester {semesterFilter}
          </h2>
          {filteredNilaiRapor.length ? (
            <Table className="border rounded-md w-full">
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
          ) : (
            <p>Belum ada nilai untuk semester {semesterFilter}.</p>
          )}
        </div>
      </div>
    );
  }
);

export default PrintPreview;
