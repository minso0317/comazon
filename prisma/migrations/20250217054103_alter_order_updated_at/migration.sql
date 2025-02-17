/*
  Warnings:

  - You are about to drop the column `updataedAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `updataedAt` on the `OrderItem` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "updataedAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "updataedAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
