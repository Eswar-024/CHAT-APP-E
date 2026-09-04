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
    if (config.isProduction) {
      next(new AppError(403, "Forbidden"));
      return;
    }
    next();
    return;
  }

  if (!config.clientOrigins.includes(origin)) {
    next(new AppError(403, "Forbidden"));
    return;
  }

  next();
}
