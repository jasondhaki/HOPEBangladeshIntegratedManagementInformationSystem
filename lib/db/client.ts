import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

declare global {
  var __dbClient: postgres.Sql | undefined;
}

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return postgres(url);
}

// Reuse the connection across Next.js dev-mode hot reloads instead of opening a new one per reload.
const client = globalThis.__dbClient ?? createClient();
if (process.env.NODE_ENV !== "production") {
  globalThis.__dbClient = client;
}

export const db = drizzle(client, { schema });
