/*
  Warnings:

  - Added the required column `categoryId` to the `tutorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `tutorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `tutorProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "student" ADD COLUMN     "completedSessions" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "tutorProfile" ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "completedSessions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cv" TEXT,
ADD COLUMN     "experienceYears" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "expertiseAreas" TEXT[],
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "tutorProfile" ADD CONSTRAINT "tutorProfile_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
