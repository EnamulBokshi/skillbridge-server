import { Request, Response } from "express";
import { errorResponse } from "../../helpers/errorResponse.js";
import { successResponse } from "../../helpers/successResponse.js";
import { newsletterService } from "./newslatter.service.js";

const subscribeNewsletter = async (req: Request, res: Response) => {
	try {
		const result = await newsletterService.subscribeNewsletter({
			name: req.body.name,
			email: req.body.email,
		});

		const statusCode = result.action === "created" ? 201 : 200;
		const message =
			result.action === "created"
				? "Subscribed to newsletter successfully"
				: "Resubscribed to newsletter successfully";

		return successResponse(res, statusCode, result.subscriber, message);
	} catch (error: unknown) {
		console.error("Error subscribing newsletter:", error);

		if (error instanceof Error) {
			if (error.message === "Email is already subscribed to newsletter") {
				return errorResponse(res, 409, null, error.message);
			}

			if (error.message === "This email is not eligible for newsletter subscription") {
				return errorResponse(res, 403, null, error.message);
			}
		}

		return errorResponse(res, 500, error, "Failed to subscribe newsletter");
	}
};

const unsubscribeNewsletter = async (req: Request, res: Response) => {
	try {
		const subscriber = await newsletterService.unsubscribeNewsletter(req.body.email);

		return successResponse(
			res,
			200,
			subscriber,
			"Unsubscribed from newsletter successfully",
		);
	} catch (error: unknown) {
		console.error("Error unsubscribing newsletter:", error);

		if (error instanceof Error && error.message === "Subscriber not found") {
			return errorResponse(res, 404, null, error.message);
		}

		return errorResponse(res, 500, error, "Failed to unsubscribe newsletter");
	}
};

const sendBulkNewsletterEmail = async (req: Request, res: Response) => {
	try {
		const result = await newsletterService.sendBulkNewsletterEmail({
			emails: req.body.emails,
			subject: req.body.subject,
			message: req.body.message,
		});

		return successResponse(res, 200, result, "Newsletter emails processed successfully");
	} catch (error) {
		console.error("Error sending bulk newsletter email:", error);
		return errorResponse(res, 500, error, "Failed to send newsletter emails");
	}
};

const getAllSubscribers = async (_req: Request, res: Response) => {
	try {
		const subscribers = await newsletterService.getAllSubscribers();
        console.log("Fetched subscribers:", subscribers);
		return successResponse(
			res,
			200,
			subscribers,
			"Newsletter subscribers fetched successfully",
		);
	} catch (error) {
		console.error("Error fetching newsletter subscribers:", error);
		return errorResponse(res, 500, error, "Failed to fetch newsletter subscribers");
	}
};

export const newsletterController = {
	subscribeNewsletter,
	unsubscribeNewsletter,
	sendBulkNewsletterEmail,
	getAllSubscribers,
};
