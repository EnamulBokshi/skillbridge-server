import { User } from "better-auth";
import { prisma } from "../../lib/prisma";

const getUserById = async(userId: string) => {
    return await prisma.user.findUnique({
        where: { id: userId },
        include: {
            student: {
                select: {
                    id: true,
                    lastName: true,
                    firstName: true
                }
            },
            tutorProfile: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                }
            }
        }
        
    })
}

const updateUser = async(userId: string, data: Partial<User>) => {
    return await prisma.user.update({
        where: { id: userId },
        data,
    })
}

const deleteUser = async(userId: string) => {
    return await prisma.user.delete({
        where: { id: userId },
    })
}
export const userService =  { getUserById, updateUser, deleteUser };