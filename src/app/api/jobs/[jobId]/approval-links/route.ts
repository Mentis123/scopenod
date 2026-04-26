import { NextResponse } from "next/server";
import { hasDatabase } from "@/lib/db/client";
import { getAppUrl } from "@/lib/env";
import { approvalPurposeSchema, createApprovalLink } from "@/lib/server/approval-links";
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
  const purpose = approvalPurposeSchema.parse(body.purpose ?? "scope");

  if (!hasDatabase()) {
    const token = purpose === "completion" ? "completion-demo" : "scope-demo";

    return NextResponse.json({
      ok: true,
      source: "demo",
      purpose,
      url:
        purpose === "service_record"
          ? `${getAppUrl(request)}/record/demo`
          : `${getAppUrl(request)}/ack/${token}`
    });
  }

  const link = await createApprovalLink(params.jobId, purpose, request);

  return NextResponse.json({
    ok: true,
    purpose,
    url: link.url,
    tokenPreview:
      "approvalLink" in link ? link.approvalLink.tokenPreview : link.serviceRecord.publicTokenPreview
  });
}
