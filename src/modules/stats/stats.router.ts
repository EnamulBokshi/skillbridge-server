import express, { Router } from "express";
import { StatsController } from "./stats.controller.js";

const statsRouter: Router = express.Router();

// Public endpoint - no authentication required
statsRouter.get("/", StatsController.getPlatformStats);

export default statsRouter;
