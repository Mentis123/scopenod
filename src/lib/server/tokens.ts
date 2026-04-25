import { createHash, randomBytes } from "node:crypto";

const TOKEN_BYTES = 32;

export type TokenPrefix = "ack" | "rec" | "upl";

export function createPublicToken(prefix: TokenPrefix = "ack") {
  const body = randomBytes(TOKEN_BYTES).toString("base64url");
  return `${prefix}_${body}`;
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function tokenPreview(token: string) {
  const [prefix] = token.split("_");
  return `${prefix}_${token.slice(-8)}`;
}

export function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function daysFromNow(days: number) {
  return hoursFromNow(days * 24);
}
