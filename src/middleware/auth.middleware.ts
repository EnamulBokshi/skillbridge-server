import { NextFunction, Request, Response } from "express";
import { UserRole } from "../constants/userRole.js";
import { errorResponse } from "../helpers/errorResponse.js";
import { auth } from "../lib/auth.js";

declare global{
    namespace Express{
        interface Request{
            user?:{
                id: string;
                email: string;
                name: string;
                role: string;
                emailVerified: boolean;
                status: "ACTIVE" | "BANNED" | "INACTIVE";
                
                isAssociate: boolean;
            }
        }
    }
}

const authMiddleware = (...role: UserRole[])=> {
    return async(req: Request, res: Response, next: NextFunction) => {
        try {
            const userSession = await auth.api.getSession({
                headers: req.headers as any,
            })
            if(!userSession){
                console.error('Please logged in to access this recource!');
                errorResponse(res, 401, null, 'Please logged in to access this resource');
                return;
            }
            if(!userSession.user.emailVerified){
                console.error('Email is not verified');
                errorResponse(res, 400, null, 'Please verify your email first!!');
                return;
            }
            if(userSession.user.status === "BANNED"){
                console.error('Your account has been banned. Please contact support.');
                errorResponse(res, 403, null, 'Your account has been banned. Please contact support.');
                return;
            }
            req.user = {
                id: userSession.user.id,
                email: userSession.user.email,
                name: userSession.user.name,
                emailVerified: userSession.user.emailVerified,
                role: userSession.user.role as string,
                isAssociate: userSession.user.isAssociate as boolean,
                status: userSession.user.status as "ACTIVE" | "BANNED" | "INACTIVE"
            }
            if(role.length && !role.includes(req.user.role as UserRole)){
                errorResponse(res, 403, null, "Forbidden! You are not authorized to access this resource");
                return;
            };

            console.log('**********Auth check passed**********');
            console.log(`User ID: ${req.user.id}, Role: ${req.user.role}, Status: ${req.user.status}`);
            console.log(`Requested Resource: ${req.method} ${req.originalUrl}`);
            console.log('User is authorized to access this resource');
            console.log('***************************************');

            next();
        } catch (error) {
            console.error(error);
            next(error)
        }
    }
}

export {authMiddleware};

