import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Link2,
  Plus,
  QrCode,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand";
import { PhotoTile } from "@/components/photo-tile";
import { StatusPill } from "@/components/status-pill";
import { demoJobs, photos, stateLabel } from "@/lib/demo-data";

const activeJob = demoJobs[0];
const storySteps = [
  ["1", "Capture condition", "Before photos set the baseline."],
  ["2", "Confirm scope", "Customer reviews and acknowledges."],
  ["3", "Show work", "Guided proof checkpoints."],
  ["4", "Handle exceptions", "Document issues in context."],
  ["5", "Get the nod", "Customer approves completion."],
  ["6", "Leave a record", "Clean, shareable, built for trust."]
];

export default function Home() {
  return (
    <main className="app-bg min-h-screen text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-4 py-5 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-8">
        <section className="flex flex-col justify-between gap-8">
          <div>
            <div className="flex items-center justify-between">
              <Logo tagline />
              <Link
                href="/moodboard"
                className="inline-flex min-h-10 items-center rounded-full border border-white/10 px-4 text-sm text-white/70 transition hover:border-white/25 hover:text-white"
              >
                Moodboard
              </Link>
            </div>

            <div className="mt-14 max-w-xl">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-scope-blue">
                AI-verified service proof
              </p>
              <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-normal sm:text-6xl">
                Capture the condition. Confirm the scope. Show the work.{" "}
                <span className="text-scope-blue">Leave a trusted Service Record.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-8 text-white/68">
                ScopeNod is a mobile service-proof app for capturing scope, photos, exceptions,
                customer acknowledgements, and shareable Service Records.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Protect the worker", ShieldCheck],
              ["Reassure the customer", CheckCircle2],
              ["Reduce disputes", ClipboardCheck],
              ["Build a better business", Sparkles]
            ].map(([label, Icon]) => (
              <div key={label as string} className="camera-glass rounded-2xl p-4">
                <Icon className="h-5 w-5 text-scope-green" />
                <p className="mt-3 text-sm font-medium text-white/82">{label as string}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="phone-frame mx-auto w-full max-w-[390px] p-2">
            <div className="phone-screen min-h-[720px] overflow-hidden p-4">
              <div className="flex items-center justify-between">
                <Logo />
                <button className="grid h-10 w-10 place-items-center rounded-full border border-scope-blue/30 bg-scope-blue/10 text-scope-blue">
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="text-sm text-white/50">Today</p>
                  <h2 className="mt-1 text-2xl font-semibold">3 active jobs</h2>
                </div>
                <StatusPill tone="green">All synced</StatusPill>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {["All 5", "In progress 2", "Complete 1"].map((tab, index) => (
                  <button
                    key={tab}
                    className={
                      index === 0
                        ? "min-h-10 rounded-full bg-scope-blue text-sm font-semibold text-white"
                        : "min-h-10 rounded-full border border-white/10 text-sm text-white/58"
                    }
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                {demoJobs.map((job, index) => (
                  <Link
                    href={index === 0 ? `/jobs/${job.id}/capture` : `/jobs/${job.id}/scope`}
                    key={job.id}
                    className="block rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-scope-blue/50"
                  >
                    <div className="flex gap-3">
                      <PhotoTile
                        photo={photos[index + 1]}
                        label={false}
                        className="h-20 w-24 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="truncate text-sm font-semibold">{job.vehicle}</h3>
                          <ArrowRight className="h-4 w-4 shrink-0 text-white/35" />
                        </div>
                        <p className="mt-1 text-xs text-white/50">{job.service}</p>
                        <p className="mt-2 text-xs text-white/70">{job.scheduled}</p>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-scope-blue"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-scope-blue">{job.nextAction}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="grid content-start gap-4">
            <div className="camera-glass rounded-[24px] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/50">Next action</p>
                  <h2 className="mt-1 text-2xl font-semibold">{activeJob.nextAction}</h2>
                </div>
                <StatusPill tone={activeJob.statusTone}>{stateLabel(activeJob.state)}</StatusPill>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Link
                  href={`/jobs/${activeJob.id}/capture`}
                  className="group rounded-2xl bg-scope-blue p-4 text-white"
                >
                  <Camera className="h-5 w-5" />
                  <p className="mt-6 text-sm font-semibold">Open capture</p>
                </Link>
                <Link
                  href={`/jobs/${activeJob.id}/scope`}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <QrCode className="h-5 w-5 text-scope-blue" />
                  <p className="mt-6 text-sm font-semibold">Scope handoff</p>
                </Link>
                <Link
                  href="/record/demo"
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <ClipboardCheck className="h-5 w-5 text-scope-blue" />
                  <p className="mt-6 text-sm font-semibold">Service Record</p>
                </Link>
              </div>
            </div>

            <div className="camera-glass rounded-[24px] p-5">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-scope-blue">
                Product flow
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {storySteps.map(([number, title, body]) => (
                  <div key={number} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-scope-blue text-sm font-bold text-white">
                      {number}
                    </span>
                    <span>
                      <h3 className="text-sm font-semibold">{title}</h3>
                      <p className="mt-1 text-xs leading-5 text-white/55">{body}</p>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="camera-glass rounded-[24px] p-5">
                <Link2 className="h-5 w-5 text-scope-blue" />
                <h3 className="mt-5 text-xl font-semibold">Async-first handoff</h3>
                <p className="mt-2 text-sm leading-6 text-white/58">
                  Copy/share link first. QR stays ready for the face-to-face moment.
                </p>
              </div>
              <div className="camera-glass rounded-[24px] p-5">
                <ShieldCheck className="h-5 w-5 text-scope-green" />
                <h3 className="mt-5 text-xl font-semibold">AI as a sidekick</h3>
                <p className="mt-2 text-sm leading-6 text-white/58">
                  Photos save immediately. Checks advise, but never block the worker.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {photos.slice(0, 6).map((photo) => (
                <PhotoTile key={photo.id} photo={photo} className="aspect-square" />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
