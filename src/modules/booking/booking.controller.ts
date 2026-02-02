import { Request, Response } from "express";
import { errorResponse } from "../../helpers/errorResponse";
import { bookingService } from "./booking.service";
import { successResponse } from "../../helpers/successResponse";
import { BookingSearchParams } from "../../types";
import { slotService } from "../slot/slot.service";

const createBooking = async(req: Request, res: Response) => {
    try {
        const { slotId, studentId } = req.body;
        if(!slotId || !studentId) {
            return errorResponse(res, 400, null, "slotId and studentId are required");
        }
        const slot = await slotService.getSlotById(slotId);
        if(!slot) {
            return errorResponse(res, 404, null, "Slot not found");
        }
        if(slot.isBooked) {
            return errorResponse(res, 400, null, "Slot is already booked");
        }
        const currentDate = new Date();

        const slotEndDateTime = new Date(`${slot.date}T${slot.endTime}`);
        if(slotEndDateTime < currentDate) {
            return errorResponse(res, 400, null, "Cannot book a slot in the past");
        }

        const booking = await bookingService.createBooking({slotId, studentId});
        successResponse(res, 201, booking, "Booking created successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't create booking!!");
    }
}

const confirmBooking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if(!id) {
            return errorResponse(res, 400, null, "Booking ID is required");
        }
        const booking = await bookingService.confirmBooking(id as string);
        successResponse(res, 200, booking, "Booking confirmed successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't confirm booking!!");
    }
}

const getBookingById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if(!id) {
            return errorResponse(res, 400, null, "Booking ID is required");
        }
        const booking = await bookingService.getBookingById(id as string);
        if(!booking) {
            return errorResponse(res, 404, null, "Booking not found");
        }
        successResponse(res, 200, booking, "Booking fetched successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch booking!!");
    }
} 

const getBookings = async (req: Request, res: Response) => {
    try {
        const params: BookingSearchParams = req.query;
        const bookings = await bookingService.getAllBookings(params);
        successResponse(res, 200, bookings, "Bookings fetched successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch bookings!!");
    }
}
export const bookingController = {
    createBooking,
    getBookingById,
    confirmBooking,
    getBookings
}