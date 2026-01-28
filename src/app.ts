// app 

import express, { Application } from "express"
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



export default app;
