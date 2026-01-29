import { NextFunction, Request, Response } from "express";
import { UserRole } from "../constants/userRole";

declare global{
    namespace Express{
        interface Request{
            user?:{
                id: string;
                email: string;
                name: string;
                role: string;
                emailVerified: boolean
            }
        }
    }
}

const authMiddleware = (...role: UserRole[])=> {
    return async(req: Request, res: Response, next: NextFunction) => {
        try {
            
        } catch (error) {
            
        }
    }
}

export {};

