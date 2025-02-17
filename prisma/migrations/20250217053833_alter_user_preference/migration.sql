/*
  Warnings:

  - You are about to drop the column `updataedAt` on the `UserPreference` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `UserPreference` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserPreference" DROP COLUMN "updataedAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
