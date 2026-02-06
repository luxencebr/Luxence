-- CreateTable
CREATE TABLE `HomeSliderImage` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `originalUrl` VARCHAR(191) NULL,
    `cropX` DOUBLE NULL,
    `cropY` DOUBLE NULL,
    `cropWidth` DOUBLE NULL,
    `cropHeight` DOUBLE NULL,
    `cropZoom` DOUBLE NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
