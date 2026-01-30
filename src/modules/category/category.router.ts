import { Router } from "express";
import { categoryController } from "./category.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { UserRole } from "../../constants/userRole";

const categoryRouter = Router();

categoryRouter.post("/", authMiddleware(UserRole.ADMIN), categoryController.createCategory);
categoryRouter.get("/", categoryController.getAllCategories);
categoryRouter.delete("/:id", authMiddleware(UserRole.ADMIN), categoryController.deleteCategory);
categoryRouter.patch("/:id", authMiddleware(UserRole.ADMIN), categoryController.updateCategory);

export { categoryRouter };

