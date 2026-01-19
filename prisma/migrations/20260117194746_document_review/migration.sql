/*
  Warnings:

  - A unique constraint covering the columns `[document]` on the table `Producer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Producer_document_key` ON `Producer`(`document`);
