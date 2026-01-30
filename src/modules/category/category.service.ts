import { prisma } from "../../lib/prisma";
import { Category } from "../../types";

const createCategory = async (data: Category) => {
        return await prisma.category.create({
            data: data
        });
}

const getAllCategories = async (): Promise<Category[]> => {
    return await prisma.category.findMany();
}

const deleteCategory = async (id: string): Promise<Category | null> => {
    return await prisma.category.delete({
        where: { id }
    });
}

const updateCategory = async (id: string, data: Partial<Category>): Promise<Category | null> => {
    return await prisma.category.update({
        where: { id },
        data: data
    });
}

export const categoryService = {
    createCategory,
    getAllCategories,
    deleteCategory,
    updateCategory
}