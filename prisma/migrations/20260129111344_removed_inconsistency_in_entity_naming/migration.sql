/*
  Warnings:

  - You are about to drop the `bookings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contacts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reviews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `slots` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `students` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tutorSubjects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_slotId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_studentId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_studentId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "slots" DROP CONSTRAINT "slots_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_userId_fkey";

-- DropForeignKey
ALTER TABLE "tutorProfiles" DROP CONSTRAINT "tutorProfiles_contactId_fkey";

-- DropForeignKey
ALTER TABLE "tutorSubjects" DROP CONSTRAINT "tutorSubjects_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "tutorSubjects" DROP CONSTRAINT "tutorSubjects_tfId_fkey";

-- DropTable
DROP TABLE "bookings";

-- DropTable
DROP TABLE "contacts";

-- DropTable
DROP TABLE "reviews";

-- DropTable
DROP TABLE "slots";

-- DropTable
DROP TABLE "students";

-- DropTable
DROP TABLE "tutorSubjects";

-- CreateTable
CREATE TABLE "booking" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 1.00,
    "studentId" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slot" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isBooked" BOOLEAN NOT NULL,
    "tutorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "userId" TEXT NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutorSubject" (
    "id" TEXT NOT NULL,
    "tfId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutorSubject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_tutorId_studentId_slotId_subjectId_idx" ON "booking"("tutorId", "studentId", "slotId", "subjectId");

-- CreateIndex
CREATE INDEX "review_studentId_id_tutorId_idx" ON "review"("studentId", "id", "tutorId");

-- CreateIndex
CREATE INDEX "slot_id_tutorId_idx" ON "slot"("id", "tutorId");

-- CreateIndex
CREATE UNIQUE INDEX "student_sid_key" ON "student"("sid");

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutorProfiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutorProfiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slot" ADD CONSTRAINT "slot_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutorProfiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorProfiles" ADD CONSTRAINT "tutorProfiles_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorSubject" ADD CONSTRAINT "tutorSubject_tfId_fkey" FOREIGN KEY ("tfId") REFERENCES "tutorProfiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorSubject" ADD CONSTRAINT "tutorSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
