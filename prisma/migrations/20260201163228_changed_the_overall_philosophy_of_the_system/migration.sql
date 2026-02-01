/*
  Warnings:

  - You are about to drop the column `subjectId` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `slotPrice` on the `category` table. All the data in the column will be lost.
  - Added the required column `description` to the `category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slotPrice` to the `slot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectId` to the `slot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_subjectId_fkey";

-- DropIndex
DROP INDEX "booking_tutorId_studentId_slotId_subjectId_idx";

-- AlterTable
ALTER TABLE "booking" DROP COLUMN "subjectId";

-- AlterTable
ALTER TABLE "category" DROP COLUMN "slotPrice",
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "slot" ADD COLUMN     "slotPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "subjectId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "booking_id_tutorId_studentId_slotId_idx" ON "booking"("id", "tutorId", "studentId", "slotId");

-- AddForeignKey
ALTER TABLE "slot" ADD CONSTRAINT "slot_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
