// server 

import "./config/config.js";
import app from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = process.env.PORT || 5000;

async function server(){
    try {
        await prisma.$connect();
        console.log('Database connected successfully');
        app.listen(PORT, ()=> {
            console.log(`The server is running on ${process.env.APP_URL || 'http://localhost:5000'}`)
        })
    } catch (error) {
        console.error('An error occured: ', error)
        await prisma.$disconnect();
        process.exit(1)
    }
}

server();