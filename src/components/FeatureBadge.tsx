import { cn } from "@/lib/utils";

export function FeatureBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
        tone === "good" && "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
        tone === "warn" && "border-amber-300/30 bg-amber-300/10 text-amber-100",
        tone === "neutral" && "border-white/10 bg-white/[0.04] text-slate-200",
      )}
    >
      {children}
    </span>
  );
}
