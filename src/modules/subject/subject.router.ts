import  {Router} from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { UserRole } from "../../constants/userRole.js";
import { subjectController } from "./subject.controller.js";

const subjectRouter:Router = Router();

subjectRouter.post("/", authMiddleware(UserRole.ADMIN), subjectController.createSubject );
subjectRouter.get("/", subjectController.getAllSubjects);
subjectRouter.get("/category/:categoryId", subjectController.getSubjectsByCategory);
subjectRouter.delete("/:id", authMiddleware(UserRole.ADMIN), subjectController.deleteSubject);
subjectRouter.patch("/:id", authMiddleware(UserRole.ADMIN), subjectController.updateSubject);

export default subjectRouter;
