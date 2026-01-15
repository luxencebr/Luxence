/*
  Warnings:

  - A unique constraint covering the columns `[userId,profileId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Review` ADD COLUMN `hasComment` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isApproved` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `comment` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Review_userId_profileId_key` ON `Review`(`userId`, `profileId`);
