// src/services/laporan.service.ts
import { prisma } from "../config/database";
import ExcelJS from "exceljs";
import { Parser } from "json2csv";
import path from "path";
import fs from "fs/promises";

export class LaporanService {
  /**
   * Get statistics for a specific tahun ajaran
   */
  static async getStats(tahunAjaranId: number) {
    // Get total siswa aktif
    const totalSiswa = await prisma.siswa.count({
      where: { status: "AKTIF" },
    });

    // Get tagihan stats
    const tagihanList = await prisma.tagihan.findMany({
      where: { tahunAjaranId },
      select: {
        jumlah: true,
        status: true,
        tarif: { select: { nominal: true } },
      },
    });

    // Get pembayaran stats
    const pembayaranStats = await prisma.pembayaran.aggregate({
      where: {
        tagihan: { tahunAjaranId },
      },
      _sum: { jumlahBayar: true },
      _count: true,
    });

    // Get status breakdown
    // const statusCounts = await prisma.tagihan.groupBy({
    //   by: ["status"],
    //   where: { tahunAjaranId },
    //   _count: true,
    // });

    const totalTagihan = tagihanList.reduce((sum, t) => {
      return sum + (t.jumlah ?? t.tarif?.nominal ?? 0);
    }, 0);
    const totalBayar = pembayaranStats._sum.jumlahBayar || 0;
    const sisaPembayaran = totalTagihan - totalBayar;

    const lunasCount = tagihanList.filter((t) => t.status === "LUNAS").length;
    const totalCount = tagihanList.length || 1; // Prevent division by zero
    const persentaseLunas = (lunasCount / totalCount) * 100;

    return {
      totalSiswa,
      totalTagihan,
      totalBayar,
      sisaPembayaran,
      persentaseLunas,
      totalTransaksi: pembayaranStats._count,
    };
  }

  /**
   * Generate Excel report for Tagihan
   */
  static async generateTagihanExcel(tahunAjaranId: number) {
    const data = await prisma.tagihan.findMany({
      where: { tahunAjaranId },
      include: {
        siswa: {
          select: {
            nis: true,
            nama: true,
            kelas: {
              select: {
                namaKelas: true,
              },
            },
          },
        },
        tarif: {
          select: {
            namaTagihan: true,
            nominal: true,
          },
        },
        tahunAjaran: {
          select: {
            namaTahun: true,
            semester: true,
          },
        },
        pembayaran: {
          select: {
            jumlahBayar: true,
          },
        },
      },
      orderBy: [{ siswa: { nama: "asc" } }, { id_tagihan: "asc" }],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Tagihan");

    // Add header info
    const tahunAjaran = data[0]?.tahunAjaran;
    worksheet.addRow(["LAPORAN TAGIHAN SISWA"]);
    worksheet.addRow([
      `Tahun Ajaran: ${tahunAjaran?.namaTahun} - Semester ${tahunAjaran?.semester}`,
    ]);
    worksheet.addRow([]);

    // Define columns
    worksheet.columns = [
      { header: "No", key: "no", width: 5 },
      { header: "NIS", key: "nis", width: 15 },
      { header: "Nama Siswa", key: "nama", width: 30 },
      { header: "Kelas", key: "kelas", width: 10 },
      { header: "Jenis Tagihan", key: "jenisTagihan", width: 25 },
      { header: "Bulan", key: "bulan", width: 12 },
      { header: "Nominal", key: "nominal", width: 15 },
      { header: "Sudah Bayar", key: "sudahBayar", width: 15 },
      { header: "Sisa", key: "sisa", width: 15 },
      { header: "Status", key: "status", width: 12 },
    ];

    // Style header
    const headerRow = worksheet.getRow(4);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    // Add data
    data.forEach((tagihan, index) => {
      const totalBayar = tagihan.pembayaran.reduce(
        (sum, p) => sum + (p.jumlahBayar || 0),
        0,
      );
      const sisa = (tagihan.tarif.nominal || 0) - totalBayar;

      worksheet.addRow({
        no: index + 1,
        nis: tagihan.siswa.nis || "-",
        nama: tagihan.siswa.nama,
        kelas: tagihan.siswa.kelas?.namaKelas || "-",
        jenisTagihan: tagihan.tarif.namaTagihan,
        bulan: tagihan.bulan || "-",
        nominal: tagihan.tarif.nominal || 0,
        sudahBayar: totalBayar,
        sisa: sisa,
        status: tagihan.status,
      });
    });

    // Format currency columns
    worksheet.getColumn("nominal").numFmt = '"Rp"#,##0';
    worksheet.getColumn("sudahBayar").numFmt = '"Rp"#,##0';
    worksheet.getColumn("sisa").numFmt = '"Rp"#,##0';

    // Add borders
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 4) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }
    });

    // Add summary
    const lastRow = worksheet.lastRow?.number || 0;
    worksheet.addRow([]);
    const summaryRow = worksheet.addRow([
      "",
      "",
      "",
      "",
      "",
      "TOTAL:",
      { formula: `SUM(G5:G${lastRow})` },
      { formula: `SUM(H5:H${lastRow})` },
      { formula: `SUM(I5:I${lastRow})` },
      "",
    ]);
    summaryRow.font = { bold: true };
    summaryRow.getCell(7).numFmt = '"Rp"#,##0';
    summaryRow.getCell(8).numFmt = '"Rp"#,##0';
    summaryRow.getCell(9).numFmt = '"Rp"#,##0';

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  /**
   * Generate Excel report for Pembayaran
   */
  static async generatePembayaranExcel(tahunAjaranId: number) {
    const data = await prisma.pembayaran.findMany({
      where: {
        tagihan: { tahunAjaranId },
      },
      include: {
        siswa: {
          select: {
            nis: true,
            nama: true,
            kelas: {
              select: {
                namaKelas: true,
              },
            },
          },
        },
        tagihan: {
          select: {
            siswa: {
              select: {
                nis: true,
                nama: true,
                kelas: {
                  select: {
                    namaKelas: true,
                  },
                },
              },
            },
            tarif: {
              select: {
                namaTagihan: true,
                nominal: true,
              },
            },
            tahunAjaran: {
              select: {
                namaTahun: true,
                semester: true,
              },
            },
          },
        },
      },
      orderBy: { tanggal: "desc" },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Pembayaran");

    // Add header info
    const tahunAjaran = data[0]?.tagihan.tahunAjaran;
    worksheet.addRow(["LAPORAN PEMBAYARAN SISWA"]);
    worksheet.addRow([
      `Tahun Ajaran: ${tahunAjaran?.namaTahun} - Semester ${tahunAjaran?.semester}`,
    ]);
    worksheet.addRow([]);

    // Define columns
    worksheet.columns = [
      { header: "No", key: "no", width: 5 },
      { header: "Tanggal", key: "tanggal", width: 12 },
      { header: "NIS", key: "nis", width: 15 },
      { header: "Nama Siswa", key: "nama", width: 30 },
      { header: "Kelas", key: "kelas", width: 10 },
      { header: "Jenis Tagihan", key: "jenisTagihan", width: 25 },
      { header: "Nominal Tagihan", key: "nominalTagihan", width: 15 },
      { header: "Jumlah Bayar", key: "jumlahBayar", width: 15 },
      { header: "Metode", key: "metode", width: 12 },
      { header: "No Bukti", key: "noBukti", width: 15 },
      { header: "Keterangan", key: "keterangan", width: 25 },
    ];

    // Style header
    const headerRow = worksheet.getRow(4);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    // Add data
    data.forEach((pembayaran, index) => {
      const siswa = pembayaran.siswa || pembayaran.tagihan.siswa;

      worksheet.addRow({
        no: index + 1,
        tanggal: pembayaran.tanggal,
        nis: siswa?.nis || "-",
        nama: siswa?.nama || "-",
        kelas: siswa?.kelas?.namaKelas || "-",
        jenisTagihan: pembayaran.tagihan.tarif.namaTagihan,
        nominalTagihan: pembayaran.tagihan.tarif.nominal || 0,
        jumlahBayar: pembayaran.jumlahBayar || 0,
        metode: pembayaran.metode || "-",
        noBukti: pembayaran.noBukti || "-",
        keterangan: pembayaran.keterangan || "-",
      });
    });

    // Format columns
    worksheet.getColumn("tanggal").numFmt = "dd/mm/yyyy";
    worksheet.getColumn("nominalTagihan").numFmt = '"Rp"#,##0';
    worksheet.getColumn("jumlahBayar").numFmt = '"Rp"#,##0';

    // Add borders
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 4) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }
    });

    // Add summary
    const lastRow = worksheet.lastRow?.number || 0;
    worksheet.addRow([]);
    const summaryRow = worksheet.addRow([
      "",
      "",
      "",
      "",
      "",
      "TOTAL:",
      { formula: `SUM(G5:G${lastRow})` },
      { formula: `SUM(H5:H${lastRow})` },
      "",
      "",
      "",
    ]);
    summaryRow.font = { bold: true };
    summaryRow.getCell(7).numFmt = '"Rp"#,##0';
    summaryRow.getCell(8).numFmt = '"Rp"#,##0';

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  /**
   * Generate CSV for Tagihan
   */
  static async generateTagihanCSV(tahunAjaranId: number) {
    const data = await prisma.tagihan.findMany({
      where: { tahunAjaranId },
      include: {
        siswa: {
          select: {
            nis: true,
            nama: true,
            kelas: { select: { namaKelas: true } },
          },
        },
        tarif: {
          select: {
            namaTagihan: true,
            nominal: true,
          },
        },
        pembayaran: {
          select: { jumlahBayar: true },
        },
      },
    });

    const csvData = data.map((tagihan, index) => {
      const totalBayar = tagihan.pembayaran.reduce(
        (sum, p) => sum + (p.jumlahBayar || 0),
        0,
      );
      const sisa = (tagihan.tarif.nominal || 0) - totalBayar;

      return {
        No: index + 1,
        NIS: tagihan.siswa.nis || "-",
        "Nama Siswa": tagihan.siswa.nama,
        Kelas: tagihan.siswa.kelas?.namaKelas || "-",
        "Jenis Tagihan": tagihan.tarif.namaTagihan,
        Bulan: tagihan.bulan || "-",
        Nominal: tagihan.tarif.nominal || 0,
        "Sudah Bayar": totalBayar,
        Sisa: sisa,
        Status: tagihan.status,
      };
    });

    const parser = new Parser();
    const csv = parser.parse(csvData);
    return csv;
  }

  /**
   * Generate CSV for Pembayaran
   */
  static async generatePembayaranCSV(tahunAjaranId: number) {
    const data = await prisma.pembayaran.findMany({
      where: {
        tagihan: { tahunAjaranId },
      },
      include: {
        siswa: {
          select: {
            nis: true,
            nama: true,
            kelas: { select: { namaKelas: true } },
          },
        },
        tagihan: {
          select: {
            siswa: {
              select: {
                nis: true,
                nama: true,
                kelas: { select: { namaKelas: true } },
              },
            },
            tarif: {
              select: {
                namaTagihan: true,
                nominal: true,
              },
            },
          },
        },
      },
      orderBy: { tanggal: "desc" },
    });

    const csvData = data.map((pembayaran, index) => {
      const siswa = pembayaran.siswa || pembayaran.tagihan.siswa;

      return {
        No: index + 1,
        Tanggal: new Date(pembayaran.tanggal).toLocaleDateString("id-ID"),
        NIS: siswa?.nis || "-",
        "Nama Siswa": siswa?.nama || "-",
        Kelas: siswa?.kelas?.namaKelas || "-",
        "Jenis Tagihan": pembayaran.tagihan.tarif.namaTagihan,
        "Nominal Tagihan": pembayaran.tagihan.tarif.nominal || 0,
        "Jumlah Bayar": pembayaran.jumlahBayar || 0,
        Metode: pembayaran.metode || "-",
        "No Bukti": pembayaran.noBukti || "-",
        Keterangan: pembayaran.keterangan || "-",
      };
    });

    const parser = new Parser();
    const csv = parser.parse(csvData);
    return csv;
  }

  /**
   * Archive data for a tahun ajaran
   * Creates JSON backup files without deleting from database
   *
   * FIXES:
   * 1. Tagihan query: include siswa with kelas nested (was: siswa: true, no kelas)
   * 2. Pembayaran query: include tagihan with jumlah & sisaBayar hydrated from tarif
   * 3. Removed duplicate top-level pembayaran array — pembayaran already nested in tagihan
   * 4. hydratedTagihan: jumlah and sisaBayar are computed correctly before archiving
   */
  static async arsipData(tahunAjaranId: number, shouldDelete: boolean = false) {
    // ----------------------------------------------------------------
    // FIX 1: include kelas inside siswa so Kelas column is not blank
    // ----------------------------------------------------------------
    const tagihan = await prisma.tagihan.findMany({
      where: { tahunAjaranId },
      include: {
        siswa: {
          include: {
            kelas: true,
          },
        },
        tarif: true,
        pembayaran: true,
      },
    });

    // ----------------------------------------------------------------
    // NEW: Include all students and classes in this academic year
    // This ensures "everyone" is in the archive, even if they have no tagihan
    // ----------------------------------------------------------------
    const classes = await prisma.kelas.findMany({
      where: {
        tahunRel: {
          some: {
            tahunAjaranId: tahunAjaranId,
          },
        },
      },
      include: {
        guru: true,
        siswa: {
          select: { id_siswa: true },
        },
      },
    });

    const classIds = classes.map((c) => c.id_kelas);
    const siswaInYear = await prisma.siswa.findMany({
      where: {
        OR: [
          { kelasId: { in: classIds } },
          { tagihan: { some: { tahunAjaranId } } },
        ],
      },
      include: {
        kelas: true,
      },
    });

    // ----------------------------------------------------------------
    // FIX 2: include tagihan.jumlah, sisaBayar + siswa.kelas in pembayaran
    // ----------------------------------------------------------------
    const pembayaran = await prisma.pembayaran.findMany({
      where: {
        tagihan: { tahunAjaranId },
      },
      include: {
        siswa: {
          include: {
            kelas: true,
          },
        },
        tagihan: {
          include: {
            tarif: true,
            siswa: {
              include: {
                kelas: true,
              },
            },
          },
        },
      },
    });

    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id_tahun: tahunAjaranId },
    });

    // ----------------------------------------------------------------
    // INTERNAL HELPER: Hydrate a single pembayaran record
    // ----------------------------------------------------------------
    const hydrateSinglePembayaran = (p: any) => {
      const parentTagihan = tagihan.find((t) => t.id_tagihan === p.tagihanId);
      const siswa = p.siswa || parentTagihan?.siswa;
      const id_siswa = p.id_siswa || siswa?.id_siswa;
      const tarif = parentTagihan?.tarif;
      const nominal = tarif?.nominal || 0;

      // Calculate total for this specific tagihan to compute sisaBayar
      const totalBayarForTagihan =
        parentTagihan?.pembayaran.reduce(
          (sum, pb) => sum + (pb.jumlahBayar || 0),
          0,
        ) ?? 0;

      return {
        ...p,
        id_siswa,
        siswa,
        tagihan: p.tagihan || parentTagihan
          ? {
              ...(p.tagihan || parentTagihan),
              jumlah: (p.tagihan || parentTagihan).jumlah ?? nominal,
              sisaBayar:
                (p.tagihan || parentTagihan).sisaBayar ??
                nominal - totalBayarForTagihan,
            }
          : undefined,
      };
    };

    // ----------------------------------------------------------------
    // FIX 3: Hydrate tagihan — jumlah & sisaBayar + HYDRATE NESTED PEMBAYARAN
    // ----------------------------------------------------------------
    const hydratedTagihan = tagihan.map((t) => {
      const totalBayar = t.pembayaran.reduce(
        (sum, p) => sum + (p.jumlahBayar || 0),
        0,
      );
      const nominal = t.tarif?.nominal || 0;

      return {
        ...t,
        jumlah: t.jumlah ?? nominal,
        sisaBayar: t.sisaBayar ?? nominal - totalBayar,
        pembayaran: t.pembayaran.map((p) => hydrateSinglePembayaran(p)),
      };
    });

    // ----------------------------------------------------------------
    // FIX 4: Hydrate top-level pembayaran using the same helper
    // ----------------------------------------------------------------
    const hydratedPembayaran = pembayaran.map((p) => hydrateSinglePembayaran(p));

    // Create backup object
    const backup = {
      tahunAjaran,
      classes,
      siswa: siswaInYear,
      tagihan: hydratedTagihan,
      pembayaran: hydratedPembayaran,
      arsipDate: new Date().toISOString(),
      totalClasses: classes.length,
      totalSiswa: siswaInYear.length,
      totalTagihan: tagihan.length,
      totalPembayaran: pembayaran.length,
    };

    // Save to file
    const backupDir = path.resolve(__dirname, "../../backups");
    try {
      await fs.mkdir(backupDir, { recursive: true });
    } catch (mkdirError) {
      throw new Error(
        `Gagal membuat folder backup: ${(mkdirError as Error).message}`,
      );
    }

    const filename = `backup_${tahunAjaranId}_${Date.now()}.json`;
    const filepath = path.join(backupDir, filename);

    try {
      await fs.writeFile(filepath, JSON.stringify(backup, null, 2));
      console.log(`[Arsip] File backup berhasil disimpan di: ${filepath}`);
    } catch (writeError) {
      throw new Error(
        `Gagal menyimpan file backup: ${(writeError as Error).message}`,
      );
    }

    let deletedFromDB = false;
    let deleteMessage = "";

    // JIKA DIMINTA HAPUS SEKALIGUS
    if (shouldDelete) {
      try {
        await this.deleteArchivedData(tahunAjaranId, false); // false agar status aktif tidak hilang
        deletedFromDB = true;
        deleteMessage = " dan data telah dihapus dari database";
      } catch (deleteError: any) {
        deleteMessage = `. Namun gagal menghapus data: ${deleteError.message}`;
      }
    }

    return {
      success: true,
      message: `Data berhasil diarsipkan${deleteMessage}`,
      arsipDate: backup.arsipDate,
      totalTagihan: backup.totalTagihan,
      totalPembayaran: backup.totalPembayaran,
      filename,
      deletedFromDB,
    };
  }

  /**
   * Generate CSV from archived data
   */
  static async generateArchivedCSV(tahunAjaranId: number) {
    const backupDir = path.resolve(__dirname, "../../backups");

    console.log(`[Arsip] Mencari file backup di: ${backupDir}`);

    // Find the latest backup file for this tahun ajaran
    if (!(await fs.stat(backupDir).catch(() => false))) {
      console.error(`[Arsip] Folder backup tidak ditemukan: ${backupDir}`);
      throw new Error("Folder arsip tidak ditemukan");
    }

    const files = await fs.readdir(backupDir);
    const backupFiles = files
      .filter(
        (f) => f.startsWith(`backup_${tahunAjaranId}_`) && f.endsWith(".json"),
      )
      .sort(); // ascending; last entry is the most recent

    console.log(`[Arsip] File ditemukan:`, backupFiles);

    if (backupFiles.length === 0) {
      throw new Error("File arsip tidak ditemukan untuk tahun ajaran ini");
    }

    const backupFile = backupFiles[backupFiles.length - 1]; // most recent
    const filepath = path.join(backupDir, backupFile);
    console.log(`[Arsip] Membaca file: ${filepath}`);
    const fileContent = await fs.readFile(filepath, "utf-8");
    const backup = JSON.parse(fileContent);

    // ----------------------------------------------------------------
    // Generate CSV for Tagihan
    // FIX: tagihan.siswa.kelas is now present in backup (fixed in arsipData)
    // FIX: jumlah/sisaBayar are now hydrated (fixed in arsipData)
    // ----------------------------------------------------------------
    const tagihanCsvData = backup.tagihan.map((tagihan: any, index: number) => {
      const totalBayar = tagihan.pembayaran.reduce(
        (sum: number, p: any) => sum + (p.jumlahBayar || 0),
        0,
      );
      const nominal = tagihan.tarif?.nominal || 0;
      const sisa = nominal - totalBayar;

      return {
        No: index + 1,
        NIS: tagihan.siswa?.nis || "-",
        "Nama Siswa": tagihan.siswa?.nama || "-",
        Kelas: tagihan.siswa?.kelas?.namaKelas || "-", // now populated
        "Jenis Tagihan": tagihan.tarif?.namaTagihan || "-",
        Bulan: tagihan.bulan || "-",
        Nominal: nominal,
        "Sudah Bayar": totalBayar,
        Sisa: sisa,
        Status: tagihan.status,
      };
    });

    // ----------------------------------------------------------------
    // Generate CSV for Pembayaran
    // FIX: siswa.kelas, tagihan.jumlah, tagihan.sisaBayar now populated
    // ----------------------------------------------------------------
    const pembayaranCsvData = backup.pembayaran.map(
      (pembayaran: any, index: number) => {
        const siswa = pembayaran.siswa || pembayaran.tagihan?.siswa;

        return {
          No: index + 1,
          Tanggal: new Date(pembayaran.tanggal).toLocaleDateString("id-ID"),
          NIS: siswa?.nis || "-",
          "Nama Siswa": siswa?.nama || "-",
          Kelas: siswa?.kelas?.namaKelas || "-", // now populated
          "Jenis Tagihan": pembayaran.tagihan?.tarif?.namaTagihan || "-",
          "Nominal Tagihan": pembayaran.tagihan?.tarif?.nominal || 0,
          "Jumlah Tagihan (Arsip)": pembayaran.tagihan?.jumlah || 0, // now populated
          "Sisa Tagihan (Arsip)": pembayaran.tagihan?.sisaBayar || 0, // now populated
          "Jumlah Bayar": pembayaran.jumlahBayar || 0,
          Metode: pembayaran.metode || "-",
          "No Bukti": pembayaran.noBukti || "-",
          Keterangan: pembayaran.keterangan || "-",
        };
      },
    );

    // Create combined CSV with both sections
    let csv = "LAPORAN TAGIHAN\n";
    csv += `Tahun Ajaran: ${backup.tahunAjaran?.namaTahun} - Semester ${backup.tahunAjaran?.semester}\n`;
    csv += `Tanggal Arsip: ${new Date(backup.arsipDate).toLocaleString("id-ID")}\n\n`;

    if (tagihanCsvData.length > 0) {
      const tagihanParser = new Parser();
      csv += tagihanParser.parse(tagihanCsvData);
    }

    csv += "\n\nLAPORAN PEMBAYARAN\n\n";

    if (pembayaranCsvData.length > 0) {
      const pembayaranParser = new Parser();
      csv += pembayaranParser.parse(pembayaranCsvData);
    }

    return csv;
  }

  /**
   * Delete archived data from database
   * Only call this after arsipData() has been successfully saved
   */
  static async deleteArchivedData(
    tahunAjaranId: number,
    shouldDeactivateTahunAjaran: boolean = false,
  ) {
    // Delete in correct order to respect foreign key constraints
    await prisma.$transaction(async (tx) => {
      // 1. Delete pembayaran first
      await tx.pembayaran.deleteMany({
        where: {
          tagihan: { tahunAjaranId },
        },
      });

      // 2. Delete tagihan
      await tx.tagihan.deleteMany({
        where: { tahunAjaranId },
      });

      // 3. Mark tahun ajaran as archived (optional)
      if (shouldDeactivateTahunAjaran) {
        await tx.tahunAjaran.update({
          where: { id_tahun: tahunAjaranId },
          data: {
            isActive: false,
          },
        });
      }
    });

    return {
      success: true,
      message: "Data arsip berhasil dihapus dari database",
    };
  }

  /**
   * Restore archived data back into the database
   * Uses upsert to safely handle cases where data was NOT deleted after archiving
   */
  static async restoreData(tahunAjaranId: number) {
    const backupDir = path.resolve(__dirname, "../../backups");

    // Ambil backup terbaru untuk tahun ajaran ini
    const files = await fs.readdir(backupDir);
    const backupFiles = files
      .filter(
        (f) => f.startsWith(`backup_${tahunAjaranId}_`) && f.endsWith(".json"),
      )
      .sort();

    if (backupFiles.length === 0) {
      throw new Error("File arsip tidak ditemukan untuk tahun ajaran ini");
    }

    const backupFile = backupFiles[backupFiles.length - 1]; // paling baru
    const filepath = path.join(backupDir, backupFile);
    const fileContent = await fs.readFile(filepath, "utf-8");
    const backup = JSON.parse(fileContent);

    // ----------------------------------------------------------------
    // Validasi: pastikan relasi yang dibutuhkan masih ada di DB
    // ----------------------------------------------------------------
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id_tahun: tahunAjaranId },
    });
    if (!tahunAjaran) {
      throw new Error(
        `Tahun ajaran ID ${tahunAjaranId} tidak ditemukan di database. ` +
          "Buat ulang tahun ajaran terlebih dahulu sebelum restore.",
      );
    }

    // Kumpulkan semua id_siswa dan tarifId dari backup
    const siswaIds = [
      ...new Set<number>(
        backup.tagihan
          .map((t: any) => t.id_siswa)
          .filter((id: any): id is number => typeof id === "number"),
      ),
    ];
    const tarifIds = [
      ...new Set<number>(
        backup.tagihan
          .map((t: any) => t.tarifId)
          .filter((id: any): id is number => typeof id === "number"),
      ),
    ];

    // Cek siswa yang hilang
    const siswaDiDB = await prisma.siswa.findMany({
      where: { id_siswa: { in: siswaIds } },
      select: { id_siswa: true },
    });
    const siswaIdsDiDB = siswaDiDB.map((s) => s.id_siswa);
    const siswaHilang = siswaIds.filter((id) => !siswaIdsDiDB.includes(id));

    // Cek tarif yang hilang
    const tarifDiDB = await prisma.tarifPembayaran.findMany({
      where: { id_tarif: { in: tarifIds } },
      select: { id_tarif: true },
    });
    const tarifIdsDiDB = tarifDiDB.map((t) => t.id_tarif);
    const tarifHilang = tarifIds.filter((id) => !tarifIdsDiDB.includes(id));

    if (siswaHilang.length > 0 || tarifHilang.length > 0) {
      throw new Error(
        `Restore gagal karena ada relasi yang tidak ditemukan:\n` +
          (siswaHilang.length > 0
            ? `- Siswa ID tidak ada: ${siswaHilang.join(", ")}\n`
            : "") +
          (tarifHilang.length > 0
            ? `- Tarif ID tidak ada: ${tarifHilang.join(", ")}`
            : ""),
      );
    }

    // ----------------------------------------------------------------
    // Restore dalam satu transaksi — gunakan upsert agar aman
    // jika data belum dihapus dari DB sebelumnya (tidak duplikat)
    // ----------------------------------------------------------------
    const result = await prisma.$transaction(async (tx) => {
      let tagihanRestored = 0;
      let tagihanSkipped = 0;
      let pembayaranRestored = 0;
      let pembayaranSkipped = 0;

      // 1. Restore tagihan
      for (const tagihan of backup.tagihan) {
        const existing = await tx.tagihan.findUnique({
          where: { id_tagihan: tagihan.id_tagihan },
        });

        if (existing) {
          // Data masih ada di DB (user tidak hapus saat arsip) — skip
          tagihanSkipped++;
          continue;
        }

        await tx.tagihan.create({
          data: {
            id_tagihan: tagihan.id_tagihan,
            id_siswa: tagihan.id_siswa,
            tarifId: tagihan.tarifId,
            tahunAjaranId: tagihan.tahunAjaranId,
            bulan: tagihan.bulan,
            status: tagihan.status,
            jumlah: tagihan.jumlah,
            sisaBayar: tagihan.sisaBayar,
            jatuhTempo: tagihan.jatuhTempo
              ? new Date(tagihan.jatuhTempo)
              : null,
            createdAt: new Date(tagihan.createdAt),
            updatedAt: new Date(),
          },
        });
        tagihanRestored++;
      }

      // 2. Restore pembayaran
      // Gunakan backup.tagihan[].pembayaran (lebih lengkap, sudah tervalidasi)
      for (const tagihan of backup.tagihan) {
        for (const pembayaran of tagihan.pembayaran ?? []) {
          const existing = await tx.pembayaran.findUnique({
            where: { id_pembayaran: pembayaran.id_pembayaran },
          });

          if (existing) {
            pembayaranSkipped++;
            continue;
          }

          await tx.pembayaran.create({
            data: {
              id_pembayaran: pembayaran.id_pembayaran,
              tagihanId: tagihan.id_tagihan,
              jumlahBayar: pembayaran.jumlahBayar,
              tanggal: new Date(pembayaran.tanggal),
              metode: pembayaran.metode,
              keterangan: pembayaran.keterangan,
              noBukti: pembayaran.noBukti,
              id_siswa: pembayaran.id_siswa,
              createdAt: new Date(pembayaran.createdAt),
              updatedAt: new Date(),
            },
          });
          pembayaranRestored++;
        }
      }

      // 3. Aktifkan kembali tahun ajaran
      await tx.tahunAjaran.update({
        where: { id_tahun: tahunAjaranId },
        data: { isActive: true },
      });

      return {
        tagihanRestored,
        tagihanSkipped,
        pembayaranRestored,
        pembayaranSkipped,
      };
    });

    return {
      success: true,
      message: "Data berhasil direstore",
      backupFile,
      ...result,
    };
  }
}
