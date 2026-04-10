import express, { Router } from "express";
import { UserRole } from "../../constants/userRole.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { testimonialController } from "./testimonial.controller.js";
import {
	validateCreateTestimonial,
	validateUpdateTestimonial,
} from "./testimonial.validator.js";

const testimonialRouter: Router = express.Router();

testimonialRouter.get("/", testimonialController.getTestimonials);
testimonialRouter.get("/:id", testimonialController.getTestimonialById);

testimonialRouter.post(
	"/",
	authMiddleware(UserRole.ADMIN, UserRole.USER, UserRole.STUDENT),
	validateCreateTestimonial,
	testimonialController.createTestimonial,
);

testimonialRouter.patch(
	"/:id",
	authMiddleware(UserRole.ADMIN, UserRole.USER, UserRole.STUDENT),
	validateUpdateTestimonial,
	testimonialController.updateTestimonial,
);

testimonialRouter.delete(
	"/:id",
	authMiddleware(UserRole.ADMIN, UserRole.USER, UserRole.STUDENT),
	testimonialController.deleteTestimonial,
);

export default testimonialRouter;
