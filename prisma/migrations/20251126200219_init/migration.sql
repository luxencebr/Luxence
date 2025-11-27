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
    `neighborhood` VARCHAR(191) NULL,

    UNIQUE INDEX `Locality_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('CLIENT', 'ADVERTISER') NOT NULL DEFAULT 'CLIENT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'TRANS') NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `profileId` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Producer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `signature` ENUM('COPPER', 'SILVER', 'GOLD', 'DIAMOND') NOT NULL DEFAULT 'COPPER',
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `verificationStatus` ENUM('YELLOW', 'GREEN', 'RED') NOT NULL DEFAULT 'YELLOW',
    `birthday` DATETIME(3) NOT NULL,
    `nationality` VARCHAR(191) NOT NULL,
    `document` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `documentFrontPhoto` VARCHAR(191) NOT NULL,
    `documentBackPhoto` VARCHAR(191) NOT NULL,
    `selfieWithDocument` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Producer_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProducerProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `producerId` INTEGER NOT NULL,
    `slogan` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `images` JSON NOT NULL,
    `scholarity` VARCHAR(191) NOT NULL,
    `languages` JSON NOT NULL,
    `hasLocal` BOOLEAN NOT NULL DEFAULT false,
    `views` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `ProducerProfile_producerId_key`(`producerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProducerLocal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `profileId` INTEGER NOT NULL,
    `cep` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `neighborhood` VARCHAR(191) NOT NULL,
    `street` VARCHAR(191) NULL,
    `number` VARCHAR(191) NULL,
    `complement` VARCHAR(191) NULL,

    UNIQUE INDEX `ProducerLocal_profileId_key`(`profileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AmenityOption` (
    `id` INTEGER NOT NULL,
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
CREATE TABLE `AppearanceOption` (
    `id` INTEGER NOT NULL,
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
    `id` INTEGER NOT NULL,
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

-- CreateTable
CREATE TABLE `PaymentOption` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PaymentOption_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProducerPayment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `profileId` INTEGER NOT NULL,
    `paymentId` INTEGER NOT NULL,

    UNIQUE INDEX `ProducerPayment_profileId_paymentId_key`(`profileId`, `paymentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceOption` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ServiceOption_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProducerService` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `profileId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'neutral',

    UNIQUE INDEX `ProducerService_profileId_serviceId_key`(`profileId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FetishOption` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `FetishOption_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProducerFetish` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `profileId` INTEGER NOT NULL,
    `fetishId` INTEGER NOT NULL,

    UNIQUE INDEX `ProducerFetish_profileId_fetishId_key`(`profileId`, `fetishId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AudienceOption` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `AudienceOption_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProducerAudience` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `profileId` INTEGER NOT NULL,
    `audienceId` INTEGER NOT NULL,

    UNIQUE INDEX `ProducerAudience_profileId_audienceId_key`(`profileId`, `audienceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LocationOption` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `LocationOption_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProducerLocation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `profileId` INTEGER NOT NULL,
    `locationId` INTEGER NOT NULL,

    UNIQUE INDEX `ProducerLocation_profileId_locationId_key`(`profileId`, `locationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserPreference` ADD CONSTRAINT `UserPreference_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Locality` ADD CONSTRAINT `Locality_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Producer` ADD CONSTRAINT `Producer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerProfile` ADD CONSTRAINT `ProducerProfile_producerId_fkey` FOREIGN KEY (`producerId`) REFERENCES `Producer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerLocal` ADD CONSTRAINT `ProducerLocal_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LocalAmenity` ADD CONSTRAINT `LocalAmenity_localId_fkey` FOREIGN KEY (`localId`) REFERENCES `ProducerLocal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LocalAmenity` ADD CONSTRAINT `LocalAmenity_amenityId_fkey` FOREIGN KEY (`amenityId`) REFERENCES `AmenityOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerAppearance` ADD CONSTRAINT `ProducerAppearance_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerAppearance` ADD CONSTRAINT `ProducerAppearance_appearanceId_fkey` FOREIGN KEY (`appearanceId`) REFERENCES `AppearanceOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerPrice` ADD CONSTRAINT `ProducerPrice_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerPrice` ADD CONSTRAINT `ProducerPrice_priceId_fkey` FOREIGN KEY (`priceId`) REFERENCES `PriceOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerPayment` ADD CONSTRAINT `ProducerPayment_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerPayment` ADD CONSTRAINT `ProducerPayment_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `PaymentOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerService` ADD CONSTRAINT `ProducerService_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerService` ADD CONSTRAINT `ProducerService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `ServiceOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerFetish` ADD CONSTRAINT `ProducerFetish_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerFetish` ADD CONSTRAINT `ProducerFetish_fetishId_fkey` FOREIGN KEY (`fetishId`) REFERENCES `FetishOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerAudience` ADD CONSTRAINT `ProducerAudience_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerAudience` ADD CONSTRAINT `ProducerAudience_audienceId_fkey` FOREIGN KEY (`audienceId`) REFERENCES `AudienceOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerLocation` ADD CONSTRAINT `ProducerLocation_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerLocation` ADD CONSTRAINT `ProducerLocation_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `LocationOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
