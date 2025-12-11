/*
  Warnings:

  - You are about to alter the column `image` on the `Post` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Json`.

*/
-- AlterTable
ALTER TABLE `Post` MODIFY `image` JSON NULL;
