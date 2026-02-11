import { uuid } from "better-auth";
import { generateId } from "../../helpers/idGenerator";
import { prisma } from "../../lib/prisma";
import { StudentRegistration } from "../../types";
import { ReviewUncheckedCreateInput } from "../../../generated/prisma/models";


const createStudent = async(payload: StudentRegistration)=>{
    const sid = await generateId({entityType: "student", prefix: "S"});
    const data = {...payload, sid}
    return await prisma.$transaction(async(tx)=>{
        const student = await tx.student.create({data});
        await tx.user.update({
            where: {
                id: student.userId
            },

            data: {
                isAssociate: true,
                role: "STUDENT"
            },
            
        });

        return student;

    })
    
}

const getStudentByStudentId = async(sid:string) => {
    return await prisma.student.findUnique({
        where: {
            sid: sid
        }
    })
}
const getStudentById = async(id: string) => {
    return await prisma.student.findUnique({
        where: {id},
        include:{
            user: true,
            reviews: {
                include: {
                    tutor: {
                        select: {
                            tid: true,
                            firstName: true,
                            lastName: true,
                            avgRating: true,
                        }
                    }
                }
            },
            bookings: {
                include: {
                    slot:true
                }
            },

        }
    })
}

const updateStudent = async (id: string, data: Partial<StudentRegistration>) => {
    return await prisma.student.update({
        where: {id},
        data,
    })
}

const deleteStudent = async (id: string) => {
    return await prisma.student.delete({
        where: {id},
    })
}
const studentStats = async (studentId: string) => {
    // Implementation for fetching student statistics
    const result = await prisma.$transaction(async (tx)=>{

        const totalBookings = await tx.booking.count({
            where: { studentId }
        });

        const latestBooking = await tx.booking.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
            include: {
                slot: {
                    select: {
                        tutorProfile:{
                            select: {
                                id: true,
                                
                                firstName: true,
                                lastName: true,
                                avgRating: true,
                            }
                        },
                        startTime: true,
                        endTime: true,
                        date: true,
                        id: true,
                        slotPrice: true
                    },
                
                }
            },
            take: 5
        },
    );
    const totalCompletedBookings = await tx.booking.count({
        where: {
            studentId,
            status: "COMPLETED"
        }
    })
    
    const totalUpcomingBookings = await tx.booking.count({
        where: {
            studentId,
            status: "CONFIRMED",
        }
    })

        // const totalTutors = await tx.booking.groupBy({
        //     by: ['tutorId'],
        //     where: { studentId },
        //     _count: {
        //         tutorId: true
        //     }
        // })
        // const favoriteTutorId = totalTutors.sort((a, b) => b._count.tutorId - a._count.tutorId)[0];
        // const favoriteTutor = favoriteTutorId ? await tx.tutorProfile.findUnique({
        //     where: { id: favoriteTutorId.tutorId },
        //     select: {
        //         tid: true,
        //         firstName: true,
        //         lastName: true,
        //         avgRating: true,
        //     }
        // }) : null;


        // const favoriteSubject = await tx.booking.groupBy({
        //     by: ['']
        // })

        const totalReviews = await tx.review.count({
            where: { studentId }
        });
        const data = {
            totalBookings,
            totalCompletedBookings,
            totalUpcomingBookings,
            latestBooking,
            // favoriteTutor,
            totalReviews
        }
        return data;
        
    })
    return result;
}
const createReview = async (payload: ReviewUncheckedCreateInput) => {
    const result = await prisma.$transaction(async(tx)=> {
        // find the tutor profile
        const tutorProfile = await tx.tutorProfile.findUnique({
            where: { id: payload.tutorId }
        });
        if(!tutorProfile) {
            throw new Error("Tutor profile not found");
        }

        // create the review
        const review = await tx.review.create({
            data: payload
        });

        // update tutor's avg rating and total reviews
        const totalReviews = await tx.review.count({
            where: { tutorId: payload.tutorId }
        });

        const sumRatingsResult = await tx.review.aggregate({
            where: { tutorId: payload.tutorId },
            _sum: { rating: true }
        });

        const sumRatings = sumRatingsResult._sum.rating || 0;
        const avgRating = sumRatings / totalReviews;

        await tx.tutorProfile.update({
            where: { id: payload.tutorId },
            data: {
                avgRating,
                totalReviews
            }
        });

        return review;
    }

   );  
   
    return result
}


export const studentService = {
    createStudent,
    getStudentByStudentId,
    getStudentById,
    updateStudent,
    deleteStudent,
    studentStats,
    createReview
}