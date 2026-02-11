import { UserWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { UserFilterParams } from "../../types";

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

export const adminService = {
  getTotalEarnings,
  deleteUser,
  banUser,
  unbanUser,
  getAllUsers,
};
