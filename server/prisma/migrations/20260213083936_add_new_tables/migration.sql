/*
  Warnings:

  - You are about to alter the column `jumlahBayar` on the `pembayaran` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to drop the `matapelajaran` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `nilairapor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orangtua` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tahunajaran` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tarifpembayaran` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id_siswa,id_tahun,tanggal]` on the table `absensi` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nisn]` on the table `siswa` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `absensi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `guru` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `kelas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `pembayaran` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `siswa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tagihan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `absensi` DROP FOREIGN KEY `Absensi_id_siswa_fkey`;

-- DropForeignKey
ALTER TABLE `absensi` DROP FOREIGN KEY `Absensi_id_tahun_fkey`;

-- DropForeignKey
ALTER TABLE `kelas` DROP FOREIGN KEY `Kelas_waliId_fkey`;

-- DropForeignKey
ALTER TABLE `kelastahunajaran` DROP FOREIGN KEY `KelasTahunAjaran_tahunAjaranId_fkey`;

-- DropForeignKey
ALTER TABLE `nilairapor` DROP FOREIGN KEY `NilaiRapor_id_mapel_fkey`;

-- DropForeignKey
ALTER TABLE `nilairapor` DROP FOREIGN KEY `NilaiRapor_id_siswa_fkey`;

-- DropForeignKey
ALTER TABLE `nilairapor` DROP FOREIGN KEY `NilaiRapor_tahunAjaranId_fkey`;

-- DropForeignKey
ALTER TABLE `pembayaran` DROP FOREIGN KEY `Pembayaran_tagihanId_fkey`;

-- DropForeignKey
ALTER TABLE `pendaftaran` DROP FOREIGN KEY `Pendaftaran_siswaId_fkey`;

-- DropForeignKey
ALTER TABLE `pendaftaran` DROP FOREIGN KEY `Pendaftaran_tahunAjaranId_fkey`;

-- DropForeignKey
ALTER TABLE `siswa` DROP FOREIGN KEY `Siswa_kelasId_fkey`;

-- DropForeignKey
ALTER TABLE `siswa_orangtua` DROP FOREIGN KEY `Siswa_Orangtua_id_orangtua_fkey`;

-- DropForeignKey
ALTER TABLE `siswa_orangtua` DROP FOREIGN KEY `Siswa_Orangtua_id_siswa_fkey`;

-- DropForeignKey
ALTER TABLE `tagihan` DROP FOREIGN KEY `Tagihan_id_siswa_fkey`;

-- DropForeignKey
ALTER TABLE `tagihan` DROP FOREIGN KEY `Tagihan_tahunAjaranId_fkey`;

-- DropForeignKey
ALTER TABLE `tagihan` DROP FOREIGN KEY `Tagihan_tarifId_fkey`;

-- DropForeignKey
ALTER TABLE `tarifpembayaran` DROP FOREIGN KEY `TarifPembayaran_tahunAjaranId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_guruId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_siswaId_fkey`;

-- DropIndex
DROP INDEX `Absensi_id_siswa_tanggal_id_tahun_key` ON `absensi`;

-- DropIndex
DROP INDEX `KelasTahunAjaran_tahunAjaranId_fkey` ON `kelastahunajaran`;

-- DropIndex
DROP INDEX `Siswa_Orangtua_id_orangtua_fkey` ON `siswa_orangtua`;

-- DropIndex
DROP INDEX `Tagihan_id_siswa_tarifId_tahunAjaranId_bulan_key` ON `tagihan`;

-- AlterTable
ALTER TABLE `absensi` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `keterangan` TEXT NULL;

-- AlterTable
ALTER TABLE `guru` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `isWaliKelas` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `pendidikan` VARCHAR(191) NULL,
    ADD COLUMN `statusKepegawaian` VARCHAR(191) NULL,
    ADD COLUMN `tanggalLahir` DATETIME(3) NULL,
    ADD COLUMN `tempatLahir` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `alamat` TEXT NULL,
    MODIFY `noHP` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `kelas` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `jurusan` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `pembayaran` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `id_siswa` INTEGER NULL,
    ADD COLUMN `noBukti` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `jumlahBayar` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `pendaftaran` ADD COLUMN `dokumen` JSON NULL,
    MODIFY `statusDokumen` ENUM('BELUM_DITERIMA', 'LENGKAP', 'KURANG', 'BELUM_LENGKAP') NOT NULL DEFAULT 'BELUM_DITERIMA';

-- AlterTable
ALTER TABLE `siswa` ADD COLUMN `agama` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `namaAyah` VARCHAR(191) NULL,
    ADD COLUMN `namaIbu` VARCHAR(191) NULL,
    ADD COLUMN `nisn` VARCHAR(191) NULL,
    ADD COLUMN `noHP` VARCHAR(191) NULL,
    ADD COLUMN `noTeleponOrtu` VARCHAR(191) NULL,
    ADD COLUMN `pekerjaanAyah` VARCHAR(191) NULL,
    ADD COLUMN `pekerjaanIbu` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'AKTIF',
    ADD COLUMN `tahunMasuk` INTEGER NULL,
    ADD COLUMN `tempatLahir` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `alamat` TEXT NULL;

-- AlterTable
ALTER TABLE `siswa_orangtua` MODIFY `status` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `tagihan` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `jatuhTempo` DATETIME(3) NULL,
    ADD COLUMN `jumlah` DOUBLE NULL,
    ADD COLUMN `sisaBayar` DOUBLE NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- DropTable
DROP TABLE `matapelajaran`;

-- DropTable
DROP TABLE `nilairapor`;

-- DropTable
DROP TABLE `orangtua`;

-- DropTable
DROP TABLE `tahunajaran`;

-- DropTable
DROP TABLE `tarifpembayaran`;

-- DropTable
DROP TABLE `user`;

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
CREATE TABLE `tarif_pembayaran` (
    `id_tarif` INTEGER NOT NULL AUTO_INCREMENT,
    `tahunAjaranId` INTEGER NOT NULL,
    `namaTagihan` VARCHAR(191) NOT NULL,
    `nominal` DOUBLE NOT NULL,
    `keterangan` VARCHAR(191) NULL,

    PRIMARY KEY (`id_tarif`)
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

-- CreateIndex
CREATE UNIQUE INDEX `absensi_id_siswa_id_tahun_tanggal_key` ON `absensi`(`id_siswa`, `id_tahun`, `tanggal`);

-- CreateIndex
CREATE UNIQUE INDEX `siswa_nisn_key` ON `siswa`(`nisn`);

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

-- RenameIndex
ALTER TABLE `absensi` RENAME INDEX `Absensi_id_siswa_idx` TO `absensi_id_siswa_idx`;

-- RenameIndex
ALTER TABLE `absensi` RENAME INDEX `Absensi_id_tahun_idx` TO `absensi_id_tahun_idx`;

-- RenameIndex
ALTER TABLE `absensi` RENAME INDEX `Absensi_tanggal_idx` TO `absensi_tanggal_idx`;

-- RenameIndex
ALTER TABLE `guru` RENAME INDEX `Guru_nip_key` TO `guru_nip_key`;

-- RenameIndex
ALTER TABLE `pembayaran` RENAME INDEX `Pembayaran_tagihanId_idx` TO `pembayaran_tagihanId_idx`;

-- RenameIndex
ALTER TABLE `pendaftaran` RENAME INDEX `Pendaftaran_siswaId_key` TO `pendaftaran_siswaId_key`;

-- RenameIndex
ALTER TABLE `pendaftaran` RENAME INDEX `Pendaftaran_statusDokumen_idx` TO `pendaftaran_statusDokumen_idx`;

-- RenameIndex
ALTER TABLE `pendaftaran` RENAME INDEX `Pendaftaran_statusPembayaran_idx` TO `pendaftaran_statusPembayaran_idx`;

-- RenameIndex
ALTER TABLE `pendaftaran` RENAME INDEX `Pendaftaran_tahunAjaranId_idx` TO `pendaftaran_tahunAjaranId_idx`;

-- RenameIndex
ALTER TABLE `siswa` RENAME INDEX `Siswa_kelasId_fkey` TO `siswa_kelasId_idx`;

-- RenameIndex
ALTER TABLE `siswa` RENAME INDEX `Siswa_nis_key` TO `siswa_nis_key`;

-- RenameIndex
ALTER TABLE `tagihan` RENAME INDEX `Tagihan_id_siswa_idx` TO `tagihan_id_siswa_idx`;

-- RenameIndex
ALTER TABLE `tagihan` RENAME INDEX `Tagihan_status_idx` TO `tagihan_status_idx`;

-- RenameIndex
ALTER TABLE `tagihan` RENAME INDEX `Tagihan_tahunAjaranId_idx` TO `tagihan_tahunAjaranId_idx`;

-- RenameIndex
ALTER TABLE `tagihan` RENAME INDEX `Tagihan_tarifId_idx` TO `tagihan_tarifId_idx`;
