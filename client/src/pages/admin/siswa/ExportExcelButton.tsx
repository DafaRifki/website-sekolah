import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import apiClient from "@/config/axios";
import Swal from "sweetalert2";

interface ExportProps {
  search: string;
  kelasFilter: string;
}

const ExportExcelButton: React.FC<ExportProps> = ({ search, kelasFilter }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      // Mengambil data dengan limit besar agar semua halaman terambil
      const res = await apiClient.get("/siswa", {
        params: {
          page: 1,
          limit: 10000, 
          search: search,
          kelasId: kelasFilter !== "all" ? kelasFilter : undefined,
        },
      });

      const allData = res.data.data;

      if (!allData || allData.length === 0) {
        Swal.fire("Info", "Tidak ada data yang sesuai untuk diexport", "info");
        return;
      }

      // Formatting data agar nama kolom di Excel rapi dan mudah dibaca
      const formattedData = allData.map((s: any, index: number) => ({
        "No": index + 1,
        "Nama Lengkap": s.nama,
        "NIS": s.nis || "-",
        "NISN": s.nisn || "-",
        "Jenis Kelamin": s.jenisKelamin === "L" ? "Laki-laki" : s.jenisKelamin === "P" ? "Perempuan" : "-",
        "Kelas": s.kelas?.namaKelas || "-",
        "Tempat Lahir": s.tempatLahir || "-",
        "Tanggal Lahir": s.tanggalLahir 
            ? new Date(s.tanggalLahir).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) 
            : "-",
        "Agama": s.agama || "-",
        "No. HP Siswa": s.noHP || "-",
        "Email": s.user?.email || "-",
        "Alamat Siswa": s.alamat || "-",
        "Nama Ayah": s.namaAyah || "-",
        "Pekerjaan Ayah": s.pekerjaanAyah || "-",
        "Nama Ibu": s.namaIbu || "-",
        "Pekerjaan Ibu": s.pekerjaanIbu || "-",
        "No Telepon Ortu": s.noTeleponOrtu || "-",
        "Alamat Orang Tua": s.Siswa_Orangtua?.[0]?.orangtua?.alamat || "-"
      }));

      // Proses pembuatan Excel
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Siswa");
      
      // Mengatur lebar kolom otomatis agar rapi dan teks tidak tertumpuk
      const wscols = [
        { wch: 5 },  // A: No
        { wch: 30 }, // B: Nama Lengkap
        { wch: 15 }, // C: NIS
        { wch: 15 }, // D: NISN
        { wch: 15 }, // E: Jenis Kelamin
        { wch: 15 }, // F: Kelas
        { wch: 20 }, // G: Tempat Lahir
        { wch: 20 }, // H: Tanggal Lahir
        { wch: 15 }, // I: Agama
        { wch: 18 }, // J: No. HP Siswa
        { wch: 30 }, // K: Email
        { wch: 45 }, // L: Alamat Siswa (Dibuat lebar karena panjang)
        { wch: 25 }, // M: Nama Ayah
        { wch: 20 }, // N: Pekerjaan Ayah
        { wch: 25 }, // O: Nama Ibu
        { wch: 20 }, // P: Pekerjaan Ibu
        { wch: 18 }, // Q: No Telepon Ortu
        { wch: 45 }, // R: Alamat Orang Tua (Dibuat lebar karena panjang)
      ];
      worksheet['!cols'] = wscols;

      // Trigger download
      XLSX.writeFile(workbook, `Data_Siswa_SMA_IT_Assakinah_${new Date().toISOString().split('T')[0]}.xlsx`);
      
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal!", "Terjadi kesalahan saat mengexport data.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleExport} 
      disabled={isLoading}
      className="gap-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
    >
      <Download className="w-4 h-4" />
      {isLoading ? "Mengekspor..." : "Export Excel"}
    </Button>
  );
};

export default ExportExcelButton;