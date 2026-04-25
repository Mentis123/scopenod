import { CheckCircle2, Clock, ExternalLink, ShieldCheck, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand";
import { PhotoTile } from "@/components/photo-tile";
import { StatusPill } from "@/components/status-pill";
import { demoBusiness, exceptions, includedScope, photos } from "@/lib/demo-data";

export default function ServiceRecordPage() {
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
                <p><span className="font-semibold text-graphite-950">Vehicle:</span> Honda Accord - Black</p>
                <p><span className="font-semibold text-graphite-950">Service:</span> Exterior Detail</p>
                <p><span className="font-semibold text-graphite-950">Date:</span> May 24, 2025</p>
                <p><span className="font-semibold text-graphite-950">Worker:</span> {demoBusiness.worker}</p>
              </div>
            </div>

            <div className="rounded-[22px] border border-scope-green/25 bg-scope-green/10 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-scope-green" />
                <div>
                  <p className="font-semibold">Acknowledged on May 24, 2025</p>
                  <p className="text-sm text-black/60">Scope and completion reviewed by Maya Chen.</p>
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
                <PhotoTile photo={photos[0]} className="aspect-[16/10]" />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-black/58">After</p>
                <PhotoTile photo={photos[7]} className="aspect-[16/10]" />
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">Final photos</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {photos.slice(5, 9).map((photo) => (
                <PhotoTile key={photo.id} photo={photo} className="aspect-square" />
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[20px] border border-black/10 p-5">
              <h2 className="font-semibold">Included work</h2>
              <div className="mt-4 space-y-2">
                {includedScope.map((item) => (
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
                <p className="mt-1 text-sm text-black/62">
                  {exceptions[0].title}: {exceptions[0].note}
                </p>
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
