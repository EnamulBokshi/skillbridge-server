import { NextFunction, Request, Response} from "express";
import { Prisma } from "../../generated/prisma/client";

const errorHandler = async(err: any, req: Request, res: Response, next: NextFunction) =>{
    let errorMessage = "Internal Server Issue!";
    let statusCode = 500;
    let errorDetails = err;

    //PrismaClientValidationError
    if(err instanceof Prisma.PrismaClientValidationError){
        errorMessage = "Missing fileds or Incorrect field type provided!!";
        statusCode = 400;

    }
    else if(err instanceof Prisma.PrismaClientKnownRequestError){
        statusCode = 400;
        if(err.code === "P2025") {
            errorMessage = "An operation failed because it depends on one or more records that were required but not found";
        }
         else if(err.code === "P2029") {
            errorMessage = "Query parameter limit exceeded";
        }
        else if(err.code === "P2023") {
            errorMessage = "Inconsistent column data";
        }
        else{
        errorMessage = err.message;

        }
    }
    else if(err instanceof Prisma.PrismaClientKnownRequestError){
        statusCode=500;
        errorMessage = "Error occured during query execution";

    }
    else if(err instanceof Prisma.PrismaClientInitializationError) {
        if(err.errorCode === "P1000"){
            statusCode=401
            errorMessage = "Authentication failed. Please check you credentials!"
        }
        else if(err.errorCode === "P1001"){
            statusCode = 400;
            errorMessage = "Can't reach database server"
        }
    }
    res.status(statusCode).json({
        success: false,
        message: errorMessage,
        details: errorDetails
    })
}

export default errorHandler;