import { Router } from "express";
import {authMiddleware} from "../../middleware/auth.middleware"
import { UserRole } from "../../constants/userRole";
import { studentController } from "./student.controller";

const studentRouter = Router();
studentRouter.post("/", authMiddleware(UserRole.ADMIN, UserRole.USER), studentController.createStudent)


export default studentRouter;