/*
  Warnings:

  - You are about to drop the column `tahunAjaranId_tahun` on the `kelas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `kelas` DROP FOREIGN KEY `Kelas_tahunAjaranId_tahun_fkey`;

-- DropIndex
DROP INDEX `Kelas_tahunAjaranId_tahun_fkey` ON `kelas`;

-- AlterTable
ALTER TABLE `kelas` DROP COLUMN `tahunAjaranId_tahun`;
