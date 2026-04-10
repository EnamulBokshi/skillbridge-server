import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../../helpers/errorResponse.js";

const normalizeText = (value: unknown): string => {
	if (typeof value !== "string") return "";
	return value.trim();
};

const normalizeRating = (value: unknown): number | null => {
	const rating = typeof value === "string" ? Number(value) : Number(value);
	if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
		return null;
	}

	return Number(rating.toFixed(1));
};

const validateCreateTestimonial = (req: Request, res: Response, next: NextFunction) => {
	const title = normalizeText(req.body.title);
	const content = normalizeText(req.body.content);
	const rating = normalizeRating(req.body.rating);

	if (!content) {
		return errorResponse(res, 400, null, "Testimonial content is required");
	}

	if (rating === null) {
		return errorResponse(res, 400, null, "Rating must be a number between 1 and 5");
	}

	req.body = {
		title: title || undefined,
		content,
		rating,
		userId: normalizeText(req.body.userId) || undefined,
	};

	return next();
};

const validateUpdateTestimonial = (req: Request, res: Response, next: NextFunction) => {
	const title = normalizeText(req.body.title);
	const content = normalizeText(req.body.content);
	const rating = req.body.rating !== undefined ? normalizeRating(req.body.rating) : undefined;

	const payload: {
		title?: string;
		content?: string;
		rating?: number;
	} = {};

	if (title) payload.title = title;
	if (content) payload.content = content;
	if (rating !== undefined) {
		if (rating === null) {
			return errorResponse(res, 400, null, "Rating must be a number between 1 and 5");
		}
		payload.rating = rating;
	}

	if (Object.keys(payload).length === 0) {
		return errorResponse(res, 400, null, "At least one field is required to update testimonial");
	}

	req.body = payload;
	return next();
};

export { validateCreateTestimonial, validateUpdateTestimonial };
