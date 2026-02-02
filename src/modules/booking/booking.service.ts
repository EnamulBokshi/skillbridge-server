import { BookingStatus } from "../../../generated/prisma/enums";
import { BookingCreateInput, BookingUncheckedCreateInput, BookingWhereInput, SlotWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { BookingSearchParams } from "../../types";
//TODO:* Create booking with PENDING status, then CONFIRMED upon payment success
//* Admin and Tutor can APPROVE or REJECT booking - change status accordingly
// * Cancel booking - change status to CANCELLED
// * View bookings by student, by slot, by status, date filter, pagination, sorting

// booking statestics - total bookings, bookings by status, booking trends over time, earnings from bookings, bookings by tutor, popular subjects based on bookings, popular categories based on bookings 

const createBooking = async (data:BookingUncheckedCreateInput) => {
    return await prisma.booking.create({ data })
} 

const getAllBookings = async (params:BookingSearchParams) => {
    const partials: BookingWhereInput [] = [];
    const { studentId, tutorId, slotId, status, date, page =1, limit=10, sortBy, orderBy } = params;
    if(status){
        partials.push({status})
    }
    if(date){
        const startOfDay = new Date(date);
        startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23,59,59,999);
        partials.push({
            createdAt: {
                gte: startOfDay,
                lte: endOfDay
            }
        })
    }
    if(studentId){
        partials.push({studentId})
    }
    if(tutorId){
        partials.push({slot: {tutorId}})
    }
    if(slotId){
        partials.push({slotId})
    }
    const allBookings =  await prisma.booking.findMany({
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
            [sortBy || 'createdAt']: orderBy === 'asc' ? 'asc' : 'desc'
        },
        where: {
            AND: partials
        },
        include: {
            student: true,
            slot: {
                select: {
                    id: true,
                    date: true,
                    startTime: true,
                    endTime: true,
                    slotPrice: true,
                    tutorProfile: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            }
        }
    });
    // meta data for pagination 
    const totalCount = await prisma.booking.count({
        where: {
            AND: partials
        }
    });
    return {
        data: allBookings,
        pagination: {
            page,
            limit,
            totalRecords: totalCount,
            totalPages: Math.ceil(totalCount / limit)
        }
    }
}

const getBookingById = async (id:string) => {
    return await prisma.booking.findUnique({
        where: { id },
        include: {
            student: true,
            slot: {
                select: {
                    id: true,
                    date: true,
                    startTime: true,
                    endTime: true,
                    slotPrice: true,
                    tutorProfile: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            }
        }
    })
}

const getBookingsByStudentId = async (studentId: string) => {
    return await prisma.booking.findMany({
        where: { studentId },
        include: {
            slot: {
                select:{
                    id: true,
                    date: true,
                    startTime: true,
                    endTime: true,
                    slotPrice: true,
                    tutorProfile: {
                        select: {
                            id: true, 
                            firstName: true,
                            lastName: true,
                            email: true,
                            profilePicture: true,
                        }
                    }
                }
            }
        }
    })
}

const confirmBooking = async (id: string) => {
    const result = await prisma.$transaction(async (tx)=> {
        // Fetch booking with slot data first
        const existingBooking = await tx.booking.findUnique({
            where: { id },
            include: { slot: true }
        });
        
        if (!existingBooking) {
            throw new Error("Booking not found");
        }
        
        if (!existingBooking.slot) {
            throw new Error("Slot not found for the booking");
        }
        
        // Update booking status
        const booking = await tx.booking.update({
            where: { id },
            data: { status: 'CONFIRMED' }
        });
        
        // Update slot to mark as booked
        await tx.slot.update({
            where: { id: existingBooking.slotId },
            data: { isBooked: true }
        });
        
        // Update tutor's total earnings
        await tx.tutorProfile.update({
            where: { id: existingBooking.slot.tutorId },
            data: {
                totalEarned: {
                    increment: existingBooking.slot.slotPrice
                }
            }
        });
        
        return booking;
    });
    return result;
}

const cancelBooking = async (id: string) => {
    const resutl = await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
            where: {id},
            include: { slot:{select: {tutorId: true, slotPrice: true}}}
        })
        if(!booking) {
            throw new Error("Booking not found");
        }
        // Refund logic can be added here after integrating payment gateway 

        // Update tutor's total earnings deducting the booking amount
        await tx.tutorProfile.update({
            where: {id: booking.slot.tutorId},
            data: {
                totalEarned: {
                    decrement: booking.slot.slotPrice
                }
            }
        })
        // update booking status to CANCELLED
        const updatedBooking = await tx.booking.update({
            where: {id},
            data: { status: 'CANCELLED' }
        })
        // update slot to mark as unbooked
        await tx.slot.update({
            where: {id: booking.slotId},
            data: { isBooked: false }
        })
        return updatedBooking;
    })
    return resutl;
}

const completeBooking = async (id: string) => {
    return await prisma.booking.update({
        where: { id },
        data: {
            status: 'COMPLETED'
        }
    })
}

const updateStatus = async (id: string, status: BookingStatus) => {
    return await prisma.booking.update({
        where: { id },
        data: { status }
    })
}
const getBookingStats = async ()=> {
    const totalBookings = await prisma.booking.count();
    const bookingsByStatus = await prisma.booking.groupBy({
        by: ['status'],
        _count: {
            status: true
        }
    });

    return {
        totalBookings,
        bookingsByStatus,
    }
}
export const bookingService = {
    createBooking,
    getBookingById,
    confirmBooking,
    cancelBooking,
    completeBooking,
    updateStatus,
    getBookingsByStudentId,
    getAllBookings

}