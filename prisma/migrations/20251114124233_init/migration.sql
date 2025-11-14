/*
  Warnings:

  - You are about to drop the column `age` on the `Producer` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Producer` table. All the data in the column will be lost.
  - You are about to drop the column `hasLocal` on the `Producer` table. All the data in the column will be lost.
  - You are about to drop the column `instagram` on the `Producer` table. All the data in the column will be lost.
  - You are about to drop the column `languages` on the `Producer` table. All the data in the column will be lost.
  - You are about to drop the column `scholarity` on the `Producer` table. All the data in the column will be lost.
  - You are about to drop the column `slogan` on the `Producer` table. All the data in the column will be lost.
  - You are about to drop the column `telegram` on the `Producer` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `Producer` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `Producer` table. All the data in the column will be lost.
  - You are about to drop the column `producerId` on the `ProducerAudience` table. All the data in the column will be lost.
  - You are about to drop the column `producerId` on the `ProducerFetish` table. All the data in the column will be lost.
  - You are about to drop the column `producerId` on the `ProducerLocal` table. All the data in the column will be lost.
  - You are about to drop the column `producerId` on the `ProducerLocations` table. All the data in the column will be lost.
  - You are about to drop the column `producerId` on the `ProducerPayment` table. All the data in the column will be lost.
  - You are about to drop the column `producerId` on the `ProducerService` table. All the data in the column will be lost.
  - You are about to drop the column `producerId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the `Appearance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Price` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[profileId,audienceId]` on the table `ProducerAudience` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,fetishId]` on the table `ProducerFetish` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId]` on the table `ProducerLocal` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,locationId]` on the table `ProducerLocations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,paymentId]` on the table `ProducerPayment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,serviceId]` on the table `ProducerService` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `birthday` to the `Producer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document` to the `Producer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documentBackPhoto` to the `Producer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documentFrontPhoto` to the `Producer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selfieWithDocument` to the `Producer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `ProducerAudience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `ProducerFetish` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `ProducerLocal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `ProducerLocations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `ProducerPayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `ProducerService` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Appearance` DROP FOREIGN KEY `Appearance_producerId_fkey`;

-- DropForeignKey
ALTER TABLE `Price` DROP FOREIGN KEY `Price_producerId_fkey`;

-- DropForeignKey
ALTER TABLE `ProducerAudience` DROP FOREIGN KEY `ProducerAudience_producerId_fkey`;

-- DropForeignKey
ALTER TABLE `ProducerFetish` DROP FOREIGN KEY `ProducerFetish_producerId_fkey`;

-- DropForeignKey
ALTER TABLE `ProducerLocal` DROP FOREIGN KEY `ProducerLocal_producerId_fkey`;

-- DropForeignKey
ALTER TABLE `ProducerLocations` DROP FOREIGN KEY `ProducerLocations_producerId_fkey`;

-- DropForeignKey
ALTER TABLE `ProducerPayment` DROP FOREIGN KEY `ProducerPayment_producerId_fkey`;

-- DropForeignKey
ALTER TABLE `ProducerService` DROP FOREIGN KEY `ProducerService_producerId_fkey`;

-- DropForeignKey
ALTER TABLE `Review` DROP FOREIGN KEY `Review_producerId_fkey`;

-- DropIndex
DROP INDEX `ProducerAudience_producerId_audienceId_key` ON `ProducerAudience`;

-- DropIndex
DROP INDEX `ProducerFetish_producerId_fetishId_key` ON `ProducerFetish`;

-- DropIndex
DROP INDEX `ProducerLocal_producerId_key` ON `ProducerLocal`;

-- DropIndex
DROP INDEX `ProducerLocations_producerId_locationId_key` ON `ProducerLocations`;

-- DropIndex
DROP INDEX `ProducerPayment_producerId_paymentId_key` ON `ProducerPayment`;

-- DropIndex
DROP INDEX `ProducerService_producerId_serviceId_key` ON `ProducerService`;

-- DropIndex
DROP INDEX `Review_producerId_fkey` ON `Review`;

-- AlterTable
ALTER TABLE `Producer` DROP COLUMN `age`,
    DROP COLUMN `description`,
    DROP COLUMN `hasLocal`,
    DROP COLUMN `instagram`,
    DROP COLUMN `languages`,
    DROP COLUMN `scholarity`,
    DROP COLUMN `slogan`,
    DROP COLUMN `telegram`,
    DROP COLUMN `verified`,
    DROP COLUMN `views`,
    ADD COLUMN `birthday` DATETIME(3) NOT NULL,
    ADD COLUMN `document` VARCHAR(191) NOT NULL,
    ADD COLUMN `documentBackPhoto` VARCHAR(191) NOT NULL,
    ADD COLUMN `documentFrontPhoto` VARCHAR(191) NOT NULL,
    ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `selfieWithDocument` VARCHAR(191) NOT NULL,
    ADD COLUMN `verificationStatus` ENUM('YELLOW', 'GREEN', 'RED') NOT NULL DEFAULT 'YELLOW';

-- AlterTable
ALTER TABLE `ProducerAudience` DROP COLUMN `producerId`,
    ADD COLUMN `profileId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `ProducerFetish` DROP COLUMN `producerId`,
    ADD COLUMN `profileId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `ProducerLocal` DROP COLUMN `producerId`,
    ADD COLUMN `profileId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `ProducerLocations` DROP COLUMN `producerId`,
    ADD COLUMN `profileId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `ProducerPayment` DROP COLUMN `producerId`,
    ADD COLUMN `profileId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `ProducerService` DROP COLUMN `producerId`,
    ADD COLUMN `profileId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Review` DROP COLUMN `producerId`,
    ADD COLUMN `profileId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `Appearance`;

-- DropTable
DROP TABLE `Price`;

-- CreateTable
CREATE TABLE `ProducerProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `producerId` INTEGER NOT NULL,
    `slogan` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `scholarity` VARCHAR(191) NOT NULL,
    `languages` JSON NOT NULL,
    `hasLocal` BOOLEAN NOT NULL DEFAULT false,
    `views` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `ProducerProfile_producerId_key`(`producerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppearanceOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `AppearanceOption_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProducerAppearance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `profileId` INTEGER NOT NULL,
    `appearanceId` INTEGER NOT NULL,
    `height` DOUBLE NULL,
    `mannequin` INTEGER NULL,
    `feet` INTEGER NULL,
    `tattoos` BOOLEAN NULL,
    `piercings` BOOLEAN NULL,
    `silicone` BOOLEAN NULL,

    UNIQUE INDEX `ProducerAppearance_profileId_appearanceId_key`(`profileId`, `appearanceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PriceOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PriceOption_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProducerPrice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `profileId` INTEGER NOT NULL,
    `priceId` INTEGER NOT NULL,
    `value` DOUBLE NOT NULL,

    UNIQUE INDEX `ProducerPrice_profileId_priceId_key`(`profileId`, `priceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `ProducerAudience_profileId_audienceId_key` ON `ProducerAudience`(`profileId`, `audienceId`);

-- CreateIndex
CREATE UNIQUE INDEX `ProducerFetish_profileId_fetishId_key` ON `ProducerFetish`(`profileId`, `fetishId`);

-- CreateIndex
CREATE UNIQUE INDEX `ProducerLocal_profileId_key` ON `ProducerLocal`(`profileId`);

-- CreateIndex
CREATE UNIQUE INDEX `ProducerLocations_profileId_locationId_key` ON `ProducerLocations`(`profileId`, `locationId`);

-- CreateIndex
CREATE UNIQUE INDEX `ProducerPayment_profileId_paymentId_key` ON `ProducerPayment`(`profileId`, `paymentId`);

-- CreateIndex
CREATE UNIQUE INDEX `ProducerService_profileId_serviceId_key` ON `ProducerService`(`profileId`, `serviceId`);

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerProfile` ADD CONSTRAINT `ProducerProfile_producerId_fkey` FOREIGN KEY (`producerId`) REFERENCES `Producer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerLocal` ADD CONSTRAINT `ProducerLocal_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerAppearance` ADD CONSTRAINT `ProducerAppearance_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerAppearance` ADD CONSTRAINT `ProducerAppearance_appearanceId_fkey` FOREIGN KEY (`appearanceId`) REFERENCES `AppearanceOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerPrice` ADD CONSTRAINT `ProducerPrice_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerPrice` ADD CONSTRAINT `ProducerPrice_priceId_fkey` FOREIGN KEY (`priceId`) REFERENCES `PriceOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerService` ADD CONSTRAINT `ProducerService_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerFetish` ADD CONSTRAINT `ProducerFetish_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerAudience` ADD CONSTRAINT `ProducerAudience_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerLocations` ADD CONSTRAINT `ProducerLocations_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerPayment` ADD CONSTRAINT `ProducerPayment_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
