import { prisma } from "../config/database";
import { PaginationQuery, PaginationResult } from "../types/common.types";
import {
  buildPaginationQuery,
  buildPaginationResult,
  buildSearchFilter,
} from "../utils/database.util";
import {
  Prisma,
  StatusDokumen,
  StatusPembayaranPendaftaran,
} from "@prisma/client";
import { SiswaService } from "./siswa.service";

interface CreatePendaftaranData {
  unitPendidikan?: string;
  jenisPendaftaran?: string;
  noIndukPesertaDidik?: string;
  jurusan?: string;
  tanggalPendaftaran?: Date | string;
  nama: string;
  jenisKelamin?: string;
  nisn?: string;
  nik?: string;
  noKK?: string;
  tempatLahir?: string;
  tanggalLahir?: Date | string;
  agama?: string;
  alamat?: string;
  noHandphonAktif?: string;
  tempatTinggal?: string;
  transportasi?: string;
  anakKe?: string;
  penerimaKIP?: string;
  noKIP?: string;
  namaAyah?: string;
  nikAyah?: string;
  tempatLahirAyah?: string;
  tanggalLahirAyah?: Date | string;
  pendidikanAyah?: string;
  noHPAyah?: string;
  pekerjaanAyah?: string;
  penghasilanAyah?: string;
  namaIbu?: string;
  nikIbu?: string;
  tempatLahirIbu?: string;
  tanggalLahirIbu?: Date | string;
  pendidikanIbu?: string;
  noHPIbu?: string;
  pekerjaanIbu?: string;
  penghasilanIbu?: string;
  namaWali?: string;
  nikWali?: string;
  tempatLahirWali?: string;
  tanggalLahirWali?: Date | string;
  pendidikanWali?: string;
  noWali?: string;
  pekerjaanWali?: string;
  penghasilanWali?: string;
  tinggiBadan?: string;
  beratBadan?: string;
  jarakSekolah?: string;
  waktuTempuh?: string;
  jumlahSaudara?: string;
  ijazah?: string;
  skhun?: string;
  kartuKeluarga?: string;
  aktaKelahiran?: string;
  ktpOrangTua?: string;
  email?: string;
  noHp?: string;
  asalSekolah?: string;
  tahunAjaranId: number;
  // Optional status fields for admin to set during creation
  statusDokumen?: StatusDokumen;
  statusPembayaran?: StatusPembayaranPendaftaran;
}

interface UpdatePendaftaranData {
  [key: string]: any;
}

interface ImportResult {
  total: number;
  imported: number;
  failed: number;
  errors: Array<{
    row: number;
    nama: string;
    error: string;
  }>;
}

export class PendaftaranService {
  static async getAll(query: PaginationQuery): Promise<PaginationResult<any>> {
    const { skip, take, page, limit } = buildPaginationQuery(query);

    const searchFilter = buildSearchFilter(query.search, [
      "nama",
      "email",
      "nisn",
    ]);

    const where: Prisma.PendaftaranWhereInput = {
      ...searchFilter,
    };

    const [pendaftaran, total] = await Promise.all([
      prisma.pendaftaran.findMany({
        where,
        skip,
        take,
        orderBy: { id_pendaftaran: "desc" },
        select: {
          id_pendaftaran: true,
          unitPendidikan: true,
          jenisPendaftaran: true,
          nama: true,
          nisn: true,
          nik: true,
          tempatLahir: true,
          tanggalLahir: true,
          jenisKelamin: true,
          agama: true,
          alamat: true,
          noHandphonAktif: true,
          namaAyah: true,
          noHPAyah: true,
          namaIbu: true,
          noHPIbu: true,
          email: true,
          statusDokumen: true,
          statusPembayaran: true,
          tahunAjaranId: true,
          siswaId: true,
          createdAt: true,
          tahunAjaran: {
            select: {
              id_tahun: true,
              namaTahun: true,
              semester: true,
            },
          },
          siswa: {
            select: {
              id_siswa: true,
              nis: true,
              nama: true,
            },
          },
        },
      }),
      prisma.pendaftaran.count({ where }),
    ]);

    return buildPaginationResult(pendaftaran, total, page, limit);
  }

  static async getById(id: number) {
    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id_pendaftaran: id },
      include: {
        tahunAjaran: true,
        siswa: {
          select: {
            id_siswa: true,
            nis: true,
            nama: true,
            kelas: {
              select: {
                namaKelas: true,
                tingkat: true,
              },
            },
          },
        },
      },
    });

    if (!pendaftaran) {
      throw new Error("Pendaftaran not found");
    }

    return pendaftaran;
  }

  static async create(data: CreatePendaftaranData) {
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id_tahun: data.tahunAjaranId },
    });

    if (!tahunAjaran) {
      throw new Error("Tahun ajaran not found");
    }

    // Determine status from input or use defaults
    const statusDokumen = data.statusDokumen || StatusDokumen.BELUM_DITERIMA;
    const statusPembayaran =
      data.statusPembayaran || StatusPembayaranPendaftaran.BELUM_BAYAR;

    const pendaftaran = await prisma.pendaftaran.create({
      data: {
        ...data,
        tanggalPendaftaran: data.tanggalPendaftaran
          ? new Date(data.tanggalPendaftaran)
          : undefined,
        tanggalLahir: data.tanggalLahir
          ? new Date(data.tanggalLahir)
          : undefined,
        tanggalLahirAyah: data.tanggalLahirAyah
          ? new Date(data.tanggalLahirAyah)
          : undefined,
        tanggalLahirIbu: data.tanggalLahirIbu
          ? new Date(data.tanggalLahirIbu)
          : undefined,
        tanggalLahirWali: data.tanggalLahirWali
          ? new Date(data.tanggalLahirWali)
          : undefined,
        statusDokumen,
        statusPembayaran,
      },
      include: {
        tahunAjaran: {
          select: {
            namaTahun: true,
            semester: true,
          },
        },
      },
    });

    // Auto-approve if statusDokumen is LENGKAP and statusPembayaran is not BELUM_BAYAR
    if (
      statusDokumen === StatusDokumen.LENGKAP &&
      statusPembayaran !== StatusPembayaranPendaftaran.BELUM_BAYAR
    ) {
      try {
        const approvalResult = await this.approve(pendaftaran.id_pendaftaran);
        return approvalResult.pendaftaran;
      } catch (error) {
        // If auto-approve fails, return the pendaftaran without approval
        console.error("Auto-approve failed:", error);
        return pendaftaran;
      }
    }

    return pendaftaran;
  }

  private static normalizeEnum<T>(
    val: string | undefined,
    enumObject: any,
    defaultValue: T,
  ): T {
    if (!val) return defaultValue;
    const formatted = val.trim().toUpperCase().replace(/\s+/g, "_");
    return Object.values(enumObject).includes(formatted)
      ? (formatted as unknown as T)
      : defaultValue;
  }

  private static extractField(
    row: Record<string, any>,
    possibleNames: string[],
  ): string | undefined {
    for (const name of possibleNames) {
      const key = Object.keys(row).find(
        (k) => k.toLowerCase().trim() === name.toLowerCase().trim(),
      );
      if (key && row[key]) {
        return row[key].toString().trim();
      }
    }
    return undefined;
  }

  private static normalizeGender(
    value: string | undefined,
  ): string | undefined {
    if (!value) return undefined;
    const normalized = value.toLowerCase().trim();
    if (
      normalized.includes("laki") ||
      normalized === "l" ||
      normalized === "male" ||
      normalized === "pria"
    ) {
      return "L";
    }
    if (
      normalized.includes("perempuan") ||
      normalized === "p" ||
      normalized === "female" ||
      normalized === "wanita"
    ) {
      return "P";
    }
    return value;
  }

  static async approve(id: number) {
    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id_pendaftaran: id },
    });

    if (!pendaftaran) {
      throw new Error("Pendaftaran not found");
    }

    if (pendaftaran.siswaId) {
      throw new Error("Pendaftaran already approved");
    }

    if (pendaftaran.statusDokumen !== StatusDokumen.LENGKAP) {
      throw new Error("Cannot approve: Status dokumen must be LENGKAP");
    }
    if (pendaftaran.statusPembayaran !== StatusPembayaranPendaftaran.LUNAS) {
      throw new Error("Cannot approve: Payment must be LUNAS");
    }

    const siswa = await SiswaService.create({
      nama: pendaftaran.nama,
      nis: pendaftaran.nisn || undefined,
      email: pendaftaran.email || `siswa${Date.now()}@sekolah.com`,
      alamat: pendaftaran.alamat || undefined,
      tanggalLahir: pendaftaran.tanggalLahir || undefined,
      jenisKelamin: pendaftaran.jenisKelamin as "L" | "P" | undefined,
      orangtuaNama:
        pendaftaran.namaAyah ||
        pendaftaran.namaIbu ||
        pendaftaran.namaWali ||
        undefined,
      orangtuaHubungan: pendaftaran.namaAyah
        ? "Ayah"
        : pendaftaran.namaIbu
          ? "Ibu"
          : "Wali",
      orangtuaPekerjaan:
        pendaftaran.pekerjaanAyah ||
        pendaftaran.pekerjaanIbu ||
        pendaftaran.pekerjaanWali ||
        undefined,
      orangtuaNoHp:
        pendaftaran.noHPAyah ||
        pendaftaran.noHPIbu ||
        pendaftaran.noWali ||
        undefined,
    });

    const updatedPendaftaran = await prisma.pendaftaran.update({
      where: { id_pendaftaran: id },
      data: { siswaId: siswa.id_siswa },
      include: {
        siswa: true,
        tahunAjaran: true,
      },
    });

    return {
      pendaftaran: updatedPendaftaran,
      siswa,
    };
  }

  static async update(id: number, data: UpdatePendaftaranData) {
    const existing = await prisma.pendaftaran.findUnique({
      where: { id_pendaftaran: id },
    });

    if (!existing) {
      throw new Error("Pendaftaran not found");
    }

    if (existing.siswaId) {
      throw new Error("Cannot update approved pendaftaran");
    }

    const updated = await prisma.pendaftaran.update({
      where: { id_pendaftaran: id },
      data,
      include: {
        tahunAjaran: true,
      },
    });

    // auto-approve
    if (
      updated.statusDokumen === StatusDokumen.LENGKAP &&
      updated.statusPembayaran === StatusPembayaranPendaftaran.LUNAS
    ) {
      try {
        return await this.approve(id);
      } catch (error: any) {
        console.error("Auto-approve failed during update:", error.message);
        return { ...updated, autoApproved: false, error: error.message };
      }
    }

    // cek jika dokumen LENGKAP & pembayaran LUNAS
    // const isLengkap = updated.statusDokumen === StatusDokumen.LENGKAP;
    // const isLunas =
    //   updated.statusPembayaran === StatusPembayaranPendaftaran.LUNAS;

    // if (isLengkap && isLunas && !updated.siswaId) {
    //   try {
    //     // Otomatis approve dan buat siswa
    //     const siswa = await SiswaService.create({
    //       nama: updated.nama,
    //       nis: updated.nisn || undefined,
    //       email: updated.email || `siswa${Date.now()}@sekolah.com`,
    //       alamat: updated.alamat || undefined,
    //       tanggalLahir: updated.tanggalLahir || undefined,
    //       jenisKelamin: updated.jenisKelamin as "L" | "P" | undefined,
    //       orangtuaNama:
    //         updated.namaAyah ||
    //         updated.namaIbu ||
    //         updated.namaWali ||
    //         undefined,
    //       orangtuaHubungan: updated.namaAyah
    //         ? "Ayah"
    //         : updated.namaIbu
    //           ? "Ibu"
    //           : "Wali",
    //       orangtuaPekerjaan:
    //         updated.pekerjaanAyah ||
    //         updated.pekerjaanIbu ||
    //         updated.pekerjaanWali ||
    //         undefined,
    //       orangtuaNoHp:
    //         updated.noHPAyah || updated.noHPIbu || updated.noWali || undefined,
    //     });

    //     // Update pendaftaran dengan siswaId
    //     const finalPendaftaran = await prisma.pendaftaran.update({
    //       where: { id_pendaftaran: id },
    //       data: { siswaId: siswa.id_siswa },
    //       include: {
    //         tahunAjaran: {
    //           select: {
    //             namaTahun: true,
    //             semester: true,
    //           },
    //         },
    //         siswa: true,
    //       },
    //     });

    //     const approvalResult = await this.approve(id);

    //     return {
    //       ...approvalResult.pendaftaran,
    //       autoApproved: true,
    //       siswa: approvalResult.siswa,
    //     };
    //   } catch (error: any) {
    //     // Jika gagal auto-approve, kembalikan data yang sudah di-update saja
    //     console.error("Auto-approve failed:", error.message);
    //     return {
    //       ...updated,
    //       autoApproved: false,
    //       autoApproveError: error.message,
    //     };
    //   }
    // }

    return updated;
  }

  static async importFromCSV(
    data: Array<Record<string, any>>,
    tahunAjaranId: number,
  ): Promise<ImportResult> {
    const result: ImportResult = {
      total: data.length,
      imported: 0,
      failed: 0,
      errors: [],
    };

    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id_tahun: tahunAjaranId },
    });

    if (!tahunAjaran) {
      throw new Error("Tahun ajaran not found");
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      try {
        const pendaftaranData = this.mapCsvToPendaftaran(row, tahunAjaranId);

        const pendaftaran = await prisma.pendaftaran.create({
          data: pendaftaranData,
        });

        // cek auto-approve berdasarkan hasil create
        if (
          pendaftaran.statusDokumen === StatusDokumen.LENGKAP &&
          pendaftaran.statusPembayaran === StatusPembayaranPendaftaran.LUNAS
        ) {
          try {
            await this.approve(pendaftaran.id_pendaftaran);
          } catch (approveErr: any) {
            console.warn(
              `Row ${rowNumber}: Data masuk tapi gagal jadi siswa: ${approveErr.message}`,
            );
          }
        }
        result.imported++;
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          nama: row.nama || "Unknown",
          error: error.message,
        });
      }

      // try {
      //   const nama = this.extractField(row, ["nama lengkap", "nama", "name"]);
      //   if (!nama) {
      //     throw new Error("Nama is required");
      //   }

      //   const parseDate = (dateStr: string | undefined): Date | undefined => {
      //     if (!dateStr) return undefined;
      //     const date = new Date(dateStr);
      //     return isNaN(date.getTime()) ? undefined : date;
      //   };

      //   // Ambil dan Normalisasi Status dari CSV
      //   const rawDocStatus = this.extractField(row, [
      //     "statusDokumen",
      //     "status dokumen",
      //   ]);
      //   const rawPayStatus = this.extractField(row, [
      //     "statusPembayaran",
      //     "status pembayaran",
      //   ]);

      //   const statusDokumen = this.normalizeEnum<StatusDokumen>(
      //     rawDocStatus,
      //     StatusDokumen,
      //     StatusDokumen.BELUM_DITERIMA,
      //   );
      //   const statusPembayaran =
      //     this.normalizeEnum<StatusPembayaranPendaftaran>(
      //       rawPayStatus,
      //       StatusPembayaranPendaftaran,
      //       StatusPembayaranPendaftaran.BELUM_BAYAR,
      //     );

      //   const pendaftaranData: any = {
      //     // Informasi Pendaftaran
      //     unitPendidikan: this.extractField(row, [
      //       "unit pendidikan",
      //       "unitPendidikan",
      //     ]),
      //     jenisPendaftaran: this.extractField(row, [
      //       "jenis pendaftaran",
      //       "jenisPendaftaran",
      //     ]),
      //     noIndukPesertaDidik: this.extractField(row, [
      //       "no induk peserta didik",
      //       "noIndukPesertaDidik",
      //       "nipd",
      //     ]),
      //     jurusan: this.extractField(row, ["jurusan", "jurusan (opsional)"]),
      //     tanggalPendaftaran: parseDate(
      //       this.extractField(row, [
      //         "tanggal pendaftaran",
      //         "tanggalPendaftaran",
      //       ]),
      //     ),

      //     // Data Siswa - Identitas
      //     nama: nama,
      //     jenisKelamin: this.normalizeGender(
      //       this.extractField(row, ["jenis kelamin", "gender", "jenisKelamin"]),
      //     ),
      //     nisn: this.extractField(row, ["nisn"]),
      //     nik: this.extractField(row, ["nik"]),
      //     noKK: this.extractField(row, ["no. kk", "no kk", "nomor kk", "noKK"]),
      //     tempatLahir: this.extractField(row, ["tempat lahir", "tempatLahir"]),
      //     tanggalLahir: parseDate(
      //       this.extractField(row, ["tanggal lahir", "tanggalLahir"]),
      //     ),
      //     agama: this.extractField(row, ["agama"]),

      //     // Data Siswa - Alamat & Kontak
      //     alamat: this.extractField(row, ["alamat lengkap", "alamat"]),
      //     noHandphonAktif: this.extractField(row, [
      //       "no. handphon aktif",
      //       "noHandphonAktif",
      //       "no handphone aktif",
      //       "hp aktif",
      //     ]),
      //     tempatTinggal: this.extractField(row, [
      //       "tempat tinggal",
      //       "tempatTinggal",
      //     ]),
      //     transportasi: this.extractField(row, ["transportasi"]),

      //     // Data Siswa - Keluarga
      //     anakKe: this.extractField(row, ["anak ke", "anakKe"]),
      //     penerimaKIP: this.extractField(row, [
      //       "penerima kip/pkh/kps (opsional)",
      //       "penerima kip",
      //       "penerimaKIP",
      //       "kip",
      //     ]),
      //     noKIP: this.extractField(row, [
      //       "no. kip/pkh/kps (opsi)",
      //       "no kip",
      //       "noKIP",
      //       "nomor kip",
      //     ]),

      //     // Data Ayah
      //     namaAyah: this.extractField(row, [
      //       "nama ayah kandung",
      //       "nama ayah",
      //       "namaAyah",
      //     ]),
      //     nikAyah: this.extractField(row, [
      //       "nik ayah",
      //       "nikAyah",
      //       "nik (ayah)",
      //     ]),
      //     tempatLahirAyah: this.extractField(row, [
      //       "tempat lahir ayah",
      //       "tempatLahirAyah",
      //       "tempat lahir (ayah)",
      //     ]),
      //     tanggalLahirAyah: parseDate(
      //       this.extractField(row, [
      //         "tanggal lahir ayah",
      //         "tanggalLahirAyah",
      //         "tanggal lahir (ayah)",
      //       ]),
      //     ),
      //     pendidikanAyah: this.extractField(row, [
      //       "pendidikan terakhir ayah",
      //       "pendidikan ayah",
      //       "pendidikanAyah",
      //     ]),
      //     noHPAyah: this.extractField(row, [
      //       "no hp ayah",
      //       "no. hp ayah",
      //       "noHPAyah",
      //     ]),
      //     pekerjaanAyah: this.extractField(row, [
      //       "pekerjaan ayah",
      //       "pekerjaanAyah",
      //       "pekerjaan (ayah)",
      //     ]),
      //     penghasilanAyah: this.extractField(row, [
      //       "penghasilan bulanan ayah",
      //       "penghasilan ayah",
      //       "penghasilanAyah",
      //     ]),

      //     // Data Ibu
      //     namaIbu: this.extractField(row, [
      //       "nama ibu kandung",
      //       "nama ibu",
      //       "namaIbu",
      //     ]),
      //     nikIbu: this.extractField(row, ["nik ibu", "nikIbu", "nik (ibu)"]),
      //     tempatLahirIbu: this.extractField(row, [
      //       "tempat lahir ibu",
      //       "tempatLahirIbu",
      //       "tempat lahir (ibu)",
      //     ]),
      //     tanggalLahirIbu: parseDate(
      //       this.extractField(row, [
      //         "tanggal lahir ibu",
      //         "tanggal lahir (ibu)",
      //         "tanggalLahirIbu",
      //       ]),
      //     ),
      //     pendidikanIbu: this.extractField(row, [
      //       "pendidikan terakhir ibu",
      //       "pendidikan ibu",
      //       "pendidikanIbu",
      //     ]),
      //     noHPIbu: this.extractField(row, [
      //       "no hp ibu",
      //       "no. hp ibu",
      //       "noHPIbu",
      //     ]),
      //     pekerjaanIbu: this.extractField(row, [
      //       "pekerjaan ibu",
      //       "pekerjaanIbu",
      //       "pekerjaan (ibu)",
      //     ]),
      //     penghasilanIbu: this.extractField(row, [
      //       "penghasilan bulanan ibu",
      //       "penghasilan ibu",
      //       "penghasilanIbu",
      //     ]),

      //     // Data Wali
      //     namaWali: this.extractField(row, ["nama wali", "namaWali"]),
      //     nikWali: this.extractField(row, [
      //       "nik wali",
      //       "nikWali",
      //       "nik (wali)",
      //     ]),
      //     tempatLahirWali: this.extractField(row, [
      //       "tempat lahir wali",
      //       "tempatLahirWali",
      //     ]),
      //     tanggalLahirWali: parseDate(
      //       this.extractField(row, ["tanggal lahir wali", "tanggalLahirWali"]),
      //     ),
      //     pendidikanWali: this.extractField(row, [
      //       "pendidikan terakhir wali",
      //       "pendidikan wali",
      //       "pendidikanWali",
      //     ]),
      //     noWali: this.extractField(row, ["no wali", "no. wali", "noWali"]),
      //     pekerjaanWali: this.extractField(row, [
      //       "pekerjaan wali",
      //       "pekerjaanWali",
      //     ]),
      //     penghasilanWali: this.extractField(row, [
      //       "penghasilan bulanan wali",
      //       "penghasilan wali",
      //       "penghasilanWali",
      //     ]),

      //     // Data Fisik & Lainnya
      //     tinggiBadan: this.extractField(row, [
      //       "tinggi badan",
      //       "tinggiBadan",
      //       "tinggi badan (cm)",
      //     ]),
      //     beratBadan: this.extractField(row, [
      //       "berat badan",
      //       "beratBadan",
      //       "berat badan (kg)",
      //     ]),
      //     jarakSekolah: this.extractField(row, [
      //       "jarak tempuh ke sekolah (km)",
      //       "jarak sekolah",
      //       "jarakSekolah",
      //     ]),
      //     waktuTempuh: this.extractField(row, ["waktu tempuh", "waktuTempuh"]),
      //     jumlahSaudara: this.extractField(row, [
      //       "jumlah saudara kandung",
      //       "jumlah saudara",
      //       "jumlahSaudara",
      //     ]),

      //     // Dokumen
      //     ijazah: this.extractField(row, ["ijazah"]),
      //     skhun: this.extractField(row, ["skhun"]),
      //     kartuKeluarga: this.extractField(row, [
      //       "kartu keluarga",
      //       "kartuKeluarga",
      //       "kk",
      //       "akta kelahiran",
      //     ]),
      //     aktaKelahiran: this.extractField(row, [
      //       "akta kelahiran",
      //       "aktaKelahiran",
      //     ]),
      //     ktpOrangTua: this.extractField(row, ["ktp orang tua", "ktpOrangTua"]),

      //     // Contact & Asal
      //     email: this.extractField(row, ["email", "e-mail"]),
      //     noHp: this.extractField(row, ["no hp", "nomor hp", "noHp"]),
      //     asalSekolah: this.extractField(row, ["asal sekolah", "asalSekolah"]),

      //     // System
      //     statusDokumen,
      //     statusPembayaran,
      //     tahunAjaranId: { connect: { id_tahun: tahunAjaranId } },
      //   };

      //   const pendaftaran = await prisma.pendaftaran.create({
      //     data: pendaftaranData,
      //   });

      //   // cek jika siswa sudah memenuhi syarat
      //   if (
      //     pendaftaran.statusDokumen === StatusDokumen.LENGKAP &&
      //     pendaftaran.statusPembayaran === StatusPembayaranPendaftaran.LUNAS
      //   ) {
      //     try {
      //       await this.approve(pendaftaran.id_pendaftaran);
      //     } catch (approveErr: any) {
      //       console.error(
      //         `Row ${rowNumber}: Gagal auto-approve menjadi siswa: ${approveErr.message}`,
      //       );
      //     }
      //   }

      //   result.imported++;
      // } catch (error: any) {
      //   result.failed++;
      //   result.errors.push({
      //     row: rowNumber,
      //     nama:
      //       row["NAMA LENGKAP"] || row["Nama Lengkap"] || row.nama || "Unknown",
      //     error: error.message,
      //   });
      // }
    }

    return result;
  }

  // Helper untuk merapikan kode Import
  private static mapCsvToPendaftaran(row: any, tahunAjaranId: number) {
    const rawDoc = this.extractField(row, ["statusDokumen", "status dokumen"]);
    const rawPay = this.extractField(row, [
      "statusPembayaran",
      "status pembayaran",
    ]);

    return {
      nama: this.extractField(row, ["nama lengkap", "nama"]) || "Tanpa Nama",
      nisn: this.extractField(row, ["nisn"]),
      email: this.extractField(row, ["email"]),
      // ... (masukkan mapping field lainnya dari kode asli Anda di sini) ...
      statusDokumen: this.normalizeEnum<StatusDokumen>(
        rawDoc,
        StatusDokumen,
        StatusDokumen.BELUM_DITERIMA,
      ),
      statusPembayaran: this.normalizeEnum<StatusPembayaranPendaftaran>(
        rawPay,
        StatusPembayaranPendaftaran,
        StatusPembayaranPendaftaran.BELUM_BAYAR,
      ),
      tahunAjaran: { connect: { id_tahun: tahunAjaranId } },
    };
  }

  static async reject(id: number, reason?: string) {
    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id_pendaftaran: id },
    });

    if (!pendaftaran) {
      throw new Error("Pendaftaran not found");
    }

    if (pendaftaran.siswaId) {
      throw new Error("Cannot reject approved pendaftaran");
    }

    await prisma.pendaftaran.delete({
      where: { id_pendaftaran: id },
    });

    return { message: "Pendaftaran rejected and deleted", reason };
  }

  static async delete(id: number) {
    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id_pendaftaran: id },
    });

    if (!pendaftaran) {
      throw new Error("Pendaftaran not found");
    }

    if (pendaftaran.siswaId) {
      throw new Error("Cannot delete approved pendaftaran");
    }

    await prisma.pendaftaran.delete({
      where: { id_pendaftaran: id },
    });

    return { message: "Pendaftaran deleted successfully" };
  }

  static async getStats(tahunAjaranId?: number) {
    const where: Prisma.PendaftaranWhereInput = tahunAjaranId
      ? { tahunAjaranId }
      : {};

    const [
      total,
      approved,
      pending,
      dokumenLengkap,
      dokumenKurang,
      dokumenBelum,
      bayarLunas,
      bayarCicil,
      bayarBelum,
    ] = await Promise.all([
      prisma.pendaftaran.count({ where }),
      prisma.pendaftaran.count({ where: { ...where, siswaId: { not: null } } }),
      prisma.pendaftaran.count({ where: { ...where, siswaId: null } }),
      prisma.pendaftaran.count({
        where: { ...where, statusDokumen: StatusDokumen.LENGKAP },
      }),
      prisma.pendaftaran.count({
        where: { ...where, statusDokumen: StatusDokumen.KURANG },
      }),
      prisma.pendaftaran.count({
        where: { ...where, statusDokumen: StatusDokumen.BELUM_DITERIMA },
      }),
      prisma.pendaftaran.count({
        where: {
          ...where,
          statusPembayaran: StatusPembayaranPendaftaran.LUNAS,
        },
      }),
      prisma.pendaftaran.count({
        where: {
          ...where,
          statusPembayaran: StatusPembayaranPendaftaran.CICIL,
        },
      }),
      prisma.pendaftaran.count({
        where: {
          ...where,
          statusPembayaran: StatusPembayaranPendaftaran.BELUM_BAYAR,
        },
      }),
    ]);

    return {
      total,
      approved,
      pending,
      byDokumen: {
        lengkap: dokumenLengkap,
        kurang: dokumenKurang,
        belum: dokumenBelum,
      },
      byPembayaran: {
        lunas: bayarLunas,
        cicil: bayarCicil,
        belum: bayarBelum,
      },
    };
  }

  static async getByTahunAjaran(tahunAjaranId: number) {
    const pendaftaran = await prisma.pendaftaran.findMany({
      where: { tahunAjaranId },
      orderBy: { id_pendaftaran: "desc" },
      include: {
        siswa: {
          select: {
            id_siswa: true,
            nis: true,
            nama: true,
          },
        },
      },
    });

    return pendaftaran;
  }
}
