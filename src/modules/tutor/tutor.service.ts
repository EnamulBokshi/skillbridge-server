import { generateId } from "../../helpers/idGenerator";
import { prisma } from "../../lib/prisma";
import { TutorRegistration } from "../../types";

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

export const tutorService = {
    createTutor,
}