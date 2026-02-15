import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { UserRole } from "../../constants/userRole.js";
import privateRoute from "../../middleware/private.middleware.js";
import { tutorController } from "./tutor.controller.js";

const tutorRouter:Router = Router();

// Public routes - must be before parameterized routes
tutorRouter.get(
  "/",
  tutorController.getTutors
);

tutorRouter.get("/:tutorId",tutorController.getTutorById)

// Protected routes
tutorRouter.post(
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.TUTOR, UserRole.USER),
  privateRoute,
  tutorController.createTutor,
);
tutorRouter.delete(
  "/:tutorId",
  authMiddleware(UserRole.ADMIN),
  privateRoute,
  tutorController.deleteTutor,
);

tutorRouter.patch(
  "/:tutorId",
  authMiddleware(UserRole.TUTOR, UserRole.ADMIN),
  tutorController.updateTutorProfile,
);
// tutorRouter.get(
//   "/:tutorId",
//   authMiddleware(UserRole.ADMIN, UserRole.TUTOR),
  
//   tutorController.getTutorById,
// );


tutorRouter.get(
  "/:tutorId/upcoming-bookings",
  authMiddleware(UserRole.TUTOR),
  privateRoute,
  tutorController.getUpcomingBookings,
);
tutorRouter.get(
  "/:tutorId/completed-bookings",
  authMiddleware(UserRole.TUTOR),
  privateRoute,
  tutorController.getCompletedBookings,
);

tutorRouter.get(
  "/:tutorId/reviews",
  authMiddleware(UserRole.TUTOR, UserRole.ADMIN),
  privateRoute,
  tutorController.getTutorReviews,
);  
tutorRouter.delete(
  "/slots/:slotId",
  authMiddleware(UserRole.TUTOR),
  privateRoute,
  tutorController.deleteTutorSlot
)

tutorRouter.get(
  "/:tutorId/slots",
  authMiddleware(UserRole.TUTOR, UserRole.ADMIN),
  privateRoute,
  tutorController.getTutorSlots
)

tutorRouter.patch(
  "/:tutorId/bookings/:bookingId/status",
  authMiddleware(UserRole.TUTOR),
  privateRoute,
  tutorController.updateBookingStatus
)

tutorRouter.get(
  "/:tutorId/sessions",
  authMiddleware(UserRole.TUTOR, UserRole.ADMIN),
  privateRoute,
  tutorController.getTutorBookings
)

tutorRouter.get(
  "/:tutorId/dashboard",
  authMiddleware(UserRole.TUTOR),
  privateRoute,
  tutorController.getTutorDashboardStats
)


export default tutorRouter;
