import { Request, Response } from "express";
import { adminService } from "./admin.service.js";
import { bookingService } from "../booking/booking.service.js";
import { successResponse } from "../../helpers/successResponse.js";
import { errorResponse } from "../../helpers/errorResponse.js";
import { studentService } from "../student/student.service.js";
import { tutorService } from "../tutor/tutor.service.js";

const getTotalEarnings = async (req:Request, res: Response)=>{
    try {
        const totalEarnings = await adminService.getTotalEarnings();
        res.status(200).json({
            success: true,
            message: "Total earnings fetched successfully!!",
            data: totalEarnings
        });
        
    } catch (error:any) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message || "Couldn't fetch total earnings!!",
            data: null
        });
    }
}

const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if(!id) {
            return errorResponse(res, 400, null, "User ID is required");
        }
        // Assuming adminService.deleteUser is implemented
        await adminService.deleteUser(id as string);
        successResponse(res, 200, null, "User deleted successfully!!");
        
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't delete user!!");
    }
}

const banUser = async (req: Request, res: Response) => {
   try {
    const { id } = req.params;
    if(!id) {
        return errorResponse(res, 400, null, "User ID is required");
    }
    // Assuming adminService.banUser is implemented
    await adminService.banUser(id as string);
    successResponse(res, 200, null, "User banned successfully!!");
    
   } catch (error:any) {
    console.error(error);
    errorResponse(res, 500, error, error.message || "Couldn't ban user!!");
   }
}

const unbanUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if(!id) {
            return errorResponse(res, 400, null, "User ID is required");
        }
        // Assuming adminService.unbanUser is implemented
        await adminService.unbanUser(id as string);
        successResponse(res, 200, null, "User unbanned successfully!!");
        
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't unban user!!");
    }
}
const getAllBookings = async (req: Request, res: Response) => {
    try {
        const filters = req.query; 
        
        const bookings = await bookingService.getAllBookings(filters);
        successResponse(res, 200, bookings, "Bookings fetched successfully!!");
        
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch bookings!!");
    }
}
const getAllUsers = async (req: Request, res: Response) => {
    try {
        const filters = req.query;
        const users = await adminService.getAllUsers(filters);
        successResponse(res, 200, users, "Users fetched successfully!!");
        
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch users!!");
    }
}

const adminDashboardStats = async (req: Request, res: Response) => {
    try {
        const stats = await adminService.adminDashboardStats();
        successResponse(res, 200, stats, "Dashboard stats fetched successfully!!");
        
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch dashboard stats!!");
    }
}

const updateStudentByAdmin = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        if(!studentId) {
            return errorResponse(res, 400, null, "Student ID is required");
        }
        const updatedStudent = await studentService.updateStudent(studentId as string, req.body);
        successResponse(res, 200, updatedStudent, "Student profile updated successfully!!");
        
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't update student profile!!");
    }
}

const updateTutorByAdmin = async (req: Request, res: Response) => {
    try {
        const { tutorId } = req.params;
        if(!tutorId) {
            return errorResponse(res, 400, null, "Tutor ID is required");
        }
        const updatedTutor = await tutorService.updateTutorProfile(tutorId as string, req.body);
        successResponse(res, 200, updatedTutor, "Tutor profile updated successfully!!");
        
    } catch (error:any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't update tutor profile!!");
    }   
}


export const adminController = {
    getTotalEarnings,
    deleteUser,
    banUser,
    unbanUser,
    getAllBookings,
    getAllUsers,
    adminDashboardStats,
    updateStudentByAdmin,
    updateTutorByAdmin
}