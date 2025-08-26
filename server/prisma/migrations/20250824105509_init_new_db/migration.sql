/*
  Warnings:

  - The primary key for the `guru` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `guru` table. All the data in the column will be lost.
  - You are about to drop the column `mataPelajaran` on the `guru` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `guru` table. All the data in the column will be lost.
  - The primary key for the `kelas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `guruId` on the `kelas` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `kelas` table. All the data in the column will be lost.
  - You are about to drop the column `nama` on the `kelas` table. All the data in the column will be lost.
  - The primary key for the `siswa` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `siswa` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `siswa` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[guruId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[siswaId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_guru` to the `Guru` table without a default value. This is not possible if the table is not empty.
  - Added the required column `noHP` to the `Guru` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_kelas` to the `Kelas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namaKelas` to the `Kelas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tingkat` to the `Kelas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_siswa` to the `Siswa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jenisKelamin` to the `Siswa` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `guru` DROP FOREIGN KEY `Guru_userId_fkey`;

-- DropForeignKey
ALTER TABLE `kelas` DROP FOREIGN KEY `Kelas_guruId_fkey`;

-- DropForeignKey
ALTER TABLE `siswa` DROP FOREIGN KEY `Siswa_kelasId_fkey`;

-- DropForeignKey
ALTER TABLE `siswa` DROP FOREIGN KEY `Siswa_userId_fkey`;

-- DropIndex
DROP INDEX `Guru_userId_key` ON `guru`;

-- DropIndex
DROP INDEX `Kelas_guruId_fkey` ON `kelas`;

-- DropIndex
DROP INDEX `Kelas_nama_key` ON `kelas`;

-- DropIndex
DROP INDEX `Siswa_kelasId_fkey` ON `siswa`;

-- DropIndex
DROP INDEX `Siswa_userId_key` ON `siswa`;

-- AlterTable
ALTER TABLE `guru` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `mataPelajaran`,
    DROP COLUMN `userId`,
    ADD COLUMN `alamat` VARCHAR(191) NULL,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `id_guru` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `jabatan` VARCHAR(191) NULL,
    ADD COLUMN `jenisKelamin` VARCHAR(191) NULL,
    ADD COLUMN `noHP` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id_guru`);

-- AlterTable
ALTER TABLE `kelas` DROP PRIMARY KEY,
    DROP COLUMN `guruId`,
    DROP COLUMN `id`,
    DROP COLUMN `nama`,
    ADD COLUMN `id_kelas` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `namaKelas` VARCHAR(191) NOT NULL,
    ADD COLUMN `tingkat` VARCHAR(191) NOT NULL,
    ADD COLUMN `waliId` INTEGER NULL,
    ADD PRIMARY KEY (`id_kelas`);

-- AlterTable
ALTER TABLE `siswa` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `userId`,
    ADD COLUMN `id_siswa` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `jenisKelamin` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id_siswa`);

-- AlterTable
ALTER TABLE `user` DROP COLUMN `name`,
    ADD COLUMN `guruId` INTEGER NULL,
    ADD COLUMN `siswaId` INTEGER NULL,
    MODIFY `role` ENUM('ADMIN', 'GURU', 'SISWA') NOT NULL DEFAULT 'SISWA';

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
    `semester` VARCHAR(191) NOT NULL,
    `nilai` INTEGER NOT NULL,

    PRIMARY KEY (`id_nilai`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_guruId_key` ON `User`(`guruId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_siswaId_key` ON `User`(`siswaId`);

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
ALTER TABLE `NilaiRapor` ADD CONSTRAINT `NilaiRapor_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `Siswa`(`id_siswa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NilaiRapor` ADD CONSTRAINT `NilaiRapor_id_mapel_fkey` FOREIGN KEY (`id_mapel`) REFERENCES `MataPelajaran`(`id_mapel`) ON DELETE RESTRICT ON UPDATE CASCADE;
