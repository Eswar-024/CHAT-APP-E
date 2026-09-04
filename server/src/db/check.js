import { config } from "../config.js";
import { pool } from "./pool.js";
import { verifyDatabaseConnection } from "./verify.js";

function connectionEndpoint() {
  try {
    const parsed = new URL(config.databaseUrl);
    return {
      hostname: parsed.hostname || "unknown",
      port: parsed.port || "5432",
    };
  } catch {
    return { hostname: "unparsed", port: "unknown" };
  }
}

function redact(value) {
  if (value == null) return "";
  let text = String(value);
  const secrets = [config.databaseUrl];

  try {
    const parsed = new URL(config.databaseUrl);
    if (parsed.password) secrets.push(decodeURIComponent(parsed.password));
    if (parsed.username) secrets.push(decodeURIComponent(parsed.username));
  } catch {
    /* ignore malformed URI */
  }

  for (const secret of secrets) {
    if (secret) {
      text = text.split(secret).join("[redacted]");
    }
  }

  return text
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[redacted-url]")
    .replace(/:[^:@/\s]{4,}@/g, ":[redacted]@");
}

function errorChain(err) {
  const seen = [];
  let current = err;
  while (current && seen.length < 6) {
    seen.push(current);
    current = current.cause;
  }
  if (Array.isArray(err?.errors)) {
    seen.push(...err.errors);
  }
  return seen;
}

function classify(err) {
  const code = String(err?.code || "");
  const message = `${err?.message || ""} ${err?.opensslErrorStack || ""}`.toLowerCase();

  if (code === "ENOTFOUND" || code === "EAI_AGAIN") return "dns";
  if (
    code === "ECONNREFUSED" ||
    code === "ETIMEDOUT" ||
    code === "ECONNRESET" ||
    code === "ENETUNREACH" ||
    code === "EHOSTUNREACH" ||
    code === "UND_ERR_CONNECT_TIMEOUT"
  ) {
    return "network";
  }
  if (
    code === "28P01" ||
    code === "28000" ||
    message.includes("password authentication failed") ||
    message.includes("authentication failed")
  ) {
    return "authentication";
  }
  if (
    message.includes("ssl") ||
    message.includes("tls") ||
    message.includes("certificate") ||
    code.startsWith("ERR_TLS") ||
    code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
    code === "CERT_HAS_EXPIRED" ||
    code === "DEPTH_ZERO_SELF_SIGNED_CERT" ||
    code === "SELF_SIGNED_CERT_IN_CHAIN"
  ) {
    return "ssl";
  }
  if (err?.message?.startsWith("Database is missing tables:")) return "schema";
  return "other";
}

function formatCheckDbDiagnostic(err) {
  if (config.isProduction) {
    return "PostgreSQL connection or schema check failed.";
  }

  const { hostname, port } = connectionEndpoint();
  const chain = errorChain(err);
  const primary = chain.find((item) => item?.code || item?.message) || err;
  const category = classify(primary);

  return [
    "PostgreSQL check failed (development diagnostic; secrets redacted).",
    `category: ${category}`,
    `name: ${primary?.name || "Error"}`,
    `code: ${primary?.code || "none"}`,
    `message: ${redact(primary?.message || "none")}`,
    `hostname: ${hostname}`,
    `port: ${port}`,
    `ssl: ${config.databaseSsl ? "enabled" : "disabled"}`,
    `sslRejectUnauthorized: ${config.databaseSslRejectUnauthorized}`,
  ].join("\n");
}

verifyDatabaseConnection(config.databaseUrl)
  .then(({ host }) => {
    console.log(`PostgreSQL schema OK (${host})`);
  })
  .catch((err) => {
    console.error(formatCheckDbDiagnostic(err));
    process.exitCode = 1;
  })
  .finally(() => pool.end());
