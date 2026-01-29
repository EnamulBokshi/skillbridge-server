// app 

import express, { Application, Request, Response } from "express"
import {auth} from './lib/auth';
import cors from "cors"
import { toNodeHandler } from "better-auth/node";


const app:Application = express();

app.use(express.json());
app.use(cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true
}));

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({message: "Welcome to SkillBride Server"});
})

export default app;
