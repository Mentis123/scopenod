import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, hasDatabase } from "@/lib/db/client";
import { auditEvents, jobExceptions, jobPhotos, jobs } from "@/lib/db/schema";
import { photos as demoPhotos } from "@/lib/demo-data";
import type { DisplayPhoto } from "@/components/photo-tile";

export const uploadedPhotoInputSchema = z.object({
  clientUploadId: z.string().trim().min(8),
  checkpointId: z.string().uuid().optional(),
  exceptionId: z.string().uuid().optional(),
  kind: z.enum(["before", "checkpoint", "after", "exception", "other"]).default("checkpoint"),
  label: z.string().trim().min(1).default("Proof photo"),
  note: z.string().trim().optional(),
  blobUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  rawBlobUrl: z.string().url().optional(),
  blobPathname: z.string().trim().optional(),
  contentType: z.string().trim().optional(),
  sizeBytes: z.number().int().positive().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export type UploadedPhotoInput = z.infer<typeof uploadedPhotoInputSchema>;

export async function registerUploadedPhoto(jobId: string, input: UploadedPhotoInput) {
  if (!hasDatabase()) {
    return null;
  }

  const db = getDb();
  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

  if (!job) {
    throw new Error("Job not found.");
  }

  let exceptionId = input.exceptionId;

  if (input.kind === "exception" && !exceptionId) {
    const [exception] = await db
      .insert(jobExceptions)
      .values({
        jobId,
        title: input.label || "Exception photo",
        note: input.note || "Captured during proof flow.",
        severity: "low",
        customerVisible: true
      })
      .returning();

    exceptionId = exception.id;
  }

  const [photo] = await db
    .insert(jobPhotos)
    .values({
      clientUploadId: input.clientUploadId,
      jobId,
      checkpointId: input.checkpointId,
      exceptionId,
      kind: input.kind,
      label: input.label,
      note: input.note,
      blobUrl: input.blobUrl,
      thumbnailUrl: input.thumbnailUrl,
      rawBlobUrl: input.rawBlobUrl,
      blobPathname: input.blobPathname,
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
      status: "uploaded",
      capturedAt: new Date(),
      uploadedAt: new Date(),
      metadata: input.metadata
    })
    .onConflictDoUpdate({
      target: jobPhotos.clientUploadId,
      set: {
        blobUrl: input.blobUrl,
        thumbnailUrl: input.thumbnailUrl,
        rawBlobUrl: input.rawBlobUrl,
        exceptionId,
        blobPathname: input.blobPathname,
        contentType: input.contentType,
        sizeBytes: input.sizeBytes,
        status: "uploaded",
        uploadedAt: new Date(),
        updatedAt: new Date(),
        metadata: input.metadata
      }
    })
    .returning();

  await db.insert(auditEvents).values({
    organizationId: job.organizationId,
    jobId,
    eventType: "photo.uploaded",
    publicSummary: "Proof photo uploaded.",
    metadata: {
      photoId: photo.id,
      clientUploadId: input.clientUploadId,
      kind: input.kind,
      blobPathname: input.blobPathname
    }
  });

  return photo;
}

export async function listPhotosForJob(jobId?: string): Promise<DisplayPhoto[]> {
  if (!jobId || !hasDatabase()) {
    return demoPhotos;
  }

  try {
    const db = getDb();
    const rows = await db.select().from(jobPhotos).where(eq(jobPhotos.jobId, jobId));

    if (rows.length === 0) {
      return [];
    }

    return rows.map((photo) => ({
      id: photo.id,
      label: photo.label,
      kind: photo.kind === "other" ? "checkpoint" : photo.kind,
      position: "50% 50%",
      url: photo.blobUrl ?? photo.thumbnailUrl ?? photo.rawBlobUrl,
      status: photo.status,
      suggestion: photo.note
    }));
  } catch {
    return demoPhotos;
  }
}
