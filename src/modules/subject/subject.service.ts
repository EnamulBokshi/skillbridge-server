import { prisma } from "../../lib/prisma";
import { Subject } from "../../types";

const createSubject = async(data: Subject):Promise<Subject> => {
    return await prisma.subject.create({data})   
}

const getAllSubjects = async():Promise<Subject[]> => {
    return await prisma.subject.findMany();
}

const getSubjectsByCategory = async(categoryId: string):Promise<Subject[]> => {
    return await prisma.subject.findMany({
        where: { categoryId }
    });
}

const deleteSubject = async(id: string):Promise<Subject | null> => {
    return await prisma.subject.delete({
        where: { id }
    });
}

const updateSubject = async(id: string, data: Partial<Subject>):Promise<Subject | null> => {
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