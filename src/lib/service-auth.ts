export const SERVICE_COOKIE_NAME = "scopenod_service";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const encoder = new TextEncoder();

type SessionPayload = {
  codeHash: string;
  iat: number;
  exp: number;
};

export function getServiceCodes() {
  return (process.env.SERVICE_CODES || "Mentis123")
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean);
}

export function getServiceCookieMaxAge() {
  return SESSION_TTL_SECONDS;
}

export async function createServiceSession(code: string) {
  const trimmedCode = code.trim();

  if (!(await isAllowedServiceCode(trimmedCode))) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    codeHash: await digest(trimmedCode.toLowerCase()),
    iat: now,
    exp: now + SESSION_TTL_SECONDS
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifyServiceSession(session: string | undefined | null) {
  if (!session) {
    return false;
  }

  const [encodedPayload, signature] = session.split(".");

  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = await sign(encodedPayload);

  if (signature !== expectedSignature) {
    return false;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;

    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }

    const allowedHashes = await Promise.all(
      getServiceCodes().map((code) => digest(code.toLowerCase()))
    );

    return allowedHashes.includes(payload.codeHash);
  } catch {
    return false;
  }
}

export async function verifyServiceSessionFromCookieHeader(cookieHeader: string | null) {
  const cookies = parseCookieHeader(cookieHeader);
  return verifyServiceSession(cookies[SERVICE_COOKIE_NAME]);
}

export function isSafeInternalPath(path: string | null | undefined) {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//"));
}

async function isAllowedServiceCode(code: string) {
  const allowedCodes = getServiceCodes();
  const attemptedHash = await digest(code.toLowerCase());
  const allowedHashes = await Promise.all(
    allowedCodes.map((allowedCode) => digest(allowedCode.toLowerCase()))
  );

  return allowedHashes.includes(attemptedHash);
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return arrayBufferToBase64Url(signature);
}

async function digest(value: string) {
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return arrayBufferToBase64Url(hash);
}

function getAuthSecret() {
  return (
    process.env.SERVICE_GATE_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "scopenod-local-service-gate"
  );
}

function parseCookieHeader(cookieHeader: string | null) {
  return Object.fromEntries(
    (cookieHeader || "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [key, ...valueParts] = part.split("=");
        return [decodeURIComponent(key), decodeURIComponent(valueParts.join("="))];
      })
  );
}

function base64UrlEncode(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string) {
  const padded = `${value}${"=".repeat((4 - (value.length % 4)) % 4)}`;
  return atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
}

function arrayBufferToBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
