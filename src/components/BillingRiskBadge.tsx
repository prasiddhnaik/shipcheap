import type { RiskLevel } from "@/lib/types";
import { cn, riskLabels } from "@/lib/utils";

const riskClasses: Record<RiskLevel, string> = {
  low: "bg-[var(--green)] text-[var(--foreground)]",
  medium: "bg-[var(--yellow)] text-[var(--foreground)]",
  high: "bg-[var(--red)] text-[var(--foreground)]",
};

export function BillingRiskBadge({ risk }: { risk: RiskLevel }) {
  return (
    <span className={cn("inline-flex items-center border-2 border-[var(--line)] px-2 py-1 text-xs font-black", riskClasses[risk])}>
      {riskLabels[risk]} risk
    </span>
  );
}
