import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../../helpers/errorResponse.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_REGEX = /^\d{6}$/;

const sanitize = (value: unknown, maxLength: number): string => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
};

const validateVerifyEmailOtp = (req: Request, res: Response, next: NextFunction) => {
  const email = sanitize(req.body.email, 160).toLowerCase();
  const otp = sanitize(req.body.otp, 6);

  if (!email) return errorResponse(res, 400, null, "Email is required");
  if (!EMAIL_REGEX.test(email)) {
    return errorResponse(res, 400, null, "Please provide a valid email address");
  }

  if (!otp) return errorResponse(res, 400, null, "OTP is required");
  if (!OTP_REGEX.test(otp)) {
    return errorResponse(res, 400, null, "OTP must be a 6-digit number");
  }

  req.body = { email, otp };
  return next();
};

const validateResendEmailOtp = (req: Request, res: Response, next: NextFunction) => {
  const email = sanitize(req.body.email, 160).toLowerCase();

  if (!email) return errorResponse(res, 400, null, "Email is required");
  if (!EMAIL_REGEX.test(email)) {
    return errorResponse(res, 400, null, "Please provide a valid email address");
  }

  req.body = { email };
  return next();
};

const validateForgotPassword = (req: Request, res: Response, next: NextFunction) => {
  const email = sanitize(req.body.email, 160).toLowerCase();
  const redirectTo = sanitize(req.body.redirectTo, 1000);

  if (!email) return errorResponse(res, 400, null, "Email is required");
  if (!EMAIL_REGEX.test(email)) {
    return errorResponse(res, 400, null, "Please provide a valid email address");
  }

  if (redirectTo) {
    try {
      new URL(redirectTo);
    } catch {
      return errorResponse(res, 400, null, "redirectTo must be a valid URL");
    }
  }

  req.body = {
    email,
    ...(redirectTo ? { redirectTo } : {}),
  };
  return next();
};

const validateResetPassword = (req: Request, res: Response, next: NextFunction) => {
  const token = sanitize(req.body.token, 256);
  const newPassword = sanitize(req.body.newPassword, 128);
  const confirmPassword = sanitize(req.body.confirmPassword, 128);

  if (!token) return errorResponse(res, 400, null, "Token is required");
  if (!newPassword) return errorResponse(res, 400, null, "New password is required");
  if (newPassword.length < 8) {
    return errorResponse(res, 400, null, "New password must be at least 8 characters long");
  }
  if (!confirmPassword) {
    return errorResponse(res, 400, null, "Confirm password is required");
  }
  if (newPassword !== confirmPassword) {
    return errorResponse(res, 400, null, "New password and confirm password must match");
  }

  req.body = {
    token,
    newPassword,
    confirmPassword,
  };
  return next();
};

const validateChangePassword = (req: Request, res: Response, next: NextFunction) => {
  const currentPassword = sanitize(req.body.currentPassword, 128);
  const newPassword = sanitize(req.body.newPassword, 128);
  const confirmPassword = sanitize(req.body.confirmPassword, 128);
  const revokeOtherSessions = Boolean(req.body.revokeOtherSessions);

  if (!currentPassword) {
    return errorResponse(res, 400, null, "Current password is required");
  }
  if (!newPassword) {
    return errorResponse(res, 400, null, "New password is required");
  }
  if (newPassword.length < 8) {
    return errorResponse(res, 400, null, "New password must be at least 8 characters long");
  }
  if (!confirmPassword) {
    return errorResponse(res, 400, null, "Confirm password is required");
  }
  if (newPassword !== confirmPassword) {
    return errorResponse(res, 400, null, "New password and confirm password must match");
  }

  req.body = {
    currentPassword,
    newPassword,
    confirmPassword,
    revokeOtherSessions,
  };
  return next();
};

export {
  validateVerifyEmailOtp,
  validateResendEmailOtp,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
};
