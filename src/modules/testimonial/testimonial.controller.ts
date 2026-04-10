import { Request, Response } from "express";
import { errorResponse } from "../../helpers/errorResponse.js";
import { successResponse } from "../../helpers/successResponse.js";
import { UserRole } from "../../constants/userRole.js";
import { testimonialService } from "./testimonial.service.js";

const isAdmin = (req: Request): boolean => req.user?.role === UserRole.ADMIN;

const createTestimonial = async (req: Request, res: Response) => {
	try {
		const userId = isAdmin(req) && req.body.userId ? req.body.userId : req.user?.id;

		if (!userId) {
			return errorResponse(res, 401, null, "Unauthorized access");
		}

		const testimonial = await testimonialService.createTestimonial({
			title: req.body.title,
			content: req.body.content,
			rating: req.body.rating,
			userId,
		});

		return successResponse(res, 201, testimonial, "Testimonial created successfully");
	} catch (error) {
		console.error("Error creating testimonial:", error);
		return errorResponse(res, 500, error, "Failed to create testimonial");
	}
};

const getTestimonials = async (req: Request, res: Response) => {
	try {
		const page = Number(req.query.page) || 1;
		const limit = Number(req.query.limit) || 10;
		const result = await testimonialService.getTestimonials(page, limit);

		return successResponse(res, 200, result, "Testimonials fetched successfully");
	} catch (error) {
		console.error("Error fetching testimonials:", error);
		return errorResponse(res, 500, error, "Failed to fetch testimonials");
	}
};

const getTestimonialById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const testimonialId = Array.isArray(id) ? id[0] : id;

		if (!testimonialId) {
			return errorResponse(res, 400, null, "Testimonial ID is required");
		}

		const testimonial = await testimonialService.getTestimonialById(testimonialId);

		if (!testimonial) {
			return errorResponse(res, 404, null, "Testimonial not found");
		}

		return successResponse(res, 200, testimonial, "Testimonial fetched successfully");
	} catch (error) {
		console.error("Error fetching testimonial:", error);
		return errorResponse(res, 500, error, "Failed to fetch testimonial");
	}
};

const updateTestimonial = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const testimonialId = Array.isArray(id) ? id[0] : id;

		if (!testimonialId) {
			return errorResponse(res, 400, null, "Testimonial ID is required");
		}

		const testimonial = await testimonialService.getTestimonialOwner(testimonialId);

		if (!testimonial) {
			return errorResponse(res, 404, null, "Testimonial not found");
		}

		if (!isAdmin(req) && testimonial.userId !== req.user?.id) {
			return errorResponse(res, 403, null, "You can only edit your own testimonial");
		}

		const updated = await testimonialService.updateTestimonial(testimonialId, req.body);

		return successResponse(res, 200, updated, "Testimonial updated successfully");
	} catch (error) {
		console.error("Error updating testimonial:", error);
		return errorResponse(res, 500, error, "Failed to update testimonial");
	}
};

const deleteTestimonial = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const testimonialId = Array.isArray(id) ? id[0] : id;

		if (!testimonialId) {
			return errorResponse(res, 400, null, "Testimonial ID is required");
		}

		const testimonial = await testimonialService.getTestimonialOwner(testimonialId);

		if (!testimonial) {
			return errorResponse(res, 404, null, "Testimonial not found");
		}

		if (!isAdmin(req) && testimonial.userId !== req.user?.id) {
			return errorResponse(res, 403, null, "You can only delete your own testimonial");
		}

		await testimonialService.deleteTestimonial(testimonialId);

		return successResponse(res, 200, null, "Testimonial deleted successfully");
	} catch (error) {
		console.error("Error deleting testimonial:", error);
		return errorResponse(res, 500, error, "Failed to delete testimonial");
	}
};

export const testimonialController = {
	createTestimonial,
	getTestimonials,
	getTestimonialById,
	updateTestimonial,
	deleteTestimonial,
};
