import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { isDatabaseConfigured } from "@/lib/env";
import * as schema from "./schema";

type ScopeNodDatabase = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  scopenodSql?: ReturnType<typeof postgres>;
  scopenodDb?: ScopeNodDatabase;
};

export function hasDatabase() {
  return isDatabaseConfigured();
}

export function getDb(): ScopeNodDatabase {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!globalForDb.scopenodSql) {
    globalForDb.scopenodSql = postgres(databaseUrl, {
      max: 1,
      prepare: false
    });
  }

  if (!globalForDb.scopenodDb) {
    globalForDb.scopenodDb = drizzle(globalForDb.scopenodSql, { schema });
  }

  return globalForDb.scopenodDb;
}
