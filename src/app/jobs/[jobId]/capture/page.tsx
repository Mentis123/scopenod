import { CaptureFlow } from "@/components/capture-flow";

export default function CapturePage({ params }: { params: { jobId: string } }) {
  return <CaptureFlow jobId={params.jobId} />;
}
