import { NextFunction, Request, Response } from "express";
import { UserRole } from "../constants/userRole.js";
import { errorResponse } from "../helpers/errorResponse.js";

/**
 * SuperAdmin middleware - Allows only SUPER_ADMIN role
 * Throws 403 Forbidden if not SUPER_ADMIN
 */
export const superAdminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    errorResponse(res, 401, null, "Unauthorized. Please log in.");
    return;
  }

  if (req.user.role !== UserRole.SUPER_ADMIN) {
    console.error(`Access denied: user ${req.user.id} is not SUPER_ADMIN`);
    errorResponse(
      res,
      403,
      null,
      "Access denied. Only SUPER_ADMIN can perform this action."
    );
    return;
  }

  next();
};

/**
 * Admin or SuperAdmin middleware - Allows SUPER_ADMIN and ADMIN roles
 */
export const adminOrSuperAdminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    errorResponse(res, 401, null, "Unauthorized. Please log in.");
    return;
  }

  if (
    req.user.role !== UserRole.SUPER_ADMIN &&
    req.user.role !== UserRole.ADMIN
  ) {
    console.error(
      `Access denied: user ${req.user.id} is not ADMIN or SUPER_ADMIN`
    );
    errorResponse(
      res,
      403,
      null,
      "Access denied. Only ADMIN or SUPER_ADMIN can perform this action."
    );
    return;
  }

  next();
};
