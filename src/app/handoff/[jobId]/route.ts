import { redirect } from "next/navigation";
import { hasDatabase } from "@/lib/db/client";
import { approvalPurposeSchema, createApprovalLink } from "@/lib/server/approval-links";
import { requireServiceRequest } from "@/lib/server/service-gate";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  const unauthorized = await requireServiceRequest(request);

  if (unauthorized) {
    return unauthorized;
  }

  const url = new URL(request.url);
  const purpose = approvalPurposeSchema.catch("scope").parse(url.searchParams.get("purpose"));

  if (!hasDatabase() || params.jobId === "honda-accord") {
    redirect(purpose === "completion" ? "/ack/completion-demo" : "/ack/scope-demo");
  }

  const link = await createApprovalLink(params.jobId, purpose, request);
  redirect(link.url);
}
