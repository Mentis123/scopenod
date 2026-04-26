import { ArrowLeft, Camera, CheckCircle2, ClipboardCheck, Send } from "lucide-react";
import Link from "next/link";
import { PhotoTile } from "@/components/photo-tile";
import { QrCard } from "@/components/qr-card";
import { StatusPill } from "@/components/status-pill";
import { checkpoints } from "@/lib/demo-data";
import { getAppUrl } from "@/lib/env";
import { getJobForDisplay } from "@/lib/server/jobs";
import { listPhotosForJob } from "@/lib/server/photos";

export default async function WorkerReviewPage({ params }: { params: { jobId: string } }) {
  const job = await getJobForDisplay(params.jobId);
  const jobPhotos = await listPhotosForJob(job.id);
  const visiblePhotos = jobPhotos.length > 0 ? jobPhotos : [];
  const handoffUrl = `${getAppUrl()}/handoff/${job.id}?purpose=completion`;

  return (
    <main className="app-bg min-h-dvh overflow-x-hidden px-4 py-5 text-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <Link
            href={`/jobs/${job.id}/capture`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-sm text-white/70"
          >
            <ArrowLeft className="h-4 w-4" />
            Capture
          </Link>
          <StatusPill tone="green">Ready for completion</StatusPill>
        </div>

        <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[1fr_360px]">
          <section className="camera-glass min-w-0 rounded-[24px] p-5 sm:rounded-[28px] sm:p-7">
            <p className="text-sm uppercase tracking-[0.18em] text-scope-green">Review reel</p>
            <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
              Check the set before the customer sees it.
            </h1>
            <p className="mt-3 max-w-2xl text-white/60">
              Swipe-through review catches blurry shots, missing context, and awkward handoffs.
            </p>

            {visiblePhotos.length > 0 ? (
              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visiblePhotos.map((photo, index) => (
                <div key={photo.id} className="rounded-2xl border border-white/10 bg-black/18 p-2">
                  <PhotoTile photo={photo} className="aspect-[4/3]" />
                  <div className="mt-3 flex items-center justify-between px-1">
                    <span className="text-sm font-medium">{photo.label}</span>
                    <StatusPill tone={index < 6 ? "green" : "blue"}>
                      {index < 6 ? "Looks good" : "Saved"}
                    </StatusPill>
                  </div>
                </div>
                ))}
              </div>
            ) : (
              <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm leading-6 text-white/58">
                No uploaded proof photos yet. Capture the required checkpoints before sending completion review.
              </div>
            )}
          </section>

          <aside className="grid content-start gap-4">
            <div className="camera-glass rounded-[24px] p-5">
              <p className="text-sm text-white/50">Job</p>
              <h2 className="mt-1 text-2xl font-semibold">{job.vehicle}</h2>
              <p className="mt-1 text-sm text-white/55">{job.customer} - {job.service}</p>
            </div>

            <div className="camera-glass rounded-[24px] p-5">
              <h3 className="font-semibold">Required checkpoints</h3>
              <div className="mt-4 space-y-3">
                {checkpoints.map((checkpoint) => (
                  <div key={checkpoint.id} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-scope-green" />
                    <span className="text-sm text-white/78">{checkpoint.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="camera-glass rounded-[24px] p-5 text-center">
              <QrCard value={handoffUrl} label="Scan for completion review" />
              <p className="mt-4 text-sm font-semibold">Completion QR</p>
              <p className="mt-1 text-xs text-white/48">Customer can scan this phone.</p>
            </div>

            <Link
              href={`/handoff/${job.id}?purpose=completion`}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-scope-green px-5 font-semibold text-graphite-950"
            >
              <Send className="h-5 w-5" />
              Send completion review
            </Link>
            <Link
              href={`/handoff/${job.id}?purpose=service_record`}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/12 px-5 font-semibold text-white/82"
            >
              <ClipboardCheck className="h-5 w-5" />
              Open Service Record
            </Link>
            <Link
              href={`/jobs/${job.id}/capture`}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/12 px-5 font-semibold text-white/82"
            >
              <Camera className="h-5 w-5" />
              Add optional proof
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
