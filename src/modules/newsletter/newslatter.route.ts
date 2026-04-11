import express, { Router } from "express";
import { UserRole } from "../../constants/userRole.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { newsletterController } from "./newslatter.controller.js";
import {
	validateSendBulkNewsletter,
	validateSubscribeNewsletter,
	validateUnsubscribeNewsletter,
} from "./newslatter.validator.js";

const newsletterRouter: Router = express.Router();

newsletterRouter.get(
	"/subscribers",
	authMiddleware(UserRole.ADMIN),
	newsletterController.getAllSubscribers,
);

newsletterRouter.post(
	"/subscribe",
	validateSubscribeNewsletter,
	newsletterController.subscribeNewsletter,
);

newsletterRouter.post(
	"/unsubscribe",
	validateUnsubscribeNewsletter,
	newsletterController.unsubscribeNewsletter,
);

newsletterRouter.post(
	"/send",
	authMiddleware(UserRole.ADMIN),
	validateSendBulkNewsletter,
	newsletterController.sendBulkNewsletterEmail,
);

export default newsletterRouter;
