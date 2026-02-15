import { Router } from "express";
import { categoryController } from "./category.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { UserRole } from "../../constants/userRole.js";

const categoryRouter:Router = Router();

categoryRouter.post("/", authMiddleware(UserRole.ADMIN), categoryController.createCategory);
categoryRouter.get("/", categoryController.getAllCategories);
categoryRouter.get("/:slug", categoryController.getCategoryBySlug);

categoryRouter.delete("/:id", authMiddleware(UserRole.ADMIN), categoryController.deleteCategory);
categoryRouter.patch("/:id", authMiddleware(UserRole.ADMIN), categoryController.updateCategory);

export { categoryRouter };

