import { Router } from "express";
import {authMiddleware} from "../../middleware/auth.middleware.js"
import { UserRole } from "../../constants/userRole.js";
import { studentController } from "./student.controller.js";
import privateRoute from "../../middleware/private.middleware.js";
import { bookingController } from "../booking/booking.controller.js";

const studentRouter:Router = Router();
studentRouter.post("/", authMiddleware(UserRole.ADMIN, UserRole.USER),privateRoute, studentController.createStudent);
studentRouter.get("/:studentId", authMiddleware(UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR, UserRole.USER), studentController.getStudentByIdFullProfile);
studentRouter.patch("/:studentId", authMiddleware(UserRole.ADMIN, UserRole.STUDENT),privateRoute, studentController.updateStudent);
studentRouter.delete("/:studentId", authMiddleware(UserRole.ADMIN), privateRoute,studentController.deleteStudent);
studentRouter.get("/:studentId/stats", authMiddleware(UserRole.ADMIN, UserRole.STUDENT), privateRoute, studentController.studentStats);
// studentRouter.get("/:studentId/sessions", authMiddleware(UserRole.ADMIN, UserRole.STUDENT), privateRoute, studentController.getCompletedBookings);
studentRouter.get("/:studentId/upcoming-sessions", authMiddleware(UserRole.ADMIN, UserRole.STUDENT), privateRoute,studentController.upcomingBookings);
studentRouter.post("/:studentId/review", authMiddleware(UserRole.ADMIN, UserRole.STUDENT), privateRoute, studentController.createReview);
studentRouter.delete("/sessions/:bookingId/cancel", authMiddleware(UserRole.ADMIN, UserRole.STUDENT), privateRoute, bookingController.cancelBooking); // sttudent can cancel his/her own bookings only -> so it is in student router, not booking router
studentRouter.get("/:studentId/sessions", authMiddleware(UserRole.ADMIN, UserRole.STUDENT), privateRoute, bookingController.getAllBookingsByStudentId);

export default studentRouter;