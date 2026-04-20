-- CreateTable
CREATE TABLE `SubscriptionNotification` (
    `id` VARCHAR(191) NOT NULL,
    `subscriptionId` VARCHAR(191) NOT NULL,
    `type` ENUM('WELCOME', 'REMINDER', 'LAST_DAY', 'EXPIRED') NOT NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `emailSent` BOOLEAN NOT NULL DEFAULT true,
    `metadata` JSON NULL,

    INDEX `SubscriptionNotification_subscriptionId_idx`(`subscriptionId`),
    INDEX `SubscriptionNotification_type_idx`(`type`),
    INDEX `SubscriptionNotification_sentAt_idx`(`sentAt`),
    UNIQUE INDEX `SubscriptionNotification_subscriptionId_type_key`(`subscriptionId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SubscriptionNotification` ADD CONSTRAINT `SubscriptionNotification_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `Subscription`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;