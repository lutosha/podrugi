-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'RESOLVED', 'DISMISSED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "reporterId" INTEGER NOT NULL,
    "reportedPostId" INTEGER,
    "reportedUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" SERIAL NOT NULL,
    "blockerId" INTEGER NOT NULL,
    "blockedId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Block_blockerId_blockedId_key" ON "Block"("blockerId", "blockedId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedPostId_fkey" FOREIGN KEY ("reportedPostId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
