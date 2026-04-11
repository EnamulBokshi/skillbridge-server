import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../../helpers/errorResponse.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATUS_VALUES = ["NEW", "IN_REVIEW", "REPLIED", "CLOSED"] as const;

const cleanText = (value: unknown, maxLength: number): string => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
};

const validateCreateContact = (req: Request, res: Response, next: NextFunction) => {
  const name = cleanText(req.body.name, 120);
  const email = cleanText(req.body.email, 160).toLowerCase();
  const subject = cleanText(req.body.subject, 180);
  const message = cleanText(req.body.message, 4000);

  if (!name) return errorResponse(res, 400, null, "Name is required");
  if (!email) return errorResponse(res, 400, null, "Email is required");
  if (!EMAIL_REGEX.test(email)) {
    return errorResponse(res, 400, null, "Please provide a valid email address");
  }
  if (!subject) return errorResponse(res, 400, null, "Subject is required");
  if (!message || message.length < 10) {
    return errorResponse(res, 400, null, "Message must be at least 10 characters long");
  }

  req.body = {
    name,
    email,
    subject,
    message,
  };

  return next();
};

const validateReplyContact = (req: Request, res: Response, next: NextFunction) => {
  const reply = cleanText(req.body.reply, 5000);

  if (!reply || reply.length < 5) {
    return errorResponse(res, 400, null, "Reply message is required and must be meaningful");
  }

  req.body = {
    reply,
  };

  return next();
};

const validateUpdateContactStatus = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const status = cleanText(req.body.status, 30).toUpperCase();

  if (!status || !STATUS_VALUES.includes(status as (typeof STATUS_VALUES)[number])) {
    return errorResponse(
      res,
      400,
      null,
      "Status must be one of NEW, IN_REVIEW, REPLIED, CLOSED",
    );
  }

  req.body = { status };
  return next();
};

export { validateCreateContact, validateReplyContact, validateUpdateContactStatus };
