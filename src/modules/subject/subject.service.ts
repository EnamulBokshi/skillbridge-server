import { prisma } from "../../lib/prisma";
import { Subject } from "../../types";

const createSubject = async(data: Subject) => {
    return await prisma.subject.create({data})   
}

const getAllSubjects = async() => {
    return await prisma.subject.findMany({
        include: {
            category:{
                select: {
                    id: true, 
                    name: true
                }
            }
        }
    });
}

const getSubjectsByCategory = async(categoryId: string) => {
    return await prisma.subject.findMany({
        where: { categoryId },
        include: {
            category: {
                select: {
                    id: true, 
                    name: true
                }
            }
        }
    });
}

const deleteSubject = async(id: string) => {
    return await prisma.subject.delete({
        where: { id }
    });
}

const updateSubject = async(id: string, data: Partial<Subject>) => {
    return await prisma.subject.update({
        where: { id },
        data: data
    });
}

export const subjectService = {
    createSubject,
    getAllSubjects,
    getSubjectsByCategory,
    deleteSubject,
    updateSubject
}