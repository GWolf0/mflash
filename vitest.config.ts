/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import dotenv from "dotenv";
import path from "path";

// load env files manually
dotenv.config({ path: path.resolve(__dirname, ".env.local") });
dotenv.config(); // fallback to .env

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    alias: {
      "@": path.resolve(__dirname), // safer than "/"
    },
  },
});
