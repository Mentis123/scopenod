import Link from "next/link";
import Image from "next/image";

type LogoProps = {
  tone?: "dark" | "light";
  tagline?: boolean;
};

export function Logo({ tone = "dark", tagline = false }: LogoProps) {
  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label="ScopeNod home">
      <span className="relative h-12 w-12 shrink-0 overflow-visible">
        <Image
          src="/scopenod_mark_transparent.png"
          alt=""
          width={96}
          height={106}
          className="absolute inset-[-8px] h-[64px] w-[58px] object-contain"
          priority
        />
      </span>
      <span className="leading-none">
        <span
          className={
            tone === "light"
              ? "block text-2xl font-semibold tracking-normal text-graphite-950"
              : "block text-2xl font-semibold tracking-normal text-white"
          }
        >
          Scope<span className="text-scope-blue">Nod</span>
        </span>
        {tagline ? (
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.28em] text-white/62">
            AI-verified service proof
          </span>
        ) : null}
      </span>
    </Link>
  );
}
