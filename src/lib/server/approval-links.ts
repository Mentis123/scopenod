import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import {
  approvalLinks,
  auditEvents,
  jobs,
  serviceRecords,
  type ApprovalLink,
  type ServiceRecord
} from "@/lib/db/schema";
import { getAppUrl } from "@/lib/env";
import { createPublicToken, daysFromNow, hashToken, hoursFromNow, tokenPreview } from "./tokens";

export const approvalPurposeSchema = z.enum(["scope", "completion", "service_record"]);
export type ApprovalPurpose = z.infer<typeof approvalPurposeSchema>;

export async function createApprovalLink(jobId: string, purpose: ApprovalPurpose, request?: Request) {
  const db = getDb();
  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

  if (!job) {
    throw new Error("Job not found.");
  }

  if (purpose === "service_record") {
    return createServiceRecordLink(jobId, request);
  }

  const token = createPublicToken("ack");
  const [approvalLink] = await db
    .insert(approvalLinks)
    .values({
      jobId,
      purpose,
      tokenHash: hashToken(token),
      tokenPreview: tokenPreview(token),
      expiresAt: hoursFromNow(24)
    })
    .returning();

  await db
    .update(jobs)
    .set({
      state: purpose === "scope" ? "scope_sent" : "completion_sent",
      updatedAt: new Date()
    })
    .where(eq(jobs.id, jobId));

  await db.insert(auditEvents).values({
    organizationId: job.organizationId,
    jobId,
    eventType: purpose === "scope" ? "scope.link_created" : "completion.link_created",
    publicSummary:
      purpose === "scope" ? "Scope review link created." : "Completion review link created.",
    metadata: {
      approvalLinkId: approvalLink.id,
      tokenPreview: approvalLink.tokenPreview
    }
  });

  return {
    token,
    approvalLink,
    url: `${getAppUrl(request)}/ack/${token}`
  };
}

export async function createServiceRecordLink(jobId: string, request?: Request) {
  const db = getDb();
  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

  if (!job) {
    throw new Error("Job not found.");
  }

  const record = await ensureServiceRecord(jobId);
  const token = createPublicToken("rec");
  const tokenHash = hashToken(token);
  const publicTokenPreview = tokenPreview(token);

  const [updatedRecord] = await db
    .update(serviceRecords)
    .set({
      publicTokenHash: tokenHash,
      publicTokenPreview,
      expiresAt: daysFromNow(365),
      updatedAt: new Date()
    })
    .where(eq(serviceRecords.id, record.id))
    .returning();

  await db.insert(auditEvents).values({
    organizationId: job.organizationId,
    jobId,
    eventType: "service_record.token_created",
    publicSummary: "Service Record link created.",
    metadata: {
      serviceRecordId: updatedRecord.id,
      tokenPreview: publicTokenPreview
    }
  });

  return {
    token,
    serviceRecord: updatedRecord,
    url: `${getAppUrl(request)}/record/${token}`
  };
}

export async function ensureServiceRecord(jobId: string): Promise<ServiceRecord> {
  const db = getDb();
  const existing = (
    await db.select().from(serviceRecords).where(eq(serviceRecords.jobId, jobId)).limit(1)
  )[0];

  if (existing) {
    return existing;
  }

  const [record] = await db
    .insert(serviceRecords)
    .values({
      jobId,
      expiresAt: daysFromNow(365)
    })
    .returning();

  return record;
}

export async function findActiveApprovalLinkByToken(token: string) {
  const db = getDb();
  const [link] = await db
    .select()
    .from(approvalLinks)
    .where(eq(approvalLinks.tokenHash, hashToken(token)))
    .limit(1);

  return link;
}

export function isApprovalActionAllowed(link: ApprovalLink) {
  return link.status === "active" && link.expiresAt.getTime() > Date.now() && !link.revokedAt;
}

export async function findServiceRecordByToken(token: string) {
  const db = getDb();
  const [record] = await db
    .select()
    .from(serviceRecords)
    .where(
      and(
        eq(serviceRecords.publicTokenHash, hashToken(token)),
        eq(serviceRecords.status, "pending_acknowledgement")
      )
    )
    .limit(1);

  if (record) {
    return record;
  }

  const [acknowledgedRecord] = await db
    .select()
    .from(serviceRecords)
    .where(eq(serviceRecords.publicTokenHash, hashToken(token)))
    .limit(1);

  return acknowledgedRecord;
}
