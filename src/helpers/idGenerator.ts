import { prisma } from "../lib/prisma.js";

type EntityType = "student" | "tutor";

interface GenerateIdOptions {
  entityType: EntityType;
  prefix?: string; // Optional prefix before date (e.g., 'S' for student, 'T' for tutor)
}

/**
 * Generates a 10-digit ID with format: MMDDYYXXXX
 * MM = Month, DD = Day, YY = Year, XXXX = Sequence number for that day
 * 
 * Example: "0129260001" for first student on 01/29/26
 * 
 * @param options - Configuration for ID generation
 * @returns Generated ID string
 */
export const generateId = async (options: GenerateIdOptions): Promise<string> => {
  const { entityType, prefix = "" } = options;

  // Get current date in MMDDYY format
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2); // Last 2 digits

  const datePrefix = `${month}${day}${year}`; // e.g., "012926"

  // Count existing records of this type created today
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  let count = 0;

  if (entityType === "student") {
    count = await prisma.student.count({
      where: {
        createdAt: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    });
  } else if (entityType === "tutor") {
    count = await prisma.tutorProfile.count({
      where: {
        createdAt: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    });
  }

  // Generate sequence number (count + 1, padded to 4 digits)
  const sequenceNumber = String(count + 1).padStart(4, "0");

  return `${prefix}${datePrefix}${sequenceNumber}`;
};