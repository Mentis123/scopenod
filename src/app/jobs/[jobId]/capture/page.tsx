import { CaptureFlow } from "@/components/capture-flow";
import { getJobForDisplay } from "@/lib/server/jobs";

export default async function CapturePage({ params }: { params: { jobId: string } }) {
  const job = await getJobForDisplay(params.jobId);

  return <CaptureFlow job={job} />;
}
