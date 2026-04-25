export type AiMode = "stub" | "live";

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function getAiMode(): AiMode {
  return process.env.AI_MODE === "live" ? "live" : "stub";
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function getGeminiModelId() {
  return process.env.GEMINI_MODEL_ID || "gemini-3-flash-preview";
}

export function getGeminiApiBaseUrl() {
  return process.env.GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta";
}

export function getAppUrl(request?: Request) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (request) {
    return new URL(request.url).origin;
  }

  return "http://localhost:3000";
}

export function getBackendStatus(request?: Request) {
  return {
    database: isDatabaseConfigured(),
    blob: isBlobConfigured(),
    aiMode: getAiMode(),
    gemini: isGeminiConfigured(),
    geminiModelId: getGeminiModelId(),
    appUrl: getAppUrl(request)
  };
}
