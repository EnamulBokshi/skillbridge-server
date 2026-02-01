import { SlotCreateInput } from "../../../generated/prisma/models"
import { prisma } from "../../lib/prisma"
import { ISlot } from "../../types"

const createSlot = async (slotData:ISlot)=> {
    return await prisma.slot.create({
        data: slotData
    })
}


export const slotService = {
    createSlot
}