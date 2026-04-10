import { Router } from "express";
import {
	validateAiChatRequest,
	validateReviewSuggestionRequest,
	validateTutorBioWriterRequest,
	validateTutorRecommendationRequest,
} from "./ai.validation.js";
import { aiChatRateLimit } from "./ai.rateLimit.js";
import { AiController } from "./ai.controller.js";

const AiRoute:Router = Router();

AiRoute.post(
	"/chat",
	validateAiChatRequest,
	aiChatRateLimit,
	AiController.generateChatResponse,
);
AiRoute.get("/models", AiController.getAvailableModels);
AiRoute.post(
	"/tutor-recommendations",
	validateTutorRecommendationRequest,
	AiController.getTutorRecommendations,
);
AiRoute.post(
	"/write/tutor-bio",
	validateTutorBioWriterRequest,
	aiChatRateLimit,
	AiController.generateTutorBio,
);
AiRoute.post(
	"/write/review-suggestions",
	validateReviewSuggestionRequest,
	aiChatRateLimit,
	AiController.generateReviewSuggestions,
);


export default AiRoute;

