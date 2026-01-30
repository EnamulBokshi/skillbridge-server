import { Request, Response } from "express";

const errorResponse = async(res: Response, errorCode:number = 500, error: any | null, message:string="Something went wrong!!") => {
    res.status(errorCode).json({success: false, data: null, error: error, message })
}

export {errorResponse};