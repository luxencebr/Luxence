/*
  Warnings:

  - You are about to drop the column `type` on the `AppearanceOption` table. All the data in the column will be lost.
  - You are about to drop the column `feet` on the `ProducerAppearance` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `ProducerAppearance` table. All the data in the column will be lost.
  - You are about to drop the column `mannequin` on the `ProducerAppearance` table. All the data in the column will be lost.
  - You are about to drop the column `piercings` on the `ProducerAppearance` table. All the data in the column will be lost.
  - You are about to drop the column `silicone` on the `ProducerAppearance` table. All the data in the column will be lost.
  - You are about to drop the column `tattoos` on the `ProducerAppearance` table. All the data in the column will be lost.
  - Added the required column `valueType` to the `AppearanceOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `AppearanceOption` DROP COLUMN `type`,
    ADD COLUMN `valueType` ENUM('BOOLEAN', 'NUMBER', 'OPTION') NOT NULL;

-- AlterTable
ALTER TABLE `ProducerAppearance` DROP COLUMN `feet`,
    DROP COLUMN `height`,
    DROP COLUMN `mannequin`,
    DROP COLUMN `piercings`,
    DROP COLUMN `silicone`,
    DROP COLUMN `tattoos`,
    ADD COLUMN `valueBoolean` BOOLEAN NULL,
    ADD COLUMN `valueNumber` DOUBLE NULL,
    ADD COLUMN `valueString` VARCHAR(191) NULL;
