import { UserWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { AdminDashboardStats, UserFilterParams } from "../../types";

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
    const users = await prisma.user.findMany({
      where: {
        AND: partials,
      },
      include: {
        student:{
            select: {
                id:true,
            }
        },
        tutorProfile:{
            select: {
                id:true,
            }
        }
      },

      take: limit,
      skip: skip,
      orderBy: {
        [sortBy]: orderBy === "asc" ? "asc" : "desc",
      },
    });
    const totalUsers = await prisma.user.count();
    
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
  return await prisma.$transaction(async (tx) => {
    // User Statistics
    const totalUsers = await tx.user.count();
    const activeUsers = await tx.user.count({ where: { status: "ACTIVE" } });
    const bannedUsers = await tx.user.count({ where: { status: "BANNED" } });
    const usersByRole = await tx.user.groupBy({
      by: ["role"],
      _count: { id: true },
    });

    // Tutor Statistics
    const totalTutors = await tx.tutorProfile.count();
    const featuredTutors = await tx.tutorProfile.count({
      where: { isFeatured: true },
    });
    const tutorWithMostSessions = await tx.tutorProfile.findFirst({
      orderBy: { completedSessions: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        completedSessions: true,
        avgRating: true,
      },
    });
    const topRatedTutors = await tx.tutorProfile.findMany({
      take: 5,
      orderBy: { avgRating: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avgRating: true,
        totalReviews: true,
        completedSessions: true,
      },
    });
    const totalTutorEarnings = await tx.tutorProfile.aggregate({
      _sum: { totalEarned: true },
      _avg: { totalEarned: true },
    });

    // Student Statistics
    const totalStudents = await tx.student.count();
    const activeStudents = await tx.student.count({
      where: { status: "ACTIVE" },
    });
    const studentWithMostBookings = await tx.student.findFirst({
      orderBy: {
        bookings: {
          _count: "desc",
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        completedSessions: true,
        _count: {
          select: { bookings: true },
        },
      },
    });

    // Booking Statistics
    const totalBookings = await tx.booking.count();
    const bookingsByStatus = await tx.booking.groupBy({
      by: ["status"],
      _count: { id: true },
    });
    const confirmedBookings = await tx.booking.count({
      where: { status: "CONFIRMED" },
    });
    const completedBookings = await tx.booking.count({
      where: { status: "COMPLETED" },
    });
    const cancelledBookings = await tx.booking.count({
      where: { status: "CANCELLED" },
    });
    const pendingBookings = await tx.booking.count({
      where: { status: "PENDING" },
    });

    // Recent Bookings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentBookings = await tx.booking.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Slot Statistics
    const totalSlots = await tx.slot.count();
    const bookedSlots = await tx.slot.count({ where: { isBooked: true } });
    const availableSlots = await tx.slot.count({ where: { isBooked: false } });
    const featuredSlots = await tx.slot.count({ where: { isFeatured: true } });
    const freeSlots = await tx.slot.count({ where: { isFree: true } });
    const slotPricing = await tx.slot.aggregate({
      _avg: { slotPrice: true },
      _min: { slotPrice: true },
      _max: { slotPrice: true },
      _sum: { slotPrice: true },
    });

    // Revenue Statistics
    const totalRevenue = await tx.booking.findMany({
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
    const revenueSum = totalRevenue.reduce(
      (sum, booking) => sum + booking.slot.slotPrice,
      0,
    );

    // Revenue from last 30 days
    const recentRevenue = await tx.booking.findMany({
      where: {
        status: {
          in: ["CONFIRMED", "COMPLETED"],
        },
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        slot: {
          select: {
            slotPrice: true,
          },
        },
      },
    });
    const recentRevenueSum = recentRevenue.reduce(
      (sum, booking) => sum + booking.slot.slotPrice,
      0,
    );

    // Review Statistics
    const totalReviews = await tx.review.count();
    const averageRating = await tx.review.aggregate({
      _avg: { rating: true },
    });
    const ratingDistribution = await tx.review.groupBy({
      by: ["rating"],
      _count: { id: true },
    });
    const recentReviews = await tx.review.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Category Statistics
    const totalCategories = await tx.category.count();
    const categoriesWithCounts = await tx.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            subject: true,
            tutorProfile: true,
          },
        },
      },
      orderBy: {
        tutorProfile: {
          _count: "desc",
        },
      },
    });

    // Subject Statistics
    const totalSubjects = await tx.subject.count();
    const activeSubjects = await tx.subject.count({ where: { isActive: true } });
    const subjectsWithMostSlots = await tx.subject.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        creditHours: true,
        _count: {
          select: {
            slots: true,
            tutorSubject: true,
          },
        },
      },
      orderBy: {
        slots: {
          _count: "desc",
        },
      },
    });

    // Session Statistics
    const totalCompletedSessions = await tx.tutorProfile.aggregate({
      _sum: { completedSessions: true },
    });

    // Growth Metrics (comparing last 30 days to previous 30 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const previousPeriodBookings = await tx.booking.count({
      where: {
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
    });
    const bookingGrowthRate =
      previousPeriodBookings > 0
        ? ((recentBookings - previousPeriodBookings) / previousPeriodBookings) *
          100
        : 0;

    const previousPeriodUsers = await tx.user.count({
      where: {
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
    });
    const recentUsers = await tx.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    });
    const userGrowthRate =
      previousPeriodUsers > 0
        ? ((recentUsers - previousPeriodUsers) / previousPeriodUsers) * 100
        : 0;

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers,
        byRole: usersByRole,
        recentSignups: recentUsers,
        growthRate: userGrowthRate,
      },
      tutors: {
        total: totalTutors,
        featured: featuredTutors,
        topPerformer: tutorWithMostSessions,
        topRated: topRatedTutors,
        totalEarnings: totalTutorEarnings._sum.totalEarned || 0,
        averageEarnings: totalTutorEarnings._avg.totalEarned || 0,
      },
      students: {
        total: totalStudents,
        active: activeStudents,
        topBooker: studentWithMostBookings,
      },
      bookings: {
        total: totalBookings,
        byStatus: bookingsByStatus,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        pending: pendingBookings,
        recent: recentBookings,
        growthRate: bookingGrowthRate,
      },
      slots: {
        total: totalSlots,
        booked: bookedSlots,
        available: availableSlots,
        featured: featuredSlots,
        free: freeSlots,
        pricing: {
          average: slotPricing._avg.slotPrice || 0,
          minimum: slotPricing._min.slotPrice || 0,
          maximum: slotPricing._max.slotPrice || 0,
          total: slotPricing._sum.slotPrice || 0,
        },
      },
      revenue: {
        total: revenueSum,
        lastThirtyDays: recentRevenueSum,
        averagePerBooking: totalBookings > 0 ? revenueSum / totalBookings : 0,
      },
      reviews: {
        total: totalReviews,
        averageRating: averageRating._avg.rating || 0,
        ratingDistribution: ratingDistribution,
        recent: recentReviews,
      },
      categories: {
        total: totalCategories,
        details: categoriesWithCounts,
      },
      subjects: {
        total: totalSubjects,
        active: activeSubjects,
        mostPopular: subjectsWithMostSlots,
      },
      sessions: {
        totalCompleted: totalCompletedSessions._sum.completedSessions || 0,
      },
    };
  });
}

export const adminService = {
  getTotalEarnings,
  deleteUser,
  banUser,
  unbanUser,
  getAllUsers,
  adminDashboardStats,
};
