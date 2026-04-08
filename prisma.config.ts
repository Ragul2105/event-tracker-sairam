// Prisma 7 Configuration for Event Tracker
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use DIRECT_URL for migrations/push to avoid pgbouncer timeout
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"]!,
  },
});
