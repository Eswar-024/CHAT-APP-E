import { AppError } from "../utils/AppError.js";
import { config } from "../config.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function requireTrustedOrigin(req, _res, next) {
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    next();
    return;
  }

  const origin = req.headers.origin;
  if (!origin) {
    next();
    return;
  }

  if (
    !config.isProduction ||
    origin.endsWith(".vercel.app") ||
    config.clientOrigins.includes(origin) ||
    config.clientOrigins.includes("*")
  ) {
    next();
    return;
  }

  next(new AppError(403, "Forbidden"));
}
