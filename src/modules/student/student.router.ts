import { Router } from "express";
import {authMiddleware} from "../../middleware/auth.middleware"
import { UserRole } from "../../constants/userRole";
import { studentController } from "./student.controller";
import privateRoute from "../../middleware/private.middleware";

const studentRouter = Router();
studentRouter.post("/", authMiddleware(UserRole.ADMIN, UserRole.USER),privateRoute, studentController.createStudent);
studentRouter.get("/:studentId", authMiddleware(UserRole.ADMIN, UserRole.STUDENT, UserRole.TUTOR, UserRole.USER), studentController.getStudentByIdFullProfile);
studentRouter.patch("/:studentId", authMiddleware(UserRole.ADMIN, UserRole.STUDENT), studentController.updateStudent);
studentRouter.delete("/:studentId", authMiddleware(UserRole.ADMIN), studentController.deleteStudent);
studentRouter.get("/:studentId/stats", authMiddleware(UserRole.ADMIN, UserRole.STUDENT), studentController.studentStats);


export default studentRouter;