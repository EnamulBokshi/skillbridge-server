import { Request, Response } from "express";
import { adminService } from "./admin.service";

const getTotalEarnings = async (req:Request, res: Response)=>{
    try {
        const totalEarnings = await adminService.getTotalEarnings();
        res.status(200).json({
            success: true,
            message: "Total earnings fetched successfully!!",
            data: totalEarnings
        });
        
    } catch (error:any) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message || "Couldn't fetch total earnings!!",
            data: null
        });
    }
}

const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if(!id) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
                data: null
            });
        }
        // Assuming adminService.deleteUser is implemented
        await adminService.deleteUser(id as string);
        res.status(200).json({
            success: true,
            message: "User deleted successfully!!",
            data: null
        });
        
    } catch (error:any) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message || "Couldn't delete user!!",
            data: null
        });
    }
}

const banUser = async (req: Request, res: Response) => {
    // Implementation for banning a user
}

const unbanUser = async (req: Request, res: Response) => {
    // Implementation for unbanning a user
}

export const adminController = {
    getTotalEarnings,
    deleteUser,
    banUser,
    unbanUser
}