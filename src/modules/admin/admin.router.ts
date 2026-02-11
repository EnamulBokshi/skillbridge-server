import { Router } from "express";   
import { adminController } from "./admin.controller";
import { UserRole } from "../../constants/userRole";
import { authMiddleware } from "../../middleware/auth.middleware";
import { bookingController } from "../booking/booking.controller";

const adminRouter = Router();

adminRouter.get("/earnings", authMiddleware(UserRole.ADMIN), adminController.getTotalEarnings);

adminRouter.delete("/users/:id", authMiddleware(UserRole.ADMIN), adminController.deleteUser);
adminRouter.post("/users/:id/ban", authMiddleware(UserRole.ADMIN), adminController.banUser);
adminRouter.post("/users/:id/unban", authMiddleware(UserRole.ADMIN), adminController.unbanUser);
adminRouter.get("/bookings", authMiddleware(UserRole.ADMIN), adminController.getAllBookings);
adminRouter.get("/users", authMiddleware(UserRole.ADMIN), adminController.getAllUsers);
adminRouter.patch("/sessions/:bookingId/cancel", authMiddleware(UserRole.ADMIN), bookingController.cancelBooking); // Admin can cancel any booking -> so it is in admin router, not booking router
adminRouter.patch("/sessions/:bookingId/confirm", authMiddleware(UserRole.ADMIN), bookingController.confirmBooking); // Admin can confirm any booking -> so it is in admin router, not booking router
adminRouter.get("/dashboard-stats", authMiddleware(UserRole.ADMIN), adminController.adminDashboardStats);
export default adminRouter;