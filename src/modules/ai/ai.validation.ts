import { NextFunction, Request, Response } from "express";

export type TutorRecommendationRequest = {
  search?: string;
  categoryId?: string;
  minRating?: number;
  maxRating?: number;
  minExperience?: number;
  maxExperience?: number;
  isFeatured?: boolean;
  budgetMin?: number;
  budgetMax?: number;
  preferredTopics?: string[];
  learningGoal?: string;
  maxResults?: number;
};

type ChatHistoryItem = {
  role: "user" | "model";
  content: string;
};

export type ChatRequestBody = {
  prompt: string;
  context?: string;
  history?: ChatHistoryItem[];
};

export type TutorBioWriterRequest = {
  firstName?: string;
  lastName?: string;
  completedSessions?: number;
  experienceYears?: number;
  expertiseAreas?: string[];
  categories?: string[];
  avgRating?: number;
  totalReviews?: number;
};

export type ReviewSuggestionRequest = {
  rating: number;
  count?: number;
};

const asNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
};

export const validateTutorRecommendationRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const body = req.body as TutorRecommendationRequest;

  if (body.search !== undefined && typeof body.search !== "string") {
    return res.status(400).json({
      success: false,
      message: "search must be a string",
      data: null,
    });
  }

  if (body.search && body.search.trim().length > 120) {
    return res.status(400).json({
      success: false,
      message: "search is too long (max 120 characters)",
      data: null,
    });
  }

  if (body.categoryId !== undefined && typeof body.categoryId !== "string") {
    return res.status(400).json({
      success: false,
      message: "categoryId must be a string",
      data: null,
    });
  }

  if (body.learningGoal !== undefined && typeof body.learningGoal !== "string") {
    return res.status(400).json({
      success: false,
      message: "learningGoal must be a string",
      data: null,
    });
  }

  if (body.learningGoal && body.learningGoal.trim().length > 300) {
    return res.status(400).json({
      success: false,
      message: "learningGoal is too long (max 300 characters)",
      data: null,
    });
  }

  if (body.isFeatured !== undefined && typeof body.isFeatured !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "isFeatured must be a boolean",
      data: null,
    });
  }

  if (body.preferredTopics !== undefined) {
    if (!isStringArray(body.preferredTopics)) {
      return res.status(400).json({
        success: false,
        message: "preferredTopics must be an array of strings",
        data: null,
      });
    }

    if (body.preferredTopics.length > 15) {
      return res.status(400).json({
        success: false,
        message: "preferredTopics can contain at most 15 items",
        data: null,
      });
    }

    if (body.preferredTopics.some((topic) => topic.trim().length === 0 || topic.length > 60)) {
      return res.status(400).json({
        success: false,
        message: "Each preferred topic must be 1-60 characters",
        data: null,
      });
    }
  }

  const minRating = asNumber(body.minRating);
  const maxRating = asNumber(body.maxRating);
  const minExperience = asNumber(body.minExperience);
  const maxExperience = asNumber(body.maxExperience);
  const budgetMin = asNumber(body.budgetMin);
  const budgetMax = asNumber(body.budgetMax);
  const maxResults = asNumber(body.maxResults);

  if (body.minRating !== undefined && minRating === undefined) {
    return res.status(400).json({ success: false, message: "minRating must be a number", data: null });
  }
  if (body.maxRating !== undefined && maxRating === undefined) {
    return res.status(400).json({ success: false, message: "maxRating must be a number", data: null });
  }
  if (minRating !== undefined && (minRating < 0 || minRating > 5)) {
    return res.status(400).json({ success: false, message: "minRating must be between 0 and 5", data: null });
  }
  if (maxRating !== undefined && (maxRating < 0 || maxRating > 5)) {
    return res.status(400).json({ success: false, message: "maxRating must be between 0 and 5", data: null });
  }
  if (minRating !== undefined && maxRating !== undefined && minRating > maxRating) {
    return res.status(400).json({ success: false, message: "minRating cannot be greater than maxRating", data: null });
  }

  if (body.minExperience !== undefined && minExperience === undefined) {
    return res.status(400).json({ success: false, message: "minExperience must be a number", data: null });
  }
  if (body.maxExperience !== undefined && maxExperience === undefined) {
    return res.status(400).json({ success: false, message: "maxExperience must be a number", data: null });
  }
  if (minExperience !== undefined && minExperience < 0) {
    return res.status(400).json({ success: false, message: "minExperience cannot be negative", data: null });
  }
  if (maxExperience !== undefined && maxExperience < 0) {
    return res.status(400).json({ success: false, message: "maxExperience cannot be negative", data: null });
  }
  if (
    minExperience !== undefined &&
    maxExperience !== undefined &&
    minExperience > maxExperience
  ) {
    return res.status(400).json({ success: false, message: "minExperience cannot be greater than maxExperience", data: null });
  }

  if (body.budgetMin !== undefined && budgetMin === undefined) {
    return res.status(400).json({ success: false, message: "budgetMin must be a number", data: null });
  }
  if (body.budgetMax !== undefined && budgetMax === undefined) {
    return res.status(400).json({ success: false, message: "budgetMax must be a number", data: null });
  }
  if (budgetMin !== undefined && budgetMin < 0) {
    return res.status(400).json({ success: false, message: "budgetMin cannot be negative", data: null });
  }
  if (budgetMax !== undefined && budgetMax < 0) {
    return res.status(400).json({ success: false, message: "budgetMax cannot be negative", data: null });
  }
  if (budgetMin !== undefined && budgetMax !== undefined && budgetMin > budgetMax) {
    return res.status(400).json({ success: false, message: "budgetMin cannot be greater than budgetMax", data: null });
  }

  if (body.maxResults !== undefined && maxResults === undefined) {
    return res.status(400).json({ success: false, message: "maxResults must be a number", data: null });
  }
  if (maxResults !== undefined && (!Number.isInteger(maxResults) || maxResults < 1 || maxResults > 10)) {
    return res.status(400).json({
      success: false,
      message: "maxResults must be an integer between 1 and 10",
      data: null,
    });
  }

  const normalized: TutorRecommendationRequest = {};

  if (typeof body.search === "string") {
    const search = body.search.trim();
    if (search.length > 0) normalized.search = search;
  }

  if (typeof body.categoryId === "string") {
    const categoryId = body.categoryId.trim();
    if (categoryId.length > 0) normalized.categoryId = categoryId;
  }

  if (typeof body.learningGoal === "string") {
    const learningGoal = body.learningGoal.trim();
    if (learningGoal.length > 0) normalized.learningGoal = learningGoal;
  }

  if (typeof body.isFeatured === "boolean") {
    normalized.isFeatured = body.isFeatured;
  }

  if (Array.isArray(body.preferredTopics)) {
    const preferredTopics = body.preferredTopics
      .map((topic) => topic.trim())
      .filter((topic) => topic.length > 0);

    if (preferredTopics.length > 0) {
      normalized.preferredTopics = preferredTopics;
    }
  }

  if (minRating !== undefined) normalized.minRating = minRating;
  if (maxRating !== undefined) normalized.maxRating = maxRating;
  if (minExperience !== undefined) normalized.minExperience = minExperience;
  if (maxExperience !== undefined) normalized.maxExperience = maxExperience;
  if (budgetMin !== undefined) normalized.budgetMin = budgetMin;
  if (budgetMax !== undefined) normalized.budgetMax = budgetMax;
  if (maxResults !== undefined) normalized.maxResults = maxResults;

  req.body = normalized;

  next();
};

export const validateAiChatRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const body = req.body as Partial<ChatRequestBody>;

  if (typeof body.prompt !== "string") {
    return res.status(400).json({
      success: false,
      message: "prompt is required and must be a string",
      data: null,
    });
  }

  const prompt = body.prompt.trim();
  if (!prompt) {
    return res.status(400).json({
      success: false,
      message: "prompt cannot be empty",
      data: null,
    });
  }

  if (prompt.length > 1000) {
    return res.status(400).json({
      success: false,
      message: "prompt is too long (max 1000 characters)",
      data: null,
    });
  }

  if (body.context !== undefined) {
    if (typeof body.context !== "string") {
      return res.status(400).json({
        success: false,
        message: "context must be a string",
        data: null,
      });
    }

    if (body.context.length > 1500) {
      return res.status(400).json({
        success: false,
        message: "context is too long (max 1500 characters)",
        data: null,
      });
    }
  }

  if (body.history !== undefined) {
    if (!Array.isArray(body.history)) {
      return res.status(400).json({
        success: false,
        message: "history must be an array",
        data: null,
      });
    }

    if (body.history.length > 10) {
      return res.status(400).json({
        success: false,
        message: "history can include at most 10 messages",
        data: null,
      });
    }

    const isValidHistory = body.history.every((item) => {
      return (
        item &&
        (item.role === "user" || item.role === "model") &&
        typeof item.content === "string" &&
        item.content.trim().length > 0 &&
        item.content.length <= 500
      );
    });

    if (!isValidHistory) {
      return res.status(400).json({
        success: false,
        message:
          "Each history item must include role (user|model) and non-empty content up to 500 chars",
        data: null,
      });
    }
  }

  const normalized: ChatRequestBody = { prompt };
  if (typeof body.context === "string" && body.context.trim().length > 0) {
    normalized.context = body.context.trim();
  }
  if (Array.isArray(body.history) && body.history.length > 0) {
    normalized.history = body.history.map((item) => ({
      role: item.role,
      content: item.content.trim(),
    }));
  }

  req.body = normalized;
  next();
};

export const validateTutorBioWriterRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const body = req.body as TutorBioWriterRequest;

  const normalized: TutorBioWriterRequest = {};

  if (body.firstName !== undefined) {
    if (typeof body.firstName !== "string") {
      return res.status(400).json({ success: false, message: "firstName must be a string", data: null });
    }
    const firstName = body.firstName.trim();
    if (firstName.length > 0) normalized.firstName = firstName;
  }

  if (body.lastName !== undefined) {
    if (typeof body.lastName !== "string") {
      return res.status(400).json({ success: false, message: "lastName must be a string", data: null });
    }
    const lastName = body.lastName.trim();
    if (lastName.length > 0) normalized.lastName = lastName;
  }

  const completedSessions = asNumber(body.completedSessions);
  if (body.completedSessions !== undefined && completedSessions === undefined) {
    return res.status(400).json({ success: false, message: "completedSessions must be a number", data: null });
  }
  if (completedSessions !== undefined && completedSessions < 0) {
    return res.status(400).json({ success: false, message: "completedSessions cannot be negative", data: null });
  }
  if (completedSessions !== undefined && completedSessions > 0) {
    normalized.completedSessions = completedSessions;
  }

  const experienceYears = asNumber(body.experienceYears);
  if (body.experienceYears !== undefined && experienceYears === undefined) {
    return res.status(400).json({ success: false, message: "experienceYears must be a number", data: null });
  }
  if (experienceYears !== undefined && experienceYears < 0) {
    return res.status(400).json({ success: false, message: "experienceYears cannot be negative", data: null });
  }
  if (experienceYears !== undefined && experienceYears > 0) {
    normalized.experienceYears = experienceYears;
  }

  const avgRating = asNumber(body.avgRating);
  if (body.avgRating !== undefined && avgRating === undefined) {
    return res.status(400).json({ success: false, message: "avgRating must be a number", data: null });
  }
  if (avgRating !== undefined && (avgRating < 0 || avgRating > 5)) {
    return res.status(400).json({ success: false, message: "avgRating must be between 0 and 5", data: null });
  }
  if (avgRating !== undefined && avgRating > 0) {
    normalized.avgRating = avgRating;
  }

  const totalReviews = asNumber(body.totalReviews);
  if (body.totalReviews !== undefined && totalReviews === undefined) {
    return res.status(400).json({ success: false, message: "totalReviews must be a number", data: null });
  }
  if (totalReviews !== undefined && totalReviews < 0) {
    return res.status(400).json({ success: false, message: "totalReviews cannot be negative", data: null });
  }
  if (totalReviews !== undefined && totalReviews > 0) {
    normalized.totalReviews = totalReviews;
  }

  if (body.expertiseAreas !== undefined) {
    if (!isStringArray(body.expertiseAreas)) {
      return res.status(400).json({ success: false, message: "expertiseAreas must be an array of strings", data: null });
    }
    const expertiseAreas = body.expertiseAreas
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, 12);

    if (expertiseAreas.length > 0) {
      normalized.expertiseAreas = expertiseAreas;
    }
  }

  if (body.categories !== undefined) {
    if (!isStringArray(body.categories)) {
      return res.status(400).json({ success: false, message: "categories must be an array of strings", data: null });
    }
    const categories = body.categories
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, 8);

    if (categories.length > 0) {
      normalized.categories = categories;
    }
  }

  if (Object.keys(normalized).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Provide at least one meaningful tutor field to generate bio",
      data: null,
    });
  }

  req.body = normalized;
  next();
};

export const validateReviewSuggestionRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const body = req.body as ReviewSuggestionRequest;

  const rating = asNumber(body.rating);
  if (rating === undefined) {
    return res.status(400).json({ success: false, message: "rating is required and must be a number", data: null });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "rating must be between 1 and 5", data: null });
  }

  const count = body.count === undefined ? 3 : asNumber(body.count);
  if (count === undefined || !Number.isInteger(count) || count < 1 || count > 5) {
    return res.status(400).json({ success: false, message: "count must be an integer between 1 and 5", data: null });
  }

  req.body = {
    rating,
    count,
  } satisfies ReviewSuggestionRequest;

  next();
};
