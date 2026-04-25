import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, hasDatabase } from "@/lib/db/client";
import {
  approvalLinks,
  auditEvents,
  customerAcknowledgements,
  jobExceptions,
  jobPhotos,
  jobs,
  scopeItems,
  serviceRecords
} from "@/lib/db/schema";
import { demoBusiness, exceptions, excludedScope, includedScope, photos } from "@/lib/demo-data";
import {
  createServiceRecordLink,
  ensureServiceRecord,
  findActiveApprovalLinkByToken,
  isApprovalActionAllowed
} from "@/lib/server/approval-links";
import { getRequesterInfo } from "@/lib/server/request";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { token: string } }
) {
  if (!hasDatabase() || params.token.includes("demo")) {
    return NextResponse.json(demoAckPayload(params.token));
  }

  const db = getDb();
  const link = await findActiveApprovalLinkByToken(params.token);

  if (!link) {
    return NextResponse.json({ ok: false, code: "token_not_found" }, { status: 404 });
  }

  const [job] = await db.select().from(jobs).where(eq(jobs.id, link.jobId)).limit(1);

  if (!job) {
    return NextResponse.json({ ok: false, code: "job_not_found" }, { status: 404 });
  }

  if (!link.viewedAt) {
    await db
      .update(approvalLinks)
      .set({ viewedAt: new Date(), updatedAt: new Date() })
      .where(eq(approvalLinks.id, link.id));
  }

  const [scope, jobPhotoRows, exceptionRows] = await Promise.all([
    db.select().from(scopeItems).where(eq(scopeItems.jobId, job.id)),
    db.select().from(jobPhotos).where(eq(jobPhotos.jobId, job.id)),
    db.select().from(jobExceptions).where(eq(jobExceptions.jobId, job.id))
  ]);

  return NextResponse.json({
    ok: true,
    readOnly: link.status !== "active",
    token: {
      purpose: link.purpose,
      status: link.status,
      expiresAt: link.expiresAt
    },
    job,
    scope,
    photos: jobPhotoRows,
    exceptions: exceptionRows
  });
}

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  const body = await request.json().catch(() => ({}));
  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const customerNote = typeof body.customerNote === "string" ? body.customerNote.trim() : undefined;
  const checkboxAccepted = body.checkboxAccepted !== false;

  if (!customerName) {
    return NextResponse.json(
      { ok: false, code: "customer_name_required", message: "Customer name is required." },
      { status: 400 }
    );
  }

  if (!checkboxAccepted) {
    return NextResponse.json(
      { ok: false, code: "checkbox_required", message: "The acknowledgement checkbox is required." },
      { status: 400 }
    );
  }

  if (!hasDatabase() || params.token.includes("demo")) {
    return NextResponse.json({
      ok: true,
      source: "demo",
      redirectUrl: params.token.includes("completion") ? "/record/demo" : "/jobs/honda-accord/capture"
    });
  }

  const db = getDb();
  const link = await findActiveApprovalLinkByToken(params.token);

  if (!link) {
    return NextResponse.json({ ok: false, code: "token_not_found" }, { status: 404 });
  }

  if (link.purpose === "service_record") {
    return NextResponse.json(
      { ok: false, code: "not_actionable", message: "Service Record links are read-only." },
      { status: 400 }
    );
  }

  if (!isApprovalActionAllowed(link)) {
    if (link.status === "active" && link.expiresAt.getTime() <= Date.now()) {
      await db
        .update(approvalLinks)
        .set({ status: "expired", updatedAt: new Date() })
        .where(eq(approvalLinks.id, link.id));
    }

    return NextResponse.json(
      { ok: false, code: "token_not_active", status: link.status },
      { status: 410 }
    );
  }

  const [job] = await db.select().from(jobs).where(eq(jobs.id, link.jobId)).limit(1);

  if (!job) {
    return NextResponse.json({ ok: false, code: "job_not_found" }, { status: 404 });
  }

  const requester = getRequesterInfo(request);
  const acknowledgedAt = new Date();

  await db.insert(customerAcknowledgements).values({
    jobId: job.id,
    approvalLinkId: link.id,
    kind: link.purpose,
    customerName,
    customerNote,
    checkboxAccepted,
    ipAddress: requester.ipAddress,
    userAgent: requester.userAgent,
    acknowledgedAt
  });

  await db
    .update(approvalLinks)
    .set({
      status: "used",
      usedAt: acknowledgedAt,
      updatedAt: acknowledgedAt
    })
    .where(eq(approvalLinks.id, link.id));

  if (link.purpose === "scope") {
    await db
      .update(jobs)
      .set({ state: "scope_acknowledged", updatedAt: acknowledgedAt })
      .where(eq(jobs.id, job.id));
  } else {
    const record = await ensureServiceRecord(job.id);

    await db
      .update(jobs)
      .set({ state: "completed", completedAt: acknowledgedAt, updatedAt: acknowledgedAt })
      .where(eq(jobs.id, job.id));

    await db
      .update(serviceRecords)
      .set({
        status: "acknowledged",
        customerAcknowledgedAt: acknowledgedAt,
        updatedAt: acknowledgedAt
      })
      .where(eq(serviceRecords.id, record.id));
  }

  await db.insert(auditEvents).values({
    organizationId: job.organizationId,
    jobId: job.id,
    eventType: link.purpose === "scope" ? "scope.acknowledged" : "completion.acknowledged",
    publicSummary:
      link.purpose === "scope" ? "Scope acknowledged." : "Completion acknowledged.",
    metadata: {
      approvalLinkId: link.id,
      customerName,
      customerNote
    },
    ipAddress: requester.ipAddress,
    userAgent: requester.userAgent
  });

  return NextResponse.json({
    ok: true,
    redirectUrl:
      link.purpose === "scope"
        ? `/jobs/${job.id}/capture`
        : (await createServiceRecordLink(job.id, request)).url
  });
}

function demoAckPayload(token: string) {
  const isCompletion = token.includes("completion");

  return {
    ok: true,
    source: "demo",
    readOnly: false,
    token: {
      purpose: isCompletion ? "completion" : "scope",
      status: "active"
    },
    business: demoBusiness,
    job: {
      id: "honda-accord",
      customerName: "Maya Chen",
      serviceLabel: "Exterior Detail",
      subjectLabel: "Honda Accord - Black"
    },
    scope: [
      ...includedScope.map((item) => ({ kind: "included", label: item.label })),
      ...excludedScope.map((item) => ({ kind: "excluded", label: item.label }))
    ],
    photos,
    exceptions
  };
}
