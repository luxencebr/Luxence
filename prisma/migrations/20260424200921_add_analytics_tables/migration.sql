-- CreateTable
CREATE TABLE `AnalyticsSession` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `fingerprint` VARCHAR(191) NOT NULL,
    `userId` INTEGER NULL,
    `ipAddress` VARCHAR(191) NOT NULL,
    `userAgent` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `deviceType` VARCHAR(191) NOT NULL,
    `browser` VARCHAR(191) NOT NULL,
    `browserVersion` VARCHAR(191) NULL,
    `os` VARCHAR(191) NOT NULL,
    `osVersion` VARCHAR(191) NULL,
    `viewport` VARCHAR(191) NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'pt',
    `startTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastActivity` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endTime` DATETIME(3) NULL,
    `duration` INTEGER NOT NULL DEFAULT 0,
    `pageViewCount` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `hasEngagement` BOOLEAN NOT NULL DEFAULT false,
    `bounced` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `AnalyticsSession_sessionId_key`(`sessionId`),
    INDEX `AnalyticsSession_sessionId_idx`(`sessionId`),
    INDEX `AnalyticsSession_fingerprint_idx`(`fingerprint`),
    INDEX `AnalyticsSession_userId_idx`(`userId`),
    INDEX `AnalyticsSession_startTime_idx`(`startTime`),
    INDEX `AnalyticsSession_country_idx`(`country`),
    INDEX `AnalyticsSession_deviceType_idx`(`deviceType`),
    INDEX `AnalyticsSession_isActive_idx`(`isActive`),
    INDEX `AnalyticsSession_hasEngagement_idx`(`hasEngagement`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnalyticsPageView` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `referrer` VARCHAR(191) NULL,
    `startTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endTime` DATETIME(3) NULL,
    `duration` INTEGER NOT NULL DEFAULT 0,
    `profileViewed` BOOLEAN NOT NULL DEFAULT false,
    `contactViewed` BOOLEAN NOT NULL DEFAULT false,

    INDEX `AnalyticsPageView_sessionId_idx`(`sessionId`),
    INDEX `AnalyticsPageView_path_idx`(`path`),
    INDEX `AnalyticsPageView_startTime_idx`(`startTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnalyticsHourly` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `totalSessions` INTEGER NOT NULL DEFAULT 0,
    `uniqueUsers` INTEGER NOT NULL DEFAULT 0,
    `authenticatedUsers` INTEGER NOT NULL DEFAULT 0,
    `anonymousUsers` INTEGER NOT NULL DEFAULT 0,
    `engagedSessions` INTEGER NOT NULL DEFAULT 0,
    `bouncedSessions` INTEGER NOT NULL DEFAULT 0,
    `bounceRate` DOUBLE NOT NULL DEFAULT 0,
    `avgSessionDuration` DOUBLE NOT NULL DEFAULT 0,
    `totalPageViews` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AnalyticsHourly_date_idx`(`date`),
    UNIQUE INDEX `AnalyticsHourly_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnalyticsDaily` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `totalSessions` INTEGER NOT NULL DEFAULT 0,
    `uniqueUsers` INTEGER NOT NULL DEFAULT 0,
    `authenticatedUsers` INTEGER NOT NULL DEFAULT 0,
    `anonymousUsers` INTEGER NOT NULL DEFAULT 0,
    `engagedSessions` INTEGER NOT NULL DEFAULT 0,
    `bouncedSessions` INTEGER NOT NULL DEFAULT 0,
    `bounceRate` DOUBLE NOT NULL DEFAULT 0,
    `avgSessionDuration` DOUBLE NOT NULL DEFAULT 0,
    `totalPageViews` INTEGER NOT NULL DEFAULT 0,
    `peakHour` INTEGER NULL,
    `peakSessions` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AnalyticsDaily_date_idx`(`date`),
    UNIQUE INDEX `AnalyticsDaily_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnalyticsDeviceBreakdown` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `period` VARCHAR(191) NOT NULL,
    `deviceType` VARCHAR(191) NOT NULL,
    `browser` VARCHAR(191) NOT NULL,
    `os` VARCHAR(191) NOT NULL,
    `sessionCount` INTEGER NOT NULL DEFAULT 0,
    `uniqueUsers` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AnalyticsDeviceBreakdown_date_period_idx`(`date`, `period`),
    INDEX `AnalyticsDeviceBreakdown_deviceType_idx`(`deviceType`),
    UNIQUE INDEX `AnalyticsDeviceBreakdown_date_period_deviceType_browser_os_key`(`date`, `period`, `deviceType`, `browser`, `os`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnalyticsLocationBreakdown` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `period` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `sessionCount` INTEGER NOT NULL DEFAULT 0,
    `uniqueUsers` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AnalyticsLocationBreakdown_date_period_idx`(`date`, `period`),
    INDEX `AnalyticsLocationBreakdown_country_idx`(`country`),
    UNIQUE INDEX `AnalyticsLocationBreakdown_date_period_country_region_city_key`(`date`, `period`, `country`, `region`, `city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AnalyticsSession` ADD CONSTRAINT `AnalyticsSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnalyticsPageView` ADD CONSTRAINT `AnalyticsPageView_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `AnalyticsSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
