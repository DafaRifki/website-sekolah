// src/services/pendaftaran-upload.service.ts
import { prisma } from "../config/database";
import { Prisma } from "@prisma/client";

interface PendaftaranCSVRow {
  // Informasi Pendaftaran
  unitPendidikan?: string;
  jenisPendaftaran?: string;
  noIndukPesertaDidik?: string;
  jurusan?: string;
  tanggalPendaftaran?: string;

  // Data Siswa - Identitas
  nama: string;
  jenisKelamin?: string;
  nisn?: string;
  nik?: string;
  noKK?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  agama?: string;

  // Data Siswa - Alamat & Kontak
  alamat?: string;
  noHandphonAktif?: string;
  tempatTinggal?: string;
  transportasi?: string;

  // Data Siswa - Keluarga
  anakKe?: string;
  penerimaKIP?: string;
  noKIP?: string;

  // Data Ayah
  namaAyah?: string;
  nikAyah?: string;
  tempatLahirAyah?: string;
  tanggalLahirAyah?: string;
  pendidikanAyah?: string;
  noHPAyah?: string;
  pekerjaanAyah?: string;
  penghasilanAyah?: string;

  // Data Ibu
  namaIbu?: string;
  nikIbu?: string;
  tempatLahirIbu?: string;
  tanggalLahirIbu?: string;
  pendidikanIbu?: string;
  noHPIbu?: string;
  pekerjaanIbu?: string;
  penghasilanIbu?: string;

  // Data Wali
  namaWali?: string;
  nikWali?: string;
  tempatLahirWali?: string;
  tanggalLahirWali?: string;
  pendidikanWali?: string;
  noWali?: string;
  pekerjaanWali?: string;
  penghasilanWali?: string;

  // Data Fisik & Jarak
  tinggiBadan?: string;
  beratBadan?: string;
  jarakSekolah?: string;
  waktuTempuh?: string;
  jumlahSaudara?: string;

  // Contact & Asal Sekolah
  email?: string;
  noHp?: string;
  asalSekolah?: string;
}

export class PendaftaranUploadService {
  /**
   * Process CSV/Excel data and bulk insert to database
   */
  static async bulkUpload(data: PendaftaranCSVRow[], tahunAjaranId: number) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as { row: number; error: string; data: any }[],
    };

    // Validate tahun ajaran
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id_tahun: tahunAjaranId },
    });

    if (!tahunAjaran) {
      throw new Error("Tahun ajaran not found");
    }

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];

        // Validate required fields
        if (!row.nama) {
          throw new Error("Nama wajib diisi");
        }

        // Parse dates
        const parseDate = (dateStr?: string) => {
          if (!dateStr) return null;
          const date = new Date(dateStr);
          return isNaN(date.getTime()) ? null : date;
        };

        // Create pendaftaran
        await prisma.pendaftaran.create({
          data: {
            // Informasi Pendaftaran
            unitPendidikan: row.unitPendidikan || null,
            jenisPendaftaran: row.jenisPendaftaran || null,
            noIndukPesertaDidik: row.noIndukPesertaDidik || null,
            jurusan: row.jurusan || null,
            tanggalPendaftaran: parseDate(row.tanggalPendaftaran),

            // Data Siswa - Identitas
            nama: row.nama,
            jenisKelamin: row.jenisKelamin || null,
            nisn: row.nisn || null,
            nik: row.nik || null,
            noKK: row.noKK || null,
            tempatLahir: row.tempatLahir || null,
            tanggalLahir: parseDate(row.tanggalLahir),
            agama: row.agama || null,

            // Data Siswa - Alamat & Kontak
            alamat: row.alamat || null,
            noHandphonAktif: row.noHandphonAktif || null,
            tempatTinggal: row.tempatTinggal || null,
            transportasi: row.transportasi || null,

            // Data Siswa - Keluarga
            anakKe: row.anakKe || null,
            penerimaKIP: row.penerimaKIP || null,
            noKIP: row.noKIP || null,

            // Data Ayah
            namaAyah: row.namaAyah || null,
            nikAyah: row.nikAyah || null,
            tempatLahirAyah: row.tempatLahirAyah || null,
            tanggalLahirAyah: parseDate(row.tanggalLahirAyah),
            pendidikanAyah: row.pendidikanAyah || null,
            noHPAyah: row.noHPAyah || null,
            pekerjaanAyah: row.pekerjaanAyah || null,
            penghasilanAyah: row.penghasilanAyah || null,

            // Data Ibu
            namaIbu: row.namaIbu || null,
            nikIbu: row.nikIbu || null,
            tempatLahirIbu: row.tempatLahirIbu || null,
            tanggalLahirIbu: parseDate(row.tanggalLahirIbu),
            pendidikanIbu: row.pendidikanIbu || null,
            noHPIbu: row.noHPIbu || null,
            pekerjaanIbu: row.pekerjaanIbu || null,
            penghasilanIbu: row.penghasilanIbu || null,

            // Data Wali
            namaWali: row.namaWali || null,
            nikWali: row.nikWali || null,
            tempatLahirWali: row.tempatLahirWali || null,
            tanggalLahirWali: parseDate(row.tanggalLahirWali),
            pendidikanWali: row.pendidikanWali || null,
            noWali: row.noWali || null,
            pekerjaanWali: row.pekerjaanWali || null,
            penghasilanWali: row.penghasilanWali || null,

            // Data Fisik & Jarak
            tinggiBadan: row.tinggiBadan || null,
            beratBadan: row.beratBadan || null,
            jarakSekolah: row.jarakSekolah || null,
            waktuTempuh: row.waktuTempuh || null,
            jumlahSaudara: row.jumlahSaudara || null,

            // Contact & Asal Sekolah
            email: row.email || null,
            noHp: row.noHp || null,
            asalSekolah: row.asalSekolah || null,

            // Relations
            tahunAjaranId,

            // Default status
            statusDokumen: "BELUM_DITERIMA",
            statusPembayaran: "BELUM_BAYAR",
          },
        });

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error.message,
          data: data[i],
        });
      }
    }

    return results;
  }

  /**
   * Generate CSV template
   */
  static getCSVTemplate() {
    const headers = [
      // Informasi Pendaftaran
      "unitPendidikan",
      "jenisPendaftaran",
      "noIndukPesertaDidik",
      "jurusan",
      "tanggalPendaftaran",

      // Data Siswa - Identitas
      "nama",
      "jenisKelamin",
      "nisn",
      "nik",
      "noKK",
      "tempatLahir",
      "tanggalLahir",
      "agama",

      // Data Siswa - Alamat & Kontak
      "alamat",
      "noHandphonAktif",
      "tempatTinggal",
      "transportasi",

      // Data Siswa - Keluarga
      "anakKe",
      "penerimaKIP",
      "noKIP",

      // Data Ayah
      "namaAyah",
      "nikAyah",
      "tempatLahirAyah",
      "tanggalLahirAyah",
      "pendidikanAyah",
      "noHPAyah",
      "pekerjaanAyah",
      "penghasilanAyah",

      // Data Ibu
      "namaIbu",
      "nikIbu",
      "tempatLahirIbu",
      "tanggalLahirIbu",
      "pendidikanIbu",
      "noHPIbu",
      "pekerjaanIbu",
      "penghasilanIbu",

      // Data Wali
      "namaWali",
      "nikWali",
      "tempatLahirWali",
      "tanggalLahirWali",
      "pendidikanWali",
      "noWali",
      "pekerjaanWali",
      "penghasilanWali",

      // Data Fisik & Jarak
      "tinggiBadan",
      "beratBadan",
      "jarakSekolah",
      "waktuTempuh",
      "jumlahSaudara",

      // Contact & Asal Sekolah
      "email",
      "noHp",
      "asalSekolah",
    ];

    return headers;
  }
}
