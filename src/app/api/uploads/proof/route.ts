import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, hasDatabase } from "@/lib/db/client";
import { auditEvents, jobPhotos, jobs } from "@/lib/db/schema";
import { isBlobConfigured } from "@/lib/env";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

const uploadPayloadSchema = z.object({
  jobId: z.string().uuid(),
  checkpointId: z.string().uuid().optional(),
  exceptionId: z.string().uuid().optional(),
  kind: z.enum(["before", "checkpoint", "after", "exception", "other"]).default("checkpoint"),
  label: z.string().min(1).default("Proof photo"),
  note: z.string().optional(),
  contentType: z.string().optional(),
  assetRole: z.enum(["display", "raw", "thumbnail"]).default("display")
});

export async function POST(request: Request): Promise<NextResponse> {
  if (!isBlobConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        code: "blob_not_configured",
        message: "Set BLOB_READ_WRITE_TOKEN before requesting upload tokens."
      },
      { status: 501 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const payload = parseClientPayload(clientPayload);

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/heic",
            "image/heif"
          ],
          maximumSizeInBytes: payload.assetRole === "raw" ? 18 * 1024 * 1024 : 5 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify(payload)
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = parseClientPayload(tokenPayload);

        if (!hasDatabase()) {
          return;
        }

        const db = getDb();
        const [job] = await db.select().from(jobs).where(eq(jobs.id, payload.jobId)).limit(1);

        if (!job) {
          return;
        }

        const [photo] = await db
          .insert(jobPhotos)
          .values({
            jobId: payload.jobId,
            checkpointId: payload.checkpointId,
            exceptionId: payload.exceptionId,
            kind: payload.kind,
            label: payload.label,
            note: payload.note,
            blobUrl: payload.assetRole === "display" ? blob.url : null,
            rawBlobUrl: payload.assetRole === "raw" ? blob.url : null,
            thumbnailUrl: payload.assetRole === "thumbnail" ? blob.url : null,
            blobPathname: blob.pathname,
            contentType: payload.contentType,
            status: "uploaded",
            uploadedAt: new Date(),
            capturedAt: new Date()
          })
          .returning();

        await db.insert(auditEvents).values({
          organizationId: job.organizationId,
          jobId: payload.jobId,
          eventType: "photo.uploaded",
          publicSummary: "Proof photo uploaded.",
          metadata: {
            photoId: photo.id,
            kind: payload.kind,
            assetRole: payload.assetRole,
            blobPathname: blob.pathname
          }
        });
      }
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        code: "upload_failed",
        message: error instanceof Error ? error.message : "Upload token request failed."
      },
      { status: 400 }
    );
  }
}

function parseClientPayload(clientPayload: string | null | undefined) {
  if (!clientPayload) {
    throw new Error("Upload clientPayload is required.");
  }

  return uploadPayloadSchema.parse(JSON.parse(clientPayload));
}
