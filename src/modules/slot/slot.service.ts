import { SlotWhereInput } from "../../../generated/prisma/models"
import { prisma } from "../../lib/prisma"
import { ICreateSlotPayload, SlotSearchParams } from "../../types"
//TODO: mark as booked, unbooked, date filter, tutor filter, subject filter, pagination, sorting, delete..
const createSlot = async (slotData:ICreateSlotPayload)=> {
    return await prisma.slot.create({
        data: slotData
    })
}
// view slots by various filters - TODO
const getSlots = async (filters: SlotSearchParams) => {
    
    const partials:SlotWhereInput[] = [];
    if(filters.search){
        partials.push({
            OR:[
                {
                    tutorProfile:{
                        firstName: {
                            contains: filters.search,
                            mode: "insensitive"
                        },
                        lastName: {
                            contains: filters.search,
                            mode: "insensitive"
                        }
                    }
                },
                {
                    subject: {
                        name: {
                            contains: filters.search,
                            mode: "insensitive"
                        }
                    }
                },
                
            ]
        })
    }
    if(filters.isFeatured !== undefined){
        partials.push({
            isFeatured: filters.isFeatured
        })
    }
    if(filters.isFree !== undefined){
        partials.push({
            isFree: filters.isFree
        })
    }
    if(filters.tutorId){
        partials.push({
            tutorId: filters.tutorId
        })
    }
    if(filters.subjectId){
        partials.push({
            subjectId: filters.subjectId
        })
    }
    if(filters.date){
        partials.push({
            date: new Date(filters.date)
        })
    }

    const allSLots =  await prisma.slot.findMany({
        take: filters.limit ? filters.limit : 10,
        skip: filters.skip? filters.skip : 0,
        orderBy: {
            [filters.sortBy || 'createdAt']: filters.orderBy === 'asc' ? 'asc' : 'desc'
        },
        where: {
            AND: partials
        },
        include: {
            tutorProfile: {
                select: {

                    id: true,
                    firstName: true,
                    lastName: true,
                    userId: true,
                    profilePicture: true
                }
            },
            subject: {
                select: {
                    name: true,
                    id: true,
                    slug: true,
                    category:{
                        select: {
                            name: true,
                            id: true,
                            slug: true
                        }
                    }
                }
                
            }
        }
    });
    // meta data for pagination 
    const totalCount = await prisma.slot.count({
        where: {
            AND: partials
        }
    });
    return {
        data: allSLots,
        pagination: {
            page: filters.page,
            limit: filters.limit,
            totalRecords: totalCount,
            totalPages: filters.limit ? Math.ceil(totalCount / filters.limit) : 1
        }
    }
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