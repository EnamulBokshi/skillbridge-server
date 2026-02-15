import { Request, Response } from "express";
import { errorResponse } from "../../helpers/errorResponse.js";
import { bookingService } from "./booking.service.js";
import { successResponse } from "../../helpers/successResponse.js";
import { BookingSearchParams } from "../../types/index.js";
import { slotService } from "../slot/slot.service.js";

const createBooking = async(req: Request, res: Response) => {
    try {
        const user = req.user;
        if(!user) {
            return errorResponse(res, 401, null, "Unauthorized");
        }
        const studentId = user.id;
        const { slotId } = req.body;
        if(!slotId || !studentId) {
            return errorResponse(res, 400, null, "slotId and studentId are required");
        }
        console.log({ slotId, studentId });
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
        const { bookingId } = req.params;
        if(!bookingId) {
            return errorResponse(res, 400, null, "Booking ID is required");
        }
        const booking = await bookingService.confirmBooking(bookingId as string);
        successResponse(res, 200, booking, "Booking confirmed successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't confirm booking!!");
    }
}

const cancelBooking = async (req: Request, res: Response) => { 
    try {
        const { bookingId } = req.params;
        if (!bookingId) {
            return errorResponse(res, 400, null, "Booking ID is required");
        }
        const canceledBooking = await bookingService.cancelBooking(bookingId as string);
        successResponse(res, 200, canceledBooking, "Booking canceled successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't cancel booking!!");
    }
 }

const getBookingById = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        if(!bookingId) {
            return errorResponse(res, 400, null, "Booking ID is required");
        }
        const booking = await bookingService.getBookingById(bookingId as string);
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
const getAllPendingBookings = async (req: Request, res: Response) => {
    try {
        const bookings = await bookingService.getllPendingBookings();
        successResponse(res, 200, bookings, "Pending bookings fetched successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch pending bookings!!");
    }
}

const getAllPendingBookingsByTutorId = async (req: Request, res: Response) => {
    try {
        const { tutorId } = req.params;
        if (!tutorId) {
            return errorResponse(res, 400, null, "Tutor ID is required");
        }
        const bookings = await bookingService.getllPendingBookingsByTutorId(tutorId as string);
        successResponse(res, 200, bookings, "Pending bookings fetched successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch pending bookings!!");
    }
}

const getAllBookingsByStudentId = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;

        if (!studentId) {
            return errorResponse(res, 400, null, "Student ID is required");
        }
        const filters = req.query;

        const bookings = await bookingService.getBookingsByStudentId(studentId as string, filters);
        successResponse(res, 200, bookings, "Bookings fetched successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch bookings!!");
    }
}
const completeBooking = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        if(!bookingId) {
            return errorResponse(res, 400, null, "Booking ID is required");
        }
        const booking = await bookingService.completeBooking(bookingId as string);
        successResponse(res, 200, booking, "Booking marked as completed successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't mark booking as completed!!");
    }
}
export const bookingController = {
    createBooking,
    getBookingById,
    confirmBooking,
    getBookings,
    cancelBooking,
    getAllPendingBookings,
    getAllPendingBookingsByTutorId,
    getAllBookingsByStudentId,
    completeBooking,

}