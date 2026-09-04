import http from "node:http";
import { app } from "./app.js";
import { config } from "./config.js";
import { pool } from "./db/pool.js";
import { verifyDatabaseConnection, safeDatabaseError } from "./db/verify.js";
import { attachSocket } from "./realtime/socket.js";

const httpServer = http.createServer(app);
attachSocket(httpServer);

let server;

function shutdown() {
  if (!server) {
    pool.end().finally(() => process.exit(0));
    return;
  }

  server.close(() => {
    pool.end().finally(() => process.exit(0));
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

async function start() {
  try {
    const { host } = await verifyDatabaseConnection(config.databaseUrl);
    server = httpServer.listen(config.port, () => {
      console.log(`API listening on http://localhost:${config.port}`);
      console.log(`PostgreSQL schema OK (${host})`);
    });
  } catch (err) {
    console.error(safeDatabaseError(err));
    await pool.end().catch(() => {});
    process.exit(1);
  }
}

start();
