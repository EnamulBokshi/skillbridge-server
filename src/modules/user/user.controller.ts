import { Request, Response } from "express";
import { errorResponse } from "../../helpers/errorResponse";
import { successResponse } from "../../helpers/successResponse";

// interface CustomRequest extends Request {
//     user?: any;
// }

const getCurrentUser = async(req: Request, res: Response) => {
    
    try {
        const currentUser = req.user;
        successResponse(res, 200, currentUser, 'Current user retrive successfully!!')
    } catch (error: any) {
        console.error(error)
        errorResponse(res, error, error.message)
    }
}


export default getCurrentUser;
