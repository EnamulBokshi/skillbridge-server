import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { UserRole } from "../../constants/userRole";
import privateRoute from "../../middleware/private.middleware";
import { tutorController } from "./tutor.controller";

const tutorRouter = Router();
tutorRouter.post("/",authMiddleware(UserRole.ADMIN, UserRole.TUTOR, UserRole.USER), privateRoute, tutorController.createTutor);

export default tutorRouter;