import { Request, Response } from "express";
import { errorResponse } from "../../helpers/errorResponse";
import { slotService } from "./slot.service";
import { successResponse } from "../../helpers/successResponse";


const createSlot = async (req: Request, res: Response) => {
    try {
        const slotData = req.body;
        if(!slotData.tutorId || !slotData.date || !slotData.startTime || !slotData.endTime) {
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

export const slotController = {
    createSlot
}