import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: "Not found" });
}

export function errorHandler(err, _req, res, _next) {
  console.error("API Server Error:", err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Invalid input",
      details: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  return res.status(500).json({
    error: err.message || "Internal server error",
    status: 500,
  });
}
