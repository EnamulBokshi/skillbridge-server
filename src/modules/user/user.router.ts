    import { Router } from "express";
    import {userController} from "./user.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { UserRole } from "../../constants/userRole.js";
import {
    validateChangePassword,
    validateForgotPassword,
    validateResendEmailOtp,
    validateResetPassword,
    validateVerifyEmailOtp,
} from "./user.validator.js";

const userRouter:Router = Router();

userRouter.post("/verify-email-otp", validateVerifyEmailOtp, userController.verifyEmailWithOtp);
userRouter.post("/resend-verification-otp", validateResendEmailOtp, userController.resendEmailVerificationOtp);
userRouter.post("/forgot-password", validateForgotPassword, userController.forgotPassword);
userRouter.post("/reset-password", validateResetPassword, userController.resetPassword);
userRouter.post(
    "/change-password",
    authMiddleware(UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR, UserRole.USER),
    validateChangePassword,
    userController.changePassword,
);

userRouter.get("/me", authMiddleware(UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR, UserRole.USER), userController.getCurrentUser);
userRouter.get("/:userId", authMiddleware(UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR, UserRole.USER), userController.getUserById);
userRouter.patch("/:userId", authMiddleware(UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR, UserRole.USER), userController.updateUserById);
userRouter.delete("/:userId", authMiddleware(UserRole.ADMIN), userController.deleteUserById);

export default userRouter;