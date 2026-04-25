import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, hasDatabase } from "@/lib/db/client";
import { getBackendStatus } from "@/lib/env";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const status = getBackendStatus(request);
  const database = await checkDatabase();

  return NextResponse.json({
    ok: database.ok || !hasDatabase(),
    env: status,
    checks: {
      database
    }
  });
}

async function checkDatabase() {
  if (!hasDatabase()) {
    return {
      ok: false,
      status: "not_configured"
    };
  }

  try {
    await getDb().execute(sql`select 1`);

    return {
      ok: true,
      status: "connected"
    };
  } catch (error) {
    return {
      ok: false,
      status: "error",
      message: error instanceof Error ? error.message : "Database check failed."
    };
  }
}
