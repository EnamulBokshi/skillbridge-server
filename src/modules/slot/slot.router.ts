import { Router } from "express";   
import { slotController } from "./slot.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { UserRole } from "../../constants/userRole";

const slotRouter = Router();

slotRouter.post("/", authMiddleware(UserRole.ADMIN, UserRole.TUTOR), slotController.createSlot);

export default slotRouter;