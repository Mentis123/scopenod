import { NextResponse } from "next/server";
import { hasDatabase } from "@/lib/db/client";
import { demoJobs } from "@/lib/demo-data";
import { createJob, createJobInputSchema, listJobsForToday } from "@/lib/server/jobs";

export const runtime = "nodejs";

export async function GET() {
  const jobs = await listJobsForToday();

  return NextResponse.json({
    source: hasDatabase() ? "database_or_demo_fallback" : "demo",
    jobs
  });
}

export async function POST(request: Request) {
  if (!hasDatabase()) {
    return NextResponse.json(
      {
        ok: false,
        code: "database_not_configured",
        message: "Set DATABASE_URL and run npm run db:push before creating real jobs.",
        demoJob: demoJobs[0]
      },
      { status: 501 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const input = createJobInputSchema.parse(body);
  const job = await createJob(input);

  return NextResponse.json({ ok: true, job }, { status: 201 });
}
