import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { config } from "./config.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requireTrustedOrigin } from "./middleware/requireTrustedOrigin.js";
import { apiRateLimiter } from "./middleware/rateLimit.js";
import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import conversationsRoutes from "./modules/conversations/conversations.routes.js";

export const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    strictTransportSecurity: config.isProduction,
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        origin.endsWith(".vercel.app") ||
        config.clientOrigins.includes(origin) ||
        config.clientOrigins.includes("*") ||
        !config.isProduction
      ) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());
app.use(requireTrustedOrigin);
app.use("/api", apiRateLimiter);

app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/conversations", conversationsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
