import { uuid } from "better-auth";
import { generateId } from "../../helpers/idGenerator";
import { prisma } from "../../lib/prisma";
import { StudentRegistration } from "../../types";


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
                isAssociate: true
            },
            
        });

        return student;

    })
    
}



export const studentService = {
    createStudent,
    
}