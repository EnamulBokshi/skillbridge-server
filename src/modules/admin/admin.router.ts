import { Router } from "express";   
import { adminController } from "./admin.controller.js";
import { UserRole } from "../../constants/userRole.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { bookingController } from "../booking/booking.controller.js";

const adminRouter:Router = Router();

adminRouter.get("/earnings", authMiddleware(UserRole.ADMIN), adminController.getTotalEarnings);

adminRouter.delete("/users/:id", authMiddleware(UserRole.ADMIN), adminController.deleteUser);
adminRouter.post("/users/:id/ban", authMiddleware(UserRole.ADMIN), adminController.banUser);
adminRouter.post("/users/:id/unban", authMiddleware(UserRole.ADMIN), adminController.unbanUser);
adminRouter.get("/bookings", authMiddleware(UserRole.ADMIN), adminController.getAllBookings);
adminRouter.get("/users", authMiddleware(UserRole.ADMIN), adminController.getAllUsers);
adminRouter.patch("/sessions/:bookingId/cancel", authMiddleware(UserRole.ADMIN), bookingController.cancelBooking); // Admin can cancel any booking -> so it is in admin router, not booking router
adminRouter.patch("/sessions/:bookingId/confirm", authMiddleware(UserRole.ADMIN), bookingController.confirmBooking); // Admin can confirm any booking -> so it is in admin router, not booking router
adminRouter.get("/dashboard-stats", authMiddleware(UserRole.ADMIN), adminController.adminDashboardStats);
adminRouter.patch("/students/:studentId/update", authMiddleware(UserRole.ADMIN), adminController.updateStudentByAdmin);
adminRouter.patch("/tutors/:tutorId/update", authMiddleware(UserRole.ADMIN), adminController.updateTutorByAdmin);
export default adminRouter;