"use client";

import { upload } from "@vercel/blob/client";
import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  Circle,
  ClipboardEdit,
  ImagePlus,
  Loader2,
  RotateCcw,
  Zap
} from "lucide-react";
import Link from "next/link";
import { PhotoTile } from "@/components/photo-tile";
import { StatusPill } from "@/components/status-pill";
import { checkpoints, photos, type DemoJob } from "@/lib/demo-data";

type CaptureFlowProps = {
  job: DemoJob;
};

type UploadStatus = "idle" | "preparing" | "uploading" | "checking" | "saved" | "error";

type CaptureState = {
  status: UploadStatus;
  progress: number;
  previewUrl?: string;
  blobUrl?: string;
  photoId?: string;
  suggestion?: string;
  error?: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function CaptureFlow({ job }: CaptureFlowProps) {
  const jobId = job.id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState(1);
  const [exceptionMode, setExceptionMode] = useState(false);
  const [captures, setCaptures] = useState<Record<string, CaptureState>>({
    "starting-condition": {
      status: "saved",
      progress: 100,
      suggestion: "Looks good."
    }
  });
  const active = checkpoints[activeIndex];
  const activeCapture = captures[active.id];
  const activePhoto = photos[activeIndex + 3] ?? photos[0];
  const isRealJob = uuidPattern.test(jobId);

  const completedCount = useMemo(
    () => checkpoints.filter((checkpoint) => captures[checkpoint.id]?.status === "saved").length,
    [captures]
  );

  const statusText = getStatusText(activeCapture, isRealJob);
  const statusTone = getStatusTone(activeCapture, active.tone);

  function chooseFile() {
    fileInputRef.current?.click();
  }

  async function handleSelectedFile(file: File | undefined) {
    if (!file) {
      return;
    }

    const checkpoint = active;
    const captureKind = exceptionMode
      ? "exception"
      : checkpoint.id === "starting-condition"
        ? "before"
        : "checkpoint";
    const captureLabel = exceptionMode ? `Exception - ${checkpoint.title}` : checkpoint.title;
    const clientUploadId = crypto.randomUUID();
    const localPreviewUrl = URL.createObjectURL(file);

    setCaptures((current) => ({
      ...current,
      [checkpoint.id]: {
        status: "preparing",
        progress: 4,
        previewUrl: localPreviewUrl,
        suggestion: "Preparing image."
      }
    }));

    try {
      const proofFile = await resizeForProof(file);
      const previewUrl = URL.createObjectURL(proofFile);

      setCaptures((current) => ({
        ...current,
        [checkpoint.id]: {
          ...current[checkpoint.id],
          status: isRealJob ? "uploading" : "saved",
          progress: isRealJob ? 10 : 100,
          previewUrl,
          suggestion: isRealJob ? "Uploading proof photo." : "Demo preview saved."
        }
      }));

      if (!isRealJob) {
        return;
      }

      const pathname = buildBlobPathname(jobId, checkpoint.id, proofFile);
      const blob = await upload(pathname, proofFile, {
        access: "public",
        handleUploadUrl: "/api/uploads/proof",
        clientPayload: JSON.stringify({
          clientUploadId,
          jobId,
          checkpointId: undefined,
          kind: captureKind,
          label: captureLabel,
          contentType: proofFile.type,
          sizeBytes: proofFile.size,
          assetRole: "display"
        }),
        onUploadProgress: (event) => {
          setCaptures((current) => ({
            ...current,
            [checkpoint.id]: {
              ...current[checkpoint.id],
              status: "uploading",
              progress: Math.max(10, Math.round(event.percentage * 0.82)),
              suggestion: "Uploading proof photo."
            }
          }));
        }
      });

      const registered = await registerUploadedPhoto(jobId, {
        clientUploadId,
        blobUrl: blob.url,
        blobPathname: blob.pathname,
        checkpointId: undefined,
        kind: captureKind,
        label: captureLabel,
        contentType: proofFile.type,
        sizeBytes: proofFile.size,
        metadata: {
          checkpointSlug: checkpoint.id
        }
      });

      setCaptures((current) => ({
        ...current,
        [checkpoint.id]: {
          ...current[checkpoint.id],
          status: "checking",
          progress: 94,
          blobUrl: blob.url,
          photoId: registered.photo?.id,
          suggestion: "Saved. Checking photo."
        }
      }));

      const check = await runPhotoCheck({
        jobId,
        photoId: registered.photo?.id,
        checkpointId: checkpoint.id,
        checkpointTitle: checkpoint.title,
        checkpointInstruction: checkpoint.instruction,
        serviceLabel: job.service,
        subjectLabel: job.vehicle,
        imageBase64: await fileToBase64(proofFile),
        mimeType: proofFile.type || "image/jpeg"
      });

      setCaptures((current) => ({
        ...current,
        [checkpoint.id]: {
          ...current[checkpoint.id],
          status: "saved",
          progress: 100,
          suggestion: check.result?.suggestion ?? "Saved."
        }
      }));
    } catch (error) {
      setCaptures((current) => ({
        ...current,
        [checkpoint.id]: {
          ...current[checkpoint.id],
          status: "error",
          progress: 0,
          error: error instanceof Error ? error.message : "Upload failed.",
          suggestion: "Upload failed. Try again."
        }
      }));
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function nextCheckpoint() {
    if (activeIndex === checkpoints.length - 1) {
      window.location.href = `/jobs/${jobId}/review`;
      return;
    }

    setActiveIndex((index) => Math.min(index + 1, checkpoints.length - 1));
  }

  return (
    <main className="app-bg min-h-dvh overflow-x-hidden text-white">
      <div className="mx-auto grid min-h-dvh max-w-6xl gap-6 px-0 py-0 lg:grid-cols-[0.72fr_0.28fr] lg:px-8 lg:py-5">
        <section className="phone-frame mx-auto w-full max-w-none p-0 sm:max-w-[430px] sm:p-2 lg:max-w-none">
          <div className="phone-screen min-h-dvh overflow-hidden sm:min-h-[760px]">
            <header className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <Link href="/" className="grid h-10 w-10 place-items-center rounded-full bg-white/5">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="text-center">
                <p className="text-xs text-white/45">{active.eyebrow}</p>
                <h1 className="text-base font-semibold">{active.title}</h1>
              </div>
              <button
                onClick={() => setExceptionMode((current) => !current)}
                className={
                  exceptionMode
                    ? "grid h-10 w-10 place-items-center rounded-full bg-scope-amber/20 text-scope-amber"
                    : "grid h-10 w-10 place-items-center rounded-full bg-white/5 text-scope-blue"
                }
              >
                <Zap className="h-5 w-5" />
              </button>
            </header>

            <div className="relative min-h-[470px] overflow-hidden">
              {activeCapture?.previewUrl || activeCapture?.blobUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeCapture.blobUrl ?? activeCapture.previewUrl}
                  alt={`${active.title} proof`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0 scale-110 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('/scopenod_moodboard.png')",
                    backgroundPosition: activePhoto.position,
                    backgroundSize: "245%"
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-black/82" />

              <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                <StatusPill tone={statusTone}>{statusText}</StatusPill>
                <StatusPill>{completedCount}/3 saved</StatusPill>
              </div>

              {activeCapture?.status === "uploading" || activeCapture?.status === "checking" ? (
                <div className="absolute left-5 right-5 top-20">
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/16">
                    <div
                      className="h-full rounded-full bg-scope-blue transition-all"
                      style={{ width: `${activeCapture.progress}%` }}
                    />
                  </div>
                </div>
              ) : null}

              <div className="absolute bottom-6 left-5 right-5 text-center">
                <p className="mx-auto max-w-xs break-words text-lg font-semibold">
                  {exceptionMode ? "Capture the issue with context." : active.instruction}
                </p>
                <p className="mx-auto mt-2 max-w-sm break-words text-sm text-white/58">
                  {activeCapture?.suggestion ?? "Capture from the worker phone or choose a file."}
                </p>
              </div>
            </div>

            <div className="hide-scrollbar flex gap-2 overflow-x-auto border-y border-white/10 px-4 py-3">
              {checkpoints.map((checkpoint, index) => {
                const capture = captures[checkpoint.id];

                return (
                  <button
                    key={checkpoint.id}
                    onClick={() => setActiveIndex(index)}
                    className="relative shrink-0"
                  >
                    {capture?.previewUrl || capture?.blobUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={capture.blobUrl ?? capture.previewUrl}
                        alt=""
                        className={
                          index === activeIndex
                            ? "h-16 w-16 rounded-xl border border-scope-blue object-cover"
                            : "h-16 w-16 rounded-xl border border-white/10 object-cover opacity-75"
                        }
                      />
                    ) : (
                      <PhotoTile
                        photo={photos[index]}
                        label={false}
                        className={
                          index === activeIndex
                            ? "h-16 w-16 border-scope-blue"
                            : "h-16 w-16 border-white/10 opacity-75"
                        }
                      />
                    )}
                    {capture?.status === "saved" ? (
                      <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-scope-green">
                        <Check className="h-3 w-3 text-white" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="safe-bottom grid grid-cols-[1fr_88px_1fr] items-center gap-4 px-5 py-5">
              <button
                onClick={() => setExceptionMode((current) => !current)}
                className={
                  exceptionMode
                    ? "min-h-12 rounded-full border border-scope-amber/35 bg-scope-amber/15 text-sm font-semibold text-scope-amber"
                    : "min-h-12 rounded-full border border-white/12 text-sm font-semibold text-white/80"
                }
              >
                {exceptionMode ? "Exception" : "Note"}
              </button>
              <button
                onClick={chooseFile}
                disabled={activeCapture?.status === "uploading" || activeCapture?.status === "checking"}
                aria-label="Capture proof photo"
                className="grid h-[76px] w-[76px] place-items-center rounded-full border-[6px] border-white bg-white/10 shadow-phone disabled:opacity-55"
              >
                {activeCapture?.status === "uploading" || activeCapture?.status === "checking" ? (
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                ) : (
                  <span className="h-14 w-14 rounded-full bg-white" />
                )}
              </button>
              <button
                onClick={nextCheckpoint}
                className="min-h-12 rounded-full bg-scope-blue text-sm font-semibold text-white"
              >
                {activeIndex === checkpoints.length - 1 ? "Review" : "Next"}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) => handleSelectedFile(event.target.files?.[0])}
            />
          </div>
        </section>

        <aside className="hidden content-start gap-4 lg:grid">
          <div className="camera-glass rounded-[24px] p-5">
            <p className="text-sm text-white/50">Current job</p>
            <h2 className="mt-2 text-2xl font-semibold">{job.vehicle}</h2>
            <p className="mt-1 text-sm text-white/58">{job.customer} - {job.service}</p>
            <div className="mt-5 space-y-3">
              {checkpoints.map((checkpoint, index) => {
                const capture = captures[checkpoint.id];

                return (
                  <button
                    key={checkpoint.id}
                    onClick={() => setActiveIndex(index)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-white/5">
                      {capture?.status === "saved" ? (
                        <Check className="h-4 w-4 text-scope-green" />
                      ) : capture?.status === "uploading" || capture?.status === "checking" ? (
                        <Loader2 className="h-4 w-4 animate-spin text-scope-blue" />
                      ) : (
                        <Circle className="h-4 w-4 text-white/35" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{checkpoint.title}</span>
                      <span className="block truncate text-xs text-white/48">
                        {capture?.suggestion ?? checkpoint.instruction}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="camera-glass rounded-[24px] p-5">
            <ClipboardEdit className="h-5 w-5 text-scope-amber" />
            <h3 className="mt-4 text-lg font-semibold">Exception ready</h3>
            <p className="mt-2 text-sm leading-6 text-white/58">
              Toggle exception mode, capture the issue, then add notes from the review reel.
            </p>
            <Link
              href={`/jobs/${job.id}/review`}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white text-sm font-semibold text-graphite-950"
            >
              Review reel
            </Link>
          </div>

          <button
            onClick={() =>
              setCaptures({
                "starting-condition": {
                  status: "saved",
                  progress: 100,
                  suggestion: "Looks good."
                }
              })
            }
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 text-sm text-white/70"
          >
            <RotateCcw className="h-4 w-4" />
            Reset capture
          </button>

          {!isRealJob ? (
            <div className="rounded-[24px] border border-scope-amber/25 bg-scope-amber/10 p-5 text-sm leading-6 text-white/70">
              <ImagePlus className="mb-3 h-5 w-5 text-scope-amber" />
              Demo jobs show local previews only. Create a new job to upload to Blob and persist photos.
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
}

function getStatusText(capture: CaptureState | undefined, isRealJob: boolean) {
  if (!isRealJob) {
    return "Demo preview";
  }

  if (!capture) {
    return "Ready";
  }

  if (capture.status === "preparing") {
    return "Preparing";
  }

  if (capture.status === "uploading") {
    return `${capture.progress}%`;
  }

  if (capture.status === "checking") {
    return "Checking";
  }

  if (capture.status === "error") {
    return "Try again";
  }

  if (
    capture.suggestion?.toLowerCase().includes("closer") ||
    capture.suggestion?.toLowerCase().includes("blurry") ||
    capture.suggestion?.toLowerCase().includes("instead")
  ) {
    return "Retake?";
  }

  return "Saved";
}

function getStatusTone(
  capture: CaptureState | undefined,
  fallback: string
): "green" | "amber" | "blue" {
  if (capture?.status === "saved") {
    return capture.suggestion?.toLowerCase().includes("closer") ||
      capture.suggestion?.toLowerCase().includes("blurry")
      ? "amber"
      : "green";
  }

  if (capture?.status === "error") {
    return "amber";
  }

  if (capture?.status === "uploading" || capture?.status === "checking") {
    return "blue";
  }

  return fallback as "green" | "amber" | "blue";
}

function buildBlobPathname(jobId: string, checkpointId: string, file: File) {
  const extension = file.type.includes("png") ? "png" : "jpg";
  return `proof/${jobId}/${checkpointId}-${Date.now()}.${extension}`;
}

async function registerUploadedPhoto(
  jobId: string,
  payload: Record<string, unknown>
): Promise<{ photo?: { id?: string } }> {
  const response = await fetch(`/api/jobs/${jobId}/photos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Photo uploaded, but registration failed.");
  }

  return (await response.json()) as { photo?: { id?: string } };
}

async function runPhotoCheck(payload: Record<string, unknown>) {
  const response = await fetch("/api/photo-checks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    return {
      result: {
        suggestion: "Saved. Check unavailable."
      }
    };
  }

  return (await response.json()) as {
    result?: {
      suggestion?: string;
    };
  };
}

async function resizeForProof(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file.");
  }

  try {
    const image = await loadImage(file);
    const maxLongEdge = 1600;
    const scale = Math.min(1, maxLongEdge / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.72)
    );

    if (!blob) {
      return file;
    }

    return new File([blob], replaceExtension(file.name, "jpg"), {
      type: "image/jpeg",
      lastModified: Date.now()
    });
  } catch {
    return file;
  }
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image could not be read."));
    };
    image.src = url;
  });
}

function replaceExtension(filename: string, extension: string) {
  const clean = filename.replace(/\.[^.]+$/, "");
  return `${clean || "proof-photo"}.${extension}`;
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("Image could not be prepared for AI check."));
    reader.readAsDataURL(file);
  });
}
