-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'GURU', 'SISWA') NOT NULL DEFAULT 'SISWA',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `guruId` INTEGER NULL,
    `siswaId` INTEGER NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_guruId_key`(`guruId`),
    UNIQUE INDEX `users_siswaId_key`(`siswaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guru` (
    `id_guru` INTEGER NOT NULL AUTO_INCREMENT,
    `nip` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `jenisKelamin` VARCHAR(191) NULL,
    `tempatLahir` VARCHAR(191) NULL,
    `tanggalLahir` DATETIME(3) NULL,
    `alamat` TEXT NULL,
    `noHP` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `pendidikan` VARCHAR(191) NULL,
    `jabatan` VARCHAR(191) NULL,
    `statusKepegawaian` VARCHAR(191) NULL,
    `fotoProfil` VARCHAR(191) NULL,
    `isWaliKelas` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `guru_nip_key`(`nip`),
    PRIMARY KEY (`id_guru`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `siswa` (
    `id_siswa` INTEGER NOT NULL AUTO_INCREMENT,
    `nis` VARCHAR(191) NULL,
    `nisn` VARCHAR(191) NULL,
    `nama` VARCHAR(191) NOT NULL,
    `jenisKelamin` VARCHAR(191) NULL,
    `tempatLahir` VARCHAR(191) NULL,
    `tanggalLahir` DATETIME(3) NULL,
    `agama` VARCHAR(191) NULL,
    `alamat` TEXT NULL,
    `noHP` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `namaAyah` VARCHAR(191) NULL,
    `namaIbu` VARCHAR(191) NULL,
    `pekerjaanAyah` VARCHAR(191) NULL,
    `pekerjaanIbu` VARCHAR(191) NULL,
    `noTeleponOrtu` VARCHAR(191) NULL,
    `kelasId` INTEGER NULL,
    `tahunMasuk` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'AKTIF',
    `fotoProfil` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `siswa_nis_key`(`nis`),
    UNIQUE INDEX `siswa_nisn_key`(`nisn`),
    INDEX `siswa_kelasId_idx`(`kelasId`),
    PRIMARY KEY (`id_siswa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orang_tua` (
    `id_orangtua` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `hubungan` VARCHAR(191) NOT NULL,
    `pekerjaan` VARCHAR(191) NULL,
    `noHp` VARCHAR(191) NULL,
    `alamat` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_orangtua`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `siswa_orangtua` (
    `id_siswa` INTEGER NOT NULL,
    `id_orangtua` INTEGER NOT NULL,
    `status` VARCHAR(191) NULL,

    PRIMARY KEY (`id_siswa`, `id_orangtua`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kelas` (
    `id_kelas` INTEGER NOT NULL AUTO_INCREMENT,
    `namaKelas` VARCHAR(191) NOT NULL,
    `tingkat` VARCHAR(191) NOT NULL,
    `jurusan` VARCHAR(191) NULL,
    `waliId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_kelas`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KelasTahunAjaran` (
    `id_kelas_tahun` INTEGER NOT NULL AUTO_INCREMENT,
    `kelasId` INTEGER NOT NULL,
    `tahunAjaranId` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `KelasTahunAjaran_kelasId_tahunAjaranId_key`(`kelasId`, `tahunAjaranId`),
    PRIMARY KEY (`id_kelas_tahun`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mata_pelajaran` (
    `id_mapel` INTEGER NOT NULL AUTO_INCREMENT,
    `kodeMapel` VARCHAR(191) NULL,
    `namaMapel` VARCHAR(191) NOT NULL,
    `kelompokMapel` VARCHAR(191) NULL,
    `deskripsi` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `mata_pelajaran_kodeMapel_key`(`kodeMapel`),
    PRIMARY KEY (`id_mapel`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guru_mapel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_guru` INTEGER NOT NULL,
    `id_mapel` INTEGER NOT NULL,
    `id_kelas` INTEGER NOT NULL,
    `tahunAjaranId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `guru_mapel_id_guru_idx`(`id_guru`),
    INDEX `guru_mapel_id_mapel_idx`(`id_mapel`),
    INDEX `guru_mapel_id_kelas_idx`(`id_kelas`),
    INDEX `guru_mapel_tahunAjaranId_idx`(`tahunAjaranId`),
    UNIQUE INDEX `guru_mapel_id_guru_id_mapel_id_kelas_tahunAjaranId_key`(`id_guru`, `id_mapel`, `id_kelas`, `tahunAjaranId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jadwal` (
    `id_jadwal` INTEGER NOT NULL AUTO_INCREMENT,
    `guruMapelId` INTEGER NOT NULL,
    `hari` VARCHAR(191) NOT NULL,
    `jamMulai` VARCHAR(191) NOT NULL,
    `jamSelesai` VARCHAR(191) NOT NULL,
    `ruangan` VARCHAR(191) NULL,
    `keterangan` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `jadwal_guruMapelId_idx`(`guruMapelId`),
    INDEX `jadwal_hari_idx`(`hari`),
    PRIMARY KEY (`id_jadwal`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nilai_rapor` (
    `id_nilai` INTEGER NOT NULL AUTO_INCREMENT,
    `id_siswa` INTEGER NOT NULL,
    `id_mapel` INTEGER NOT NULL,
    `tahunAjaranId` INTEGER NOT NULL,
    `semester` VARCHAR(191) NOT NULL,
    `nilai` DOUBLE NOT NULL,
    `nilaiTugas` DOUBLE NULL,
    `nilaiUTS` DOUBLE NULL,
    `nilaiUAS` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `nilai_rapor_id_siswa_idx`(`id_siswa`),
    INDEX `nilai_rapor_id_mapel_idx`(`id_mapel`),
    INDEX `nilai_rapor_tahunAjaranId_idx`(`tahunAjaranId`),
    UNIQUE INDEX `nilai_rapor_id_siswa_id_mapel_tahunAjaranId_semester_key`(`id_siswa`, `id_mapel`, `tahunAjaranId`, `semester`),
    PRIMARY KEY (`id_nilai`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `absensi` (
    `id_absensi` INTEGER NOT NULL AUTO_INCREMENT,
    `id_siswa` INTEGER NOT NULL,
    `id_tahun` INTEGER NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('HADIR', 'SAKIT', 'IZIN', 'TIDAK_HADIR') NOT NULL,
    `keterangan` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `absensi_id_siswa_idx`(`id_siswa`),
    INDEX `absensi_id_tahun_idx`(`id_tahun`),
    INDEX `absensi_tanggal_idx`(`tanggal`),
    UNIQUE INDEX `absensi_id_siswa_id_tahun_tanggal_key`(`id_siswa`, `id_tahun`, `tanggal`),
    PRIMARY KEY (`id_absensi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `absensi_pertemuan` (
    `id_absensi_pertemuan` INTEGER NOT NULL AUTO_INCREMENT,
    `guruMapelId` INTEGER NOT NULL,
    `pertemuanKe` INTEGER NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `jamMulai` VARCHAR(191) NOT NULL,
    `jamSelesai` VARCHAR(191) NOT NULL,
    `materi` TEXT NULL,
    `keteranganGuru` TEXT NULL,
    `statusPertemuan` ENUM('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `absensi_pertemuan_guruMapelId_idx`(`guruMapelId`),
    INDEX `absensi_pertemuan_tanggal_idx`(`tanggal`),
    INDEX `absensi_pertemuan_statusPertemuan_idx`(`statusPertemuan`),
    UNIQUE INDEX `absensi_pertemuan_guruMapelId_tanggal_key`(`guruMapelId`, `tanggal`),
    PRIMARY KEY (`id_absensi_pertemuan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_absensi_pertemuan` (
    `id_detail_absensi` INTEGER NOT NULL AUTO_INCREMENT,
    `absensiPertemuanId` INTEGER NOT NULL,
    `siswaId` INTEGER NOT NULL,
    `status` ENUM('HADIR', 'SAKIT', 'IZIN', 'TIDAK_HADIR') NOT NULL DEFAULT 'HADIR',
    `keterangan` TEXT NULL,
    `waktuCheckIn` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `detail_absensi_pertemuan_absensiPertemuanId_idx`(`absensiPertemuanId`),
    INDEX `detail_absensi_pertemuan_siswaId_idx`(`siswaId`),
    UNIQUE INDEX `detail_absensi_pertemuan_absensiPertemuanId_siswaId_key`(`absensiPertemuanId`, `siswaId`),
    PRIMARY KEY (`id_detail_absensi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tahun_ajaran` (
    `id_tahun` INTEGER NOT NULL AUTO_INCREMENT,
    `namaTahun` VARCHAR(191) NOT NULL,
    `semester` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tahun_ajaran_namaTahun_semester_key`(`namaTahun`, `semester`),
    PRIMARY KEY (`id_tahun`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pendaftaran` (
    `id_pendaftaran` INTEGER NOT NULL AUTO_INCREMENT,
    `unitPendidikan` VARCHAR(191) NULL,
    `jenisPendaftaran` VARCHAR(191) NULL,
    `noIndukPesertaDidik` VARCHAR(191) NULL,
    `jurusan` VARCHAR(191) NULL,
    `tanggalPendaftaran` DATETIME(3) NULL,
    `nama` VARCHAR(191) NOT NULL,
    `jenisKelamin` VARCHAR(191) NULL,
    `nisn` VARCHAR(191) NULL,
    `nik` VARCHAR(191) NULL,
    `noKK` VARCHAR(191) NULL,
    `tempatLahir` VARCHAR(191) NULL,
    `tanggalLahir` DATETIME(3) NULL,
    `agama` VARCHAR(191) NULL,
    `alamat` TEXT NULL,
    `noHandphonAktif` VARCHAR(191) NULL,
    `tempatTinggal` VARCHAR(191) NULL,
    `transportasi` VARCHAR(191) NULL,
    `anakKe` VARCHAR(191) NULL,
    `penerimaKIP` VARCHAR(191) NULL,
    `noKIP` VARCHAR(191) NULL,
    `namaAyah` VARCHAR(191) NULL,
    `nikAyah` VARCHAR(191) NULL,
    `tempatLahirAyah` VARCHAR(191) NULL,
    `tanggalLahirAyah` DATETIME(3) NULL,
    `pendidikanAyah` VARCHAR(191) NULL,
    `noHPAyah` VARCHAR(191) NULL,
    `pekerjaanAyah` VARCHAR(191) NULL,
    `penghasilanAyah` VARCHAR(191) NULL,
    `namaIbu` VARCHAR(191) NULL,
    `nikIbu` VARCHAR(191) NULL,
    `tempatLahirIbu` VARCHAR(191) NULL,
    `tanggalLahirIbu` DATETIME(3) NULL,
    `pendidikanIbu` VARCHAR(191) NULL,
    `noHPIbu` VARCHAR(191) NULL,
    `pekerjaanIbu` VARCHAR(191) NULL,
    `penghasilanIbu` VARCHAR(191) NULL,
    `namaWali` VARCHAR(191) NULL,
    `nikWali` VARCHAR(191) NULL,
    `tempatLahirWali` VARCHAR(191) NULL,
    `tanggalLahirWali` DATETIME(3) NULL,
    `pendidikanWali` VARCHAR(191) NULL,
    `noWali` VARCHAR(191) NULL,
    `pekerjaanWali` VARCHAR(191) NULL,
    `penghasilanWali` VARCHAR(191) NULL,
    `tinggiBadan` VARCHAR(191) NULL,
    `beratBadan` VARCHAR(191) NULL,
    `jarakSekolah` VARCHAR(191) NULL,
    `waktuTempuh` VARCHAR(191) NULL,
    `jumlahSaudara` VARCHAR(191) NULL,
    `ijazah` VARCHAR(191) NULL,
    `skhun` VARCHAR(191) NULL,
    `kartuKeluarga` VARCHAR(191) NULL,
    `aktaKelahiran` VARCHAR(191) NULL,
    `ktpOrangTua` VARCHAR(191) NULL,
    `dokumen` JSON NULL,
    `email` VARCHAR(191) NULL,
    `noHp` VARCHAR(191) NULL,
    `asalSekolah` VARCHAR(191) NULL,
    `statusDokumen` ENUM('BELUM_DITERIMA', 'LENGKAP', 'KURANG', 'BELUM_LENGKAP') NOT NULL DEFAULT 'BELUM_DITERIMA',
    `statusPembayaran` ENUM('BELUM_BAYAR', 'LUNAS', 'CICIL') NOT NULL DEFAULT 'BELUM_BAYAR',
    `tahunAjaranId` INTEGER NOT NULL,
    `siswaId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pendaftaran_siswaId_key`(`siswaId`),
    INDEX `pendaftaran_tahunAjaranId_idx`(`tahunAjaranId`),
    INDEX `pendaftaran_statusDokumen_idx`(`statusDokumen`),
    INDEX `pendaftaran_statusPembayaran_idx`(`statusPembayaran`),
    PRIMARY KEY (`id_pendaftaran`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tarif_pembayaran` (
    `id_tarif` INTEGER NOT NULL AUTO_INCREMENT,
    `tahunAjaranId` INTEGER NOT NULL,
    `namaTagihan` VARCHAR(191) NOT NULL,
    `nominal` DOUBLE NOT NULL,
    `keterangan` VARCHAR(191) NULL,

    PRIMARY KEY (`id_tarif`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tagihan` (
    `id_tagihan` INTEGER NOT NULL AUTO_INCREMENT,
    `id_siswa` INTEGER NOT NULL,
    `tarifId` INTEGER NOT NULL,
    `tahunAjaranId` INTEGER NOT NULL,
    `bulan` VARCHAR(191) NULL,
    `status` ENUM('BELUM_BAYAR', 'LUNAS', 'CICIL') NOT NULL DEFAULT 'BELUM_BAYAR',
    `jumlah` DOUBLE NULL,
    `sisaBayar` DOUBLE NULL,
    `jatuhTempo` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `tagihan_id_siswa_idx`(`id_siswa`),
    INDEX `tagihan_tarifId_idx`(`tarifId`),
    INDEX `tagihan_tahunAjaranId_idx`(`tahunAjaranId`),
    INDEX `tagihan_status_idx`(`status`),
    PRIMARY KEY (`id_tagihan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pembayaran` (
    `id_pembayaran` INTEGER NOT NULL AUTO_INCREMENT,
    `tagihanId` INTEGER NOT NULL,
    `jumlahBayar` DOUBLE NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `metode` VARCHAR(191) NULL,
    `keterangan` VARCHAR(191) NULL,
    `noBukti` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `id_siswa` INTEGER NULL,

    INDEX `pembayaran_tagihanId_idx`(`tagihanId`),
    PRIMARY KEY (`id_pembayaran`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rapor` (
    `id_rapor` INTEGER NOT NULL AUTO_INCREMENT,
    `id_siswa` INTEGER NOT NULL,
    `tahunAjaranId` INTEGER NOT NULL,
    `semester` VARCHAR(191) NOT NULL,
    `totalHadir` INTEGER NOT NULL DEFAULT 0,
    `totalSakit` INTEGER NOT NULL DEFAULT 0,
    `totalIzin` INTEGER NOT NULL DEFAULT 0,
    `totalAlpha` INTEGER NOT NULL DEFAULT 0,
    `sikapSpritual` VARCHAR(191) NULL,
    `sikapSosial` VARCHAR(191) NULL,
    `deskripsiSpritual` TEXT NULL,
    `deskripsiSosial` TEXT NULL,
    `catatanWaliKelas` TEXT NULL,
    `ekstrakurikuler` JSON NULL,
    `prestasi` JSON NULL,
    `naik` BOOLEAN NULL,
    `kelas` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `publishedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `rapor_id_siswa_idx`(`id_siswa`),
    INDEX `rapor_tahunAjaranId_idx`(`tahunAjaranId`),
    INDEX `rapor_semester_idx`(`semester`),
    INDEX `rapor_status_idx`(`status`),
    UNIQUE INDEX `rapor_id_siswa_tahunAjaranId_semester_key`(`id_siswa`, `tahunAjaranId`, `semester`),
    PRIMARY KEY (`id_rapor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `berita` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `isi` LONGTEXT NOT NULL,
    `gambar` VARCHAR(191) NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `penulis` VARCHAR(191) NOT NULL DEFAULT 'Admin',
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_guruId_fkey` FOREIGN KEY (`guruId`) REFERENCES `guru`(`id_guru`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_siswaId_fkey` FOREIGN KEY (`siswaId`) REFERENCES `siswa`(`id_siswa`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `siswa` ADD CONSTRAINT `siswa_kelasId_fkey` FOREIGN KEY (`kelasId`) REFERENCES `kelas`(`id_kelas`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `siswa_orangtua` ADD CONSTRAINT `siswa_orangtua_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `siswa`(`id_siswa`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `siswa_orangtua` ADD CONSTRAINT `siswa_orangtua_id_orangtua_fkey` FOREIGN KEY (`id_orangtua`) REFERENCES `orang_tua`(`id_orangtua`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kelas` ADD CONSTRAINT `kelas_waliId_fkey` FOREIGN KEY (`waliId`) REFERENCES `guru`(`id_guru`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KelasTahunAjaran` ADD CONSTRAINT `KelasTahunAjaran_kelasId_fkey` FOREIGN KEY (`kelasId`) REFERENCES `kelas`(`id_kelas`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KelasTahunAjaran` ADD CONSTRAINT `KelasTahunAjaran_tahunAjaranId_fkey` FOREIGN KEY (`tahunAjaranId`) REFERENCES `tahun_ajaran`(`id_tahun`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guru_mapel` ADD CONSTRAINT `guru_mapel_id_guru_fkey` FOREIGN KEY (`id_guru`) REFERENCES `guru`(`id_guru`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guru_mapel` ADD CONSTRAINT `guru_mapel_id_mapel_fkey` FOREIGN KEY (`id_mapel`) REFERENCES `mata_pelajaran`(`id_mapel`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guru_mapel` ADD CONSTRAINT `guru_mapel_id_kelas_fkey` FOREIGN KEY (`id_kelas`) REFERENCES `kelas`(`id_kelas`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guru_mapel` ADD CONSTRAINT `guru_mapel_tahunAjaranId_fkey` FOREIGN KEY (`tahunAjaranId`) REFERENCES `tahun_ajaran`(`id_tahun`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jadwal` ADD CONSTRAINT `jadwal_guruMapelId_fkey` FOREIGN KEY (`guruMapelId`) REFERENCES `guru_mapel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_rapor` ADD CONSTRAINT `nilai_rapor_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `siswa`(`id_siswa`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_rapor` ADD CONSTRAINT `nilai_rapor_id_mapel_fkey` FOREIGN KEY (`id_mapel`) REFERENCES `mata_pelajaran`(`id_mapel`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_rapor` ADD CONSTRAINT `nilai_rapor_tahunAjaranId_fkey` FOREIGN KEY (`tahunAjaranId`) REFERENCES `tahun_ajaran`(`id_tahun`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `absensi` ADD CONSTRAINT `absensi_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `siswa`(`id_siswa`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `absensi` ADD CONSTRAINT `absensi_id_tahun_fkey` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_ajaran`(`id_tahun`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `absensi_pertemuan` ADD CONSTRAINT `absensi_pertemuan_guruMapelId_fkey` FOREIGN KEY (`guruMapelId`) REFERENCES `guru_mapel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_absensi_pertemuan` ADD CONSTRAINT `detail_absensi_pertemuan_absensiPertemuanId_fkey` FOREIGN KEY (`absensiPertemuanId`) REFERENCES `absensi_pertemuan`(`id_absensi_pertemuan`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_absensi_pertemuan` ADD CONSTRAINT `detail_absensi_pertemuan_siswaId_fkey` FOREIGN KEY (`siswaId`) REFERENCES `siswa`(`id_siswa`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pendaftaran` ADD CONSTRAINT `pendaftaran_tahunAjaranId_fkey` FOREIGN KEY (`tahunAjaranId`) REFERENCES `tahun_ajaran`(`id_tahun`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pendaftaran` ADD CONSTRAINT `pendaftaran_siswaId_fkey` FOREIGN KEY (`siswaId`) REFERENCES `siswa`(`id_siswa`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tarif_pembayaran` ADD CONSTRAINT `tarif_pembayaran_tahunAjaranId_fkey` FOREIGN KEY (`tahunAjaranId`) REFERENCES `tahun_ajaran`(`id_tahun`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tagihan` ADD CONSTRAINT `tagihan_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `siswa`(`id_siswa`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tagihan` ADD CONSTRAINT `tagihan_tarifId_fkey` FOREIGN KEY (`tarifId`) REFERENCES `tarif_pembayaran`(`id_tarif`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tagihan` ADD CONSTRAINT `tagihan_tahunAjaranId_fkey` FOREIGN KEY (`tahunAjaranId`) REFERENCES `tahun_ajaran`(`id_tahun`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pembayaran` ADD CONSTRAINT `pembayaran_tagihanId_fkey` FOREIGN KEY (`tagihanId`) REFERENCES `tagihan`(`id_tagihan`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pembayaran` ADD CONSTRAINT `pembayaran_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `siswa`(`id_siswa`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rapor` ADD CONSTRAINT `rapor_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `siswa`(`id_siswa`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rapor` ADD CONSTRAINT `rapor_tahunAjaranId_fkey` FOREIGN KEY (`tahunAjaranId`) REFERENCES `tahun_ajaran`(`id_tahun`) ON DELETE CASCADE ON UPDATE CASCADE;
