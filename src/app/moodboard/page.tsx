import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MoodboardPage() {
  return (
    <main className="min-h-screen bg-graphite-950 p-4 text-white sm:p-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-sm text-white/70"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <Image
            src="/scopenod_product_direction.png"
            alt="ScopeNod product direction board"
            width={1983}
            height={793}
            priority
            className="h-auto w-full border-b border-white/10"
          />
          <Image
            src="/scopenod_logo_badge.png"
            alt="ScopeNod logo badge"
            width={1114}
            height={1109}
            className="mx-auto h-auto w-full max-w-2xl border-b border-white/10"
          />
          <Image
            src="/scopenod_moodboard.png"
            alt="ScopeNod visual moodboard"
            width={2048}
            height={1152}
            className="h-auto w-full"
          />
        </div>
      </div>
    </main>
  );
}
