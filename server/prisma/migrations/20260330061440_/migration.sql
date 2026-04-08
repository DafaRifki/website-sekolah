-- CreateTable
CREATE TABLE `struktur_organisasi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kategori` VARCHAR(191) NOT NULL,
    `jabatan` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `foto` VARCHAR(191) NOT NULL,
    `ttl` VARCHAR(191) NULL,
    `alamat` VARCHAR(191) NULL,
    `telp` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
