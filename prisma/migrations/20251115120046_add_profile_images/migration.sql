/*
  Warnings:

  - Added the required column `images` to the `ProducerProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ProducerProfile` ADD COLUMN `images` JSON NOT NULL;
