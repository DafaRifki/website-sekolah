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
        statusDokumen: StatusDokumen.BELUM_DITERIMA,
        statusPembayaran: StatusPembayaranPendaftaran.BELUM_BAYAR,
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

    return pendaftaran;
  }

  static async importFromCSV(
    data: Array<Record<string, any>>,
    tahunAjaranId: number
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
        const nama = this.extractField(row, ["nama lengkap", "nama", "name"]);
        if (!nama) {
          throw new Error("Nama is required");
        }

        const parseDate = (dateStr: string | undefined): Date | undefined => {
          if (!dateStr) return undefined;
          const date = new Date(dateStr);
          return isNaN(date.getTime()) ? undefined : date;
        };

        const pendaftaranData: any = {
          // Informasi Pendaftaran
          unitPendidikan: this.extractField(row, [
            "unit pendidikan",
            "unitPendidikan",
          ]),
          jenisPendaftaran: this.extractField(row, [
            "jenis pendaftaran",
            "jenisPendaftaran",
          ]),
          noIndukPesertaDidik: this.extractField(row, [
            "no induk peserta didik",
            "noIndukPesertaDidik",
            "nipd",
          ]),
          jurusan: this.extractField(row, ["jurusan", "jurusan (opsional)"]),
          tanggalPendaftaran: parseDate(
            this.extractField(row, [
              "tanggal pendaftaran",
              "tanggalPendaftaran",
            ])
          ),

          // Data Siswa - Identitas
          nama: nama,
          jenisKelamin: this.normalizeGender(
            this.extractField(row, ["jenis kelamin", "gender", "jenisKelamin"])
          ),
          nisn: this.extractField(row, ["nisn"]),
          nik: this.extractField(row, ["nik"]),
          noKK: this.extractField(row, ["no. kk", "no kk", "nomor kk", "noKK"]),
          tempatLahir: this.extractField(row, ["tempat lahir", "tempatLahir"]),
          tanggalLahir: parseDate(
            this.extractField(row, ["tanggal lahir", "tanggalLahir"])
          ),
          agama: this.extractField(row, ["agama"]),

          // Data Siswa - Alamat & Kontak
          alamat: this.extractField(row, ["alamat lengkap", "alamat"]),
          noHandphonAktif: this.extractField(row, [
            "no. handphon aktif",
            "noHandphonAktif",
            "no handphone aktif",
            "hp aktif",
          ]),
          tempatTinggal: this.extractField(row, [
            "tempat tinggal",
            "tempatTinggal",
          ]),
          transportasi: this.extractField(row, ["transportasi"]),

          // Data Siswa - Keluarga
          anakKe: this.extractField(row, ["anak ke", "anakKe"]),
          penerimaKIP: this.extractField(row, [
            "penerima kip/pkh/kps (opsional)",
            "penerima kip",
            "penerimaKIP",
            "kip",
          ]),
          noKIP: this.extractField(row, [
            "no. kip/pkh/kps (opsi)",
            "no kip",
            "noKIP",
            "nomor kip",
          ]),

          // Data Ayah
          namaAyah: this.extractField(row, [
            "nama ayah kandung",
            "nama ayah",
            "namaAyah",
          ]),
          nikAyah: this.extractField(row, [
            "nik ayah",
            "nikAyah",
            "nik (ayah)",
          ]),
          tempatLahirAyah: this.extractField(row, [
            "tempat lahir ayah",
            "tempatLahirAyah",
            "tempat lahir (ayah)",
          ]),
          tanggalLahirAyah: parseDate(
            this.extractField(row, [
              "tanggal lahir ayah",
              "tanggalLahirAyah",
              "tanggal lahir (ayah)",
            ])
          ),
          pendidikanAyah: this.extractField(row, [
            "pendidikan terakhir ayah",
            "pendidikan ayah",
            "pendidikanAyah",
          ]),
          noHPAyah: this.extractField(row, [
            "no hp ayah",
            "no. hp ayah",
            "noHPAyah",
          ]),
          pekerjaanAyah: this.extractField(row, [
            "pekerjaan ayah",
            "pekerjaanAyah",
            "pekerjaan (ayah)",
          ]),
          penghasilanAyah: this.extractField(row, [
            "penghasilan bulanan ayah",
            "penghasilan ayah",
            "penghasilanAyah",
          ]),

          // Data Ibu
          namaIbu: this.extractField(row, [
            "nama ibu kandung",
            "nama ibu",
            "namaIbu",
          ]),
          nikIbu: this.extractField(row, ["nik ibu", "nikIbu", "nik (ibu)"]),
          tempatLahirIbu: this.extractField(row, [
            "tempat lahir ibu",
            "tempatLahirIbu",
            "tempat lahir (ibu)",
          ]),
          tanggalLahirIbu: parseDate(
            this.extractField(row, [
              "tanggal lahir ibu",
              "tanggal lahir (ibu)",
              "tanggalLahirIbu",
            ])
          ),
          pendidikanIbu: this.extractField(row, [
            "pendidikan terakhir ibu",
            "pendidikan ibu",
            "pendidikanIbu",
          ]),
          noHPIbu: this.extractField(row, [
            "no hp ibu",
            "no. hp ibu",
            "noHPIbu",
          ]),
          pekerjaanIbu: this.extractField(row, [
            "pekerjaan ibu",
            "pekerjaanIbu",
            "pekerjaan (ibu)",
          ]),
          penghasilanIbu: this.extractField(row, [
            "penghasilan bulanan ibu",
            "penghasilan ibu",
            "penghasilanIbu",
          ]),

          // Data Wali
          namaWali: this.extractField(row, ["nama wali", "namaWali"]),
          nikWali: this.extractField(row, [
            "nik wali",
            "nikWali",
            "nik (wali)",
          ]),
          tempatLahirWali: this.extractField(row, [
            "tempat lahir wali",
            "tempatLahirWali",
          ]),
          tanggalLahirWali: parseDate(
            this.extractField(row, ["tanggal lahir wali", "tanggalLahirWali"])
          ),
          pendidikanWali: this.extractField(row, [
            "pendidikan terakhir wali",
            "pendidikan wali",
            "pendidikanWali",
          ]),
          noWali: this.extractField(row, ["no wali", "no. wali", "noWali"]),
          pekerjaanWali: this.extractField(row, [
            "pekerjaan wali",
            "pekerjaanWali",
          ]),
          penghasilanWali: this.extractField(row, [
            "penghasilan bulanan wali",
            "penghasilan wali",
            "penghasilanWali",
          ]),

          // Data Fisik & Lainnya
          tinggiBadan: this.extractField(row, [
            "tinggi badan",
            "tinggiBadan",
            "tinggi badan (cm)",
          ]),
          beratBadan: this.extractField(row, [
            "berat badan",
            "beratBadan",
            "berat badan (kg)",
          ]),
          jarakSekolah: this.extractField(row, [
            "jarak tempuh ke sekolah (km)",
            "jarak sekolah",
            "jarakSekolah",
          ]),
          waktuTempuh: this.extractField(row, ["waktu tempuh", "waktuTempuh"]),
          jumlahSaudara: this.extractField(row, [
            "jumlah saudara kandung",
            "jumlah saudara",
            "jumlahSaudara",
          ]),

          // Dokumen
          ijazah: this.extractField(row, ["ijazah"]),
          skhun: this.extractField(row, ["skhun"]),
          kartuKeluarga: this.extractField(row, [
            "kartu keluarga",
            "kartuKeluarga",
            "kk",
            "akta kelahiran",
          ]),
          aktaKelahiran: this.extractField(row, [
            "akta kelahiran",
            "aktaKelahiran",
          ]),
          ktpOrangTua: this.extractField(row, ["ktp orang tua", "ktpOrangTua"]),

          // Contact & Asal
          email: this.extractField(row, ["email", "e-mail"]),
          noHp: this.extractField(row, ["no hp", "nomor hp", "noHp"]),
          asalSekolah: this.extractField(row, ["asal sekolah", "asalSekolah"]),

          // System
          tahunAjaranId: tahunAjaranId,
          statusDokumen: StatusDokumen.BELUM_DITERIMA,
          statusPembayaran: StatusPembayaranPendaftaran.BELUM_BAYAR,
        };

        await prisma.pendaftaran.create({ data: pendaftaranData });
        result.imported++;
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          nama:
            row["NAMA LENGKAP"] || row["Nama Lengkap"] || row.nama || "Unknown",
          error: error.message,
        });
      }
    }

    return result;
  }

  private static extractField(
    row: Record<string, any>,
    possibleNames: string[]
  ): string | undefined {
    for (const name of possibleNames) {
      const key = Object.keys(row).find(
        (k) => k.toLowerCase().trim() === name.toLowerCase().trim()
      );
      if (key && row[key]) {
        return row[key].toString().trim();
      }
    }
    return undefined;
  }

  private static normalizeGender(
    value: string | undefined
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
        tahunAjaran: {
          select: {
            namaTahun: true,
            semester: true,
          },
        },
      },
    });

    return updated;
  }

  static async approve(id: number) {
    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id_pendaftaran: id },
      include: {
        tahunAjaran: true,
        siswa: true,
      },
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

    if (
      pendaftaran.statusPembayaran === StatusPembayaranPendaftaran.BELUM_BAYAR
    ) {
      throw new Error("Cannot approve: Payment is required");
    }

    const siswa = await SiswaService.create({
      nama: pendaftaran.nama,
      alamat: pendaftaran.alamat || undefined,
      tanggalLahir: pendaftaran.tanggalLahir || undefined,
      jenisKelamin: pendaftaran.jenisKelamin as "L" | "P" | undefined,
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
      siswa: siswa,
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
  static async convertPendaftaranToSiswa(id: number) {
  const pendaftaran = await prisma.pendaftaran.findUnique({
    where: { id_pendaftaran: id },
  });

  if (!pendaftaran) {
    throw new Error("Pendaftaran not found");
  }

  if (pendaftaran.siswaId) {
    throw new Error("Data pendaftar sudah pernah dikonversi menjadi siswa");
  }

  // Buat siswa baru berdasarkan data pendaftaran
  const siswa = await prisma.siswa.create({
    data: {
      nama: pendaftaran.nama,
      alamat: pendaftaran.alamat || undefined,
      tanggalLahir: pendaftaran.tanggalLahir || undefined,
      jenisKelamin: pendaftaran.jenisKelamin as "L" | "P" | undefined,
      // tambahkan field yang kamu butuhkan sesuai struktur tabel siswa
    },
  });

  // Update pendaftaran agar terhubung dengan siswa baru
  const updated = await prisma.pendaftaran.update({
    where: { id_pendaftaran: id },
    data: {
      siswaId: siswa.id_siswa,
    },
    include: { siswa: true },
  });

  return {
    message: "Berhasil mengubah pendaftar menjadi siswa",
    pendaftaran: updated,
    siswa,
  };
}

}
