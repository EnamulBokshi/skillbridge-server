import { Request, Response } from "express";

const errorResponse = async(req: Request, res: Response, error: Error, message:string="Something went wrong!!") => {
    res.status(500).json({success: false, data: null, error: error, message })
}

export {errorResponse};