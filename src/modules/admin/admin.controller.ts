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

// ============ SUPER_ADMIN CONTROLLERS ============

/**
 * Admin Management
 */
const createAdmin = async (req: Request, res: Response) => {
    try {
        const { email, name, password } = req.body;
        if (!email || !name || !password) {
            return errorResponse(res, 400, null, "Email, name, and password are required");
        }
        const admin = await adminService.createAdmin(
          email as string,
          name as string,
          password as string,
          req.user?.id || "",
        );
        successResponse(res, 201, admin, "Admin created successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 400, error, error.message || "Couldn't create admin!!");
    }
};

const updateAdmin = async (req: Request, res: Response) => {
    try {
        const { adminId } = req.params;
        if (!adminId) {
            return errorResponse(res, 400, null, "Admin ID is required");
        }
        const admin = await adminService.updateAdmin(
          adminId as string,
          req.user?.id || "",
          req.body,
        );
        successResponse(res, 200, admin, "Admin updated successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 400, error, error.message || "Couldn't update admin!!");
    }
};

const deleteAdmin = async (req: Request, res: Response) => {
    try {
        const { adminId } = req.params;
        if (!adminId) {
            return errorResponse(res, 400, null, "Admin ID is required");
        }
        await adminService.deleteAdmin(adminId as string, req.user?.id || "");
        successResponse(res, 200, null, "Admin deleted successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 400, error, error.message || "Couldn't delete admin!!");
    }
};

const getAllAdmins = async (req: Request, res: Response) => {
    try {
        const page = parseInt((req.query.page as string) || "1");
        const limit = parseInt((req.query.limit as string) || "10");
        const admins = await adminService.getAllAdmins(page, limit);
        successResponse(res, 200, admins, "Admins fetched successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch admins!!");
    }
};

/**
 * Tutor Management
 */
const createTutor = async (req: Request, res: Response) => {
    try {
        const tutor = await adminService.createTutorByAdmin(req.body);
        successResponse(res, 201, tutor, "Tutor created successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 400, error, error.message || "Couldn't create tutor!!");
    }
};

const updateTutor = async (req: Request, res: Response) => {
    try {
        const { tutorId } = req.params;
        if (!tutorId) {
            return errorResponse(res, 400, null, "Tutor ID is required");
        }
        const tutor = await adminService.updateTutorByAdmin(tutorId as string, req.body);
        successResponse(res, 200, tutor, "Tutor updated successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 400, error, error.message || "Couldn't update tutor!!");
    }
};

const deleteTutor = async (req: Request, res: Response) => {
    try {
        const { tutorId } = req.params;
        if (!tutorId) {
            return errorResponse(res, 400, null, "Tutor ID is required");
        }
        await adminService.deleteTutorByAdmin(tutorId as string);
        successResponse(res, 200, null, "Tutor deleted successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 400, error, error.message || "Couldn't delete tutor!!");
    }
};

/**
 * Student Management
 */
const createStudent = async (req: Request, res: Response) => {
    try {
        const student = await adminService.createStudentByAdmin(req.body);
        successResponse(res, 201, student, "Student created successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 400, error, error.message || "Couldn't create student!!");
    }
};

const updateStudent = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        if (!studentId) {
            return errorResponse(res, 400, null, "Student ID is required");
        }
        const student = await adminService.updateStudentByAdmin(
          studentId as string,
          req.body,
        );
        successResponse(res, 200, student, "Student updated successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 400, error, error.message || "Couldn't update student!!");
    }
};

const deleteStudent = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        if (!studentId) {
            return errorResponse(res, 400, null, "Student ID is required");
        }
        await adminService.deleteStudentByAdmin(studentId as string);
        successResponse(res, 200, null, "Student deleted successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 400, error, error.message || "Couldn't delete student!!");
    }
};

/**
 * Session Management
 */
const getAllSessions = async (req: Request, res: Response) => {
    try {
        const page = parseInt((req.query.page as string) || "1");
        const limit = parseInt((req.query.limit as string) || "10");
        const userId = (req.query.userId as string) || undefined;
        const orderBy = ((req.query.orderBy as string) || "desc") as "asc" | "desc";

        const sessions = await adminService.getAllSessions(page, limit, userId, orderBy);
        successResponse(res, 200, sessions, "Sessions fetched successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch sessions!!");
    }
};

const deleteSession = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        if (!sessionId) {
            return errorResponse(res, 400, null, "Session ID is required");
        }
        await adminService.deleteSession(sessionId as string);
        successResponse(res, 200, null, "Session deleted successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 400, error, error.message || "Couldn't delete session!!");
    }
};

const deleteUserSessions = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return errorResponse(res, 400, null, "User ID is required");
        }
        const result = await adminService.deleteUserSessions(userId as string);
        successResponse(res, 200, result, result.message);
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 400, error, error.message || "Couldn't delete user sessions!!");
    }
};

/**
 * Booking Management
 */
const softDeleteBooking = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        if (!bookingId) {
            return errorResponse(res, 400, null, "Booking ID is required");
        }
        const booking = await adminService.softDeleteBooking(bookingId as string);
        successResponse(res, 200, booking, "Booking soft deleted successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 400, error, error.message || "Couldn't soft delete booking!!");
    }
};

const hardDeleteBooking = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        if (!bookingId) {
            return errorResponse(res, 400, null, "Booking ID is required");
        }
        await adminService.hardDeleteBooking(bookingId as string);
        successResponse(res, 200, null, "Booking permanently deleted successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 400, error, error.message || "Couldn't hard delete booking!!");
    }
};

const updateBooking = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        if (!bookingId) {
            return errorResponse(res, 400, null, "Booking ID is required");
        }
        const booking = await adminService.updateBooking(bookingId as string, req.body);
        successResponse(res, 200, booking, "Booking updated successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 400, error, error.message || "Couldn't update booking!!");
    }
};

/**
 * System Insights
 */
const getSystemInsights = async (req: Request, res: Response) => {
    try {
        const insights = await adminService.getSystemInsights();
        successResponse(res, 200, insights, "System insights fetched successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch system insights!!");
    }
};

/**
 * AI Features Control
 */
const getAIFeaturesControl = async (req: Request, res: Response) => {
    try {
        const control = await adminService.getAIFeaturesControl();
        successResponse(res, 200, control, "AI features control fetched successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 500, error, error.message || "Couldn't fetch AI features!!");
    }
};

const toggleAIFeature = async (req: Request, res: Response) => {
    try {
        const { featureName } = req.params;
        const { enabled } = req.body;

        if (!featureName || enabled === undefined) {
            return errorResponse(res, 400, null, "Feature name and enabled status are required");
        }

        const result = await adminService.toggleAIFeature(
          featureName as string,
          enabled as boolean,
        );
        successResponse(res, 200, result, "AI feature toggled successfully!!");
    } catch (error: any) {
        console.error(error);
        errorResponse(res, 400, error, error.message || "Couldn't toggle AI feature!!");
    }
};


export const adminController = {
    getTotalEarnings,
    deleteUser,
    banUser,
    unbanUser,
    getAllBookings,
    getAllUsers,
    adminDashboardStats,
    updateStudentByAdmin,
    updateTutorByAdmin,
    // SuperAdmin controllers
    createAdmin,
    updateAdmin,
    deleteAdmin,
    getAllAdmins,
    createTutor,
    updateTutor,
    deleteTutor,
    createStudent,
    updateStudent,
    deleteStudent,
    getAllSessions,
    deleteSession,
    deleteUserSessions,
    softDeleteBooking,
    hardDeleteBooking,
    updateBooking,
    getSystemInsights,
    getAIFeaturesControl,
    toggleAIFeature,
}