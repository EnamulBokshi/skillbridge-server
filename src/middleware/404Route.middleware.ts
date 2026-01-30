import { Request, Response } from "express";

const notFoundMiddleware = (req:Request, res:Response) => {
    res.status(404).json({
        requestedUrl: req.originalUrl,
        message: "Route not found",
        time: new Date()
    });
}

export default notFoundMiddleware;