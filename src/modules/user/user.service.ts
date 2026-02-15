import { User } from "better-auth";
import { prisma } from "../../lib/prisma.js";
import { UserUpdateInput } from "../../generated/prisma/models.js";

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

const updateUser = async(userId: string, data:UserUpdateInput) => {
    const payload: UserUpdateInput = { }
    if(data.email) payload.email = data.email;
    if(data.name) payload.name = data.name;
    if(data.image) payload.image = data.image;
    if(data.emailVerified) payload.emailVerified = data.emailVerified;
    

    return await prisma.user.update({
        where: { id: userId },
        data: payload,
    })
}

const deleteUser = async(userId: string) => {
    return await prisma.user.delete({
        where: { id: userId },
    })
}
export const userService =  { getUserById, updateUser, deleteUser };