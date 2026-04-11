import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../../helpers/errorResponse.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cleanText = (value: unknown, maxLength: number): string => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
};

const validateEmail = (email: string): boolean => EMAIL_REGEX.test(email);

const validateSubscribeNewsletter = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const name = cleanText(req.body.name, 120);
  const email = cleanText(req.body.email, 160).toLowerCase();

  if (!name) return errorResponse(res, 400, null, "Name is required");
  if (!email) return errorResponse(res, 400, null, "Email is required");
  if (!validateEmail(email)) {
    return errorResponse(res, 400, null, "Please provide a valid email address");
  }

  req.body = { name, email };
  return next();
};

const validateUnsubscribeNewsletter = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const email = cleanText(req.body.email, 160).toLowerCase();

  if (!email) return errorResponse(res, 400, null, "Email is required");
  if (!validateEmail(email)) {
    return errorResponse(res, 400, null, "Please provide a valid email address");
  }

  req.body = { email };
  return next();
};

const validateSendBulkNewsletter = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const subject = cleanText(req.body.subject, 180);
  const message = cleanText(req.body.message, 10000);

  const rawEmails: unknown[] = Array.isArray(req.body.emails) ? req.body.emails : [];
  const normalizedEmails = rawEmails
    .filter((email: unknown): email is string => typeof email === "string")
    .map((email: string) => email.trim().toLowerCase())
    .filter((email: string) => email.length > 0);

  const uniqueEmails = [...new Set(normalizedEmails)];

  if (uniqueEmails.length === 0) {
    return errorResponse(res, 400, null, "At least one email is required");
  }

  const invalidEmail = uniqueEmails.find((email) => !validateEmail(email));
  if (invalidEmail) {
    return errorResponse(res, 400, null, `Invalid email address: ${invalidEmail}`);
  }

  if (!subject) {
    return errorResponse(res, 400, null, "Email subject is required");
  }

  if (!message || message.length < 5) {
    return errorResponse(
      res,
      400,
      null,
      "Email message is required and must be at least 5 characters",
    );
  }

  req.body = {
    emails: uniqueEmails,
    subject,
    message,
  };

  return next();
};

export {
  validateSubscribeNewsletter,
  validateUnsubscribeNewsletter,
  validateSendBulkNewsletter,
};
