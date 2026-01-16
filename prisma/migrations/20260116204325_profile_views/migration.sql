-- AlterTable
ALTER TABLE `ProducerProfile` ADD COLUMN `lastWeekViews` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `lastWeekViewsUpdatedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `ProfileView` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `profileId` INTEGER NOT NULL,
    `viewedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProfileView_profileId_viewedAt_idx`(`profileId`, `viewedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProfileView` ADD CONSTRAINT `ProfileView_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
