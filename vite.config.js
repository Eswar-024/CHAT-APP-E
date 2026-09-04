import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import process from "node:process";

const realRoot = fs.realpathSync(process.cwd());

// https://vitejs.dev/config/
export default defineConfig({
  root: realRoot,
  plugins: [react()],
  server: {
    port: 3000,
    host: "0.0.0.0",
    open: false,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:3001",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
