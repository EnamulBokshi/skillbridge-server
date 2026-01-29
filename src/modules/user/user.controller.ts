import { Request, Response } from "express";
import { errorResponse } from "../../helpers/errorResponse";
import { successResponse } from "../../helpers/successResponse";

const getCurrentUser = async(req:Request, res: Response) => {
    
    try {
        const currentUser = req.user;
        successResponse(res, 200, currentUser, 'Current user retrive successfully!!')
    } catch (error: any) {
        console.error(error)
        errorResponse(req, res, error, error.message)
    }
}


export default getCurrentUser;
