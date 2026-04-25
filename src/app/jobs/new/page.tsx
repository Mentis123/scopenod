import { ArrowLeft, Car, ClipboardList, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand";
import { hasDatabase } from "@/lib/db/client";
import { createJob, createJobInputSchema } from "@/lib/server/jobs";

async function createJobAction(formData: FormData) {
  "use server";

  if (!hasDatabase()) {
    redirect("/jobs/honda-accord/scope");
  }

  const input = createJobInputSchema.parse({
    customerName: formData.get("customerName"),
    subjectLabel: formData.get("subjectLabel"),
    serviceLabel: formData.get("serviceLabel"),
    customerPhone: formData.get("customerPhone") || undefined,
    customerEmail: formData.get("customerEmail") || undefined,
    locationLabel: formData.get("locationLabel") || undefined,
    publicNote: formData.get("publicNote") || undefined
  });
  const job = await createJob(input);

  redirect(`/jobs/${job.id}/scope`);
}

export default function NewJobPage() {
  return (
    <main className="app-bg min-h-screen px-4 py-5 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-sm text-white/70">
          <ArrowLeft className="h-4 w-4" />
          Today
        </Link>

        <section className="camera-glass mt-8 rounded-[28px] p-6 sm:p-8">
          <Logo />
          <p className="mt-10 text-sm uppercase tracking-[0.18em] text-scope-blue">New job shell</p>
          <h1 className="mt-4 text-4xl font-semibold">Create the shell in under 30 seconds.</h1>
          <p className="mt-3 max-w-xl leading-7 text-white/60">
            This is the V1 job setup surface: choose template, add customer/job label, then send scope.
          </p>

          <form action={createJobAction} className="mt-8 grid gap-3">
            <label className="block">
              <span className="text-sm text-white/55">Service template</span>
              <div className="mt-2 flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4">
                <Car className="h-5 w-5 text-scope-blue" />
                <span className="font-semibold">Car Detail - Exterior Detail</span>
              </div>
              <input type="hidden" name="serviceLabel" value="Exterior Detail" />
            </label>
            <label className="block">
              <span className="text-sm text-white/55">Customer / job label</span>
              <input
                name="customerName"
                defaultValue="Maya Chen"
                className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm text-white/55">Vehicle / site label</span>
              <input
                name="subjectLabel"
                defaultValue="Honda Accord - Black"
                className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none"
              />
            </label>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-white/55">Customer phone</span>
                <input
                  name="customerPhone"
                  placeholder="Optional"
                  className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/28"
                />
              </label>
              <label className="block">
                <span className="text-sm text-white/55">Customer email</span>
                <input
                  name="customerEmail"
                  type="email"
                  placeholder="Optional"
                  className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/28"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm text-white/55">Public note</span>
              <input
                name="publicNote"
                placeholder="Optional note shown on customer pages"
                className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/28"
              />
            </label>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="submit"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-scope-blue px-5 font-semibold text-white"
            >
              <ClipboardList className="h-5 w-5" />
              Continue to scope
            </button>
            <Link
              href="/jobs/honda-accord/capture"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/12 px-5 font-semibold text-white/80"
            >
              <Sparkles className="h-5 w-5" />
              Skip to demo capture
            </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
