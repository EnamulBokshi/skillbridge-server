import { prisma } from "../../lib/prisma"
import { ICreateSlotPayload } from "../../types"
//TODO: mark as booked, unbooked, date filter, tutor filter, subject filter, pagination, sorting, delete..
const createSlot = async (slotData:ICreateSlotPayload)=> {
    return await prisma.slot.create({
        data: slotData
    })
}
// view slots by various filters - TODO
const getSlots = async (filters: { tutorId?: string; date?: string; subjectId?: string; isBooked?: boolean; }) => {
    const whereClause: any = {};
    if (filters.tutorId) {
        whereClause.tutorId = filters.tutorId;
    }
    if (filters.date) {
        whereClause.date = new Date(filters.date);
    }
    if (filters.subjectId) {
        whereClause.subjectId = filters.subjectId;
    }
    if (filters.isBooked !== undefined) {
        whereClause.isBooked = filters.isBooked;
    }

    return await prisma.slot.findMany({
        where: whereClause
    });
}
// get slot details

const getSlotById = async (slotId: string) => {
    return await prisma.slot.findUnique({
        where: { id: slotId }
    })
}


// Mark as booked
const markSlotAsBooked = async (slotId: string) => {
    return await prisma.slot.update({
        where: { id: slotId },
        data: { isBooked: true }
    })
}

// Mark as unbooked
const markSlotAsUnbooked = async (slotId: string) => {
    return await prisma.slot.update({
        where: { id: slotId },
        data: { isBooked: false }
    })
}

// delete slot
const deleteSlot = async (slotId: string) => {
    return await prisma.slot.delete({
        where: { id: slotId }
    })
}

// update slot - TODO
const updateSlot = async (slotId: string, updateData: Partial<ICreateSlotPayload>) => {
    return await prisma.slot.update({
        where: { id: slotId },
        data: updateData
    })
}

export const slotService = {
    createSlot,
    markSlotAsBooked,
    markSlotAsUnbooked,
    deleteSlot,
    getSlots,
    getSlotById,
    updateSlot
}