import { NextResponse } from "next/server";
import { hasDatabase } from "@/lib/db/client";
import { registerUploadedPhoto, uploadedPhotoInputSchema } from "@/lib/server/photos";
import { requireServiceRequest } from "@/lib/server/service-gate";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  const unauthorized = await requireServiceRequest(request);

  if (unauthorized) {
    return unauthorized;
  }

  const body = await request.json().catch(() => ({}));
  const input = uploadedPhotoInputSchema.parse(body);

  if (!hasDatabase()) {
    return NextResponse.json({
      ok: true,
      source: "demo",
      photo: {
        id: input.clientUploadId,
        jobId: params.jobId,
        ...input,
        status: "uploaded"
      }
    });
  }

  const photo = await registerUploadedPhoto(params.jobId, input);

  return NextResponse.json({ ok: true, photo }, { status: 201 });
}
