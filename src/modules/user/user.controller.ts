import { Request, Response } from "express";
import { errorResponse } from "../../helpers/errorResponse";
import { successResponse } from "../../helpers/successResponse";
import { userService } from "./user.service";

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
export const userController = {
    getCurrentUser,
    getUserById,
    updateUserById,
    deleteUserById
};
