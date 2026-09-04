import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === "production" ? 20 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Try again later." },
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: process.env.NODE_ENV === "production" ? 120 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Try again later." },
});

export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: process.env.NODE_ENV === "production" ? 30 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many searches. Try again later." },
});

export const messageRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "You are sending messages too quickly." },
});
