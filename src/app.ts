// app 

import express, { Application, Request, Response } from "express"
import {auth} from './lib/auth';
import cors from "cors"
import { toNodeHandler } from "better-auth/node";
import studentRouter from "./modules/student/student.router";


const app:Application = express();

app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true
}));

app.all('/api/auth/*splat', toNodeHandler(auth));

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({message: "Welcome to SkillBride Server"});
})

app.use("/api/auth/registration/student", studentRouter)

export default app;
