import clsx from "clsx";

type StatusPillProps = {
  children: React.ReactNode;
  tone?: "green" | "amber" | "blue" | "neutral";
};

export function StatusPill({ children, tone = "neutral" }: StatusPillProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "green" && "border-scope-green/25 bg-scope-green/10 text-scope-green",
        tone === "amber" && "border-scope-amber/30 bg-scope-amber/10 text-scope-amber",
        tone === "blue" && "border-scope-blue/25 bg-scope-blue/10 text-scope-blue",
        tone === "neutral" && "border-white/10 bg-white/5 text-white/70"
      )}
    >
      {children}
    </span>
  );
}
