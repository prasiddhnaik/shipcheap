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
        "inline-flex items-center border-2 border-[var(--line)] px-2 py-1 text-xs font-black text-[var(--foreground)]",
        tone === "good" && "bg-[var(--green)]",
        tone === "warn" && "bg-[var(--yellow)]",
        tone === "neutral" && "bg-[var(--paper)]",
      )}
    >
      {children}
    </span>
  );
}
