import { Request, Response } from "express";
import { errorResponse } from "../../helpers/errorResponse";
import { slotService } from "./slot.service";
import { successResponse } from "../../helpers/successResponse";
import { ICreateSlotPayload } from "../../types";


const createSlot = async (req: Request, res: Response) => {
    try {
        const slotData: ICreateSlotPayload = req.body;
        if(!slotData.tutorId || !slotData.date || !slotData.startTime || !slotData.endTime || !slotData.subjectId || slotData.slotPrice === undefined ) {
            return errorResponse(res, 400, null, "Missing required slot fields");
        }
        const newSlot = await slotService.createSlot({...slotData, isBooked: false});
        if(!newSlot) {
            return errorResponse(res, 500, null, "Slot creation failed");
        }

        successResponse(res, 201, newSlot, "Slot created successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't create slot!!");
    }
}
const getSlots = async (req: Request, res: Response) => {
    try {
        const filters = req.query;
        const slots = await slotService.getSlots({
            tutorId: filters.tutorId as string,
            date: filters.date as string,
            subjectId: filters.subjectId as string,
            isBooked: filters.isBooked ? filters.isBooked === 'true' : undefined
        });
        
        successResponse(res, 200, slots, "Slots fetched successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't create slot!!");
    }
}

const getSlotById = async (req: Request, res: Response) => {
    try { 
        const { id } = req.params;
        if(!id) {
            return errorResponse(res, 400, null, "Slot ID is required");
        }
        const slot = await slotService.getSlotById(id as string);
        if(!slot) {
            return errorResponse(res, 404, null, "Slot not found");
        }
        successResponse(res, 200, slot, "Slot fetched successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch slot!!");
    }
}

const markSlotAsBooked = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if(!id) {
            return errorResponse(res, 400, null, "Slot ID is required");
        }
        const slot = await slotService.getSlotById(id as string);
        if(!slot) {
            return errorResponse(res, 404, null, "Slot not found");
        }
        if(slot.isBooked) {
            return errorResponse(res, 400, null, "Slot is already booked");
        }
        const updatedSlot = await slotService.markSlotAsBooked(id as string);
        successResponse(res, 200, updatedSlot, "Slot marked as booked successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't mark slot as booked!!");
    }
}

const markSlotAsUnbooked = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if(!id) {
            return errorResponse(res, 400, null, "Slot ID is required");
        }
        const slot = await slotService.getSlotById(id as string);
        if(!slot) {
            return errorResponse(res, 404, null, "Slot not found");
        }
        if(!slot.isBooked) {
            return errorResponse(res, 400, null, "Slot is not booked");
        }
        const updatedSlot = await slotService.markSlotAsUnbooked(id as string);
        successResponse(res, 200, updatedSlot, "Slot marked as unbooked successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't mark slot as unbooked!!");
    }
}

const deleteSlot = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if(!id) {
            return errorResponse(res, 400, null, "Slot ID is required");
        }
        const slot = await slotService.getSlotById(id as string);
        if(!slot) {
            return errorResponse(res, 404, null, "Slot not found");
        }
        const deletedSlot = await slotService.deleteSlot(id as string);
        successResponse(res, 200, deletedSlot, "Slot deleted successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't delete slot!!");
    }
}

const updateSlot = async (req: Request, res: Response) => {
    try{
        const { id } = req.params;
        if(!id) {
            return errorResponse(res, 400, null, "Slot ID is required");
        }
        const slot = await slotService.getSlotById(id as string);
        if(!slot) {
            return errorResponse(res, 404, null, "Slot not found");
        }
        const updateData = req.body;
        const updatedSlot = await slotService.updateSlot(id as string, updateData);
        if(!updatedSlot) {
            return errorResponse(res, 500, null, "Slot update failed");
        }
        successResponse(res, 200, updatedSlot, "Slot updated successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't update slot!!");
    }
}
export const slotController = {
    createSlot,
    getSlots,
    getSlotById,
    markSlotAsBooked,
    markSlotAsUnbooked,
    deleteSlot,
    updateSlot
}