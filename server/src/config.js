import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { z } from "zod";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(serverDir, "../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  CLIENT_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_SSL: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((value) => {
      if (value === undefined || value === null) return true;
      return String(value) !== "false";
    }),
  SESSION_COOKIE_NAME: z.string().default("sid"),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(14),
  COOKIE_SECURE: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((value) => {
      if (value === undefined || value === null) return undefined;
      return String(value) === "true";
    }),
  COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).default("lax"),
  TRUST_PROXY: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((value) => String(value) === "true"),
  DATABASE_SSL_REJECT_UNAUTHORIZED: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((value) => {
      if (value === undefined || value === null) return false;
      return String(value) === "true";
    }),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  console.error("Invalid server environment configuration:", details);
  throw new Error(`Invalid server environment: ${details}`);
}

const env = parsed.data;

export const config = {
  nodeEnv: env.NODE_ENV,
  isProduction: env.NODE_ENV === "production",
  port: env.PORT,
  clientOrigins: (env.CLIENT_ORIGIN || "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  databaseUrl: env.DATABASE_URL,
  databaseSsl: env.DATABASE_SSL,
  sessionCookieName: env.SESSION_COOKIE_NAME,
  sessionTtlMs: env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  cookieSecure:
    env.COOKIE_SECURE === undefined
      ? env.NODE_ENV === "production"
      : env.COOKIE_SECURE,
  cookieSameSite: env.COOKIE_SAMESITE,
  trustProxy: env.TRUST_PROXY === true,
  databaseSslRejectUnauthorized: env.DATABASE_SSL_REJECT_UNAUTHORIZED === true,
};
