import { z } from "zod";

export const photoCheckInputSchema = z.object({
  jobId: z.string().uuid().optional(),
  photoId: z.string().uuid().optional(),
  checkpointId: z.string().optional(),
  checkpointTitle: z.string().min(1).default("Service proof photo"),
  checkpointInstruction: z.string().min(1).default("Confirm the photo is useful for service proof."),
  serviceLabel: z.string().optional(),
  subjectLabel: z.string().optional(),
  note: z.string().optional(),
  imageBase64: z.string().optional(),
  mimeType: z.string().default("image/jpeg")
});

export const photoCheckResultSchema = z.object({
  result: z.enum(["usable", "suggest_retake", "check_unavailable"]),
  confidence: z.number().min(0).max(100).nullable(),
  suggestion: z.string(),
  evidenceNotes: z.array(z.string()).default([]),
  provider: z.string(),
  modelId: z.string().nullable(),
  latencyMs: z.number().int().nonnegative(),
  rawResponse: z.record(z.string(), z.unknown()).optional()
});

export type PhotoCheckInput = z.infer<typeof photoCheckInputSchema>;
export type PhotoCheckResult = z.infer<typeof photoCheckResultSchema>;
