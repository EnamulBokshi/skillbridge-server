import { BookingStatus } from "../../generated/prisma/enums.js";
import { BookingCreateInput, BookingUncheckedCreateInput, BookingWhereInput, SlotWhereInput } from "../../generated/prisma/models.js";
import { prisma } from "../../lib/prisma.js";
import { BookingSearchParams } from "../../types/index.js";
//TODO:* Create booking with PENDING status, then CONFIRMED upon payment success
//* Admin and Tutor can APPROVE or REJECT booking - change status accordingly
// * Cancel booking - change status to CANCELLED
// * View bookings by student, by slot, by status, date filter, pagination, sorting

// booking statestics - total bookings, bookings by status, booking trends over time, earnings from bookings, bookings by tutor, popular subjects based on bookings, popular categories based on bookings 

const createBooking = async (data:BookingUncheckedCreateInput) => {
    const result = await prisma.$transaction(async(tx)=> {
        // create booking with PENDING status
        const student = await tx.student.findUnique({
            where: {
                userId: data.studentId
            }
        })
        if(!student) {
            throw new Error("Student profile not found");
        }
        data.studentId = student.id;

        const slot = await tx.slot.findUnique({
            where: { id: data.slotId }
        });

        if(!slot) {
            throw new Error("Slot not found");
        }
        const booking = await tx.booking.create({
            data: {
                ...data,
                status: BookingStatus.PENDING
            }
        });

        if(!booking) {
            throw new Error("Failed to create booking");
        }

        // update slot to mark as booked
        await tx.slot.update({
            where: { id: data.slotId },
            data: { isBooked: true }
        });

        // update tutor's total earnings
        

        // await tx.tutorProfile.update({
        //     where: { id: slot.tutorId },
        //     data: {
        //         totalEarned: {
        //             increment: slot.slotPrice
        //         }
        //     }
        // });
        return booking;
    });
    return result;
} 

const getAllBookings = async (params:BookingSearchParams) => {
    const partials: BookingWhereInput [] = [];
    const { studentId, tutorId, slotId, status, date, page=1, limit=10, sortBy, orderBy } = params;
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
            student: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profilePicture: true,
                }
            },
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
                            email: true,
                            profilePicture: true,
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
            student: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profilePicture: true,
                }
            },
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

const getBookingsByStudentId = async (studentId: string, params: BookingSearchParams) => {
    const partials: BookingWhereInput [] = [];
    const {search, status, date, page =1, limit=10, sortBy, orderBy } = params;
    if(search){
        partials.push({
            OR: [
                {
                    slot: {
                        tutorProfile: {
                            firstName: { contains: search, mode: "insensitive" }
                        },
                        subject: {
                            name: { contains: search, mode: "insensitive" },

                        }
                    },
                    
                },
               
                
            ]
        })
    }
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
    partials.push({studentId})
    const bookings =  await prisma.booking.findMany({
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
            [sortBy || 'createdAt']: orderBy === 'asc' ? 'asc' : 'desc'
        },
        where: {
            AND: partials
        },
        include: {
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
                            email: true,
                            profilePicture: true,   
                        }
                    }
                }
            },
            student: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profilePicture: true,
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
        data: bookings,
        pagination: {
            page,
            limit,
            totalRecords: totalCount,
            totalPages: Math.ceil(totalCount / limit)
        }
    }
    // return await prisma.booking.findMany({
    //     where: { studentId },
    //     include: {
    //         slot: {
    //             select:{
    //                 id: true,
    //                 date: true,
    //                 startTime: true,
    //                 endTime: true,
    //                 slotPrice: true,
    //                 tutorProfile: {
    //                     select: {
    //                         id: true, 
    //                         firstName: true,
    //                         lastName: true,
    //                         email: true,
    //                         profilePicture: true,
    //                     }
    //                 }
    //             }
    //         },
    //         student: {
    //             select: {
    //                 id: true,
    //                 firstName: true,
    //                 lastName: true,
    //                 email: true,
    //                 profilePicture: true,
    //             }
    //         }
    //     }
    // })
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
const upcomingBookings = async() => {
    const bookings = await prisma.booking.findMany({
        where: {
            status: 'CONFIRMED',
        },
        include: {

            student:{ select: { firstName: true, lastName: true } },
            
            slot: {
                select: {
                    date: true,
                    startTime: true,
                    endTime: true,
                    tutorId: true,
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
            },
            
        }
    })
    const now = new Date();
    const filteredBookings = bookings.filter((booking) => {
        const slotDateTime = new Date(`${booking.slot.startTime}`);
        return slotDateTime >= now;
    });
    return filteredBookings;
}
const deleteAllPastBookings = async() => {
    const now = new Date();
    await prisma.booking.deleteMany({
        where: {
            slot: {
                endTime: {
                    lt: now
                }
            }
        }
    })
}
const getCompletedBookings = async () => {
    const bookings = await prisma.booking.findMany({
        where: {
            status: 'COMPLETED',
        },
        include: {

            student:{ select: { firstName: true, lastName: true } },
            
            slot: {
                select: {
                    date: true,
                    startTime: true,
                    endTime: true,
                    tutorId: true,
                    slotPrice: true
                }
            },
            
        }
    })
    return bookings;
}

// const getBookingByTutorId = async (tutorId: string) => {
//     return await prisma.booking.findMany({
//         where: {
//             slot: {
//                 tutorId
//             }
//         },
//         include: {
//             student: true,
//             slot: true
//         }
//     })
// }   
const getBookingByTutorId = async (tutorId: string, params: BookingSearchParams) => {
    const partials: BookingWhereInput [] = [];
    const {search, status, date, page =1, limit=10, sortBy, orderBy } = params;
    if(search){
        partials.push({
            OR: [
                {
                    slot: {
                        tutorProfile: {
                            firstName: { contains: search, mode: "insensitive" }
                        },
                        subject: {
                            name: { contains: search, mode: "insensitive" },

                        }
                    },
                    
                },
               
                
            ]
        })
    }
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
    partials.push({
        slot: {
            tutorId
        }
    })
    const bookings =  await prisma.booking.findMany({
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
            [sortBy || 'createdAt']: orderBy === 'asc' ? 'asc' : 'desc'
        },
        where: {
            AND: partials
        },
        include: {
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
                            email: true,
                            profilePicture: true,   
                        }
                    }
                }
            },
            student: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profilePicture: true,
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
        data: bookings,
        pagination: {
            page,
            limit,
            totalRecords: totalCount,
            totalPages: Math.ceil(totalCount / limit)
        }
    }
    // return await prisma.booking.findMany({
    //     where: { studentId },
    //     include: {
    //         slot: {
    //             select:{
    //                 id: true,
    //                 date: true,
    //                 startTime: true,
    //                 endTime: true,
    //                 slotPrice: true,
    //                 tutorProfile: {
    //                     select: {
    //                         id: true, 
    //                         firstName: true,
    //                         lastName: true,
    //                         email: true,
    //                         profilePicture: true,
    //                     }
    //                 }
    //             }
    //         },
    //         student: {
    //             select: {
    //                 id: true,
    //                 firstName: true,
    //                 lastName: true,
    //                 email: true,
    //                 profilePicture: true,
    //             }
    //         }
    //     }
    // })
}

const getllPendingBookings = async ()=> {
    return await prisma.booking.findMany({
        where: {
            status: 'PENDING',
        },
        include: {
            student:{ select: { firstName: true, lastName: true } },
            
            slot: {
                select: {
                    date: true,
                    startTime: true,
                    endTime: true,
                    tutorId: true,
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
            },
            
        }
    })      
}
const getllPendingBookingsByTutorId = async (tutorId: string) => {
    return await prisma.booking.findMany({
        where: {
            status: 'PENDING',
            slot: {
                tutorId
            }
        },
        include: {
            student:{ select: { firstName: true, lastName: true } },
            
            slot: {
                select: {
                    date: true,
                    startTime: true,
                    endTime: true,
                    tutorId: true,
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
            },
            
        }
    })      
}

// const deletePastBookingById = async(id:string) => {
//     const now = new Date();
//     const booking = await prisma.booking.findUnique({
//         where: {id},
//         include: { slot: true }
//     });
//     if(!booking) {
//         throw new Error("Booking not found");
//     }
//     const slotDate = new Date(booking.slot.date);
//     slotDate.setHours(0,0,0,0);
//     const today = new Date(now);
//     today.setHours(0,0,0,0);
//     if(slotDate >= today) {
//         throw new Error("Only past bookings can be deleted");
//     }
//     await prisma.booking.delete({
//         where: {id}
//     })
// }
export const bookingService = {
    createBooking,
    getBookingById,
    confirmBooking,
    cancelBooking,
    completeBooking,
    updateStatus,
    getBookingsByStudentId,
    getAllBookings,
    upcomingBookings,
    getBookingStats,
    getCompletedBookings,
    deleteAllPastBookings,
    getBookingByTutorId,
    getllPendingBookings,
    getllPendingBookingsByTutorId

}