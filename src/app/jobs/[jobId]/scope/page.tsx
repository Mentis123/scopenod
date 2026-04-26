import { ArrowLeft, CheckCircle2, Copy, MessageSquareText, QrCode } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand";
import { PhotoTile } from "@/components/photo-tile";
import { QrCard } from "@/components/qr-card";
import { StatusPill } from "@/components/status-pill";
import { hasDatabase } from "@/lib/db/client";
import { includedScope, excludedScope, photos } from "@/lib/demo-data";
import { getAppUrl } from "@/lib/env";
import { createApprovalLink } from "@/lib/server/approval-links";
import { getJobForDisplay } from "@/lib/server/jobs";

async function openScopeLinkAction(formData: FormData) {
  "use server";

  const jobId = String(formData.get("jobId") || "");

  if (!hasDatabase() || jobId === "honda-accord") {
    redirect("/ack/scope-demo");
  }

  try {
    const link = await createApprovalLink(jobId, "scope");
    redirect(link.url);
  } catch {
    redirect("/ack/scope-demo");
  }
}

export default async function WorkerScopePage({ params }: { params: { jobId: string } }) {
  const job = await getJobForDisplay(params.jobId);
  const qrUrl = `${getAppUrl()}/handoff/${job.id}?purpose=scope`;

  return (
    <main className="app-bg min-h-screen text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl gap-6 px-4 py-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <section className="camera-glass rounded-[28px] p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="grid h-11 w-11 place-items-center rounded-full bg-white/5">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <StatusPill tone="amber">Scope sent</StatusPill>
          </div>

          <div className="mt-10">
            <Logo />
            <h1 className="mt-8 max-w-lg text-4xl font-semibold leading-tight">
              Send the customer a clean scope review.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-white/62">
              Async-first by default. Copy the link into SMS, email, or chat. If they are in
              front of you, show the QR.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <form action={openScopeLinkAction}>
              <input type="hidden" name="jobId" value={job.id} />
              <button
                type="submit"
                className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-scope-blue px-5 font-semibold text-white"
              >
                <Copy className="h-5 w-5" />
                Open scope link
              </button>
            </form>
            <button className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/12 px-5 font-semibold text-white/80">
              <MessageSquareText className="h-5 w-5" />
              Native share
            </button>
          </div>

          <div className="mt-8 rounded-[24px] border border-white/10 bg-black/24 p-5 text-center">
            <QrCard value={qrUrl} label="Scan for scope review" />
            <p className="mt-5 text-sm font-semibold">QR fallback</p>
            <p className="mt-1 text-xs text-white/48">Job #1027 - {job.vehicle}</p>
          </div>
        </section>

        <section className="light-record-bg overflow-hidden rounded-[28px] border border-black/10 p-5 text-graphite-950 shadow-soft sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Scope preview</h2>
            <StatusPill tone="green">Customer safe</StatusPill>
          </div>

          <div className="mt-6 border-y border-black/10 py-4 text-sm">
            <p><span className="font-semibold">Service:</span> {job.service}</p>
            <p><span className="font-semibold">Vehicle:</span> {job.vehicle}</p>
            <p><span className="font-semibold">Date:</span> May 24, 2025 at 11:42 AM</p>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Starting condition</h3>
              <span className="text-xs text-black/50">3 photos</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {photos.slice(0, 3).map((photo) => (
                <PhotoTile key={photo.id} photo={photo} className="aspect-[4/3]" />
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <h3 className="font-semibold">What's included</h3>
              <div className="mt-3 space-y-2">
                {includedScope.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-scope-green" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold">What's excluded</h3>
              <div className="mt-3 space-y-2">
                {excludedScope.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm text-black/62">
                    <span className="h-4 w-4 rounded-full bg-black/12" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-scope-amber/30 bg-scope-amber/10 p-4 text-sm">
            <p className="font-semibold text-graphite-950">Exception noted</p>
            <p className="mt-1 text-black/62">Light scratch on left rear door. Customer shown.</p>
          </div>

          <form action={openScopeLinkAction} className="mt-6">
            <input type="hidden" name="jobId" value={job.id} />
            <button
              type="submit"
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-scope-blue px-5 font-semibold text-white"
            >
              <QrCode className="h-5 w-5" />
              Acknowledge Scope
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
