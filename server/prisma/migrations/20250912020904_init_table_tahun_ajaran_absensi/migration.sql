-- AlterTable
ALTER TABLE `kelas` ADD COLUMN `tahunAjaranId` INTEGER NULL;

-- CreateTable
CREATE TABLE `TahunAjaran` (
    `id_tahun` INTEGER NOT NULL AUTO_INCREMENT,
    `namaTahun` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,

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

    PRIMARY KEY (`id_absensi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Kelas` ADD CONSTRAINT `Kelas_tahunAjaranId_fkey` FOREIGN KEY (`tahunAjaranId`) REFERENCES `TahunAjaran`(`id_tahun`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absensi` ADD CONSTRAINT `Absensi_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `Siswa`(`id_siswa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absensi` ADD CONSTRAINT `Absensi_id_tahun_fkey` FOREIGN KEY (`id_tahun`) REFERENCES `TahunAjaran`(`id_tahun`) ON DELETE RESTRICT ON UPDATE CASCADE;
