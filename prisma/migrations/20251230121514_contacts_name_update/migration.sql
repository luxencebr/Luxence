/*
  Warnings:

  - Added the required column `name` to the `Producer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- 1. Adiciona a coluna permitindo NULL
ALTER TABLE `Producer`
ADD COLUMN `name` VARCHAR(191);

-- 2. Preenche os registros existentes
UPDATE `Producer`
SET name = 'Perfil sem nome'
WHERE name IS NULL;

-- 3. Torna o campo obrigatório
ALTER TABLE `Producer`
MODIFY COLUMN `name` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `ContactOption` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,

    UNIQUE INDEX `ContactOption_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProducerContact` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `profileId` INTEGER NOT NULL,
    `contactId` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `ProducerContact_profileId_contactId_value_key`(`profileId`, `contactId`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProducerContact` ADD CONSTRAINT `ProducerContact_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `ProducerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProducerContact` ADD CONSTRAINT `ProducerContact_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `ContactOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
