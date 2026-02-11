import { SlotWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { ICreateSlotPayload, SlotSearchParams } from "../../types";
//TODO: mark as booked, unbooked, date filter, tutor filter, subject filter, pagination, sorting, delete..
const createSlot = async (slotData: ICreateSlotPayload) => {
  return await prisma.slot.create({
    data: slotData,
  });
};
// view slots by various filters
const getSlots = async (filters: SlotSearchParams) => {
  const partials: SlotWhereInput[] = [];
  if (filters.search) {
    partials.push({
      OR: [
        {
          tutorProfile: {
            firstName: {
              contains: filters.search,
              mode: "insensitive",
            },
            lastName: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
        },
        {
          subject: {
            name: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }
  if (filters.isFeatured !== undefined) {
    partials.push({
      isFeatured: filters.isFeatured ? true : false,
    });
  }
  if (filters.isFree !== undefined) {
    partials.push({
      isFree: filters.isFree ? true : false,
    });
  }
  if (filters.tutorId) {
    partials.push({
      tutorId: filters.tutorId,
    });
  }
  if (filters.subjectId) {
    partials.push({
      subjectId: filters.subjectId,
    });
  }
  if (filters.date) {
    partials.push({
      date: new Date(filters.date),
    });
  }

  const allSLots = await prisma.slot.findMany({
    take: filters.limit ? filters.limit : 10,
    skip: filters.skip ? filters.skip : 0,
    orderBy: {
      [filters.sortBy || "createdAt"]:
        filters.orderBy === "asc" ? "asc" : "desc",
    },
    where: {
      AND: partials,
    },
    include: {
      tutorProfile: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          userId: true,
          profilePicture: true,
        },
      },
      subject: {
        select: {
          name: true,
          id: true,
          slug: true,
          category: {
            select: {
              name: true,
              id: true,
              slug: true,
            },
          },
        },
      },
    },
  });
  // meta data for pagination
  const totalCount = await prisma.slot.count({
    where: {
      AND: partials,
    },
  });
  return {
    data: allSLots,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      totalRecords: totalCount,
      totalPages: filters.limit ? Math.ceil(totalCount / filters.limit) : 1,
    },
  };
};
// get slot details

const getSlotById = async (slotId: string) => {
  return await prisma.slot.findUnique({
    where: { id: slotId },
    include: {
      tutorProfile: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          userId: true,
          profilePicture: true,
        },
      },
      subject: {
        select: {
          name: true,
          id: true,
          slug: true,
          category: {
            select: {
              name: true,
              id: true,
              slug: true,
            },
          },
        },
      },
    },
  });
};

// Mark as booked
const markSlotAsBooked = async (slotId: string) => {
  return await prisma.slot.update({
    where: { id: slotId },
    data: { isBooked: true },
  });
};

// Mark as unbooked
const markSlotAsUnbooked = async (slotId: string) => {
  return await prisma.slot.update({
    where: { id: slotId },
    data: { isBooked: false },
  });
};

// delete slot
const deleteSlot = async (slotId: string) => {
  return await prisma.slot.delete({
    where: { id: slotId },
  });
};

// update slot - TODO
const updateSlot = async (
  slotId: string,
  updateData: Partial<ICreateSlotPayload>,
) => {
  return await prisma.slot.update({
    where: { id: slotId },
    data: updateData,
  });
};

const getAllPastSlots = async (
  limit: number = 20,
  skip: number = 0,
  page: number = 1,
) => {
  const now = new Date();
  const bookings = await prisma.slot.findMany({
    where: {
      OR: [
        {
          date: {
            lt: now,
          },
        },
        {
          AND: [
            {
              date: {
                equals: now,
              },
            },
            {
              endTime: {
                lt: now.toISOString().split(" ")[0], // past time
              },
            },
          ],
        },
      ],
    },

    take: limit,
    skip: skip + (page - 1) * limit,
    orderBy: { createdAt: "desc" },
  });
  return {
    data: bookings,
    pagination: {
      page,
      limit,
      totalRecords: bookings.length,
      totalPages: Math.ceil(bookings.length / limit),
    },
  };
};

const getSlotsByTutorId = async (tutorId: string, params: SlotSearchParams) => {
  const partials: SlotWhereInput[] = [
    {
      tutorId,
    },
  ];
  if (params.search != undefined) {
    partials.push({
      OR: [
        {
          tutorProfile: {
            firstName: {
              contains: params.search,
              mode: "insensitive",
            },
            lastName: {
              contains: params.search,
              mode: "insensitive",
            },
          },
        },
        {
          subject: {
            name: {
              contains: params.search,
              mode: "insensitive",
            },
            slug: {
              contains: params.search,
              mode: "insensitive",
            },

            category: {
              name: {
                contains: params.search,
                mode: "insensitive",
              },
              slug: {
                contains: params.search,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    });
  }
  if (params.isFeatured !== undefined) {
    partials.push({
      isFeatured: params.isFeatured ? true : false,
    });
  }
  if (params.isBooked !== undefined) {
    partials.push({
      isBooked: params.isBooked ? true : false,
    });
  }
  if (params.isFree !== undefined) {
    partials.push({
      isFree: params.isFree ? true : false,
    });
  }
  if (params.subjectId != undefined) {
    partials.push({
      subjectId: params.subjectId,
    });
  }
  if (params.date != undefined) {
    partials.push({
      date: new Date(params.date),
    });
  }
  const allSlots = await prisma.slot.findMany({
    where: { AND: partials },
    take: params.limit ? params.limit : 10,
    skip: params.skip ? params.skip : 0,
    orderBy: {
      [params.sortBy || "createdAt"]: params.orderBy === "asc" ? "asc" : "desc",
    },
    include: {
      subject: {
        select: {
          name: true,
          id: true,
          slug: true,
          category: {
            select: {
              name: true,
              id: true,
              slug: true,
            },
          },
        },
      },
      tutorProfile: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          userId: true,
          profilePicture: true,
        },
      },
    },
  });

  // meta data for pagination
  const totalCount = await prisma.slot.count({
    where: { AND: partials },
  });
  return {
    data: allSlots,
    pagination: {
      page: params.page,
      limit: params.limit,
      totalRecords: totalCount,
      totalPages: params.limit ? Math.ceil(totalCount / params.limit) : 1,
    },
  };
};
const getAllPastSlotsByTutorId = async (
  tutorId: string,
  limit: number = 20,
  skip: number = 0,
  page: number = 1,
) => {
  const now = new Date();
  const bookings = await prisma.slot.findMany({
    where: {
      tutorId,
      OR: [
        {
          date: {
            lt: now,
          },
        },
        {
          AND: [
            {
              date: {
                equals: now,
              },
            },
            {
              endTime: {
                lt: now.toISOString().split(" ")[0], // past time
              },
            },
          ],
        },
      ],
    },

    take: limit,
    skip: skip + (page - 1) * limit,
    orderBy: { createdAt: "desc" },
  });
  return {
    data: bookings,
    pagination: {
      page,
      limit,
      totalRecords: bookings.length,
      totalPages: Math.ceil(bookings.length / limit),
    },
  };
};

export const slotService = {
  createSlot,
  markSlotAsBooked,
  markSlotAsUnbooked,
  deleteSlot,
  getSlots,
  getSlotById,
  updateSlot,
  getAllPastSlots,
  getSlotsByTutorId,
  getAllPastSlotsByTutorId,
};
