// app 
import { config } from "dotenv";
import express, { Application, Request, Response } from "express"
import {auth} from './lib/auth.js';
import cors from "cors"
import { toNodeHandler } from "better-auth/node";
import studentRouter from "./modules/student/student.router.js";
import logger from "./middleware/logger.middleware.js";
import tutorRouter from "./modules/tutor/tutor.router.js";
import notFoundMiddleware from "./middleware/404Route.middleware.js";
import { categoryRouter } from "./modules/category/category.router.js";
import subjectRouter from "./modules/subject/subject.router.js";
import slotRouter from "./modules/slot/slot.router.js";
import bookingRouter from "./modules/booking/booking.router.js";
import adminRouter from "./modules/admin/admin.router.js";
import userRouter from "./modules/user/user.router.js";
import AiRoute from "./modules/ai/ai.route.js";
import statsRouter from "./modules/stats/stats.router.js";
import testimonialRouter from "./modules/testimonial/testimonial.route.js";
import contactRouter from "./modules/contact/contact.route.js";
import newsletterRouter from "./modules/newsletter/newslatter.route.js";


const app:Application = express();
const allowedOrigins = [
  process.env.APP_URL,
  process.env.PROD_APP_URL,
  "http://localhost:3000",
  "https://skillbridge-client-dusky.vercel.app",
].filter((origin): origin is string => Boolean(origin));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors({
//     origin: allowedOrigins!,
//     credentials: true
// }));

// cors({

//   origin: (origin, callback) => {

//     // Allow requests with no origin (mobile apps, Postman, etc.)

//     if (!origin) return callback(null, true);


//     // Check if origin is in allowedOrigins or matches Vercel preview pattern

//     const isAllowed =

//       allowedOrigins.includes(origin) ||

//       /^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) ||

//       /^https:\/\/.*\.vercel\.app$/.test(origin); // Any Vercel deployment


//     if (isAllowed) {

//       callback(null, true);

//     } else {

//       callback(new Error(`Origin ${origin} not allowed by CORS`));

//     }

//   },

//   credentials: true,

//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

//   allowedHeaders: ["Content-Type", "Authorization", "Cookie"],

//   exposedHeaders: ["Set-Cookie"],

// }),

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);
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
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/users", userRouter)
app.use("/api/v1/ai", AiRoute);
app.use("/api/v1/stats", statsRouter);
app.use("/api/v1/testimonials", testimonialRouter);
app.use("/api/v1/contacts", contactRouter);
app.use("/api/v1/newsletters", newsletterRouter);
app.use(notFoundMiddleware);

export default app;
