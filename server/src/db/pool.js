import pg from "pg";
import { config } from "../config.js";

const { Pool } = pg;

const dbUrl = config.databaseUrl || process.env.DATABASE_URL || "";

if (!dbUrl) {
  console.error("CRITICAL ERROR: DATABASE_URL environment variable is not configured!");
}

export const pool = new Pool({
  connectionString: dbUrl || "postgresql://postgres:postgres@localhost:5432/postgres",
  ssl: config.databaseSsl
    ? { rejectUnauthorized: false }
    : false,
  max: 2,
  connectionTimeoutMillis: 10_000,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
});

export async function query(text, params) {
  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL is missing. Please add DATABASE_URL under Vercel Settings -> Environment Variables and redeploy."
    );
  }
  return pool.query(text, params);
}
