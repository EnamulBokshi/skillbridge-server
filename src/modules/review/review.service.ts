import {  ReviewUncheckedCreateInput } from "../../generated/prisma/models.js";
import { prisma } from "../../lib/prisma.js";
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
}

const getReviewsByTutorId = async(tutorId: string) => {
    return await prisma.review.findMany({
        where: { tutorId },
        orderBy: { createdAt: 'desc' }
    });
}



export const reviewService = {
    createReview,
    getReviewsByTutorId
}