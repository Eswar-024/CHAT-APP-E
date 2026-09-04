import pg from "pg";
import { config } from "../config.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseSsl
    ? { rejectUnauthorized: config.databaseSslRejectUnauthorized }
    : false,
  max: 10,
  connectionTimeoutMillis: 10_000,
});

pool.on("error", () => {
  console.error("Unexpected PostgreSQL pool error");
});

export async function query(text, params) {
  return pool.query(text, params);
}
