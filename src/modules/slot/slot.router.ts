import { Router } from "express";   
import { slotController } from "./slot.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { UserRole } from "../../constants/userRole.js";
import privateRoute from "../../middleware/private.middleware.js";

const slotRouter:Router = Router();

slotRouter.post("/", authMiddleware(UserRole.ADMIN, UserRole.TUTOR), slotController.createSlot);
slotRouter.get("/", slotController.getSlots);
slotRouter.get("/:id", slotController.getSlotById);
slotRouter.patch("/book/:id", authMiddleware(UserRole.STUDENT), slotController.markSlotAsBooked);
slotRouter.patch("/unbook/:id", authMiddleware(UserRole.STUDENT), slotController.markSlotAsUnbooked);
slotRouter.delete("/:id", authMiddleware(UserRole.ADMIN, UserRole.TUTOR), slotController.deleteSlot);
slotRouter.patch("/:id", authMiddleware( UserRole.TUTOR, UserRole.ADMIN), slotController.updateSlot);

export default slotRouter;