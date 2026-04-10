import { Request, Response } from "express";
import { successResponse } from "../../helpers/successResponse.js";
import { errorResponse } from "../../helpers/errorResponse.js";
import { statsService } from "./stats.service.js";

const getPlatformStats = async (req: Request, res: Response) => {
  try {
    const stats = await statsService.getPlatformStats();

    return successResponse(
      res,
      200,
      stats,
      "Platform statistics fetched successfully"
    );
  } catch (error: unknown) {
    console.error("Error in getPlatformStats controller:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch platform stats";

    return errorResponse(res, 500, null, errorMessage);
  }
};

export const StatsController = {
  getPlatformStats,
};
