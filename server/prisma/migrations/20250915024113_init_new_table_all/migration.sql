-- CreateTable
CREATE TABLE `Pendaftaran` (
    `id_pendaftaran` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NULL,
    `tanggalLahir` DATETIME(3) NULL,
    `jenisKelamin` VARCHAR(191) NULL,
    `noHp` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `statusDokumen` ENUM('BELUM_DITERIMA', 'LENGKAP', 'KURANG') NOT NULL DEFAULT 'BELUM_DITERIMA',
    `statusPembayaran` ENUM('BELUM_BAYAR', 'LUNAS', 'CICIL') NOT NULL DEFAULT 'BELUM_BAYAR',
    `tahunAjaranId` INTEGER NOT NULL,
    `siswaId` INTEGER NULL,

    PRIMARY KEY (`id_pendaftaran`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TarifPembayaran` (
    `id_tarif` INTEGER NOT NULL AUTO_INCREMENT,
    `tahunAjaranId` INTEGER NOT NULL,
    `nominal` INTEGER NOT NULL,
    `keterangan` VARCHAR(191) NULL,

    PRIMARY KEY (`id_tarif`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Pendaftaran` ADD CONSTRAINT `Pendaftaran_tahunAjaranId_fkey` FOREIGN KEY (`tahunAjaranId`) REFERENCES `TahunAjaran`(`id_tahun`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pendaftaran` ADD CONSTRAINT `Pendaftaran_siswaId_fkey` FOREIGN KEY (`siswaId`) REFERENCES `Siswa`(`id_siswa`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TarifPembayaran` ADD CONSTRAINT `TarifPembayaran_tahunAjaranId_fkey` FOREIGN KEY (`tahunAjaranId`) REFERENCES `TahunAjaran`(`id_tahun`) ON DELETE RESTRICT ON UPDATE CASCADE;
