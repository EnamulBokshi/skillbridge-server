import { prisma } from "../../lib/prisma.js";
import { Subject } from "../../types/index.js";

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
    if (data.categoryId) {
        const categoryExists = await prisma.category.findUnique({
            where: { id: data.categoryId }
        });
        if (!categoryExists) {
            throw new Error("Category not found");
        }
    }

    if (data.slug) {
        const existingSubject = await prisma.subject.findFirst({
            where: {
                slug: data.slug,
                NOT: { id }
            }
        });
        if (existingSubject) {
            throw new Error("Slug already exists");
        }
    }
    return await prisma.subject.update({
        where: { id },
        data: data,
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true
                }
            }
        }
    });
}

export const subjectService = {
    createSubject,
    getAllSubjects,
    getSubjectsByCategory,
    deleteSubject,
    updateSubject
}