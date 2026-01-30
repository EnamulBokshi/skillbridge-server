import { NextFunction, Request, Response } from "express";

const logger = async(req: Request, res: Response, next: NextFunction) => {
try {
    const method = req.method;
    const url = req.url
    const time = new Date;
    console.log(method.toUpperCase(), " ", url, " ", time);
    next()
} catch (error: any) {
        console.error(error)
        next(error);
}
}

export default logger;