import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { UserRole } from "../../constants/userRole.js";
import privateRoute from "../../middleware/private.middleware.js";
import { bookingController } from "./booking.controller.js";



const bookingRouter:Router = Router();

// bookingRouter.get("/", )
bookingRouter.post("/", authMiddleware(UserRole.STUDENT), privateRoute, bookingController.createBooking);
// bookingRouter.patch("/:bookingId/status", authMiddleware(UserRole.ADMIN, UserRole.TUTOR, UserRole.STUDENT), privateRoute, bookingController.updateBookingStatus);
// bookingRouter.get("/:bookingId", authMiddleware(UserRole.ADMIN, UserRole.TUTOR, UserRole.STUDENT), privateRoute, bookingController.getBookingById);
// bookingRouter.get("/student/:studentId", authMiddleware(UserRole.ADMIN, UserRole.STUDENT), privateRoute, bookingController.getBookingsByStudent);
// bookingRouter.get("/tutor/:tutorId", authMiddleware(UserRole.ADMIN, UserRole.TUTOR), privateRoute, bookingController.getBookingsByTutor);
bookingRouter.patch("/:bookingId/confirm", authMiddleware(UserRole.ADMIN, UserRole.TUTOR), bookingController.confirmBooking);
bookingRouter.patch("/:bookingId/cancel", authMiddleware(UserRole.ADMIN, UserRole.TUTOR, UserRole.STUDENT), bookingController.cancelBooking);
bookingRouter.patch("/:bookingId/complete", authMiddleware(UserRole.ADMIN, UserRole.TUTOR), bookingController.completeBooking);
export default bookingRouter;