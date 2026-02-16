import { UserWhereInput } from "../../generated/prisma/models.js";
import { prisma } from "../../lib/prisma.js";
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


export const adminService = {
  getTotalEarnings,
  deleteUser,
  banUser,
  unbanUser,
  getAllUsers,
  adminDashboardStats,
};
