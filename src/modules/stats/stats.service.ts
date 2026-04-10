import { prisma } from "../../lib/prisma.js";

export const statsService = {
  async getPlatformStats() {
    try {
      const [studentsCount, tutorsCount, slotsCount, subjectsCount] =
        await Promise.all([
          prisma.student.count(),
          prisma.tutorProfile.count(),
          prisma.slot.count(),
          prisma.subject.count(),
        ]);

      return {
        students: studentsCount,
        tutors: tutorsCount,
        slots: slotsCount,
        subjects: subjectsCount,
      };
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      throw new Error("Failed to fetch platform statistics");
    }
  },
};
