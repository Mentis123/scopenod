"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Check, Circle, ClipboardEdit, RotateCcw, Save, Zap } from "lucide-react";
import Link from "next/link";
import { PhotoTile } from "@/components/photo-tile";
import { StatusPill } from "@/components/status-pill";
import { checkpoints, getJob, photos } from "@/lib/demo-data";

type CaptureFlowProps = {
  jobId: string;
};

export function CaptureFlow({ jobId }: CaptureFlowProps) {
  const job = getJob(jobId);
  const [activeIndex, setActiveIndex] = useState(1);
  const [saved, setSaved] = useState<Record<string, boolean>>({
    "starting-condition": true
  });
  const active = checkpoints[activeIndex];
  const activePhoto = photos[activeIndex + 3] ?? photos[0];

  const completedCount = useMemo(
    () => checkpoints.filter((checkpoint) => saved[checkpoint.id]).length,
    [saved]
  );

  function saveCurrent() {
    setSaved((current) => ({ ...current, [active.id]: true }));
  }

  function nextCheckpoint() {
    saveCurrent();
    setActiveIndex((index) => Math.min(index + 1, checkpoints.length - 1));
  }

  return (
    <main className="app-bg min-h-screen text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl gap-6 px-4 py-5 lg:grid-cols-[0.72fr_0.28fr] lg:px-8">
        <section className="phone-frame mx-auto w-full max-w-[430px] p-2 lg:max-w-none">
          <div className="phone-screen min-h-[760px] overflow-hidden">
            <header className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <Link href="/" className="grid h-10 w-10 place-items-center rounded-full bg-white/5">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="text-center">
                <p className="text-xs text-white/45">{active.eyebrow}</p>
                <h1 className="text-base font-semibold">{active.title}</h1>
              </div>
              <button className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-scope-blue">
                <Zap className="h-5 w-5" />
              </button>
            </header>

            <div className="relative min-h-[470px] overflow-hidden">
              <div
                className="absolute inset-0 scale-110 bg-cover bg-center"
                style={{
                  backgroundImage: "url('/scopenod_moodboard.png')",
                  backgroundPosition: activePhoto.position,
                  backgroundSize: "245%"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-black/82" />

              <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                <StatusPill tone={active.tone as "green" | "amber" | "blue"}>
                  {active.aiState}
                </StatusPill>
                <StatusPill>{completedCount}/3 saved</StatusPill>
              </div>

              <div className="absolute bottom-6 left-5 right-5 text-center">
                <p className="mx-auto max-w-xs text-lg font-semibold">{active.instruction}</p>
                <p className="mt-2 text-sm text-white/58">
                  Worker can continue while upload and AI checks finish.
                </p>
              </div>
            </div>

            <div className="hide-scrollbar flex gap-2 overflow-x-auto border-y border-white/10 px-4 py-3">
              {photos.slice(0, 8).map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setActiveIndex(Math.min(index, checkpoints.length - 1))}
                  className="shrink-0"
                >
                  <PhotoTile
                    photo={photo}
                    label={false}
                    className={
                      index === activeIndex
                        ? "h-16 w-16 border-scope-blue"
                        : "h-16 w-16 border-white/10 opacity-75"
                    }
                  />
                </button>
              ))}
            </div>

            <div className="safe-bottom grid grid-cols-[1fr_88px_1fr] items-center gap-4 px-5 py-5">
              <button className="min-h-12 rounded-full border border-white/12 text-sm font-semibold text-white/80">
                Note
              </button>
              <button
                onClick={saveCurrent}
                aria-label="Capture proof photo"
                className="grid h-[76px] w-[76px] place-items-center rounded-full border-[6px] border-white bg-white/10 shadow-phone"
              >
                <span className="h-14 w-14 rounded-full bg-white" />
              </button>
              <button
                onClick={nextCheckpoint}
                className="min-h-12 rounded-full bg-scope-blue text-sm font-semibold text-white"
              >
                Save
              </button>
            </div>
          </div>
        </section>

        <aside className="grid content-start gap-4">
          <div className="camera-glass rounded-[24px] p-5">
            <p className="text-sm text-white/50">Current job</p>
            <h2 className="mt-2 text-2xl font-semibold">{job.vehicle}</h2>
            <p className="mt-1 text-sm text-white/58">{job.customer} - {job.service}</p>
            <div className="mt-5 space-y-3">
              {checkpoints.map((checkpoint, index) => (
                <button
                  key={checkpoint.id}
                  onClick={() => setActiveIndex(index)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/5">
                    {saved[checkpoint.id] ? (
                      <Check className="h-4 w-4 text-scope-green" />
                    ) : (
                      <Circle className="h-4 w-4 text-white/35" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{checkpoint.title}</span>
                    <span className="block truncate text-xs text-white/48">{checkpoint.instruction}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="camera-glass rounded-[24px] p-5">
            <ClipboardEdit className="h-5 w-5 text-scope-amber" />
            <h3 className="mt-4 text-lg font-semibold">Exception ready</h3>
            <p className="mt-2 text-sm leading-6 text-white/58">
              Capture pre-existing issues without leaving the proof flow.
            </p>
            <Link
              href={`/jobs/${job.id}/review`}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white text-sm font-semibold text-graphite-950"
            >
              Review reel
            </Link>
          </div>

          <button
            onClick={() => setSaved({ "starting-condition": true })}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 text-sm text-white/70"
          >
            <RotateCcw className="h-4 w-4" />
            Reset demo
          </button>
        </aside>
      </div>
    </main>
  );
}
