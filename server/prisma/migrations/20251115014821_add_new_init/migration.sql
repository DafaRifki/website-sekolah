-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'GURU', 'SISWA') NOT NULL DEFAULT 'SISWA',
    `guruId` INTEGER NULL,
    `siswaId` INTEGER NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_guruId_key`(`guruId`),
    UNIQUE INDEX `User_siswaId_key`(`siswaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Guru` (
    `id_guru` INTEGER NOT NULL AUTO_INCREMENT,
    `nip` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `jenisKelamin` VARCHAR(191) NULL,
    `alamat` VARCHAR(191) NULL,
    `noHP` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `jabatan` VARCHAR(191) NULL,
    `fotoProfil` VARCHAR(191) NULL,

    UNIQUE INDEX `Guru_nip_key`(`nip`),
    PRIMARY KEY (`id_guru`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Siswa` (
    `id_siswa` INTEGER NOT NULL AUTO_INCREMENT,
    `nis` VARCHAR(191) NULL,
    `nama` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NULL,
    `tanggalLahir` DATETIME(3) NULL,
    `jenisKelamin` VARCHAR(191) NULL,
    `fotoProfil` VARCHAR(191) NULL,
    `kelasId` INTEGER NULL,

    UNIQUE INDEX `Siswa_nis_key`(`nis`),
    PRIMARY KEY (`id_siswa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrangTua` (
    `id_orangtua` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `hubungan` VARCHAR(191) NOT NULL,
    `pekerjaan` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `noHp` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_orangtua`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Siswa_Orangtua` (
    `id_siswa` INTEGER NOT NULL,
    `id_orangtua` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_siswa`, `id_orangtua`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kelas` (
    `id_kelas` INTEGER NOT NULL AUTO_INCREMENT,
    `namaKelas` VARCHAR(191) NOT NULL,
    `tingkat` VARCHAR(191) NOT NULL,
    `waliId` INTEGER NULL,

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
CREATE TABLE `MataPelajaran` (
    `id_mapel` INTEGER NOT NULL AUTO_INCREMENT,
    `namaMapel` VARCHAR(191) NOT NULL,
    `kelompokMapel` VARCHAR(191) NULL,

    PRIMARY KEY (`id_mapel`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NilaiRapor` (
    `id_nilai` INTEGER NOT NULL AUTO_INCREMENT,
    `id_siswa` INTEGER NOT NULL,
    `id_mapel` INTEGER NOT NULL,
    `tahunAjaranId` INTEGER NOT NULL,
    `semester` VARCHAR(191) NOT NULL,
    `nilai` INTEGER NOT NULL,

    INDEX `NilaiRapor_id_siswa_idx`(`id_siswa`),
    INDEX `NilaiRapor_id_mapel_idx`(`id_mapel`),
    INDEX `NilaiRapor_tahunAjaranId_idx`(`tahunAjaranId`),
    UNIQUE INDEX `NilaiRapor_id_siswa_id_mapel_tahunAjaranId_semester_key`(`id_siswa`, `id_mapel`, `tahunAjaranId`, `semester`),
    PRIMARY KEY (`id_nilai`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TahunAjaran` (
    `id_tahun` INTEGER NOT NULL AUTO_INCREMENT,
    `namaTahun` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `semester` INTEGER NOT NULL DEFAULT 1,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TahunAjaran_isActive_idx`(`isActive`),
    INDEX `TahunAjaran_startDate_endDate_idx`(`startDate`, `endDate`),
    UNIQUE INDEX `TahunAjaran_namaTahun_semester_key`(`namaTahun`, `semester`),
    PRIMARY KEY (`id_tahun`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Absensi` (
    `id_absensi` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('HADIR', 'SAKIT', 'IZIN', 'TIDAK_HADIR') NOT NULL,
    `keterangan` VARCHAR(191) NULL,
    `id_siswa` INTEGER NOT NULL,
    `id_tahun` INTEGER NOT NULL,

    INDEX `Absensi_id_siswa_idx`(`id_siswa`),
    INDEX `Absensi_tanggal_idx`(`tanggal`),
    INDEX `Absensi_id_tahun_idx`(`id_tahun`),
    UNIQUE INDEX `Absensi_id_siswa_tanggal_id_tahun_key`(`id_siswa`, `tanggal`, `id_tahun`),
    PRIMARY KEY (`id_absensi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pendaftaran` (
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
    `email` VARCHAR(191) NULL,
    `noHp` VARCHAR(191) NULL,
    `asalSekolah` VARCHAR(191) NULL,
    `statusDokumen` ENUM('BELUM_DITERIMA', 'LENGKAP', 'KURANG') NOT NULL DEFAULT 'BELUM_DITERIMA',
    `statusPembayaran` ENUM('BELUM_BAYAR', 'LUNAS', 'CICIL') NOT NULL DEFAULT 'BELUM_BAYAR',
    `tahunAjaranId` INTEGER NOT NULL,
    `siswaId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Pendaftaran_siswaId_key`(`siswaId`),
    INDEX `Pendaftaran_tahunAjaranId_idx`(`tahunAjaranId`),
    INDEX `Pendaftaran_statusDokumen_idx`(`statusDokumen`),
    INDEX `Pendaftaran_statusPembayaran_idx`(`statusPembayaran`),
    PRIMARY KEY (`id_pendaftaran`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TarifPembayaran` (
    `id_tarif` INTEGER NOT NULL AUTO_INCREMENT,
    `tahunAjaranId` INTEGER NOT NULL,
    `namaTagihan` VARCHAR(191) NOT NULL,
    `nominal` INTEGER NOT NULL,
    `keterangan` VARCHAR(191) NULL,

    PRIMARY KEY (`id_tarif`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tagihan` (
    `id_tagihan` INTEGER NOT NULL AUTO_INCREMENT,
    `id_siswa` INTEGER NOT NULL,
    `tarifId` INTEGER NOT NULL,
    `tahunAjaranId` INTEGER NOT NULL,
    `bulan` VARCHAR(191) NULL,
    `status` ENUM('BELUM_BAYAR', 'LUNAS', 'CICIL') NOT NULL DEFAULT 'BELUM_BAYAR',

    INDEX `Tagihan_id_siswa_idx`(`id_siswa`),
    INDEX `Tagihan_tarifId_idx`(`tarifId`),
    INDEX `Tagihan_tahunAjaranId_idx`(`tahunAjaranId`),
    INDEX `Tagihan_status_idx`(`status`),
    UNIQUE INDEX `Tagihan_id_siswa_tarifId_tahunAjaranId_bulan_key`(`id_siswa`, `tarifId`, `tahunAjaranId`, `bulan`),
    PRIMARY KEY (`id_tagihan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pembayaran` (
    `id_pembayaran` INTEGER NOT NULL AUTO_INCREMENT,
    `tagihanId` INTEGER NOT NULL,
    `jumlahBayar` INTEGER NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `metode` VARCHAR(191) NULL,
    `keterangan` VARCHAR(191) NULL,

    INDEX `Pembayaran_tagihanId_idx`(`tagihanId`),
    PRIMARY KEY (`id_pembayaran`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_guruId_fkey` FOREIGN KEY (`guruId`) REFERENCES `Guru`(`id_guru`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_siswaId_fkey` FOREIGN KEY (`siswaId`) REFERENCES `Siswa`(`id_siswa`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Siswa` ADD CONSTRAINT `Siswa_kelasId_fkey` FOREIGN KEY (`kelasId`) REFERENCES `Kelas`(`id_kelas`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Siswa_Orangtua` ADD CONSTRAINT `Siswa_Orangtua_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `Siswa`(`id_siswa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Siswa_Orangtua` ADD CONSTRAINT `Siswa_Orangtua_id_orangtua_fkey` FOREIGN KEY (`id_orangtua`) REFERENCES `OrangTua`(`id_orangtua`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kelas` ADD CONSTRAINT `Kelas_waliId_fkey` FOREIGN KEY (`waliId`) REFERENCES `Guru`(`id_guru`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KelasTahunAjaran` ADD CONSTRAINT `KelasTahunAjaran_kelasId_fkey` FOREIGN KEY (`kelasId`) REFERENCES `Kelas`(`id_kelas`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KelasTahunAjaran` ADD CONSTRAINT `KelasTahunAjaran_tahunAjaranId_fkey` FOREIGN KEY (`tahunAjaranId`) REFERENCES `TahunAjaran`(`id_tahun`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NilaiRapor` ADD CONSTRAINT `NilaiRapor_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `Siswa`(`id_siswa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NilaiRapor` ADD CONSTRAINT `NilaiRapor_id_mapel_fkey` FOREIGN KEY (`id_mapel`) REFERENCES `MataPelajaran`(`id_mapel`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NilaiRapor` ADD CONSTRAINT `NilaiRapor_tahunAjaranId_fkey` FOREIGN KEY (`tahunAjaranId`) REFERENCES `TahunAjaran`(`id_tahun`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absensi` ADD CONSTRAINT `Absensi_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `Siswa`(`id_siswa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absensi` ADD CONSTRAINT `Absensi_id_tahun_fkey` FOREIGN KEY (`id_tahun`) REFERENCES `TahunAjaran`(`id_tahun`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pendaftaran` ADD CONSTRAINT `Pendaftaran_tahunAjaranId_fkey` FOREIGN KEY (`tahunAjaranId`) REFERENCES `TahunAjaran`(`id_tahun`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pendaftaran` ADD CONSTRAINT `Pendaftaran_siswaId_fkey` FOREIGN KEY (`siswaId`) REFERENCES `Siswa`(`id_siswa`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TarifPembayaran` ADD CONSTRAINT `TarifPembayaran_tahunAjaranId_fkey` FOREIGN KEY (`tahunAjaranId`) REFERENCES `TahunAjaran`(`id_tahun`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tagihan` ADD CONSTRAINT `Tagihan_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `Siswa`(`id_siswa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tagihan` ADD CONSTRAINT `Tagihan_tarifId_fkey` FOREIGN KEY (`tarifId`) REFERENCES `TarifPembayaran`(`id_tarif`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tagihan` ADD CONSTRAINT `Tagihan_tahunAjaranId_fkey` FOREIGN KEY (`tahunAjaranId`) REFERENCES `TahunAjaran`(`id_tahun`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pembayaran` ADD CONSTRAINT `Pembayaran_tagihanId_fkey` FOREIGN KEY (`tagihanId`) REFERENCES `Tagihan`(`id_tagihan`) ON DELETE RESTRICT ON UPDATE CASCADE;
