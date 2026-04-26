import { CheckCircle2, Clock, ExternalLink, ShieldCheck, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand";
import { PhotoTile } from "@/components/photo-tile";
import { StatusPill } from "@/components/status-pill";
import { demoBusiness, exceptions, includedScope, photos } from "@/lib/demo-data";
import { getDb, hasDatabase } from "@/lib/db/client";
import { customerAcknowledgements, jobExceptions, jobs, scopeItems } from "@/lib/db/schema";
import { findServiceRecordByToken } from "@/lib/server/approval-links";
import { listPhotosForJob } from "@/lib/server/photos";
import { hasServiceSession } from "@/lib/server/service-gate";
import { eq } from "drizzle-orm";

export default async function ServiceRecordPage({ params }: { params: { token: string } }) {
  if (params.token === "demo" && !(await hasServiceSession())) {
    redirect("/login?next=/record/demo");
  }

  const recordData = await getRecordData(params.token);

  return (
    <main className="light-record-bg min-h-screen px-4 py-5 text-graphite-950 sm:py-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-soft">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 px-4 py-4 sm:px-7">
          <Logo tone="light" />
          <div className="flex items-center gap-2">
            <StatusPill tone="green">Completed</StatusPill>
            <StatusPill tone="blue">Acknowledged</StatusPill>
          </div>
        </header>

        <section className="px-4 py-6 sm:px-7">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-scope-blue">
                Service Record
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight">
                Your service record. Keep it, share it, or hand it on.
              </h1>
              <div className="mt-6 space-y-2 text-sm text-black/62">
                <p><span className="font-semibold text-graphite-950">Vehicle:</span> {recordData.subjectLabel}</p>
                <p><span className="font-semibold text-graphite-950">Service:</span> {recordData.serviceLabel}</p>
                <p><span className="font-semibold text-graphite-950">Date:</span> {recordData.dateLabel}</p>
                <p><span className="font-semibold text-graphite-950">Worker:</span> {demoBusiness.worker}</p>
              </div>
            </div>

            <div className="rounded-[22px] border border-scope-green/25 bg-scope-green/10 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-scope-green" />
                <div>
                  <p className="font-semibold">{recordData.acknowledgedLabel}</p>
                  <p className="text-sm text-black/60">Scope and completion reviewed by {recordData.customerName}.</p>
                </div>
              </div>
            </div>
          </div>

          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Before and after</h2>
              <span className="text-xs text-black/45">Hero comparison</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-semibold text-black/58">Before</p>
                <PhotoTile photo={recordData.beforePhoto} className="aspect-[16/10]" />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-black/58">After</p>
                <PhotoTile photo={recordData.afterPhoto} className="aspect-[16/10]" />
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">Final photos</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {recordData.finalPhotos.map((photo) => (
                <PhotoTile key={photo.id} photo={photo} className="aspect-square" />
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[20px] border border-black/10 p-5">
              <h2 className="font-semibold">Included work</h2>
              <div className="mt-4 space-y-2">
                {recordData.included.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-scope-green" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-black/10 p-5">
              <h2 className="font-semibold">Acknowledgements</h2>
              <div className="mt-4 space-y-4 text-sm">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-scope-green" />
                  <div>
                    <p className="font-medium">Scope acknowledged</p>
                    <p className="text-black/55">May 24, 2025 at 11:47 AM by Maya Chen</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-scope-green" />
                  <div>
                    <p className="font-medium">Completion approved</p>
                    <p className="text-black/55">May 24, 2025 at 2:18 PM by Maya Chen</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-[20px] border border-scope-amber/30 bg-scope-amber/10 p-5">
            <div className="flex gap-3">
              <TriangleAlert className="mt-0.5 h-5 w-5 text-scope-amber" />
              <div>
                <h2 className="font-semibold">Exception</h2>
                <p className="mt-1 text-sm text-black/62">{recordData.exceptionLabel}</p>
              </div>
            </div>
          </section>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 px-4 py-4 text-sm text-black/50 sm:px-7">
          <p>Service provided by {demoBusiness.name}</p>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Powered by ScopeNod</span>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 text-graphite-950">
            Worker app
            <ExternalLink className="h-4 w-4" />
          </Link>
        </footer>
      </div>
    </main>
  );
}

async function getRecordData(token: string) {
  const fallback = {
    customerName: "Maya Chen",
    subjectLabel: "Honda Accord - Black",
    serviceLabel: "Exterior Detail",
    dateLabel: "May 24, 2025",
    acknowledgedLabel: "Acknowledged on May 24, 2025",
    beforePhoto: photos[0],
    afterPhoto: photos[7],
    finalPhotos: photos.slice(5, 9),
    included: includedScope,
    exceptionLabel: `${exceptions[0].title}: ${exceptions[0].note}`
  };

  if (!hasDatabase() || token === "demo") {
    return fallback;
  }

  try {
    const db = getDb();
    const record = await findServiceRecordByToken(token);

    if (!record) {
      return fallback;
    }

    const [job] = await db.select().from(jobs).where(eq(jobs.id, record.jobId)).limit(1);

    if (!job) {
      return fallback;
    }

    const [scopeRows, exceptionRows, acknowledgementRows, jobPhotos] = await Promise.all([
      db.select().from(scopeItems).where(eq(scopeItems.jobId, job.id)),
      db.select().from(jobExceptions).where(eq(jobExceptions.jobId, job.id)),
      db.select().from(customerAcknowledgements).where(eq(customerAcknowledgements.jobId, job.id)),
      listPhotosForJob(job.id)
    ]);
    const displayPhotos = jobPhotos.length > 0 ? jobPhotos : photos;
    const beforePhoto = displayPhotos.find((photo) => photo.kind === "before") ?? displayPhotos[0] ?? photos[0];
    const afterPhoto =
      displayPhotos.find((photo) => photo.kind === "after") ??
      displayPhotos.find((photo) => photo.kind === "checkpoint") ??
      displayPhotos[displayPhotos.length - 1] ??
      photos[7];
    const completionAck = acknowledgementRows.find((ack) => ack.kind === "completion");

    return {
      customerName: job.customerName,
      subjectLabel: job.subjectLabel,
      serviceLabel: job.serviceLabel,
      dateLabel: formatDate(job.createdAt),
      acknowledgedLabel: completionAck
        ? `Acknowledged on ${formatDate(completionAck.acknowledgedAt)}`
        : "Pending customer acknowledgement",
      beforePhoto,
      afterPhoto,
      finalPhotos: displayPhotos.slice(0, 8),
      included: scopeRows
        .filter((item) => item.kind === "included")
        .map((item) => ({ label: item.label, detail: item.detail ?? undefined })),
      exceptionLabel:
        exceptionRows.length > 0
          ? `${exceptionRows[0].title}: ${exceptionRows[0].note ?? "Documented during service."}`
          : fallback.exceptionLabel
    };
  } catch {
    return fallback;
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}
