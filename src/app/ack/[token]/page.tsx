import { ArrowLeft, CheckCircle2, Circle, ClipboardCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand";
import { PhotoTile } from "@/components/photo-tile";
import { getDb, hasDatabase } from "@/lib/db/client";
import { approvalLinks, customerAcknowledgements, jobs, serviceRecords } from "@/lib/db/schema";
import { includedScope, excludedScope, exceptions, photos } from "@/lib/demo-data";
import {
  createServiceRecordLink,
  findActiveApprovalLinkByToken,
  isApprovalActionAllowed
} from "@/lib/server/approval-links";
import { eq } from "drizzle-orm";

type AckPageProps = {
  params: {
    token: string;
  };
};

async function acknowledgeAction(formData: FormData) {
  "use server";

  const token = String(formData.get("token") || "");
  const completion = String(formData.get("completion") || "") === "true";
  const customerName = String(formData.get("customerName") || "").trim() || "Customer";
  const customerNote = String(formData.get("customerNote") || "").trim() || undefined;
  const checkboxAccepted = formData.get("checkboxAccepted") === "on";

  if (!checkboxAccepted) {
    redirect(`/ack/${token}`);
  }

  if (!hasDatabase() || token.includes("demo")) {
    redirect(completion ? "/record/demo" : "/jobs/honda-accord/capture");
  }

  const db = getDb();
  const link = await findActiveApprovalLinkByToken(token);

  if (!link || link.purpose === "service_record" || !isApprovalActionAllowed(link)) {
    redirect(completion ? "/record/demo" : "/");
  }

  const [job] = await db.select().from(jobs).where(eq(jobs.id, link.jobId)).limit(1);

  if (!job) {
    redirect("/");
  }

  const acknowledgedAt = new Date();

  await db.insert(customerAcknowledgements).values({
    jobId: job.id,
    approvalLinkId: link.id,
    kind: link.purpose,
    customerName,
    customerNote,
    checkboxAccepted,
    acknowledgedAt
  });

  await db
    .update(approvalLinks)
    .set({ status: "used", usedAt: acknowledgedAt, updatedAt: acknowledgedAt })
    .where(eq(approvalLinks.id, link.id));

  if (link.purpose === "scope") {
    await db
      .update(jobs)
      .set({ state: "scope_acknowledged", updatedAt: acknowledgedAt })
      .where(eq(jobs.id, job.id));
    redirect(`/jobs/${job.id}/capture`);
  }

  await db
    .update(jobs)
    .set({ state: "completed", completedAt: acknowledgedAt, updatedAt: acknowledgedAt })
    .where(eq(jobs.id, job.id));

  const recordLink = await createServiceRecordLink(job.id);
  await db
    .update(serviceRecords)
    .set({
      status: "acknowledged",
      customerAcknowledgedAt: acknowledgedAt,
      updatedAt: acknowledgedAt
    })
    .where(eq(serviceRecords.jobId, job.id));

  redirect(recordLink.url);
}

export default function AckPage({ params }: AckPageProps) {
  const isCompletion = params.token.includes("completion");

  return (
    <main className="light-record-bg min-h-screen px-4 py-4 text-graphite-950 sm:py-8">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-soft">
        <header className="flex items-center justify-between border-b border-black/10 px-4 py-4 sm:px-6">
          <Link href="/" className="grid h-10 w-10 place-items-center rounded-full border border-black/10">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Logo tone="light" />
          <span className="h-10 w-10" />
        </header>

        <section className="px-4 py-6 sm:px-7">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-scope-green">
            {isCompletion ? "Completion review" : "Scope review"}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">
            {isCompletion ? "Review the completed service" : "Review the starting condition and scope"}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-black/62">
            {isCompletion
              ? "Please check the completed photos and notes. If something is unclear, add a note before approving."
              : "Please check the photos, included work, exclusions, and notes before the service begins."}
          </p>

          <div className="mt-6 grid gap-2 rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm sm:grid-cols-2">
            <p><span className="font-semibold">Service:</span> Exterior Detail</p>
            <p><span className="font-semibold">Vehicle:</span> Honda Accord - Black</p>
            <p><span className="font-semibold">Date:</span> May 24, 2025</p>
            <p><span className="font-semibold">Business:</span> Clear Finish Detailing</p>
          </div>

          {isCompletion ? <CompletionBody token={params.token} /> : <ScopeBody token={params.token} />}
        </section>
      </div>
    </main>
  );
}

function ScopeBody({ token }: { token: string }) {
  return (
    <>
      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Starting condition</h2>
          <span className="text-xs text-black/45">3 photos</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {photos.slice(0, 3).map((photo) => (
            <PhotoTile key={photo.id} photo={photo} className="aspect-[4/3]" />
          ))}
        </div>
      </section>

      <ScopeLists />

      <section className="mt-6 rounded-2xl border border-scope-amber/30 bg-scope-amber/10 p-4">
        <p className="text-sm font-semibold">Exception noted</p>
        <p className="mt-1 text-sm text-black/62">{exceptions[0].note}</p>
      </section>

      <ApprovalPanel
        token={token}
        label="I confirm this matches my understanding of the starting condition and service scope."
        button="Acknowledge Scope"
      />
    </>
  );
}

function CompletionBody({ token }: { token: string }) {
  return (
    <>
      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Before</h2>
          <span className="text-xs text-black/45">Starting condition</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {photos.slice(0, 3).map((photo) => (
            <PhotoTile key={photo.id} photo={photo} className="aspect-square" />
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">After</h2>
          <span className="text-xs text-black/45">Final walkaround</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {photos.slice(6, 9).map((photo) => (
            <PhotoTile key={photo.id} photo={photo} className="aspect-square" />
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-scope-green/30 bg-scope-green/10 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-graphite-950">
          <CheckCircle2 className="h-5 w-5 text-scope-green" />
          All required checkpoints complete
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-scope-amber/30 bg-scope-amber/10 p-4">
        <p className="text-sm font-semibold">Scope changed during service - please review additions.</p>
        <p className="mt-1 text-sm text-black/62">Left rear door scratch was recorded as pre-existing.</p>
      </section>

      <ApprovalPanel
        token={token}
        label="I confirm the completed service photos and notes have been reviewed."
        button="Approve Completion"
        secondary="Add note before approving"
        completion
      />
    </>
  );
}

function ScopeLists() {
  return (
    <section className="mt-7 grid gap-5 sm:grid-cols-2">
      <div>
        <h2 className="font-semibold">What's included</h2>
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
        <h2 className="font-semibold">What's excluded</h2>
        <div className="mt-3 space-y-2">
          {excludedScope.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm text-black/62">
              <Circle className="h-4 w-4 text-black/22" />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ApprovalPanel({
  token,
  label,
  button,
  secondary,
  completion = false
}: {
  token: string;
  label: string;
  button: string;
  secondary?: string;
  completion?: boolean;
}) {
  return (
    <section className="mt-7 border-t border-black/10 pt-5">
      <form action={acknowledgeAction}>
        <label className="flex gap-3 rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm">
          <input
            name="checkboxAccepted"
            type="checkbox"
            className="mt-1 h-5 w-5 accent-green-500"
            defaultChecked
          />
          <span>{label}</span>
        </label>
        <input
          name="customerName"
          defaultValue="Maya Chen"
          aria-label="Customer full name"
          className="mt-3 min-h-12 w-full rounded-xl border border-black/12 px-4 text-sm outline-none focus:border-scope-blue"
        />
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="completion" value={completion ? "true" : "false"} />
        <button
          type="submit"
          className="mt-4 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-scope-blue px-5 font-semibold text-white"
        >
          {completion ? <ClipboardCheck className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          {button}
        </button>
      </form>
      {secondary ? (
        <button className="mt-3 min-h-12 w-full rounded-lg border border-black/15 font-semibold text-graphite-950">
          {secondary}
        </button>
      ) : null}
      {completion ? (
        <p className="mt-4 text-center text-sm text-black/55">
          After you approve, you'll get a clean record of the service you can keep or share.
        </p>
      ) : (
        <p className="mt-4 text-center text-xs text-black/45">This confirms the agreed scope.</p>
      )}
    </section>
  );
}
