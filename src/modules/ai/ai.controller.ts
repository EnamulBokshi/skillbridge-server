import { Request, Response } from "express";
import {
  generateSkillBridgeResponse,
  listModels,
  SkillBridgeAiRequest,
} from "../../lib/gemini.js";
import { TutorSearchParams } from "../../types/index.js";
import { tutorService } from "../tutor/tutor.service.js";
import {
  ReviewSuggestionRequest,
  TutorBioWriterRequest,
  TutorRecommendationRequest,
} from "./ai.validation.js";
import { prisma } from "../../lib/prisma.js";

type RankedResult = {
  tutorId: string;
  score: number;
  reason: string;
};

const DOMAIN_KEYWORDS = [
  "skillbridge",
  "skill bridge",
  "platform",
  "tutor",
  "tutors",
  "slot",
  "slots",
  "available",
  "booking",
  "book",
  "subject",
  "subjects",
  "category",
  "categories",
  "review",
  "rating",
  "geometry",
  "algebra",
  "math",
  "science",
  "english",
  "free",
  "price",
  "cost",
  "schedule",
  "session",
];

const TOP_TUTOR_PHRASES = [
  "best tutor",
  "top rated tutor",
  "highest rated tutor",
  "most average rating",
  "top tutor",
  "who is the best tutor",
];

const PLATFORM_INFO_PHRASES = [
  "what is skillbridge",
  "what is skill bridge",
  "how does skillbridge work",
  "how does skill bridge work",
  "about skillbridge",
  "about skill bridge",
];

const findIsoDate = (text: string): string | undefined => {
  const match = text.match(/\b\d{4}-\d{2}-\d{2}\b/);
  return match ? match[0] : undefined;
};

const extractTopic = (prompt: string): string => {
  const lowered = prompt.toLowerCase();
  const explicit = lowered.match(
    /(?:on|for|in|of)\s+([a-zA-Z][a-zA-Z\s]{1,30})/,
  );

  if (explicit && explicit[1]) {
    const value = explicit[1]
      .replace(/\b(this|that|the|platform|right|now|me)\b/gi, "")
      .trim();

    if (value && value.length <= 30) {
      return value;
    }
  }

  return "";
};

const isRelevantSkillBridgeQuery = (prompt: string): boolean => {
  const lowered = prompt.toLowerCase();
  return DOMAIN_KEYWORDS.some((keyword) => lowered.includes(keyword));
};

const isPlatformInfoQuery = (prompt: string): boolean => {
  const lowered = prompt.toLowerCase();
  return PLATFORM_INFO_PHRASES.some((phrase) => lowered.includes(phrase));
};

const isTopTutorQuery = (prompt: string): boolean => {
  const lowered = prompt.toLowerCase();
  return TOP_TUTOR_PHRASES.some((phrase) => lowered.includes(phrase));
};

const getFilteredChatContext = async (prompt: string) => {
  const lowered = prompt.toLowerCase();
  const requestedDate = findIsoDate(prompt);
  const topic = extractTopic(prompt);
  const topTutorIntent = isTopTutorQuery(prompt);

  const wantsSlots =
    lowered.includes("slot") ||
    lowered.includes("available") ||
    lowered.includes("free") ||
    lowered.includes("session");
  const wantsTutors = lowered.includes("tutor") || lowered.includes("best");
  const wantsFree = lowered.includes("free");
  const shouldUseTopicForTutorSearch = Boolean(topic) && !topTutorIntent;

  const context: {
    request: {
      topic: string;
      requestedDate: string | null;
      wantsSlots: boolean;
      wantsTutors: boolean;
      wantsFree: boolean;
      topTutorIntent: boolean;
    };
    tutors?: unknown[];
    slots?: unknown[];
  } = {
    request: {
      topic,
      requestedDate: requestedDate || null,
      wantsSlots,
      wantsTutors,
      wantsFree,
      topTutorIntent,
    },
  };

  if (wantsTutors || (!wantsSlots && (topic || topTutorIntent))) {
    const tutorQuery: TutorSearchParams = {
      page: 1,
      skip: 0,
      limit: 10,
      sortBy: "avgRating",
      orderBy: "desc",
    };

    if (shouldUseTopicForTutorSearch) {
      tutorQuery.search = topic;
    }

    const tutors = await tutorService.getTutors(tutorQuery);
    let tutorData = tutors.data;

    // If strict topic search is too narrow, fall back to top tutors.
    if (!tutorData.length && shouldUseTopicForTutorSearch) {
      const fallbackTutors = await tutorService.getTutors({
        page: 1,
        skip: 0,
        limit: 10,
        sortBy: "avgRating",
        orderBy: "desc",
      });
      tutorData = fallbackTutors.data;
    }

    context.tutors = tutorData.map((tutor) => ({
      id: tutor.id,
      name: `${tutor.firstName} ${tutor.lastName}`.trim(),
      avgRating: tutor.avgRating,
      experienceYears: tutor.experienceYears,
      isFeatured: tutor.isFeatured,
      expertiseAreas: tutor.expertiseAreas.slice(0, 5),
      category: tutor.category?.name || null,
    }));
  }

  if (wantsSlots || requestedDate) {
    const where: {
      date?: { gte: Date; lt: Date };
      isFree?: boolean;
      isBooked?: boolean;
      OR?: Array<{
        subject: {
          OR: Array<{
            name?: { contains: string; mode: "insensitive" };
            slug?: { contains: string; mode: "insensitive" };
          }>;
        };
      }>;
    } = {};

    if (requestedDate) {
      const start = new Date(`${requestedDate}T00:00:00.000Z`);
      const end = new Date(`${requestedDate}T23:59:59.999Z`);
      where.date = { gte: start, lt: end };
    }

    where.isBooked = false;
    if (wantsFree) where.isFree = true;

    if (topic) {
      where.OR = [
        {
          subject: {
            OR: [
              { name: { contains: topic, mode: "insensitive" } },
              { slug: { contains: topic, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const slots = await prisma.slot.findMany({
      where,
      take: 10,
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        slotPrice: true,
        isFree: true,
        tutorProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avgRating: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    context.slots = slots.map((slot) => ({
      id: slot.id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotPrice: slot.slotPrice,
      isFree: slot.isFree,
      subject: slot.subject,
      tutor: {
        id: slot.tutorProfile.id,
        name: `${slot.tutorProfile.firstName} ${slot.tutorProfile.lastName}`.trim(),
        avgRating: slot.tutorProfile.avgRating,
      },
    }));
  }

  return context;
};

const parseAiJson = (raw: string): { rankings?: RankedResult[] } | null => {
  try {
    return JSON.parse(raw);
  } catch {
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }

    const candidate = raw.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }
};

const fallbackRanking = (
  tutors: Array<{
    id: string;
    avgRating: number;
    experienceYears: number;
    isFeatured: boolean;
  }>,
): RankedResult[] => {
  return tutors
    .map((tutor) => {
      const score =
        tutor.avgRating * 20 +
        Math.min(tutor.experienceYears, 15) * 3 +
        (tutor.isFeatured ? 5 : 0);

      return {
        tutorId: tutor.id,
        score: Number(score.toFixed(2)),
        reason: "Ranked by rating, experience, and featured status",
      };
    })
    .sort((a, b) => b.score - a.score);
};

const parseSuggestionArray = (raw: string): string[] => {
  const normalizedRaw = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    const parsed = JSON.parse(normalizedRaw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
    if (Array.isArray(parsed?.suggestions)) {
      return parsed.suggestions.filter((item: unknown): item is string => typeof item === "string");
    }
  } catch {
    const arrayMatch = normalizedRaw.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        const parsedArray = JSON.parse(arrayMatch[0]);
        if (Array.isArray(parsedArray)) {
          return parsedArray.filter((item): item is string => typeof item === "string");
        }
      } catch {
        // Fall through to plain text parsing.
      }
    }
  }

  return normalizedRaw
    .split("\n")
    .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
    .map((line) => line.replace(/^"|"[,]?$/g, "").trim())
    .filter((line) => line.length > 0)
    .slice(0, 8);
};

const normalizeSuggestion = (text: string): string => {
  return text
    .replace(/```/g, "")
    .replace(/^"|"$/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const isValidSuggestion = (text: string): boolean => {
  const words = text.split(/\s+/).filter(Boolean);
  return words.length >= 6 && words.length <= 30 && text.length >= 30;
};

const getFallbackSuggestionsByRating = (rating: number): string[] => {
  if (rating >= 4) {
    return [
      "The tutor explained concepts clearly and made each session engaging and easy to follow.",
      "I improved quickly because the tutor was patient, organized, and focused on my weak areas.",
      "Great teaching style and helpful guidance throughout the lessons. I highly recommend this tutor.",
      "The tutor provided clear examples and practical tips that made difficult topics much easier to understand.",
      "I appreciated the tutor's consistent support and structured lessons, which helped me gain confidence.",
    ];
  }

  if (rating >= 3) {
    return [
      "The sessions were helpful overall, and I appreciated the tutor's clear explanations.",
      "The tutor was supportive and helped me understand key topics better over time.",
      "Good experience overall, with useful lessons and practical examples.",
      "The tutor communicated well and covered important concepts at a comfortable pace.",
      "I found the sessions useful and would like to continue improving with similar guidance.",
    ];
  }

  return [
    "The tutor was respectful, but I hope future sessions can be more structured and focused.",
    "Some explanations were helpful, though I would prefer a slower pace in upcoming lessons.",
    "I appreciate the effort and would like more practical examples in future sessions.",
    "The session was okay, and clearer step-by-step guidance would improve the learning experience.",
    "I value the tutor's time and suggest more interactive explanations in future lessons.",
  ];
};

const getReviewTone = (rating: number): string => {
  if (rating >= 4.5) return "very positive";
  if (rating >= 3.5) return "positive";
  if (rating >= 2.5) return "balanced";
  return "constructive and polite";
};

const generateTutorBio = async (req: Request, res: Response) => {
  const payload = req.body as TutorBioWriterRequest;

  const sanitized = {
    firstName: payload.firstName || undefined,
    lastName: payload.lastName || undefined,
    completedSessions:
      payload.completedSessions && payload.completedSessions > 0
        ? payload.completedSessions
        : undefined,
    experienceYears:
      payload.experienceYears && payload.experienceYears > 0
        ? payload.experienceYears
        : undefined,
    expertiseAreas:
      payload.expertiseAreas && payload.expertiseAreas.length > 0
        ? payload.expertiseAreas
        : undefined,
    categories:
      payload.categories && payload.categories.length > 0
        ? payload.categories
        : undefined,
    avgRating:
      payload.avgRating && payload.avgRating > 0 ? payload.avgRating : undefined,
    totalReviews:
      payload.totalReviews && payload.totalReviews > 0
        ? payload.totalReviews
        : undefined,
  };

  const compactSanitized = Object.fromEntries(
    Object.entries(sanitized).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(compactSanitized).length === 0) {
    return res.status(400).json({
      success: false,
      data: null,
      message: "No meaningful tutor data found to generate bio",
    });
  }

  try {
    const prompt = `
Write a short professional tutor bio for a tutoring platform profile.

Rules:
- 45 to 85 words.
- Natural and trustworthy tone.
- Do not invent facts.
- Use only provided fields.
- If a field is missing, do not mention it.
- Output only the bio text.
`;

    const response = await generateSkillBridgeResponse({
      prompt,
      context: JSON.stringify(compactSanitized),
      maxOutputTokens: 220,
    });

    return res.status(200).json({
      success: true,
      message: "Tutor bio generated successfully",
      data: {
        bio: response.trim(),
        usedData: compactSanitized,
      },
    });
  } catch (error) {
    console.error("Error generating tutor bio:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to generate tutor bio",
    });
  }
};

const generateReviewSuggestions = async (req: Request, res: Response) => {
  const { rating, count = 3 } = req.body as ReviewSuggestionRequest;

  const prompt = `
Generate ${count} short review suggestions for a student to submit for a tutor.

Rules:
- Tone should be ${getReviewTone(rating)} for rating ${rating}/5.
- Each suggestion 10-22 words.
- Generic, realistic, and polite.
- No fake personal details.
- Return strict JSON array of strings only.
`;

  try {
    const raw = await generateSkillBridgeResponse({
      prompt,
      maxOutputTokens: 260,
    });

    let suggestions = parseSuggestionArray(raw)
      .map(normalizeSuggestion)
      .filter(isValidSuggestion)
      .slice(0, count);

    const fallbackPool = getFallbackSuggestionsByRating(rating);

    if (suggestions.length < count) {
      const needed = count - suggestions.length;
      const additions = fallbackPool
        .filter((item) => !suggestions.includes(item))
        .slice(0, needed);
      suggestions = [...suggestions, ...additions];
    }

    return res.status(200).json({
      success: true,
      message: "Review suggestions generated successfully",
      data: {
        rating,
        suggestions,
      },
    });
  } catch (error) {
    console.error("Error generating review suggestions:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to generate review suggestions",
    });
  }
};

const generateChatResponse = async (req: Request, res: Response) => {
  const { prompt } = req.body as SkillBridgeAiRequest;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "A valid prompt is required" });
  }

  if (!isRelevantSkillBridgeQuery(prompt)) {
    return res.status(400).json({
      success: false,
      data: null,
      message:
        "I can only help with SkillBridge topics like tutors, slots, bookings, subjects, and reviews.",
    });
  }

  try {
    if (isPlatformInfoQuery(prompt)) {
      const platformPrompt = `
User asked: ${prompt}

Explain SkillBridge in a concise and friendly way. Include:
- What the platform does
- How students use it
- How tutors use it
- Main booking and review flow
`;

      const platformContext = JSON.stringify({
        platform: "SkillBridge",
        roles: ["Student", "Tutor", "Admin"],
        capabilities: [
          "Students browse tutors by subject/category/rating",
          "Students view available slots and book sessions",
          "Tutors create profiles and manage slots",
          "Students can rate/review tutors",
          "Admins manage users/bookings and platform analytics",
        ],
      });

      const introResponse = await generateSkillBridgeResponse({
        prompt: platformPrompt,
        context: platformContext,
        maxOutputTokens: 500,
      });

      return res.status(200).json({
        success: true,
        data: {
          response: introResponse,
        },
        message: "AI response generated successfully",
      });
    }

    const filteredContext = await getFilteredChatContext(prompt);

    const aiPrompt = `
Answer the user's query using ONLY the provided SkillBridge context.

Rules:
- If relevant data is available, answer directly and clearly.
- If no matching data is found, say that no matching tutors/slots were found right now.
- Do not invent tutors, slots, prices, or availability.
- Keep response concise and user-friendly.

User query:
${prompt}
`;

    const aiPayload: SkillBridgeAiRequest = {
      prompt: aiPrompt,
      context: JSON.stringify(filteredContext),
      maxOutputTokens: 500,
    };

    const response = await generateSkillBridgeResponse(aiPayload);

    res.status(200).json({
      success: true,
      data: {
        response,
      },
      message: "AI response generated successfully",
    });
  } catch (error) {
    console.error("Error generating AI response:", error);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
};

const getAvailableModels = async (_req: Request, res: Response) => {
  try {
    const models = await listModels();

    res.status(200).json({
      success: true,
      data: {
        models,
      },
      message: "Gemini models fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching Gemini models:", error);
    res.status(500).json({ error: "Failed to fetch Gemini models" });
  }
};

const getTutorRecommendations = async (req: Request, res: Response) => {
  const payload = req.body as TutorRecommendationRequest;

  const maxResults = Math.min(Math.max(payload.maxResults || 5, 1), 10);
  const candidatePoolSize = 20;
  const minRating = payload.minRating;
  const maxRating = payload.maxRating;
  const minExperience = payload.minExperience;
  const maxExperience = payload.maxExperience;
  const budgetMin = payload.budgetMin;
  const budgetMax = payload.budgetMax;

  try {
    const tutorQuery: TutorSearchParams = {
      limit: candidatePoolSize,
      page: 1,
      skip: 0,
      sortBy: "avgRating",
      orderBy: "desc",
    };

    if (payload.search) tutorQuery.search = payload.search;
    if (payload.categoryId) tutorQuery.categoryId = payload.categoryId;
    if (minRating !== undefined) tutorQuery.minRating = minRating;
    if (maxRating !== undefined) tutorQuery.maxRating = maxRating;
    if (minExperience !== undefined) tutorQuery.minExperience = minExperience;
    if (maxExperience !== undefined) tutorQuery.maxExperience = maxExperience;
    if (payload.isFeatured !== undefined) tutorQuery.isFeatured = payload.isFeatured;

    const tutorsResult = await tutorService.getTutors(tutorQuery);

    if (!tutorsResult.data.length) {
      return res.status(200).json({
        success: true,
        message: "No tutors found for the current filters",
        data: {
          recommendations: [],
          totalCandidates: 0,
          rankedBy: "none",
        },
      });
    }

    const compactCandidates = tutorsResult.data.map((tutor) => ({
      id: tutor.id,
      name: `${tutor.firstName} ${tutor.lastName}`.trim(),
      avgRating: tutor.avgRating,
      experienceYears: tutor.experienceYears,
      isFeatured: tutor.isFeatured,
      expertiseAreas: tutor.expertiseAreas.slice(0, 6),
      category: tutor.category?.name || null,
      bioSnippet: tutor.bio ? tutor.bio.slice(0, 220) : "",
    }));

    const recommendationPrompt = `
Rank tutors for the student based on the preferences and candidates.

Return strict JSON only in this shape:
{
  "rankings": [
    { "tutorId": "<id>", "score": 0-100, "reason": "short reason" }
  ]
}

Rules:
- Rank only tutor IDs from candidates.
- Return at most ${maxResults} items.
- Prefer higher rating and relevant expertise.
- Keep reason under 140 characters.
`;

    const recommendationContext = JSON.stringify(
      {
        preferences: {
          search: payload.search || null,
          categoryId: payload.categoryId || null,
          minRating: minRating ?? null,
          minExperience: minExperience ?? null,
          budgetMin: budgetMin ?? null,
          budgetMax: budgetMax ?? null,
          preferredTopics: payload.preferredTopics || [],
          learningGoal: payload.learningGoal || null,
          maxResults,
        },
        candidates: compactCandidates,
      },
      null,
      0,
    );

    const aiRawResponse = await generateSkillBridgeResponse({
      prompt: recommendationPrompt,
      context: recommendationContext,
      maxOutputTokens: 700,
    });

    const parsed = parseAiJson(aiRawResponse);
    const aiRankings = Array.isArray(parsed?.rankings) ? parsed?.rankings : [];

    const validAiRankings = aiRankings
      .filter((item): item is RankedResult => {
        return (
          !!item &&
          typeof item.tutorId === "string" &&
          typeof item.score === "number" &&
          typeof item.reason === "string"
        );
      })
      .filter((item) =>
        compactCandidates.some((candidate) => candidate.id === item.tutorId),
      )
      .slice(0, maxResults);

    const fallback = fallbackRanking(compactCandidates).slice(0, maxResults);
    const finalRankings = validAiRankings.length > 0 ? validAiRankings : fallback;

    const tutorMap = new Map(compactCandidates.map((tutor) => [tutor.id, tutor]));
    const recommendations = finalRankings
      .map((rank) => {
        const tutor = tutorMap.get(rank.tutorId);
        if (!tutor) return null;

        return {
          tutor,
          score: rank.score,
          reason: rank.reason,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    res.status(200).json({
      success: true,
      message: "Tutor recommendations generated successfully",
      data: {
        recommendations,
        totalCandidates: compactCandidates.length,
        rankedBy: validAiRankings.length > 0 ? "gemini" : "fallback",
      },
    });
  } catch (error) {
    console.error("Error generating tutor recommendations:", error);
    res.status(500).json({ error: "Failed to generate tutor recommendations" });
  }
};

export const AiController = {
  generateChatResponse,
  getAvailableModels,
  getTutorRecommendations,
  generateTutorBio,
  generateReviewSuggestions,
};
