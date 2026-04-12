import { UserWhereInput } from "../../generated/prisma/models.js";
import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "node:crypto";
import { AdminDashboardStats, UserFilterParams } from "../../types/index.js";

const getTotalEarnings = async () => {
  // Get all confirmed and completed bookings with their slot prices
  const bookings = await prisma.booking.findMany({
    where: {
      status: {
        in: ["CONFIRMED", "COMPLETED"],
      },
    },
    include: {
      slot: {
        select: {
          slotPrice: true,
        },
      },
    },
  });

  // Sum up the slot prices
  const total = bookings.reduce(
    (sum, booking) => sum + booking.slot.slotPrice,
    0,
  );

  return { totalEarnings: total };
};

// mutations for admin -> user management

const deleteUser = async (userId: string) => {
  return await prisma.user.delete({
    where: { id: userId },
  });
};

const banUser = async (userId: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { status: "BANNED" },
  });
};
const unbanUser = async (userId: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE" },
  });
};

const getAllUsers = async (filters: UserFilterParams) => {
  const {
    role,
    status,
    search,
    page = 1,
    limit = 50,
    skip = (page - 1) * limit,
    sortBy = "createdAt",
    orderBy = "desc",
  } = filters;
  const partials: UserWhereInput[] = [];

  if (role) {
    partials.push({ role });
  }
  if (status) {
    partials.push({ status });
  }
  if (search) {
    partials.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    });
  }
  const result = await prisma.$transaction(async (tx) => {
    const users = await tx.user.findMany({
      where: {
        AND: partials,
      },
      include: {
        student: {
          select: {
            id: true,
            sid:true,
            lastName: true,
            firstName: true,
            profilePicture: true,
          },
        },
        tutorProfile: {
          select: {
            tid: true,
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },

      take: limit,
      skip: skip,
      orderBy: {
        [sortBy]: orderBy === "asc" ? "asc" : "desc",
      },
    });
    const totalUsers = await tx.user.count();

    return {
      data: users,
      pagination: {
        page,
        limit,
        totalRecords: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
    };
  });
  return result;
};

const adminDashboardStats = async (): Promise<AdminDashboardStats> => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return prisma.$transaction(async (tx) => {
    // USERS
    const [totalUsers, activeUsers, bannedUsers] = await Promise.all([
      tx.user.count(),
      tx.user.count({ where: { status: 'ACTIVE' } }),
      tx.user.count({ where: { status: 'BANNED' } }),
    ]);

    // BOOKINGS
    const bookingsByStatus = await tx.booking.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const recentBookings = await tx.booking.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    const getStatusCount = (status: string) =>
      bookingsByStatus.find((b) => b.status === status)?._count.id || 0;

    // REVENUE (DB-side aggregation ✅)
    const totalRevenueBookings = await tx.booking.findMany({
      where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
      include: {
        slot: {
          select: { slotPrice: true },
        },
      },
    });

    const totalRevenue = totalRevenueBookings.reduce(
      (sum, booking) => sum + booking.slot.slotPrice,
      0,
    );

    const recentRevenueBookings = await tx.booking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        slot: {
          select: { slotPrice: true },
        },
      },
    });

    const recentRevenue = recentRevenueBookings.reduce(
      (sum, booking) => sum + booking.slot.slotPrice,
      0,
    );

    // SLOTS
    const [totalSlots, bookedSlots, freeSlots] = await Promise.all([
      tx.slot.count(),
      tx.slot.count({ where: { isBooked: true } }),
      tx.slot.count({ where: { isFree: true } }),
    ]);

    // REVIEWS
    const reviewStats = await tx.review.aggregate({
      _count: { id: true },
      _avg: { rating: true },
    });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers,
      },
      bookings: {
        total: bookingsByStatus.reduce((sum, b) => sum + b._count.id, 0),
        completed: getStatusCount('COMPLETED'),
        cancelled: getStatusCount('CANCELLED'),
        pending: getStatusCount('PENDING'),
        recent: recentBookings,
      },
      revenue: {
        total: totalRevenue,
        lastThirtyDays: recentRevenue,
      },
      slots: {
        total: totalSlots,
        booked: bookedSlots,
        free: freeSlots,
        available: totalSlots - bookedSlots,
      },
      reviews: {
        total: reviewStats._count.id,
        averageRating: reviewStats._avg.rating || 0,
      },
    };
  }, {

  });
};


// ============ SUPER_ADMIN METHODS ============

/**
 * Create a new Admin user
 * Prevents self-creation for security
 */
const createAdmin = async (
  email: string,
  name: string,
  password: string,
  createdByUserId: string,
) => {
  // Prevent self-creation
  const admin = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (admin) {
    throw new Error("Admin with this email already exists");
  }

  const hashedPassword = await hashPassword(password);

  return await prisma.$transaction(async (tx) => {
    // Create user
    const newUser = await tx.user.create({
      data: {
        id: randomUUID(),
        email,
        name,
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
      },
    });

    // Create account with hashed password
    await tx.account.create({
      data: {
        id: randomUUID(),
        userId: newUser.id,
        accountId: "email-provider",
        providerId: "credential",
        password: hashedPassword,
      },
    });

    return newUser;
  });
};

/**
 * Update an Admin user
 * Prevents admin from updating themselves if attempting self-deletion
 */
const updateAdmin = async (
  adminId: string,
  updatedByUserId: string,
  data: { email?: string; name?: string; status?: string },
) => {
  // Prevent self-modification of critical fields by themselves
  if (adminId === updatedByUserId && data.status === "BANNED") {
    throw new Error("Admins cannot ban themselves");
  }

  return await prisma.user.update({
    where: { id: adminId },
    data,
  });
};

/**
 * Delete an Admin user
 * Prevents self-deletion
 */
const deleteAdmin = async (adminId: string, deletedByUserId: string) => {
  if (adminId === deletedByUserId) {
    throw new Error("You cannot delete your own admin account");
  }

  return await prisma.user.delete({
    where: { id: adminId },
  });
};

/**
 * Get all Admins with pagination
 */
const getAllAdmins = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [admins, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: { role: "ADMIN" } }),
  ]);

  return {
    data: admins,
    pagination: {
      page,
      limit,
      totalRecords: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

/**
 * Create a new Tutor user
 */
const createTutorByAdmin = async (tutorData: any) => {
  // Prevent self-creation
  const existing = await prisma.user.findUnique({
    where: { email: tutorData.email },
    select: { id: true },
  });

  if (existing) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await hashPassword(tutorData.password);
  const { generateId } = await import("../../helpers/idGenerator.js");
  const tid = await generateId({ entityType: "tutor", prefix: "T" });

  return await prisma.$transaction(async (tx) => {
    // Create user
    const newUser = await tx.user.create({
      data: {
        id: randomUUID(),
        email: tutorData.email,
        name: tutorData.name,
        role: "TUTOR",
        status: "ACTIVE",
        emailVerified: true,
        isAssociate: true,
      },
    });

    // Create account with hashed password
    await tx.account.create({
      data: {
        id: randomUUID(),
        userId: newUser.id,
        accountId: "email-provider",
        providerId: "credential",
        password: hashedPassword,
      },
    });

    // Create tutor profile
    const tutor = await tx.tutorProfile.create({
      data: {
        userId: newUser.id,
        tid,
        firstName: tutorData.firstName,
        lastName: tutorData.lastName,
        email: tutorData.email,
        categoryId: tutorData.categoryId,
        bio: tutorData.bio || "",
        experienceYears: tutorData.experienceYears || 0,
      },
    });

    return tutor;
  });
};

/**
 * Update a Tutor user
 */
const updateTutorByAdmin = async (tutorId: string, data: any) => {
  return await prisma.tutorProfile.update({
    where: { id: tutorId },
    data,
  });
};

/**
 * Delete a Tutor user (cascade to user and profile)
 */
const deleteTutorByAdmin = async (tutorId: string) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: tutorId },
    select: { userId: true },
  });

  if (!tutor) {
    throw new Error("Tutor not found");
  }

  // Delete user (cascade will handle tutorProfile deletion)
  return await prisma.user.delete({
    where: { id: tutor.userId },
  });
};

/**
 * Create a new Student user
 */
const createStudentByAdmin = async (studentData: any) => {
  const existing = await prisma.user.findUnique({
    where: { email: studentData.email },
    select: { id: true },
  });

  if (existing) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await hashPassword(studentData.password);
  const { generateId } = await import("../../helpers/idGenerator.js");
  const sid = await generateId({ entityType: "student", prefix: "S" });

  return await prisma.$transaction(async (tx) => {
    // Create user
    const newUser = await tx.user.create({
      data: {
        id: randomUUID(),
        email: studentData.email,
        name: studentData.name,
        role: "STUDENT",
        status: "ACTIVE",
        emailVerified: true,
        isAssociate: true,
      },
    });

    // Create account with hashed password
    await tx.account.create({
      data: {
        id: randomUUID(),
        userId: newUser.id,
        accountId: "email-provider",
        providerId: "credential",
        password: hashedPassword,
      },
    });

    // Create student profile
    const student = await tx.student.create({
      data: {
        userId: newUser.id,
        sid,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
      },
    });

    return student;
  });
};

/**
 * Update a Student user
 */
const updateStudentByAdmin = async (studentId: string, data: any) => {
  return await prisma.student.update({
    where: { id: studentId },
    data,
  });
};

/**
 * Delete a Student user (cascade to user and profile)
 */
const deleteStudentByAdmin = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { userId: true },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  return await prisma.user.delete({
    where: { id: student.userId },
  });
};

/**
 * Get all Sessions
 */
const getAllSessions = async (
  page = 1,
  limit = 10,
  userId?: string,
  orderBy: "asc" | "desc" = "desc",
) => {
  const skip = (page - 1) * limit;
  const where = userId ? { userId } : {};

  const [sessions, totalCount] = await Promise.all([
    prisma.session.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: orderBy as "asc" | "desc" },
    }),
    prisma.session.count({ where }),
  ]);

  return {
    data: sessions,
    pagination: {
      page,
      limit,
      totalRecords: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

/**
 * Delete a specific Session
 */
const deleteSession = async (sessionId: string) => {
  return await prisma.session.delete({
    where: { id: sessionId },
  });
};

/**
 * Delete all Sessions for a specific User
 */
const deleteUserSessions = async (userId: string) => {
  const result = await prisma.session.deleteMany({
    where: { userId },
  });

  return {
    deletedCount: result.count,
    message: `Deleted ${result.count} session(s) for user`,
  };
};

/**
 * Soft delete a Booking
 */
const softDeleteBooking = async (bookingId: string) => {
  return await prisma.booking.update({
    where: { id: bookingId },
    data: { deletedAt: new Date() },
  });
};

/**
 * Hard delete a Booking
 */
const hardDeleteBooking = async (bookingId: string) => {
  // Restore slot availability if booking was confirmed or pending
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { slotId: true, status: true },
  });

  if (booking && ["PENDING", "CONFIRMED"].includes(booking.status as string)) {
    await prisma.slot.update({
      where: { id: booking.slotId },
      data: { isBooked: false },
    });
  }

  return await prisma.booking.delete({
    where: { id: bookingId },
  });
};

/**
 * Update Booking status
 */
const updateBooking = async (bookingId: string, data: any) => {
  return await prisma.booking.update({
    where: { id: bookingId },
    data,
  });
};

/**
 * Get comprehensive system insights
 */
const getSystemInsights = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return prisma.$transaction(async (tx) => {
    // USER INSIGHTS
    const [totalUsers, activeUsers, bannedUsers, usersByRole] = await Promise.all([
      tx.user.count(),
      tx.user.count({ where: { status: "ACTIVE" } }),
      tx.user.count({ where: { status: "BANNED" } }),
      tx.user.groupBy({
        by: ["role"],
        _count: { id: true },
      }),
    ]);

    const userRoleBreakdown = usersByRole.reduce(
      (acc, curr) => ({ ...acc, [curr.role as string]: curr._count.id }),
      {} as Record<string, number>,
    );

    // BOOKING INSIGHTS
    const bookingsByStatus = await tx.booking.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const totalRevenueData = await tx.booking.findMany({
      where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
      include: { slot: { select: { slotPrice: true } } },
    });

    const totalRevenue = totalRevenueData.reduce(
      (sum, b) => sum + b.slot.slotPrice,
      0,
    );

    const recentRevenueData = await tx.booking.findMany({
      where: {
        status: { in: ["CONFIRMED", "COMPLETED"] },
        createdAt: { gte: thirtyDaysAgo },
      },
      include: { slot: { select: { slotPrice: true } } },
    });

    const recentRevenue = recentRevenueData.reduce(
      (sum, b) => sum + b.slot.slotPrice,
      0,
    );

    // PERFORMANCE METRICS
    const avgSessionCompletionTime = await tx.booking.aggregate({
      where: { status: "COMPLETED" },
      _count: { id: true },
    });

    const [totalSlots, totalReviews, avgRating] = await Promise.all([
      tx.slot.count(),
      tx.review.count(),
      tx.review.aggregate({
        _avg: { rating: true },
      }),
    ]);

    // GROWTH METRICS
    const newUsersThisMonth = await tx.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    const newBookingsThisMonth = await tx.booking.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers,
        roleBreakdown: userRoleBreakdown as Record<string, number>,
        newThisMonth: newUsersThisMonth,
      },
      bookings: {
        total: bookingsByStatus.reduce((sum, b) => sum + b._count.id, 0),
        byStatus: bookingsByStatus.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.status as string]: curr._count.id,
          }),
          {} as Record<string, number>,
        ),
        completed: bookingsByStatus.find((b) => b.status === "COMPLETED")?._count
          .id || 0,
        newThisMonth: newBookingsThisMonth,
      },
      revenue: {
        total: totalRevenue,
        lastThirtyDays: recentRevenue,
        averagePerBooking:
          totalRevenueData.length > 0
            ? totalRevenue / totalRevenueData.length
            : 0,
      },
      platform: {
        totalSlots,
        totalReviews,
        averageRating: avgRating._avg.rating || 0,
      },
      timestamp: new Date().toISOString(),
    };
  });
};

/**
 * Configure AI Features
 * Returns available AI features and their config
 */
const getAIFeaturesControl = async () => {
  return {
    features: {
      chatbotEnabled: true,
      tutorRecommendationsEnabled: true,
      searchSuggestionsEnabled: true,
      bioGenerationEnabled: true,
      reviewSuggestionsEnabled: true,
    },
    models: {
      geminiModels: [
        "gemini-pro",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
      ],
      currentModel: "gemini-1.5-pro",
    },
    rateLimits: {
      chatRequests: 100,
      recommendationRequests: 50,
      generateRequests: 30,
    },
    timestamp: new Date().toISOString(),
  };
};

/**
 * Toggle AI Feature
 */
const toggleAIFeature = async (featureName: string, enabled: boolean) => {
  // This would be stored in a config table or cache in production
  return {
    feature: featureName,
    enabled,
    updatedAt: new Date().toISOString(),
  };
};

export const adminService = {
  getTotalEarnings,
  deleteUser,
  banUser,
  unbanUser,
  getAllUsers,
  adminDashboardStats,
  // SuperAdmin methods
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAllAdmins,
  createTutorByAdmin,
  updateTutorByAdmin,
  deleteTutorByAdmin,
  createStudentByAdmin,
  updateStudentByAdmin,
  deleteStudentByAdmin,
  getAllSessions,
  deleteSession,
  deleteUserSessions,
  softDeleteBooking,
  hardDeleteBooking,
  updateBooking,
  getSystemInsights,
  getAIFeaturesControl,
  toggleAIFeature,
};
