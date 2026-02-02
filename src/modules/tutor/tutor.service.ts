import { generateId } from "../../helpers/idGenerator";
import { prisma } from "../../lib/prisma";
import { TutorRegistration } from "../../types";

// Tutor has right to know his/her total earning, total bookings, upcoming bookings, completed bookings, ratings, reviews, subjects taught, student list etc.

const createTutor = async(payload: TutorRegistration) => {
    const tid = await generateId({entityType: "tutor", prefix: "T"});
    const data = {...payload, tid}
    return await prisma.$transaction(async(tx)=>{
        const tutor = await tx.tutorProfile.create({data});

        await tx.user.update({
            where: {
                id: tutor.userId
            },

            data: {
                isAssociate: true,
                role: "TUTOR"
            },
            
        });

        return tutor;

    })

}

const updateTutorProfile = async(tutorId: string, payload: Partial<TutorRegistration>) => {
    return await prisma.tutorProfile.update({
        where: { id: tutorId },
        data: payload
    })
}


const getTutorById = async(tutorId: string) => {
    return await prisma.tutorProfile.findUnique({
        where: { id: tutorId }
    })
}
const deleteTutor = async(tutorId: string) => {
    return await prisma.tutorProfile.delete({
        where: { id: tutorId }
    })
}

export const tutorService = {
    createTutor,
    updateTutorProfile,
    getTutorById,
    deleteTutor
}