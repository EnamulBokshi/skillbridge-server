import { NextFunction, Request, Response } from "express";
import { UserRole } from "../constants/userRole";

const privateRoute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Please log in.",
      });
    }
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (userRole === UserRole.ADMIN && userId !== req.body.id) {
      res.status(401).json({
        success: false,
        message: "Forbidden! you are not authorized for such an operation",
      });
      return;
    }
    // User is authenticated, proceed to the next middleware or route handler
    next();
  } catch (error: any) {
    console.error("Error in private route middleware:", error);
    next(error);
  }
};
export default privateRoute;