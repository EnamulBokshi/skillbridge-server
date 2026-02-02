/*
  Warnings:

  - You are about to drop the column `tutorId` on the `booking` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_tutorId_fkey";

-- DropIndex
DROP INDEX "booking_id_tutorId_studentId_slotId_idx";

-- AlterTable
ALTER TABLE "booking" DROP COLUMN "tutorId";

-- CreateIndex
CREATE INDEX "booking_id_studentId_slotId_idx" ON "booking"("id", "studentId", "slotId");
