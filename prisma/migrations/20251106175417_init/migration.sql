/*
  Warnings:

  - You are about to drop the column `preffer` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `preffer`,
    MODIFY `role` ENUM('CLIENT', 'ADVERTISER') NOT NULL DEFAULT 'CLIENT';

-- CreateTable
CREATE TABLE `UserPreference` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'TRANS') NOT NULL,

    UNIQUE INDEX `UserPreference_userId_gender_key`(`userId`, `gender`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Locality` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `zone` VARCHAR(191) NULL,
    `neighborhoods` VARCHAR(191) NULL,

    UNIQUE INDEX `Locality_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Appearance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `producerId` INTEGER NOT NULL,
    `height` DOUBLE NOT NULL,
    `mannequin` INTEGER NOT NULL,
    `feet` INTEGER NOT NULL,
    `ethnicity` ENUM('ASIATICO', 'BRANCO', 'INDIGENA', 'PARDO', 'PRETO') NOT NULL,
    `hairColor` ENUM('CASTANHO', 'COLORIDO', 'GRISALHO', 'LOIRO', 'PRETO', 'RUIVO', 'SEMCABELO') NOT NULL,
    `eyesColor` ENUM('AMBAR', 'AZUIS', 'CASTANHOS', 'PRETOS', 'VERDES') NOT NULL,
    `tattoos` BOOLEAN NOT NULL,
    `piercings` BOOLEAN NOT NULL,
    `silicone` BOOLEAN NOT NULL,

    UNIQUE INDEX `Appearance_producerId_key`(`producerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Price` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `producerId` INTEGER NOT NULL,
    `duration` ENUM('MIN15', 'MIN30', 'HOUR1', 'HOURS2', 'HOURS4', 'PERNOITE', 'DIARIA') NOT NULL,
    `price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProducerLocal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `producerId` INTEGER NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `neighborhood` VARCHAR(191) NOT NULL,
    `street` VARCHAR(191) NULL,
    `number` VARCHAR(191) NULL,
    `complement` VARCHAR(191) NULL,

    UNIQUE INDEX `ProducerLocal_producerId_key`(`producerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AmenityOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `AmenityOption_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LocalAmenity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `localId` INTEGER NOT NULL,
    `amenityId` INTEGER NOT NULL,

    UNIQUE INDEX `LocalAmenity_localId_amenityId_key`(`localId`, `amenityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AudienceOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `AudienceOption_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProducerAudience` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `producerId` INTEGER NOT NULL,
    `audienceId` INTEGER NOT NULL,

    UNIQUE INDEX `ProducerAudience_producerId_audienceId_key`(`producerId`, `audienceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LocationOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `LocationOption_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProducerLocations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `producerId` INTEGER NOT NULL,
    `locationId` INTEGER NOT NULL,

    UNIQUE INDEX `ProducerLocations_producerId_locationId_key`(`producerId`, `locationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ServiceOption_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProducerService` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `producerId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,

    UNIQUE INDEX `ProducerService_producerId_serviceId_key`(`producerId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FetishOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `FetishOption_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProducerFetish` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `producerId` INTEGER NOT NULL,
    `fetishId` INTEGER NOT NULL,

    UNIQUE INDEX `ProducerFetish_producerId_fetishId_key`(`producerId`, `fetishId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PaymentOption_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProducerPayment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `producerId` INTEGER NOT NULL,
    `paymentId` INTEGER NOT NULL,

    UNIQUE INDEX `ProducerPayment_producerId_paymentId_key`(`producerId`, `paymentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `producerId` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Producer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `signature` ENUM('COPPER', 'SILVER', 'GOLD', 'DIAMOND') NOT NULL,
    `views` INTEGER NOT NULL DEFAULT 0,
    `age` INTEGER NOT NULL,
    `nationality` VARCHAR(191) NOT NULL,
    `scholarity` VARCHAR(191) NOT NULL,
    `languages` JSON NOT NULL,
    `slogan` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `instagram` VARCHAR(191) NULL,
    `telegram` VARCHAR(191) NULL,
    `hasLocal` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Producer_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserPreference` ADD CONSTRAINT `UserPreference_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Locality` ADD CONSTRAINT `Locality_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appearance` ADD CONSTRAINT `Appearance_producerId_fkey` FOREIGN KEY (`producerId`) REFERENCES `Producer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Price` ADD CONSTRAINT `Price_producerId_fkey` FOREIGN KEY (`producerId`) REFERENCES `Producer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerLocal` ADD CONSTRAINT `ProducerLocal_producerId_fkey` FOREIGN KEY (`producerId`) REFERENCES `Producer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LocalAmenity` ADD CONSTRAINT `LocalAmenity_localId_fkey` FOREIGN KEY (`localId`) REFERENCES `ProducerLocal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LocalAmenity` ADD CONSTRAINT `LocalAmenity_amenityId_fkey` FOREIGN KEY (`amenityId`) REFERENCES `AmenityOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerAudience` ADD CONSTRAINT `ProducerAudience_producerId_fkey` FOREIGN KEY (`producerId`) REFERENCES `Producer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerAudience` ADD CONSTRAINT `ProducerAudience_audienceId_fkey` FOREIGN KEY (`audienceId`) REFERENCES `AudienceOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerLocations` ADD CONSTRAINT `ProducerLocations_producerId_fkey` FOREIGN KEY (`producerId`) REFERENCES `Producer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerLocations` ADD CONSTRAINT `ProducerLocations_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `LocationOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerService` ADD CONSTRAINT `ProducerService_producerId_fkey` FOREIGN KEY (`producerId`) REFERENCES `Producer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerService` ADD CONSTRAINT `ProducerService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `ServiceOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerFetish` ADD CONSTRAINT `ProducerFetish_producerId_fkey` FOREIGN KEY (`producerId`) REFERENCES `Producer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerFetish` ADD CONSTRAINT `ProducerFetish_fetishId_fkey` FOREIGN KEY (`fetishId`) REFERENCES `FetishOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerPayment` ADD CONSTRAINT `ProducerPayment_producerId_fkey` FOREIGN KEY (`producerId`) REFERENCES `Producer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerPayment` ADD CONSTRAINT `ProducerPayment_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `PaymentOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_producerId_fkey` FOREIGN KEY (`producerId`) REFERENCES `Producer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Producer` ADD CONSTRAINT `Producer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
