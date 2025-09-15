/*
  Warnings:

  - You are about to drop the column `tahunAjaranId` on the `kelas` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `tahunajaran` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `kelas` DROP FOREIGN KEY `Kelas_tahunAjaranId_fkey`;

-- DropIndex
DROP INDEX `Kelas_tahunAjaranId_fkey` ON `kelas`;

-- AlterTable
ALTER TABLE `kelas` DROP COLUMN `tahunAjaranId`,
    ADD COLUMN `tahunAjaranId_tahun` INTEGER NULL;

-- AlterTable
ALTER TABLE `tahunajaran` DROP COLUMN `isActive`;

-- CreateTable
CREATE TABLE `KelasTahunAjaran` (
    `id_kelas_tahun` INTEGER NOT NULL AUTO_INCREMENT,
    `kelasId` INTEGER NOT NULL,
    `tahunAjaranId` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `KelasTahunAjaran_kelasId_tahunAjaranId_key`(`kelasId`, `tahunAjaranId`),
    PRIMARY KEY (`id_kelas_tahun`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Kelas` ADD CONSTRAINT `Kelas_tahunAjaranId_tahun_fkey` FOREIGN KEY (`tahunAjaranId_tahun`) REFERENCES `TahunAjaran`(`id_tahun`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KelasTahunAjaran` ADD CONSTRAINT `KelasTahunAjaran_kelasId_fkey` FOREIGN KEY (`kelasId`) REFERENCES `Kelas`(`id_kelas`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KelasTahunAjaran` ADD CONSTRAINT `KelasTahunAjaran_tahunAjaranId_fkey` FOREIGN KEY (`tahunAjaranId`) REFERENCES `TahunAjaran`(`id_tahun`) ON DELETE RESTRICT ON UPDATE CASCADE;
