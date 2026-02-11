import { BookingStatus } from "../../../generated/prisma/enums";
import { TutorProfileWhereInput } from "../../../generated/prisma/models";
import { generateId } from "../../helpers/idGenerator";
import { prisma } from "../../lib/prisma";
import { TutorRegistration, TutorSearchParams, TutorDetailedProfile } from "../../types";

// Tutor has right to know his/her total earning, total bookings, upcoming bookings, completed bookings, ratings, reviews, subjects taught, student list etc.

const createTutor = async (payload: TutorRegistration) => {
  const tid = await generateId({ entityType: "tutor", prefix: "T" });
  const data = { ...payload, tid };
  return await prisma.$transaction(async (tx) => {
    const tutor = await tx.tutorProfile.create({ data });

    await tx.user.update({
      where: {
        id: tutor.userId,
      },

      data: {
        isAssociate: true,
        role: "TUTOR",
      },
    });

    return tutor;
  });
};

const updateTutorProfile = async (
  tutorId: string,
  payload: Partial<TutorRegistration>,
) => {
  return await prisma.tutorProfile.update({
    where: { id: tutorId },
    data: payload,
  });
};

const getTutorById = async (tutorId: string): Promise<TutorDetailedProfile | null> => {
  return await prisma.tutorProfile.findUnique({
    where: { id: tutorId },
    include: {
        category:{
            select: {
                id: true,
                name: true,
                slug: true,

            }
        },
        user: {
            select: {
                id: true,
                status: true,
                image: true,
                email: true,
            }
        },
        reviews: {
            select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        },
        slot: {
            select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                subjectId: true,
                slotPrice: true,
                isBooked: true,
                isFeatured: true,
                isFree: true,
                createdAt: true,
                updatedAt: true
            }
        }
        
    }
  });
};

const deleteTutor = async (tutorId: string) => {
  return await prisma.tutorProfile.delete({
    where: { id: tutorId },
  });
};

// tutor dashboard stats - total earnings, total bookings, upcoming bookings, completed bookings, ratings, reviews, subjects taught, student list etc.
const getTutorDashboardStats = async (tutorId: string) => {
  console.log("Fetching dashboard stats for tutor ID (server - service):", tutorId); // Debug log to check the tutor ID
  const result = await prisma.$transaction(async (tx) => {
    const totalEarnings = await tx.tutorProfile.findUnique({
      where: { id: tutorId },
      select: { totalEarned: true, avgRating: true },
    });
    const totalBookings = await tx.booking.count({
      where: {
        slot: {
          tutorId,
        },
      },
    });

    const completedBookings = await tx.booking.count({
      where: {
        slot: {
          tutorId,
        },
        status: "COMPLETED",
      },
    });

    const totalReviews = await tx.review.count({
      where: {
        tutorId,
      },
    });

    const averageRating = totalEarnings?.avgRating || 0;

    return {
      totalEarnings: totalEarnings?.totalEarned || 0,
      totalBookings,
      completedBookings,
      averageRating,
      totalReviews,
    };
  });
  return result;
};

// const upcomingBookings = async() => {
//     const now = new Date();
//     const bookings = await prisma.booking.findMany({
//         where: {
//             status: 'CONFIRMED',
//         },
//         include: {

//             student:{ select: { firstName: true, lastName: true } },

//             slot: {
//                 select: {
//                     date: true,
//                     startTime: true,
//                     endTime: true,
//                     tutorId: true,
//                     slotPrice: true
//                 }
//             },

//         }
//     })
// }

const updateBookingStatus = async (
  tutorId: string,
  bookingId: string,
  status: BookingStatus,
) => {
  const existingBooking = await prisma.booking.findUniqueOrThrow({
    where: {
      id: bookingId,
    },
    include: {
      slot: {
        select: {
          tutorId: true,
        },
      },
    },
  });
};

const getTutors = async (params: TutorSearchParams) => {
  const {
    limit = 10,
    skip = 0,
    page = 1,
    isFeatured,
    search = "",
    sortBy = "avgRating",
    orderBy = "desc",
    categoryId,
    minRating,
    maxRating,
    minExperience,
    maxExperience,
  } = params;

  const partials: TutorProfileWhereInput[] = [];

  // Filter by featured status
  if (isFeatured !== undefined) {
    partials.push({ isFeatured });
  }

  // Filter by category
  if (categoryId) {
    partials.push({ categoryId });
  }

  // Filter by rating range
  if (minRating !== undefined || maxRating !== undefined) {
    const ratingFilter: any = {};
    if (minRating !== undefined) ratingFilter.gte = minRating;
    if (maxRating !== undefined) ratingFilter.lte = maxRating;
    partials.push({ avgRating: ratingFilter });
  }

  // Filter by experience range
  if (minExperience !== undefined || maxExperience !== undefined) {
    const experienceFilter: any = {};
    if (minExperience !== undefined) experienceFilter.gte = minExperience;
    if (maxExperience !== undefined) experienceFilter.lte = maxExperience;
    partials.push({ experienceYears: experienceFilter });
  }

  // Search filter
  if (search) {
    partials.push({
      OR: [
        {
          firstName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          lastName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          bio: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          expertiseAreas: {
            hasSome: [search],
          },
        },
      ],
    });
  }

  // Build orderBy object
  const orderByClause: any = {};
  const validSortFields = [
    "avgRating",
    "experienceYears",
    "createdAt",
    "updatedAt",
    "totalEarned",
    "firstName",
    "lastName",
  ];
  const sortField = validSortFields.includes(sortBy) ? sortBy : "avgRating";
  const sortOrder = orderBy === "asc" ? "asc" : "desc";
  orderByClause[sortField] = sortOrder;

  const result = await prisma.tutorProfile.findMany({
    where: partials.length > 0 ? { AND: partials } : {},
    take: limit,
    skip: skip,
    orderBy: orderByClause,
    select: {
      id: true,
      tid: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      bio: true,
      expertiseAreas: true,
      experienceYears: true,
      avgRating: true,
      totalEarned: true,
      profilePicture: true,
      isFeatured: true,
      createdAt: true,
      updatedAt: true,
      categoryId: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  const totalCount = await prisma.tutorProfile.count({
    where: partials.length > 0 ? { AND: partials } : {},
  });

  return {
    data: result,
    pagination: {
      page,
      limit,
      totalRecords: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

export const tutorService = {
  createTutor,
  updateTutorProfile,
  getTutorById,
  deleteTutor,
  getTutorDashboardStats,
  updateBookingStatus,
  getTutors,
};
