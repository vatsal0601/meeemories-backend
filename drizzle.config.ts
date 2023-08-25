import type { Config } from "drizzle-kit";

import "dotenv/config";

if (!process.env.DRIZZLE_DATABASE_URL) {
  throw new Error("DRIZZLE_DATABASE_URL is not defined");
}

export default {
  schema: "./db/schema.ts",
  out: "./db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DRIZZLE_DATABASE_URL,
  },
  breakpoints: true,
} satisfies Config;
