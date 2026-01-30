/*
  Warnings:

  - You are about to drop the column `slotPrice` on the `subject` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `subject` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subject" DROP COLUMN "slotPrice",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "subject_slug_key" ON "subject"("slug");
