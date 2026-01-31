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
                    tutorProfile: {
                        select: {
                            tid: true,
                            firstName: true,
                            lastName:true,
                        }
                    },
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
export const studentService = {
    createStudent,
    getStudentByStudentId,
    getStudentById,
    updateStudent,
    deleteStudent
}