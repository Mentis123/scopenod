import Link from "next/link";
import { Logo } from "@/components/brand";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-graphite-950 px-6 text-white">
      <div className="max-w-md text-center">
        <Logo />
        <h1 className="mt-8 text-3xl font-semibold">This record is not available.</h1>
        <p className="mt-3 text-white/65">The link may have expired or been revoked.</p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-12 items-center rounded-full bg-scope-blue px-6 font-semibold text-white"
        >
          Back to ScopeNod
        </Link>
      </div>
    </main>
  );
}
