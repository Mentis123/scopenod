import {
  getAiMode,
  getGeminiApiBaseUrl,
  getGeminiModelId,
  isGeminiConfigured
} from "@/lib/env";
import type { PhotoCheckInput, PhotoCheckResult } from "./types";
import { photoCheckResultSchema } from "./types";

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

const geminiResponseJsonSchema = {
  type: "object",
  properties: {
    result: {
      type: "string",
      enum: ["usable", "suggest_retake"]
    },
    confidence: {
      type: "integer",
      minimum: 0,
      maximum: 100
    },
    suggestion: {
      type: "string",
      description: "Short worker-facing suggestion. Avoid legal or punitive wording."
    },
    evidenceNotes: {
      type: "array",
      items: { type: "string" },
      description: "Brief notes about why the photo is or is not useful service evidence."
    }
  },
  required: ["result", "confidence", "suggestion", "evidenceNotes"]
} as const;

export async function verifyPhotoForCheckpoint(
  input: PhotoCheckInput
): Promise<PhotoCheckResult> {
  const startedAt = Date.now();

  if (getAiMode() !== "live" || !isGeminiConfigured()) {
    return stubPhotoCheck(input, startedAt);
  }

  try {
    return await geminiPhotoCheck(input, startedAt);
  } catch (error) {
    return {
      result: "check_unavailable",
      confidence: null,
      suggestion: "Saved. Check unavailable.",
      evidenceNotes: [error instanceof Error ? error.message : "Gemini check failed."],
      provider: "gemini",
      modelId: getGeminiModelId(),
      latencyMs: Date.now() - startedAt
    };
  }
}

function stubPhotoCheck(input: PhotoCheckInput, startedAt: number): PhotoCheckResult {
  return {
    result: "usable",
    confidence: 92,
    suggestion: "Looks good.",
    evidenceNotes: [
      `Stub check for ${input.checkpointTitle}. Switch AI_MODE to live to call Gemini.`
    ],
    provider: "stub",
    modelId: null,
    latencyMs: Date.now() - startedAt
  };
}

async function geminiPhotoCheck(
  input: PhotoCheckInput,
  startedAt: number
): Promise<PhotoCheckResult> {
  const modelId = getGeminiModelId();
  const baseUrl = getGeminiApiBaseUrl().replace(/\/$/, "");
  const endpoint = `${baseUrl}/models/${modelId}:generateContent`;
  const parts: Array<Record<string, unknown>> = [{ text: buildPrompt(input) }];

  if (input.imageBase64) {
    parts.push({
      inlineData: {
        mimeType: input.mimeType,
        data: input.imageBase64
      }
    });
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY ?? ""
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: geminiResponseJsonSchema,
        temperature: 0.1
      }
    }),
    signal: AbortSignal.timeout(9000)
  });

  const json = (await response.json()) as GeminiGenerateContentResponse;

  if (!response.ok) {
    throw new Error(json.error?.message || `Gemini returned ${response.status}.`);
  }

  const text = json.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") ?? "";

  if (!text) {
    throw new Error("Gemini returned an empty photo-check response.");
  }

  const parsed = JSON.parse(text) as Record<string, unknown>;

  return photoCheckResultSchema.parse({
    ...parsed,
    result: parsed.result === "suggest_retake" ? "suggest_retake" : "usable",
    provider: "gemini",
    modelId,
    latencyMs: Date.now() - startedAt,
    rawResponse: json as unknown as Record<string, unknown>
  });
}

function buildPrompt(input: PhotoCheckInput) {
  return [
    "You are ScopeNod's service-proof photo assistant.",
    "Decide whether this worker photo is useful evidence for the current service checkpoint.",
    "You are advisory only. Do not judge service quality, make legal claims, or block the worker.",
    "",
    `Checkpoint: ${input.checkpointTitle}`,
    `Instruction: ${input.checkpointInstruction}`,
    input.serviceLabel ? `Service: ${input.serviceLabel}` : undefined,
    input.subjectLabel ? `Vehicle/site: ${input.subjectLabel}` : undefined,
    input.note ? `Worker note: ${input.note}` : undefined,
    "",
    "Return usable when the image appears clear enough to support the checkpoint.",
    "Return suggest_retake only when the image is obviously blurry, too dark, not relevant, or missing the requested subject.",
    "Use calm worker-facing copy such as 'Want a closer one?' or 'This may be blurry. Try again or save with note.'"
  ]
    .filter(Boolean)
    .join("\n");
}
