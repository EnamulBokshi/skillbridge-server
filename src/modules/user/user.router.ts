import { Router } from "express";
import getCurrentUser from "./user.controller";
import { auth } from "../../lib/auth";
import { authMiddleware } from "../../middleware/auth.middleware";
import { UserRole } from "../../constants/userRole";

const userRouter = Router();

userRouter.get("/me", authMiddleware(UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR, UserRole.USER), getCurrentUser);

export default userRouter;