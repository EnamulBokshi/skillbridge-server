import { prisma } from "../../lib/prisma";

const getTotalEarnings = async () => {
    // Get all confirmed and completed bookings with their slot prices
    const bookings = await prisma.booking.findMany({
        where: {
            status: {
                in: ['CONFIRMED', 'COMPLETED']
            }
        },
        include: {
            slot: {
                select: {
                    slotPrice: true
                }
            }
        }
    });
    
    // Sum up the slot prices
    const total = bookings.reduce((sum, booking) => sum + booking.slot.slotPrice, 0);
    
    return { totalEarnings: total };
}

// mutations for admin -> user management

const deleteUser = async (userId: string) => {
    return await prisma.user.delete({
        where: { id: userId }
    });
};



export const adminService = {
    getTotalEarnings,
    deleteUser
}