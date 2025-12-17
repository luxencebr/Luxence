-- DropIndex
DROP INDEX `Post_createdAt_idx` ON `Post`;

-- CreateIndex
CREATE INDEX `Post_createdAt_idx` ON `Post`(`createdAt` DESC);
