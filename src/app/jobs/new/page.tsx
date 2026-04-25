import { ArrowLeft, Car, ClipboardList, Sparkles } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand";

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

          <div className="mt-8 grid gap-3">
            <label className="block">
              <span className="text-sm text-white/55">Service template</span>
              <div className="mt-2 flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4">
                <Car className="h-5 w-5 text-scope-blue" />
                <span className="font-semibold">Car Detail - Exterior Detail</span>
              </div>
            </label>
            <label className="block">
              <span className="text-sm text-white/55">Customer / job label</span>
              <input
                defaultValue="Maya Chen"
                className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm text-white/55">Vehicle / site label</span>
              <input
                defaultValue="Honda Accord - Black"
                className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none"
              />
            </label>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              href="/jobs/honda-accord/scope"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-scope-blue px-5 font-semibold text-white"
            >
              <ClipboardList className="h-5 w-5" />
              Continue to scope
            </Link>
            <Link
              href="/jobs/honda-accord/capture"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/12 px-5 font-semibold text-white/80"
            >
              <Sparkles className="h-5 w-5" />
              Skip to demo capture
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
