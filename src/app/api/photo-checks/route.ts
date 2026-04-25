import { NextResponse } from "next/server";
import { getDb, hasDatabase } from "@/lib/db/client";
import { photoChecks } from "@/lib/db/schema";
import { verifyPhotoForCheckpoint } from "@/lib/ai/photo-check";
import { photoCheckInputSchema } from "@/lib/ai/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const input = photoCheckInputSchema.parse(body);
  const result = await verifyPhotoForCheckpoint(input);

  if (hasDatabase() && (input.photoId || input.jobId)) {
    await getDb().insert(photoChecks).values({
      jobId: input.jobId,
      photoId: input.photoId,
      provider: result.provider,
      modelId: result.modelId,
      result: result.result,
      confidence: result.confidence,
      suggestion: result.suggestion,
      latencyMs: result.latencyMs,
      rawResponse: result.rawResponse
    });
  }

  return NextResponse.json({ ok: true, result });
}
