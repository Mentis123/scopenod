import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import {
  isSafeInternalPath,
  SERVICE_COOKIE_NAME,
  verifyServiceSession,
  verifyServiceSessionFromCookieHeader
} from "@/lib/service-auth";

export async function hasServiceSession() {
  return verifyServiceSession(cookies().get(SERVICE_COOKIE_NAME)?.value);
}

export async function requireServiceSession(next = "/") {
  if (await hasServiceSession()) {
    return;
  }

  const safeNext = isSafeInternalPath(next) ? next : "/";
  redirect(`/login?next=${encodeURIComponent(safeNext)}`);
}

export async function requireServiceRequest(request: Request) {
  const isAuthenticated = await verifyServiceSessionFromCookieHeader(request.headers.get("cookie"));

  if (isAuthenticated) {
    return null;
  }

  return NextResponse.json(
    {
      ok: false,
      code: "service_code_required",
      message: "Sign in with a ScopeNod service code to use this endpoint."
    },
    { status: 401 }
  );
}
