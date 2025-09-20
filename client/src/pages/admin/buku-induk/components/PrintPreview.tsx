import React, { forwardRef } from "react";
import AvatarDefault from "../../../../assets/avatar.png";

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
      <>
        {/* Print-specific CSS */}
        <style jsx>{`
          @page {
            size: 215mm 330mm; /* F4 size */
            margin: 15mm;
          }

          @media print {
            .print-container {
              font-size: 8pt;
              line-height: 1.2;
            }

            .print-header {
              font-size: 11pt;
            }

            .print-section-title {
              font-size: 9pt;
            }

            .print-table {
              font-size: 7pt;
            }
          }

          .print-container {
            max-width: none;
            width: 100%;
            font-family: "Times New Roman", serif;
            color: black;
            background: white;
            font-size: 8pt;
            line-height: 1.2;
          }
        `}</style>

        <div ref={ref} className="print-container">
          {/* Header Document - Compact */}
          <div className="text-center mb-3 border-b-2 border-black pb-2">
            <h1 className="text-base font-bold uppercase mb-1 print-header">
              Buku Induk Siswa
            </h1>
            <h2 className="text-xs font-semibold">
              SMA Islam Terpadu As-Sakinah
            </h2>
            <p className="text-xs mt-0.5">
              Jl. Cibening Raya, Kp Cempaka Putih Rt.001/006 Cibening Pamijahan
              Bogor
            </p>
            <p className="text-xs">
              Telp: +62 814-0062-5336 | Email: assakinahpamijahanbogor@gmail.com
            </p>
          </div>

          {/* Main Content - Single Column */}
          <div className="space-y-2">
            {/* Student Information */}
            <div>
              <h3 className="text-xs font-bold mb-1 bg-gray-100 p-1 border print-section-title">
                I. DATA PRIBADI SISWA
              </h3>

              <div className="flex gap-2">
                {/* Profile Image - Smaller */}
                <div className="flex-shrink-0 text-center">
                  <img
                    src={getProfileImageUrl(siswa.fotoProfil)}
                    alt={siswa.nama}
                    className="w-16 h-20 border border-black object-cover mx-auto mb-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = AvatarDefault;
                    }}
                  />
                  {/* <p className="text-xs">Foto</p> */}
                </div>

                {/* Personal Data - Compact Table */}
                <div className="flex-1">
                  <table className="w-full text-xs">
                    <tbody>
                      <tr>
                        <td className="py-0 w-20 font-medium">Nama</td>
                        <td className="py-0 w-2">:</td>
                        <td className="py-0 font-medium">{siswa.nama}</td>
                      </tr>
                      <tr>
                        <td className="py-0 font-medium">NIS</td>
                        <td className="py-0">:</td>
                        <td className="py-0">{siswa.nis}</td>
                      </tr>
                      <tr>
                        <td className="py-0 font-medium">Kelamin</td>
                        <td className="py-0">:</td>
                        <td className="py-0">{siswa.jenisKelamin || "-"}</td>
                      </tr>
                      <tr>
                        <td className="py-0 font-medium">Tgl Lahir</td>
                        <td className="py-0">:</td>
                        <td className="py-0">
                          {siswa.tanggalLahir
                            ? new Date(siswa.tanggalLahir).toLocaleDateString(
                                "id-ID"
                              )
                            : "-"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0 font-medium">Alamat</td>
                        <td className="py-0">:</td>
                        <td className="py-0">{siswa.alamat || "-"}</td>
                      </tr>
                      <tr>
                        <td className="py-0 font-medium">Email</td>
                        <td className="py-0">:</td>
                        <td className="py-0">{siswa.user?.email || "-"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h3 className="text-xs font-bold mb-1 bg-gray-100 p-1 border print-section-title">
                II. DATA AKADEMIK
              </h3>

              <table className="w-full text-xs">
                <tbody>
                  <tr>
                    <td className="py-0 w-20 font-medium">Kelas</td>
                    <td className="py-0 w-2">:</td>
                    <td className="py-0">{siswa.kelas?.namaKelas || "-"}</td>
                  </tr>
                  <tr>
                    <td className="py-0 font-medium">Wali Kelas</td>
                    <td className="py-0">:</td>
                    <td className="py-0">{siswa.kelas?.guru?.nama || "-"}</td>
                  </tr>
                  <tr>
                    <td className="py-0 font-medium">Tahun Ajaran</td>
                    <td className="py-0">:</td>
                    <td className="py-0">
                      {activeTahunAjaran.length
                        ? activeTahunAjaran
                            .map((tr) => tr.tahunAjaran.namaTahun)
                            .join(", ")
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-0 font-medium">Status</td>
                    <td className="py-0">:</td>
                    <td className="py-0">{siswa.user?.role || "Siswa"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Parent Data - Compact */}
            <div>
              <h3 className="text-xs font-bold mb-1 bg-gray-100 p-1 border print-section-title">
                III. DATA ORANG TUA/WALI
              </h3>

              {siswa.Siswa_Orangtua?.length ? (
                <table className="w-full border-collapse border border-black text-xs print-table">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-black p-0.5 text-left font-bold w-4">
                        No
                      </th>
                      <th className="border border-black p-0.5 text-left font-bold">
                        Nama
                      </th>
                      <th className="border border-black p-0.5 text-left font-bold">
                        Hubungan
                      </th>
                      <th className="border border-black p-0.5 text-left font-bold">
                        No. Telepon
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {siswa.Siswa_Orangtua.slice(0, 3).map((rel, i) => (
                      <tr key={i}>
                        <td className="border border-black p-0.5 text-center">
                          {i + 1}
                        </td>
                        <td className="border border-black p-0.5">
                          {rel.orangtua.nama}
                        </td>
                        <td className="border border-black p-0.5">
                          {rel.orangtua.hubungan}
                        </td>
                        <td className="border border-black p-0.5">
                          {rel.orangtua.noHp}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs italic">Data belum tersedia.</p>
              )}
            </div>

            {/* Grades Section */}
            <div>
              <h3 className="text-xs font-bold mb-1 bg-gray-100 p-1 border print-section-title">
                IV. NILAI RAPOR - SEMESTER {semesterFilter.toUpperCase()}
              </h3>

              {filteredNilaiRapor.length ? (
                <table className="w-full border-collapse border border-black text-xs print-table">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-black p-0.5 text-center font-bold w-4">
                        No
                      </th>
                      <th className="border border-black p-0.5 text-left font-bold">
                        Mata Pelajaran
                      </th>
                      <th className="border border-black p-0.5 text-center font-bold w-8">
                        Semester
                      </th>
                      <th className="border border-black p-0.5 text-center font-bold w-8">
                        Nilai
                      </th>
                      <th className="border border-black p-0.5 text-center font-bold w-6">
                        Predikat
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNilaiRapor.map((n, i) => {
                      let predikat = "D";
                      if (n.nilai >= 90) predikat = "A";
                      else if (n.nilai >= 80) predikat = "B";
                      else if (n.nilai >= 70) predikat = "C";

                      return (
                        <tr key={i}>
                          <td className="border border-black p-0.5 text-center">
                            {i + 1}
                          </td>
                          <td className="border border-black p-0.5">
                            {n.mapel.namaMapel}
                          </td>
                          <td className="border border-black p-0.5 text-center">
                            {n.semester}
                          </td>
                          <td className="border border-black p-0.5 text-center font-medium">
                            {n.nilai}
                          </td>
                          <td className="border border-black p-0.5 text-center font-medium">
                            {predikat}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="border border-dashed border-gray-300 p-2 text-center">
                  <p className="text-xs italic text-gray-600">
                    Belum ada nilai untuk semester{" "}
                    {semesterFilter.toLowerCase()}.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Compact Signatures */}
          <div className="mt-4">
            <div className="text-right mb-1">
              <p className="text-xs">Bogor, {currentDate}</p>
            </div>

            <div className="flex justify-between mt-2">
              <div className="text-center w-32">
                <p className="text-xs font-medium mb-0.5">Mengetahui,</p>
                <p className="text-xs font-bold">Kepala Sekolah</p>
                <div className="h-8 my-1"></div>
                <div className="border-b border-black w-24 mx-auto mb-0.5"></div>
                <p className="text-xs">NIP. ______________</p>
              </div>

              <div className="text-center w-32">
                <p className="text-xs font-medium mb-0.5">Wali Kelas</p>
                <p className="text-xs font-bold">
                  {siswa.kelas?.namaKelas || "________"}
                </p>
                <div className="h-8 my-1"></div>
                <div className="border-b border-black w-24 mx-auto mb-0.5"></div>
                <p className="text-xs">
                  {siswa.kelas?.guru?.nama || "_____________"}
                </p>
                <p className="text-xs">NIP. ______________</p>
              </div>
            </div>
          </div>

          {/* Document Footer */}
          <div className="text-center mt-2 pt-1 border-t border-gray-300">
            <p className="text-xs text-gray-600">
              Dokumen ini dicetak pada {currentDate}
            </p>
          </div>
        </div>
      </>
    );
  }
);

PrintPreview.displayName = "PrintPreview";

export default PrintPreview;
