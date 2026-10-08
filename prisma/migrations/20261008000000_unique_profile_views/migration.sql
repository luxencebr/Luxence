CREATE TABLE `ProfileVisitor` (
    `profileId` INTEGER NOT NULL,
    `visitorHash` CHAR(64) NOT NULL,
    `lastCountedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`profileId`,`visitorHash`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ProfileVisitor` ADD CONSTRAINT `ProfileVisitor_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
