import { LockKeyhole, ShieldCheck } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand";
import {
  createServiceSession,
  getServiceCookieMaxAge,
  isSafeInternalPath,
  SERVICE_COOKIE_NAME,
  verifyServiceSession
} from "@/lib/service-auth";

type LoginPageProps = {
  searchParams?: {
    error?: string;
    next?: string;
  };
};

async function serviceCodeAction(formData: FormData) {
  "use server";

  const code = String(formData.get("serviceCode") || "");
  const next = String(formData.get("next") || "/");
  const session = await createServiceSession(code);

  if (!session) {
    redirect(`/login?error=invalid&next=${encodeURIComponent(isSafeInternalPath(next) ? next : "/")}`);
  }

  cookies().set(SERVICE_COOKIE_NAME, session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: getServiceCookieMaxAge(),
    path: "/"
  });

  redirect(isSafeInternalPath(next) ? next : "/");
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const isAuthenticated = await verifyServiceSession(cookies().get(SERVICE_COOKIE_NAME)?.value);
  const next = isSafeInternalPath(searchParams?.next) ? searchParams?.next : "/";

  if (isAuthenticated) {
    redirect(next || "/");
  }

  return (
    <main className="app-bg grid min-h-dvh place-items-center overflow-hidden px-4 py-6 text-white">
      <section className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#0b0e12] p-5 shadow-phone">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="grid h-11 w-11 place-items-center rounded-full border border-scope-blue/25 bg-scope-blue/10 text-scope-blue">
            <LockKeyhole className="h-5 w-5" />
          </span>
        </div>

        <div className="mt-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-scope-blue">
            Private pilot
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">Enter your service code.</h1>
          <p className="mt-3 text-sm leading-6 text-white/58">
            Worker tools, upload flows, QR handoffs, and AI checks are limited to approved
            ScopeNod pilot users.
          </p>
        </div>

        <form action={serviceCodeAction} className="mt-8 space-y-3">
          <input type="hidden" name="next" value={next} />
          <label className="block">
            <span className="text-sm text-white/55">Service code</span>
            <input
              name="serviceCode"
              type="password"
              autoComplete="one-time-code"
              autoFocus
              placeholder="Enter code"
              className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/28 focus:border-scope-blue"
            />
          </label>
          {searchParams?.error ? (
            <p className="rounded-2xl border border-scope-amber/25 bg-scope-amber/10 px-4 py-3 text-sm text-scope-amber">
              That service code is not active.
            </p>
          ) : null}
          <button
            type="submit"
            className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-scope-blue px-5 font-semibold text-white"
          >
            <ShieldCheck className="h-5 w-5" />
            Unlock ScopeNod
          </button>
        </form>
      </section>
    </main>
  );
}
