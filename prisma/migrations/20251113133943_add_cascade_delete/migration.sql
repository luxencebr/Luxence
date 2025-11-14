-- DropForeignKey
ALTER TABLE `Producer` DROP FOREIGN KEY `Producer_userId_fkey`;

-- AddForeignKey
ALTER TABLE `Producer` ADD CONSTRAINT `Producer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
