import { NextFunction, Request, Response } from "express";

type RateLimitEntry = {
  count: number;
  windowStart: number;
};

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

const chatRateLimitStore = new Map<string, RateLimitEntry>();

const getClientKey = (req: Request): string => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const userId = req.user?.id || "anonymous";
  return `${ip}:${userId}`;
};

export const aiChatRateLimit = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const now = Date.now();
  const key = getClientKey(req);
  const current = chatRateLimitStore.get(key);

  if (!current || now - current.windowStart >= WINDOW_MS) {
    chatRateLimitStore.set(key, { count: 1, windowStart: now });
    return next();
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil(
      (WINDOW_MS - (now - current.windowStart)) / 1000,
    );
    return res.status(429).json({
      success: false,
      data: null,
      message: "Too many AI chat requests. Please try again shortly.",
      retryAfterSeconds,
    });
  }

  current.count += 1;
  chatRateLimitStore.set(key, current);
  return next();
};
