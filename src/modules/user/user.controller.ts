import { Request, Response } from "express";
import { errorResponse } from "../../helpers/errorResponse.js";
import { successResponse } from "../../helpers/successResponse.js";
import { userService } from "./user.service.js";
import { UserServiceError } from "./user.service.js";

// interface CustomRequest extends Request {
//     user?: any;
// }

const getCurrentUser = async(req: Request, res: Response) => {
    
    try {
        const currentUser = req.user;
        if(!currentUser) {
            return errorResponse(res, 401, null, 'Unauthorized access');
        }
        successResponse(res, 200, currentUser, 'Current user retrieved successfully!!')
    } catch (error: any) {
        console.error(error)
        errorResponse(res, 400, error, error.message)
    }
}

const getUserById = async(req: Request, res: Response) => {
    
    try {
        const {userId} = req.params;
        if(!userId) {
            return errorResponse(res, 400, null, 'User ID is required');
        }
        const user = await userService.getUserById(userId as string)
        if(!user) {
            return errorResponse(res, 404, null, 'User not found');
        }
        successResponse(res, 200, user, 'User retrieved successfully!!')
    } catch (error: any) {
        console.error(error)
        errorResponse(res, 400, error, error.message)
    }
}
const updateUserById = async(req: Request, res: Response) => {
    
    try {
        const {userId} = req.params;
        const data = req.body;
        if(!userId) {
            return errorResponse(res, 400, null, 'User ID is required');
        }
        const updatedUser = await userService.updateUser(userId as string, data)
        successResponse(res, 200, updatedUser, 'User updated successfully!!')
    } catch (error: any) {
        console.error(error)
        errorResponse(res, 400, error, error.message)
    }
}
const deleteUserById = async(req: Request, res: Response) => {
    try {
        const {userId} = req.params;
        if(!userId) {
            return errorResponse(res, 400, null, 'User ID is required');
        }
        const deletedUser = await userService.deleteUser(userId as string)
        if(!deletedUser) {
            return errorResponse(res, 404, null, 'User not found');
        }
        successResponse(res, 200, deletedUser, 'User deleted successfully!!')
    } catch (error: any) {
        console.error(error)
        errorResponse(res, 400, error, error.message)
    }
}

const verifyEmailWithOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        const verifiedUser = await userService.verifyEmailWithOtp(email, otp);

        return successResponse(
            res,
            200,
            verifiedUser,
            "Email verified successfully",
        );
    } catch (error: unknown) {
        console.error(error);
        if (error instanceof UserServiceError) {
            return errorResponse(res, error.statusCode, null, error.message);
        }
        return errorResponse(res, 400, error, "Failed to verify email");
    }
};

const resendEmailVerificationOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const result = await userService.resendEmailVerificationOtp(email);

        return successResponse(
            res,
            200,
            result,
            "Verification OTP sent successfully",
        );
    } catch (error: unknown) {
        console.error(error);
        if (error instanceof UserServiceError) {
            return errorResponse(res, error.statusCode, null, error.message);
        }
        return errorResponse(res, 400, error, "Failed to resend verification OTP");
    }
};

const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email, redirectTo } = req.body;
        const result = await userService.forgotPassword(email, redirectTo, req.headers as any);

        return successResponse(
            res,
            200,
            result,
            "If this email exists in our system, check your email for the reset link",
        );
    } catch (error: unknown) {
        console.error(error);
        if (error instanceof UserServiceError) {
            return errorResponse(res, error.statusCode, null, error.message);
        }
        return errorResponse(res, 400, error, "Failed to request password reset");
    }
};

const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;
        const result = await userService.resetPasswordWithToken(token, newPassword, req.headers as any);

        return successResponse(
            res,
            200,
            result,
            "Password reset successfully",
        );
    } catch (error: unknown) {
        console.error(error);
        if (error instanceof UserServiceError) {
            return errorResponse(res, error.statusCode, null, error.message);
        }
        return errorResponse(res, 400, error, "Failed to reset password");
    }
};

const changePassword = async (req: Request, res: Response) => {
    try {
        const { currentPassword, newPassword, revokeOtherSessions } = req.body;
        const result = await userService.changePassword(
            currentPassword,
            newPassword,
            revokeOtherSessions,
            req.headers as any,
        );

        return successResponse(
            res,
            200,
            result,
            "Password changed successfully",
        );
    } catch (error: unknown) {
        console.error(error);
        if (error instanceof UserServiceError) {
            return errorResponse(res, error.statusCode, null, error.message);
        }
        return errorResponse(res, 400, error, "Failed to change password");
    }
};

export const userController = {
    getCurrentUser,
    getUserById,
    updateUserById,
    deleteUserById,
    verifyEmailWithOtp,
    resendEmailVerificationOtp,
    forgotPassword,
    resetPassword,
    changePassword,
};
