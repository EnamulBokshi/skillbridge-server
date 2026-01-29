import { Router } from "express";
import {authMiddleware} from "../../middleware/auth.middleware"
import { UserRole } from "../../constants/userRole";
import { studentController } from "./student.controller";
import privateRoute from "../../middleware/private.middleware";

const studentRouter = Router();
studentRouter.post("/", authMiddleware(UserRole.ADMIN, UserRole.USER),privateRoute, studentController.createStudent);


export default studentRouter;