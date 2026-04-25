import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, hasDatabase } from "@/lib/db/client";
import { jobExceptions, jobPhotos, jobs, scopeItems } from "@/lib/db/schema";
import { demoBusiness, exceptions, includedScope, photos } from "@/lib/demo-data";
import { findServiceRecordByToken } from "@/lib/server/approval-links";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { token: string } }
) {
  if (!hasDatabase() || params.token === "demo") {
    return NextResponse.json({
      ok: true,
      source: "demo",
      business: demoBusiness,
      record: {
        status: "acknowledged",
        customerAcknowledgedAt: "2025-05-24T14:18:00.000Z"
      },
      job: {
        customerName: "Maya Chen",
        serviceLabel: "Exterior Detail",
        subjectLabel: "Honda Accord - Black"
      },
      scope: includedScope,
      photos,
      exceptions
    });
  }

  const db = getDb();
  const record = await findServiceRecordByToken(params.token);

  if (!record) {
    return NextResponse.json({ ok: false, code: "record_not_found" }, { status: 404 });
  }

  const [job] = await db.select().from(jobs).where(eq(jobs.id, record.jobId)).limit(1);

  if (!job) {
    return NextResponse.json({ ok: false, code: "job_not_found" }, { status: 404 });
  }

  const [scope, jobPhotoRows, exceptionRows] = await Promise.all([
    db.select().from(scopeItems).where(eq(scopeItems.jobId, job.id)),
    db.select().from(jobPhotos).where(eq(jobPhotos.jobId, job.id)),
    db.select().from(jobExceptions).where(eq(jobExceptions.jobId, job.id))
  ]);

  return NextResponse.json({
    ok: true,
    record,
    job,
    scope,
    photos: jobPhotoRows,
    exceptions: exceptionRows
  });
}
