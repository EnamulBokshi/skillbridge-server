import express, { Router } from "express";
import { UserRole } from "../../constants/userRole.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { contactController } from "./contact.controller.js";
import {
  validateCreateContact,
  validateReplyContact,
  validateUpdateContactStatus,
} from "./contact.validator.js";

const contactRouter: Router = express.Router();

// Public submit endpoint for landing page/contact form
contactRouter.post("/", validateCreateContact, contactController.createContact);

// User endpoints
contactRouter.get(
  "/my",
  authMiddleware(UserRole.USER, UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
  contactController.getMyContacts,
);
contactRouter.get(
  "/:id",
  authMiddleware(UserRole.USER, UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
  contactController.getContactById,
);

// Admin endpoints
contactRouter.get("/", authMiddleware(UserRole.ADMIN), contactController.getContacts);
contactRouter.patch(
  "/:id/status",
  authMiddleware(UserRole.ADMIN),
  validateUpdateContactStatus,
  contactController.updateContactStatus,
);
contactRouter.patch(
  "/:id/reply",
  authMiddleware(UserRole.ADMIN),
  validateReplyContact,
  contactController.replyToContact,
);

export default contactRouter;
