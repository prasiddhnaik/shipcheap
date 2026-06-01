import type { RiskLevel } from "@/lib/types";
import { cn, riskLabels } from "@/lib/utils";

const riskClasses: Record<RiskLevel, string> = {
  low: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  medium: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  high: "border-rose-400/30 bg-rose-400/10 text-rose-200",
};

export function BillingRiskBadge({ risk }: { risk: RiskLevel }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium", riskClasses[risk])}>
      {riskLabels[risk]} risk
    </span>
  );
}
