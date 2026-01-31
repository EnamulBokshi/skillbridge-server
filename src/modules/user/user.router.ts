    import { Router } from "express";
    import {userController} from "./user.controller";
import { auth } from "../../lib/auth";
import { authMiddleware } from "../../middleware/auth.middleware";
import { UserRole } from "../../constants/userRole";

const userRouter = Router();

userRouter.get("/me", authMiddleware(UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR, UserRole.USER), userController.getCurrentUser);
userRouter.get("/:userId", authMiddleware(UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR, UserRole.USER), userController.getUserById);
userRouter.patch("/:userId", authMiddleware(UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR, UserRole.USER), userController.updateUserById);
userRouter.delete("/:userId", authMiddleware(UserRole.ADMIN), userController.deleteUserById);

export default userRouter;