import { Response } from "express";

export const successResponse = async(res: Response, statusCode:number, payload: any, message:string = 'Operation successfull!!') => {
    res.status(statusCode).json({success:true, data: payload, error: null, message});
    return;
}