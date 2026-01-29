import { NextFunction, Request, Response } from "express";
import { UserRole } from "../constants/userRole";
import { errorResponse } from "../helpers/errorResponse";
import { auth } from "../lib/auth";

declare global{
    namespace Express{
        interface Request{
            user?:{
                id: string;
                email: string;
                name: string;
                role: string;
                emailVerified: boolean;
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
            req.user = {
                id: userSession.user.id,
                email: userSession.user.email,
                name: userSession.user.name,
                emailVerified: userSession.user.emailVerified,
                role: userSession.user.role as string,
                isAssociate: userSession.user.isAssociate as boolean
            }
            if(role.length && !role.includes(req.user.role as UserRole)){
                errorResponse(res, 403, null, "Forbidden! You are not authorized to access this resource");
                return;
            };

            console.log('Access granted')
            next();
        } catch (error) {
            console.error(error);
            next(error)
        }
    }
}

export {authMiddleware};

