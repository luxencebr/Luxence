-- DropForeignKey
ALTER TABLE `UserPreference` DROP FOREIGN KEY `UserPreference_userId_fkey`;

-- AddForeignKey
ALTER TABLE `UserPreference` ADD CONSTRAINT `UserPreference_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
