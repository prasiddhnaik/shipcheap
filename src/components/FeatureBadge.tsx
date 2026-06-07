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
        tone === "good" && "border-[#2442ed]/35 bg-[#2442ed]/10 text-[#e6eaff]",
        tone === "warn" && "border-amber-300/30 bg-amber-300/10 text-amber-100",
        tone === "neutral" && "border-white/10 bg-white/[0.04] text-slate-200",
      )}
    >
      {children}
    </span>
  );
}
