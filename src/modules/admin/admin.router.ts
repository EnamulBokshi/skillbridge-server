import { Router } from "express";   
import { adminController } from "./admin.controller.js";
import { UserRole } from "../../constants/userRole.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { superAdminMiddleware } from "../../middleware/superadmin.middleware.js";
import { bookingController } from "../booking/booking.controller.js";

const adminRouter:Router = Router();

// ============ ADMIN ROUTES ============
adminRouter.get("/earnings", authMiddleware(UserRole.ADMIN), adminController.getTotalEarnings);

adminRouter.delete("/users/:id", authMiddleware(UserRole.ADMIN), adminController.deleteUser);
adminRouter.post("/users/:id/ban", authMiddleware(UserRole.ADMIN), adminController.banUser);
adminRouter.post("/users/:id/unban", authMiddleware(UserRole.ADMIN), adminController.unbanUser);
adminRouter.get("/bookings", authMiddleware(UserRole.ADMIN), adminController.getAllBookings);
adminRouter.get("/users", authMiddleware(UserRole.ADMIN), adminController.getAllUsers);
adminRouter.patch("/sessions/:bookingId/cancel", authMiddleware(UserRole.ADMIN), bookingController.cancelBooking);
adminRouter.patch("/sessions/:bookingId/confirm", authMiddleware(UserRole.ADMIN), bookingController.confirmBooking);
adminRouter.get("/dashboard-stats", authMiddleware(UserRole.ADMIN), adminController.adminDashboardStats);
adminRouter.patch("/students/:studentId/update", authMiddleware(UserRole.ADMIN), adminController.updateStudentByAdmin);
adminRouter.patch("/tutors/:tutorId/update", authMiddleware(UserRole.ADMIN), adminController.updateTutorByAdmin);

// ============ SUPER_ADMIN ROUTES ============

// Admin Management
adminRouter.post("/super/admins", superAdminMiddleware, adminController.createAdmin);
adminRouter.get("/super/admins", superAdminMiddleware, adminController.getAllAdmins);
adminRouter.patch("/super/admins/:adminId", superAdminMiddleware, adminController.updateAdmin);
adminRouter.delete("/super/admins/:adminId", superAdminMiddleware, adminController.deleteAdmin);

// Tutor Management
adminRouter.post("/super/tutors", superAdminMiddleware, adminController.createTutor);
adminRouter.patch("/super/tutors/:tutorId", superAdminMiddleware, adminController.updateTutor);
adminRouter.delete("/super/tutors/:tutorId", superAdminMiddleware, adminController.deleteTutor);

// Student Management
adminRouter.post("/super/students", superAdminMiddleware, adminController.createStudent);
adminRouter.patch("/super/students/:studentId", superAdminMiddleware, adminController.updateStudent);
adminRouter.delete("/super/students/:studentId", superAdminMiddleware, adminController.deleteStudent);

// Session Management
adminRouter.get("/super/sessions", superAdminMiddleware, adminController.getAllSessions);
adminRouter.delete("/super/sessions/:sessionId", superAdminMiddleware, adminController.deleteSession);
adminRouter.delete("/super/users/:userId/sessions", superAdminMiddleware, adminController.deleteUserSessions);

// Booking Management
adminRouter.patch("/super/bookings/:bookingId", superAdminMiddleware, adminController.updateBooking);
adminRouter.delete("/super/bookings/:bookingId/soft", superAdminMiddleware, adminController.softDeleteBooking);
adminRouter.delete("/super/bookings/:bookingId/hard", superAdminMiddleware, adminController.hardDeleteBooking);

// System Insights
adminRouter.get("/super/insights", superAdminMiddleware, adminController.getSystemInsights);

// AI Features Control
adminRouter.get("/super/ai/features", superAdminMiddleware, adminController.getAIFeaturesControl);
adminRouter.patch("/super/ai/features/:featureName", superAdminMiddleware, adminController.toggleAIFeature);

export default adminRouter;