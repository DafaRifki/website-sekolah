import React, { forwardRef } from "react";
import AvatarDefault from "../../../../assets/avatar.png";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

interface PrintPreviewProps {
  siswa: {
    nama: string;
    nis: string;
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
  };
  semesterFilter: "Ganjil" | "Genap";
}

const PrintPreview = forwardRef<HTMLDivElement, PrintPreviewProps>(
  ({ siswa, semesterFilter }, ref) => {
    const filteredNilaiRapor = (siswa.nilaiRapor || []).filter((n) =>
      n.semester.toLowerCase().includes(semesterFilter.toLowerCase())
    );

    const activeTahunAjaran =
      siswa.kelas?.tahunRel?.filter((tr) => tr.isActive) || [];

    const getProfileImageUrl = (fotoProfil?: string) => {
      if (!fotoProfil || !fotoProfil.trim()) return AvatarDefault;
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      return `${baseUrl}/uploads/${fotoProfil}`;
    };

    const currentDate = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <div
        ref={ref}
        className="max-w-4xl mx-auto bg-white text-black"
        style={{ fontFamily: "Times New Roman, serif" }}>
        {/* Header Document */}
        <div className="text-center mb-8 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase mb-2">
            Buku Induk Siswa
          </h1>
          <h2 className="text-lg font-semibold">SMA Negeri 1 Bogor</h2>
          <p className="text-sm mt-2">Jl. Ir. H. Juanda No. 16, Bogor 16122</p>
          <p className="text-sm">
            Telp: (0251) 8323456 | Email: info@sman1bogor.sch.id
          </p>
        </div>

        {/* Student Information */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 bg-gray-100 p-2 border">
            I. DATA PRIBADI SISWA
          </h3>

          <div className="grid grid-cols-4 gap-6">
            {/* Profile Image */}
            <div className="col-span-1 text-center">
              <img
                src={getProfileImageUrl(siswa.fotoProfil)}
                alt={siswa.nama}
                className="w-32 h-40 border-2 border-black object-cover mx-auto mb-2"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = AvatarDefault;
                }}
              />
              <p className="text-xs">Foto Siswa</p>
            </div>

            {/* Personal Data */}
            <div className="col-span-3">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 w-40 font-medium">Nama Lengkap</td>
                    <td className="py-1 w-4">:</td>
                    <td className="py-1 font-medium">{siswa.nama}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium">NIS</td>
                    <td className="py-1">:</td>
                    <td className="py-1">{siswa.nis}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium">Jenis Kelamin</td>
                    <td className="py-1">:</td>
                    <td className="py-1">{siswa.jenisKelamin || "-"}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium">Tanggal Lahir</td>
                    <td className="py-1">:</td>
                    <td className="py-1">
                      {siswa.tanggalLahir
                        ? new Date(siswa.tanggalLahir).toLocaleDateString(
                            "id-ID"
                          )
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium">Alamat</td>
                    <td className="py-1">:</td>
                    <td className="py-1">{siswa.alamat || "-"}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium">Email</td>
                    <td className="py-1">:</td>
                    <td className="py-1">{siswa.user?.email || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 bg-gray-100 p-2 border">
            II. DATA AKADEMIK
          </h3>

          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 w-40 font-medium">Kelas</td>
                <td className="py-1 w-4">:</td>
                <td className="py-1">{siswa.kelas?.namaKelas || "-"}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Wali Kelas</td>
                <td className="py-1">:</td>
                <td className="py-1">{siswa.kelas?.guru?.nama || "-"}</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Tahun Ajaran</td>
                <td className="py-1">:</td>
                <td className="py-1">
                  {activeTahunAjaran.length
                    ? activeTahunAjaran
                        .map((tr) => tr.tahunAjaran.namaTahun)
                        .join(", ")
                    : "-"}
                </td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Status</td>
                <td className="py-1">:</td>
                <td className="py-1">{siswa.user?.role || "Siswa"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Parent Data */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 bg-gray-100 p-2 border">
            III. DATA ORANG TUA/WALI
          </h3>

          {siswa.Siswa_Orangtua?.length ? (
            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black p-2 text-left font-bold">
                    No
                  </th>
                  <th className="border border-black p-2 text-left font-bold">
                    Nama
                  </th>
                  <th className="border border-black p-2 text-left font-bold">
                    Hubungan
                  </th>
                  <th className="border border-black p-2 text-left font-bold">
                    No. Telepon
                  </th>
                </tr>
              </thead>
              <tbody>
                {siswa.Siswa_Orangtua.map((rel, i) => (
                  <tr key={i}>
                    <td className="border border-black p-2 text-center">
                      {i + 1}
                    </td>
                    <td className="border border-black p-2">
                      {rel.orangtua.nama}
                    </td>
                    <td className="border border-black p-2">
                      {rel.orangtua.hubungan}
                    </td>
                    <td className="border border-black p-2">
                      {rel.orangtua.noHp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm italic">
              Data orang tua/wali belum tersedia.
            </p>
          )}
        </div>

        {/* Academic Grades */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 bg-gray-100 p-2 border">
            IV. NILAI RAPOR - SEMESTER {semesterFilter.toUpperCase()}
          </h3>

          {filteredNilaiRapor.length ? (
            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black p-2 text-left font-bold">
                    No
                  </th>
                  <th className="border border-black p-2 text-left font-bold">
                    Semester
                  </th>
                  <th className="border border-black p-2 text-left font-bold">
                    Mata Pelajaran
                  </th>
                  <th className="border border-black p-2 text-center font-bold">
                    Nilai
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredNilaiRapor.map((n, i) => (
                  <tr key={i}>
                    <td className="border border-black p-2 text-center">
                      {i + 1}
                    </td>
                    <td className="border border-black p-2">{n.semester}</td>
                    <td className="border border-black p-2">
                      {n.mapel.namaMapel}
                    </td>
                    <td className="border border-black p-2 text-center font-medium">
                      {n.nilai}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm italic">
              Belum ada nilai untuk semester {semesterFilter.toLowerCase()}.
            </p>
          )}
        </div>

        {/* Footer with Signatures */}
        <div className="mt-8">
          <div className="text-right mb-3">
            <p className="text-xs">Bogor, {currentDate}</p>
          </div>

          <div className="flex justify-between mt-6">
            <div className="text-center w-48">
              <p className="text-xs font-medium mb-1">Mengetahui,</p>
              <p className="text-xs font-bold">Kepala Sekolah</p>
              <div className="h-16 my-2"></div>
              <div className="border-b border-black w-40 mx-auto mb-1"></div>
              <p className="text-xs">NIP. __________________</p>
            </div>

            <div className="text-center w-48">
              <p className="text-xs font-medium mb-1">Wali Kelas</p>
              <p className="text-xs font-bold">
                {siswa.kelas?.namaKelas || "___________"}
              </p>
              <div className="h-16 my-2"></div>
              <div className="border-b border-black w-40 mx-auto mb-1"></div>
              <p className="text-xs">
                {siswa.kelas?.guru?.nama || "___________________"}
              </p>
              <p className="text-xs">NIP. __________________</p>
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className="text-center mt-6 pt-2 border-t border-gray-300">
          <p className="text-xs text-gray-600">
            Dokumen ini dicetak pada {currentDate}
          </p>
        </div>
      </div>
    );
  }
);

PrintPreview.displayName = "PrintPreview";

export default PrintPreview;
