import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, hasDatabase } from "@/lib/db/client";
import { auditEvents, jobPhotos, jobs } from "@/lib/db/schema";

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

  const [photo] = await db
    .insert(jobPhotos)
    .values({
      clientUploadId: input.clientUploadId,
      jobId,
      checkpointId: input.checkpointId,
      exceptionId: input.exceptionId,
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
