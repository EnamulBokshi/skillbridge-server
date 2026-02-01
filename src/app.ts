// app 

import express, { Application, Request, Response } from "express"
import {auth} from './lib/auth';
import cors from "cors"
import { toNodeHandler } from "better-auth/node";
import studentRouter from "./modules/student/student.router";
import logger from "./middleware/logger.middleware";
import tutorRouter from "./modules/tutor/tutor.router";
import notFoundMiddleware from "./middleware/404Route.middleware";
import { categoryRouter } from "./modules/category/category.router";
import subjectRouter from "./modules/subject/subject.router";
import slotRouter from "./modules/slot/slot.router";


const app:Application = express();

app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5000"],
    credentials: true
}));

app.use(logger);

app.all('/api/auth/*splat', toNodeHandler(auth));
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({message: "Welcome to SkillBridge Server"});
})

app.use("/api/v1/students", studentRouter);
app.use("/api/v1/tutors", tutorRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/subjects", subjectRouter)
app.use("/api/v1/slots", slotRouter);

app.use(notFoundMiddleware);

export default app;
