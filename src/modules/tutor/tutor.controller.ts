import { Request, Response } from "express";
import { tutorService } from "./tutor.service.js";
import { bookingService } from "../booking/booking.service.js";
import { reviewService } from "../review/review.service.js";
import { slotService } from "../slot/slot.service.js";
import { errorResponse } from "../../helpers/errorResponse.js";
import { successResponse } from "../../helpers/successResponse.js";
import { BookingSearchParams, SlotSearchParams } from "../../types/index.js";
import paginationSortHelper from "../../helpers/paginationHelper.js";

const createTutor = async(req: Request, res:Response) => {
    try {
        const tutorData: any = {...req.body};
        const userId = req.user?.id;
        const newTutor = await tutorService.createTutor({...tutorData, userId} );
        if(newTutor){
            successResponse(res, 201, newTutor, "Tutor profile created successfully!!");
            return;
        }   
        throw new Error('Tutor profile creation failed!!')
        
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't create tutor profile!!");
    }

}

const updateTutorProfile = async(req: Request, res: Response) => {
    try {
        const tutorId = req.params.tutorId;
        if(!tutorId) {
            return res.status(400).json({
                success: false,
                message: "Tutor ID is required"
            });
        }
        const payload = req.body;
        const updatedTutor = await tutorService.updateTutorProfile(tutorId as string, payload);
        successResponse(res, 200, updatedTutor, "Tutor profile updated successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't update tutor profile!!");
    }
}

const getTutorById = async(req: Request, res: Response) => {
    try {
        const tutorId = req.params.tutorId;
        if(!tutorId) {
            return errorResponse(res, 400, null, "Tutor ID is required");
        }
        const tutor = await tutorService.getTutorById(tutorId as string);
        if(!tutor) {
            return errorResponse(res, 404, null, "Tutor not found");
        }
        successResponse(res, 200, tutor, "Tutor fetched successfully!!");
            
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch tutor!!");
    }
}

const deleteTutor = async(req: Request, res: Response) => {
    try {
        const tutorId = req.params.tutorId;
        if(!tutorId) {
            return errorResponse(res, 400, null, "Tutor ID is required");
        }
        const deletedTutor = await tutorService.deleteTutor(tutorId as string);
        successResponse(res, 200, deletedTutor, "Tutor deleted successfully!!");
           
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't delete tutor!!");
    }
    
}

const getTutorDashboardStats = async(req: Request, res: Response) => {
    try {
        const tutorId = req.params.tutorId;
        if(!tutorId) {
            return errorResponse(res, 400, null, "Tutor ID is required");
        }
        console.log("Fetching dashboard stats for tutor ID (server):", tutorId); // Debug log to check the tutor ID
        const stats = await tutorService.getTutorDashboardStats(tutorId as string);
        console.log("Tutor Dashboard Stats:", stats); // Debug log to check the stats data
        successResponse(res, 200, stats, "Tutor dashboard stats fetched successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch tutor dashboard stats!!");
       
    }
}


// handle upcoming bookings 
const getUpcomingBookings = async (req: Request, res: Response) => {
try {
        const tutorId = req.params.tutorId;
        if(!tutorId) {
            return errorResponse(res, 400, null, "Tutor ID is required");
        }
        
        const bookings = await bookingService.upcomingBookings();
        const filteredBookings = bookings.filter((booking:any) => booking.slot.tutorId === tutorId);
        successResponse(res, 200, filteredBookings, "Upcoming bookings fetched successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch upcoming bookings!!");
    }
}

// handle completed bookings
const getCompletedBookings = async (req: Request, res: Response) => {
    try {
        const tutorId = req.params.tutorId;
        if(!tutorId) {
            return errorResponse(res, 400, null, "Tutor ID is required");
          
        }
        const bookings = await bookingService.getCompletedBookings();
        const filteredBookings = bookings.filter((booking:any) => booking.slot.tutorId === tutorId);
        successResponse(res, 200, filteredBookings, "Completed bookings fetched successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch completed bookings!!");
    }
}

const getTutorReviews = async (req: Request, res: Response) => {
    try {
        const tutorId = req.params.tutorId;
        if(!tutorId) {
            return errorResponse(res, 400, null, "Tutor ID is required");
            
        }
        const reviews = await reviewService.getReviewsByTutorId(tutorId as string);
        successResponse(res, 200, reviews, "Tutor reviews fetched successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch tutor reviews!!")
    }
}

const getTutorSlots = async (req: Request, res: Response) => {
    try {
        const tutorId = req.params.tutorId;
        if(!tutorId) {
            return errorResponse(res, 400, null, "Tutor ID is required");
        }
        const pagi = paginationSortHelper(req.query);

        const params: SlotSearchParams = {
            page: pagi.page,
            limit: pagi.limit,
            skip: pagi.skip,
            sortBy: (req.query.sortBy as string) || "createdAt",
            orderBy: (req.query.orderBy as string) || "desc",
            ...(req.query.date ? { date: req.query.date as string } : {}),
            ...(req.query.isBooked !== undefined ? { isBooked: req.query.isBooked === "true" } : {}),
            ...(req.query.isFeatured !== undefined ? { isFeatured: req.query.isFeatured === "true" } : {}),
            ...(req.query.isFree !== undefined ? { isFree: req.query.isFree === "true" } : {}),
        };

        const slots = await slotService.getSlotsByTutorId(tutorId as string, params);
        successResponse(res, 200, slots, "Tutor slots fetched successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch tutor slots!!");
    }
}

const deleteTutorSlot = async (req: Request, res: Response) => {
    try {
        
        const slotId = req.params.slotId;
        if(!slotId) {
            return errorResponse(res, 400, null, "Slot ID is required");
        }
        const deletedSlot = await slotService.deleteSlot(slotId as string);
        successResponse(res, 200, deletedSlot, "Tutor slot deleted successfully!!");
            
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't delete tutor slot!!");
            
    }
}

const updateBookingStatus = async (req: Request, res: Response) => {
    try {
        const tutorId = req.params.tutorId;
        const bookingId = req.params.bookingId;
        const { status } = req.body;
        if(!tutorId || !bookingId || !status) {
            return errorResponse(res, 400, null, "Tutor ID, Booking ID and status are required");
        }
        const updatedBooking = await tutorService.updateBookingStatus(tutorId as string, bookingId as string, status);
        successResponse(res, 200, updatedBooking, "Booking status updated successfully!!");
            
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't update booking status!!");
            
    }
}

const getTutorBookings = async (req: Request, res: Response) => {
    try {
        const tutorId = req.params.tutorId;
        if(!tutorId) {
            return errorResponse(res, 400, null, "Tutor ID is required");
        }
        const params: BookingSearchParams = req.query;
        const filters: Partial<BookingSearchParams> = {};
        if(params.status !== undefined) filters.status = params.status;
        if(params.date !== undefined) filters.date = params.date;
        if(params.search !== undefined) filters.search = params.search;
        if(params.page !== undefined) filters.page = params.page;
        if(params.limit !== undefined) filters.limit = params.limit;
        if(params.sortBy !== undefined) filters.sortBy = params.sortBy;
        if(params.orderBy !== undefined) filters.orderBy = params.orderBy;
        const bookings = await bookingService.getBookingByTutorId(tutorId as string, filters as BookingSearchParams);
        successResponse(res, 200, bookings, "Tutor bookings fetched successfully!!");
            
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch tutor bookings!!"); 
    }
}

const getTutors = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        
        // Filter parameters
        const isFeatured = req.query.isFeatured === 'true' ? true : 
                          req.query.isFeatured === 'false' ? false : undefined;
        const search = (req.query.search as string)?.trim() || '';
        const categoryId = req.query.categoryId as string;
        
        // Debug log
        console.log('Search parameter received:', JSON.stringify(search));
        
        // Rating filters
        const minRating = req.query.minRating ? parseFloat(req.query.minRating as string) : undefined;
        const maxRating = req.query.maxRating ? parseFloat(req.query.maxRating as string) : undefined;
        
        // Experience filters
        const minExperience = req.query.minExperience ? parseInt(req.query.minExperience as string) : undefined;
        const maxExperience = req.query.maxExperience ? parseInt(req.query.maxExperience as string) : undefined;
        
        const subjectId = req.query.subjectId as string;
        const slug = req.query.slug as string;
        // Sorting parameters
        const sortBy = req.query.sortBy as string || 'avgRating';
        const orderBy = req.query.orderBy as string || 'desc';
        
       const tutors = await tutorService.getTutors({ 
            limit, 
            skip, 
            page, 
            ...(isFeatured !== undefined ? { isFeatured } : {}),
            ...(search ? { search } : {}),
            ...(categoryId ? { categoryId } : {}),
            ...(minRating !== undefined ? { minRating } : {}),
            ...(maxRating !== undefined ? { maxRating } : {}),
            ...(minExperience !== undefined ? { minExperience } : {}),
            ...(maxExperience !== undefined ? { maxExperience } : {}),
            sortBy,
            orderBy,
            ...(subjectId ? { subjectId } : {}),
            ...(slug ? { slug } : {}),
        });
        
        successResponse(res, 200, tutors, "Tutors fetched successfully!!");
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch tutors!!");
    }
}

export const tutorController = {
    createTutor,
    updateTutorProfile,
    getTutorById,
    deleteTutor,
    getTutorDashboardStats, 
    getUpcomingBookings,
    getCompletedBookings,
    getTutorReviews,
    deleteTutorSlot,
    getTutorSlots,
    updateBookingStatus,
    getTutorBookings,
    getTutors
}